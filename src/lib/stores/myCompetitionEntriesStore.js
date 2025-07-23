// src/stores/myCompetitionEntriesStore.js
// JAX Members Portal - My Competition Entries Store
// Manages user's personal competition entries

import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from '$lib/stores/userProfile.js';
import { get } from 'svelte/store';

// =============================================
// Store State
// =============================================

// Raw data stores
export const myEntries = writable([]);
export const isLoaded = writable(false);
export const isLoading = writable(false);
export const error = writable(null);

// Last refresh timestamp for caching
export const lastRefresh = writable(null);

// =============================================
// Derived Stores
// =============================================

// Group entries by competition
export const entriesByCompetition = derived(myEntries, ($myEntries) => {
    const grouped = {};
    $myEntries.forEach(entry => {
        const compId = entry.competition.id;
        if (!grouped[compId]) {
            grouped[compId] = {
                competition: entry.competition,
                entries: []
            };
        }
        grouped[compId].entries.push(entry);
    });
    
    // Sort by competition deadline (most recent first)
    return Object.values(grouped).sort((a, b) => 
        new Date(b.competition.entry_deadline) - new Date(a.competition.entry_deadline)
    );
});

// Get entries for active competitions only
export const activeEntries = derived(myEntries, ($myEntries) => {
    const now = new Date();
    return $myEntries.filter(entry => 
        entry.competition.active && 
        new Date(entry.competition.entry_deadline) > now
    );
});

// Get entries for past competitions
export const pastEntries = derived(myEntries, ($myEntries) => {
    const now = new Date();
    return $myEntries.filter(entry => 
        !entry.competition.active || 
        new Date(entry.competition.entry_deadline) <= now
    );
});

// Entry statistics
export const entryStats = derived(myEntries, ($myEntries) => {
    const stats = {
        total: $myEntries.length,
        active: 0,
        past: 0,
        pending_payment: 0,
        paid: 0
    };

    const now = new Date();
    $myEntries.forEach(entry => {
        if (entry.competition.active && new Date(entry.competition.entry_deadline) > now) {
            stats.active++;
        } else {
            stats.past++;
        }

        if (entry.entry_fee_paid) {
            stats.paid++;
        } else {
            stats.pending_payment++;
        }
    });

    return stats;
});

// =============================================
// Load Functions
// =============================================

// Load user's competition entries
export async function loadMyEntries(forceRefresh = false) {
    const now = new Date();
    const lastRefreshTime = get(lastRefresh);
    
    // Wait for user profile to be loaded (NEW FIX)
    let attempts = 0;
    let userProfileValue = get(userProfile);
    
    while (!userProfileValue?.id && attempts < 10) {
        console.log(`⏳ Waiting for user profile... (attempt ${attempts + 1})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        userProfileValue = get(userProfile);
        attempts++;
    }

    if (!userProfileValue?.id) {
        console.log('❌ No user ID available after waiting - user may not be logged in');
        error.set('User not logged in');
        isLoaded.set(true);
        return;
    }

    const userId = userProfileValue.id;

    // Cache for 30 seconds unless force refresh
    if (!forceRefresh && lastRefreshTime && (now - lastRefreshTime) < 30000) {
        console.log('🍺 Using cached competition entries');
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        console.log('🍺 Loading my competition entries...');
        
        const { data, error: queryError } = await supabase
            .from('competition_entries')
            .select(`
                *,
                competition:competitions(
                    id,
                    name,
                    description,
                    entry_deadline,
                    judging_date,
                    results_published,
                    active
                ),
                bjcp_category:bjcp_categories(
                    id,
                    category_number,
                    subcategory_letter,
                    subcategory_name,
                    category_name
                ),
                results:competition_results(
                    score,
                    place,
                    judge_notes,
                    award_type
                )
            `)
            .eq('member_id', userId)
            .order('submitted_at', { ascending: false });

        if (queryError) {
            console.error('❌ Error loading entries:', queryError);
            throw queryError;
        }

        // Process the data to add convenience fields
        const processedEntries = (data || []).map(entry => ({
            ...entry,
            // Add computed fields
            category_display: entry.bjcp_category 
                ? `${entry.bjcp_category.category_number}${entry.bjcp_category.subcategory_letter} - ${entry.bjcp_category.subcategory_name}`
                : 'Unknown Category',
            can_edit: entry.competition.active && new Date(entry.competition.entry_deadline) > now,
            days_until_deadline: entry.competition.active 
                ? Math.ceil((new Date(entry.competition.entry_deadline) - now) / (1000 * 60 * 60 * 24))
                : 0,
            has_results: entry.results && entry.results.length > 0,
            result: entry.results?.[0] || null
        }));

        console.log(`✅ Loaded ${processedEntries.length} competition entries`);
        myEntries.set(processedEntries);
        lastRefresh.set(now);
        
    } catch (err) {
        console.error('💥 Failed to load competition entries:', err);
        error.set(err.message || 'Failed to load competition entries');
    } finally {
        isLoading.set(false);
        isLoaded.set(true);
    }
}

// =============================================
// Entry Management Functions
// =============================================

// Update an entry (before deadline)
export async function updateEntry(entryId, updates) {
    try {
        console.log('📝 Updating competition entry:', entryId);
        
        const { data, error: updateError } = await supabase
            .from('competition_entries')
            .update({
                beer_name: updates.beer_name,
                beer_notes: updates.beer_notes,
                bjcp_category_id: updates.bjcp_category_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', entryId)
            .select(`
                *,
                competition:competitions(
                    id,
                    name,
                    entry_deadline,
                    active
                ),
                bjcp_category:bjcp_categories(
                    category_number,
                    subcategory_letter,
                    subcategory_name
                )
            `)
            .single();

        if (updateError) {
            console.error('❌ Error updating entry:', updateError);
            throw updateError;
        }

        console.log('✅ Entry updated successfully');
        
        // Refresh entries list
        await loadMyEntries(true);
        
        return data;
        
    } catch (err) {
        console.error('💥 Failed to update entry:', err);
        throw err;
    }
}

// Delete an entry (before deadline)
export async function deleteEntry(entryId) {
    try {
        console.log('🗑️ Deleting competition entry:', entryId);
        
        const { error: deleteError } = await supabase
            .from('competition_entries')
            .delete()
            .eq('id', entryId);

        if (deleteError) {
            console.error('❌ Error deleting entry:', deleteError);
            throw deleteError;
        }

        console.log('✅ Entry deleted successfully');
        
        // Refresh entries list
        await loadMyEntries(true);
        
    } catch (err) {
        console.error('💥 Failed to delete entry:', err);
        throw err;
    }
}

// Submit a new entry
export async function submitEntry(entryData) {
    try {
        console.log('🍺 Submitting new competition entry...');
        
        // Generate random entry number
        const entryNumber = Math.floor(Math.random() * 99999 + 1).toString().padStart(5, '0');
        
        const { data, error: insertError } = await supabase
            .from('competition_entries')
            .insert([{
                ...entryData,
                entry_number: entryNumber,
                member_id: get(userProfile)?.id
            }])
            .select(`
                *,
                competition:competitions(
                    id,
                    name,
                    entry_deadline,
                    active
                ),
                bjcp_category:bjcp_categories(
                    category_number,
                    subcategory_letter,
                    subcategory_name
                )
            `)
            .single();

        if (insertError) {
            console.error('❌ Error submitting entry:', insertError);
            throw insertError;
        }

        console.log('✅ Entry submitted successfully:', data.id);
        
        // Refresh entries list
        await loadMyEntries(true);
        
        return data;
        
    } catch (err) {
        console.error('💥 Failed to submit entry:', err);
        throw err;
    }
}

// =============================================
// Utility Functions
// =============================================

// Get entry by ID
export function getEntryById(entryId) {
    const entries = get(myEntries);
    return entries.find(entry => entry.id === entryId);
}

// Check if entry can be edited
export function canEditEntry(entry) {
    if (!entry) return false;
    const now = new Date();
    return entry.competition.active && new Date(entry.competition.entry_deadline) > now;
}

// Format entry deadline
export function formatDeadline(entry) {
    if (!entry?.competition?.entry_deadline) return '';
    const deadline = new Date(entry.competition.entry_deadline);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    };
    return deadline.toLocaleDateString('en-US', options);
}

// Get award display text
export function getAwardDisplay(result) {
    if (!result) return null;
    
    const awards = {
        'first': '🥇 1st Place',
        'second': '🥈 2nd Place', 
        'third': '🥉 3rd Place',
        'best_of_show': '🏆 Best of Show'
    };
    
    return awards[result.award_type] || `Score: ${result.score}/50`;
}

// Get payment status display
export function getPaymentStatus(entry) {
    return entry.entry_fee_paid 
        ? { text: '✅ Paid', class: 'paid' }
        : { text: '⏳ Pending', class: 'pending' };
}

// =============================================
// Store Helpers
// =============================================

// Reset store to initial state
export function resetStore() {
    myEntries.set([]);
    isLoaded.set(false);
    isLoading.set(false);
    error.set(null);
    lastRefresh.set(null);
    console.log('🔄 My entries store reset');
}

// Force refresh data
export async function forceRefresh() {
    console.log('🔄 Force refreshing my entries...');
    lastRefresh.set(null);
    await loadMyEntries(true);
}

// Subscribe to store changes for debugging
if (typeof window !== 'undefined') {
    myEntries.subscribe(value => {
        console.log('🍺 My entries updated:', value.length, 'entries');
    });
    
    error.subscribe(value => {
        if (value) {
            console.error('❌ My entries store error:', value);
        }
    });
}