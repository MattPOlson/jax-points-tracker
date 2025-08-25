// Competition Management Store - Simplified Working Version
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from '$lib/stores/userProfile.js';

// =============================================
// Basic Store State
// =============================================

export const competitions = writable([]);
export const isLoading = writable(false);
export const error = writable(null);
export const lastRefresh = writable(null);

// =============================================
// Derived Stores
// =============================================

export const stats = derived(competitions, ($competitions) => {
    console.log('📊 Computing stats for competitions:', $competitions);
    
    if (!Array.isArray($competitions) || $competitions.length === 0) {
        const defaultStats = { total: 0, active: 0, totalEntries: 0, avgEntries: 0 };
        console.log('📊 Using default stats:', defaultStats);
        return defaultStats;
    }

    const total = $competitions.length;
    const active = $competitions.filter(comp => comp.is_active).length;
    const totalEntries = $competitions.reduce((sum, comp) => sum + (comp.entry_count || 0), 0);
    const avgEntries = total > 0 ? Math.round(totalEntries / total * 10) / 10 : 0;

    const computedStats = { total, active, totalEntries, avgEntries };
    console.log('📊 Computed stats:', computedStats);
    return computedStats;
});

export const filteredCompetitions = derived(competitions, ($competitions) => {
    return Array.isArray($competitions) ? $competitions : [];
});

// =============================================
// Load Function - Simple Direct Query
// =============================================

export async function loadCompetitions(forceRefresh = false) {
    const $userProfile = get(userProfile);
    
    if (!$userProfile?.is_officer) {
        console.warn('User is not officer or profile not loaded yet');
        return;
    }

    const now = new Date();
    const lastRefreshTime = get(lastRefresh);
    
    if (!forceRefresh && lastRefreshTime && (now - lastRefreshTime) < 30000) {
        console.log('Using cached competition data');
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        console.log('Loading fresh competition data...');
        
        // Use direct query - avoid problematic RPC
        const { data: competitionsData, error: competitionsError } = await supabase
            .from('competitions')
            .select('*')
            .order('entry_deadline', { ascending: false });

        if (competitionsError) {
            throw competitionsError;
        }

        console.log('Competitions fetched:', competitionsData?.length);

        // Get entry counts separately to avoid join issues
        const competitionsWithCounts = await Promise.all(
            (competitionsData || []).map(async (comp) => {
                const { count, error: countError } = await supabase
                    .from('competition_entries')
                    .select('*', { count: 'exact', head: true })
                    .eq('competition_id', comp.id);

                if (countError) {
                    console.warn('Warning getting count for competition', comp.id, ':', countError);
                }

                // Calculate status
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
                    status
                };
            })
        );

        console.log('Competition data with counts:', competitionsWithCounts?.length);
        competitions.set(competitionsWithCounts || []);
        lastRefresh.set(now);
        
        console.log('Loading complete');

    } catch (err) {
        console.error('Failed to load competitions:', err);
        error.set(err.message || 'Failed to load competitions');
        competitions.set([]); // Ensure we always have an array
    } finally {
        isLoading.set(false);
    }
}

// =============================================
// Competition Entry Function
// =============================================

export async function loadCompetitionEntries(competitionId) {
    if (!competitionId) {
        console.warn('No competition ID provided');
        return [];
    }

    try {
        console.log('Loading entries for competition:', competitionId);

        // Get competition entries
        const { data: entriesData, error: entriesError } = await supabase
            .from('competition_entries')
            .select('*')
            .eq('competition_id', competitionId)
            .order('entry_number', { ascending: true });

        if (entriesError) {
            throw entriesError;
        }

        if (!entriesData || entriesData.length === 0) {
            console.log('No entries found for this competition');
            return [];
        }

        // Get member data
        const memberIds = [...new Set(entriesData.map(entry => entry.member_id))];
        const { data: membersData } = await supabase
            .from('members')
            .select('id, name, email, phone')
            .in('id', memberIds);

        // Get category data  
        const categoryIds = [...new Set(entriesData.map(entry => entry.bjcp_category_id).filter(Boolean))];
        const { data: categoriesData } = await supabase
            .from('bjcp_categories')
            .select('id, category_name, category_number, subcategory_letter, subcategory_name')
            .in('id', categoryIds);

        // Combine data manually
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
                category_display: category 
                    ? `${category.category_number}${category.subcategory_letter || ''} - ${category.category_name}${category.subcategory_name ? ': ' + category.subcategory_name : ''}`
                    : 'Unknown Category'
            };
        });

        console.log('Loaded', entriesWithDetails.length, 'entries with full details');
        return entriesWithDetails;

    } catch (err) {
        console.error('Failed to load competition entries:', err);
        throw err;
    }
}

// =============================================
// Basic Management Functions
// =============================================

export async function createCompetition(competitionData) {
    const { data, error: insertError } = await supabase
        .from('competitions')
        .insert([competitionData])
        .select()
        .single();

    if (insertError) throw insertError;
    await loadCompetitions(true);
    return data;
}

export async function updateCompetition(competitionId, updates) {
    const { data, error: updateError } = await supabase
        .from('competitions')
        .update(updates)
        .eq('id', competitionId)
        .select()
        .single();

    if (updateError) throw updateError;
    await loadCompetitions(true);
    return data;
}

export async function deleteCompetition(competitionId) {
    const { error: deleteError } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competitionId);

    if (deleteError) throw deleteError;
    await loadCompetitions(true);
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

// =============================================
// Officers Page Compatibility
// =============================================

export const competitionManagementStore = {
    subscribe: derived([competitions, isLoading, error, stats, filteredCompetitions], 
        ([competitions, isLoading, error, stats, filteredCompetitions]) => ({
            competitions,
            isLoading,
            error,
            stats,
            filteredCompetitions
        })
    ).subscribe,
    
    loadCompetitions,
    initialize: async () => {
        console.log('Initializing competition management store');
        await loadCompetitions(false);
    }
};

// Auto-load when user profile changes
userProfile.subscribe(($userProfile) => {
    console.log('User profile changed in store:', $userProfile);
    if ($userProfile?.is_officer) {
        console.log('User is officer, loading competitions');
        loadCompetitions(false);
    } else {
        console.log('User is not officer or profile not loaded yet');
        resetStore();
    }
});