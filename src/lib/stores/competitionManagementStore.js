// Competition Management Store - Fixed Version
// This fixes the schema cache and column name issues

import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from '$lib/stores/userProfile.js';

// =============================================
// Store State
// =============================================

export const competitions = writable([]);
export const isLoading = writable(false);
export const error = writable(null);
export const lastRefresh = writable(null);

// =============================================
// Derived Stores
// =============================================

export const stats = derived(competitions, ($competitions) => {
    if (!$competitions.length) {
        return { total: 0, active: 0, totalEntries: 0, avgEntries: 0 };
    }

    const total = $competitions.length;
    const active = $competitions.filter(comp => comp.is_active).length;
    const totalEntries = $competitions.reduce((sum, comp) => sum + (comp.entry_count || 0), 0);
    const avgEntries = total > 0 ? Math.round(totalEntries / total * 10) / 10 : 0;

    return { total, active, totalEntries, avgEntries };
});

export const filteredCompetitions = derived(competitions, ($competitions) => {
    // Add any filtering logic here if needed
    return $competitions;
});

// =============================================
// Load Functions - FIXED APPROACH
// =============================================

export async function loadCompetitions(forceRefresh = false) {
    const $userProfile = get(userProfile);
    
    if (!$userProfile?.is_officer) {
        console.warn('⚠️ User is not officer or profile not loaded yet');
        return;
    }

    const now = new Date();
    const lastRefreshTime = get(lastRefresh);
    
    // Cache for 30 seconds unless force refresh
    if (!forceRefresh && lastRefreshTime && (now - lastRefreshTime) < 30000) {
        console.log('🏆 Using cached competition data');
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        console.log('🔍 loadCompetitions called, forceRefresh:', forceRefresh);
        console.log('👤 User profile:', $userProfile);
        
        console.log('🔄 Loading fresh competition data...');
        
        // APPROACH 1: Try the RPC function first, fall back to direct query
        console.log('🚀 Attempting to call get_competitions_with_stats RPC...');
        
        let data;
        let rpcError = null;
        
        try {
            const { data: rpcData, error: rpcErr } = await supabase
                .rpc('get_competitions_with_stats');
            
            if (rpcErr) {
                rpcError = rpcErr;
                throw rpcErr;
            }
            
            data = rpcData;
            console.log('✅ RPC function worked, got data:', data?.length, 'competitions');
            
        } catch (err) {
            console.log('❌ RPC error:', err);
            console.log('⚠️ RPC function not available, using direct query. Error:', err.message);
            
            // APPROACH 2: Direct query with manual joins
            console.log('📊 Fetching competitions table directly...');
            
            const { data: competitionsData, error: competitionsError } = await supabase
                .from('competitions')
                .select('*')
                .order('entry_deadline', { ascending: false });

            if (competitionsError) {
                throw competitionsError;
            }

            console.log('✅ Competitions fetched:', competitionsData?.length);

            // Get entry counts for each competition separately
            console.log('📈 Getting entry counts for each competition...');
            
            const competitionsWithCounts = await Promise.all(
                competitionsData.map(async (comp) => {
                    const { count, error: countError } = await supabase
                        .from('competition_entries')
                        .select('*', { count: 'exact', head: true })
                        .eq('competition_id', comp.id);

                    if (countError) {
                        console.warn('Warning getting count for competition', comp.id, ':', countError);
                    }

                    // Calculate is_active and status
                    const now = new Date();
                    const deadline = new Date(comp.entry_deadline);
                    const is_active = comp.active && deadline > now;
                    
                    let status = 'closed';
                    if (is_active) {
                        status = 'open';
                    } else if (comp.judging_date && new Date(comp.judging_date) >= now && !comp.results_published) {
                        status = 'judging';
                    } else if (comp.results_published) {
                        status = 'completed';
                    }

                    return {
                        ...comp,
                        entry_count: count || 0,
                        is_active,
                        status,
                        // Convert timestamps to dates for consistency
                        entry_deadline: comp.entry_deadline ? new Date(comp.entry_deadline).toISOString().split('T')[0] : null,
                        judging_date: comp.judging_date ? new Date(comp.judging_date).toISOString().split('T')[0] : null
                    };
                })
            );

            data = competitionsWithCounts;
        }

        console.log('✅ Competition data with counts:', data?.length);
        
        // Sort by entry deadline (most recent first)
        const sortedCompetitions = (data || []).sort((a, b) => {
            const dateA = new Date(a.entry_deadline);
            const dateB = new Date(b.entry_deadline);
            return dateB - dateA;
        });

        console.log('📝 Setting sorted competitions:', sortedCompetitions.length);
        competitions.set(sortedCompetitions);
        lastRefresh.set(now);
        
        console.log('✨ Loading complete');

    } catch (err) {
        console.error('❌ Failed to load competitions:', err);
        error.set(err.message || 'Failed to load competitions');
    } finally {
        isLoading.set(false);
    }
}

// =============================================
// Competition Entry Functions - FIXED APPROACH  
// =============================================

export async function loadCompetitionEntries(competitionId) {
    if (!competitionId) {
        console.warn('⚠️ No competition ID provided');
        return [];
    }

    try {
        console.log('📋 Loading entries for competition:', competitionId);

        // APPROACH: Use separate queries instead of problematic auto-joins
        
        // Step 1: Get competition entries
        const { data: entriesData, error: entriesError } = await supabase
            .from('competition_entries')
            .select('*')
            .eq('competition_id', competitionId)
            .order('entry_number', { ascending: true });

        if (entriesError) {
            throw entriesError;
        }

        if (!entriesData || entriesData.length === 0) {
            console.log('📋 No entries found for this competition');
            return [];
        }

        // Step 2: Get member data for all entries
        const memberIds = [...new Set(entriesData.map(entry => entry.member_id))];
        const { data: membersData, error: membersError } = await supabase
            .from('members')
            .select('id, name, email, phone')
            .in('id', memberIds);

        if (membersError) {
            console.warn('Warning loading members:', membersError);
        }

        // Step 3: Get BJCP category data for all entries
        const categoryIds = [...new Set(entriesData.map(entry => entry.bjcp_category_id).filter(Boolean))];
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('bjcp_categories')
            .select('id, category_name, category_number, subcategory_letter, subcategory_name')
            .in('id', categoryIds);

        if (categoriesError) {
            console.warn('Warning loading categories:', categoriesError);
        }

        // Step 4: Combine all data manually
        const entriesWithDetails = entriesData.map(entry => {
            const member = membersData?.find(m => m.id === entry.member_id);
            const category = categoriesData?.find(c => c.id === entry.bjcp_category_id);

            return {
                ...entry,
                member_name: member?.name || 'Unknown',
                member_email: member?.email || '',
                member_phone: member?.phone || '',
                category_name: category?.category_name || 'Unknown Category',
                category_number: category?.category_number || '',
                subcategory_letter: category?.subcategory_letter || '',
                subcategory_name: category?.subcategory_name || '',
                // Create a combined category display
                category_display: category 
                    ? `${category.category_number}${category.subcategory_letter || ''} - ${category.category_name}${category.subcategory_name ? ': ' + category.subcategory_name : ''}`
                    : 'Unknown Category'
            };
        });

        console.log('✅ Loaded', entriesWithDetails.length, 'entries with full details');
        return entriesWithDetails;

    } catch (err) {
        console.error('❌ Failed to load competition entries:', err);
        throw err;
    }
}

// =============================================
// Competition Management Functions
// =============================================

export async function createCompetition(competitionData) {
    try {
        const { data, error: insertError } = await supabase
            .from('competitions')
            .insert([competitionData])
            .select()
            .single();

        if (insertError) throw insertError;

        // Refresh competitions list
        await loadCompetitions(true);
        
        return data;
    } catch (err) {
        console.error('Failed to create competition:', err);
        throw err;
    }
}

export async function updateCompetition(competitionId, updates) {
    try {
        const { data, error: updateError } = await supabase
            .from('competitions')
            .update(updates)
            .eq('id', competitionId)
            .select()
            .single();

        if (updateError) throw updateError;

        // Refresh competitions list
        await loadCompetitions(true);
        
        return data;
    } catch (err) {
        console.error('Failed to update competition:', err);
        throw err;
    }
}

export async function deleteCompetition(competitionId) {
    try {
        const { error: deleteError } = await supabase
            .from('competitions')
            .delete()
            .eq('id', competitionId);

        if (deleteError) throw deleteError;

        // Refresh competitions list
        await loadCompetitions(true);
    } catch (err) {
        console.error('Failed to delete competition:', err);
        throw err;
    }
}

// =============================================
// Store Helpers
// =============================================

export function resetStore() {
    competitions.set([]);
    isLoading.set(false);
    error.set(null);
    lastRefresh.set(null);
}

export async function forceRefresh() {
    lastRefresh.set(null);
    await loadCompetitions(true);
}

// Initialize store when user profile changes
userProfile.subscribe(($userProfile) => {
    console.log('👤 User profile changed in store:', $userProfile);
    if ($userProfile?.is_officer) {
        console.log('✅ User is officer, loading competitions');
        loadCompetitions(false);
    } else {
        console.log('⚠️ User is not officer or profile not loaded yet');
        resetStore();
    }
});

// Debug logging
if (typeof window !== 'undefined') {
    competitions.subscribe(value => {
        console.log('📦 Store updated with competitions:', value.length);
    });
    
    error.subscribe(value => {
        if (value) {
            console.error('❌ Competition management store error:', value);
        }
    });
}