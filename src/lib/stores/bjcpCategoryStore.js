// src/stores/bjcpCategoryStore.js
// JAX Members Portal - BJCP Categories Store
// Manages BJCP categories and competition data

import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

// =============================================
// Store State
// =============================================

// Raw data stores
export const bjcpCategories = writable([]);
export const competitions = writable([]);
export const isLoaded = writable(false);
export const isLoading = writable(false);
export const error = writable(null);

// Last refresh timestamp for caching
export const lastRefresh = writable(null);

// =============================================
// Derived Stores
// =============================================

// Group categories by main category number
export const categoriesByNumber = derived(bjcpCategories, ($bjcpCategories) => {
    const grouped = {};
    $bjcpCategories.forEach(cat => {
        if (!grouped[cat.category_number]) {
            grouped[cat.category_number] = {
                number: cat.category_number,
                name: cat.category_name,
                subcategories: []
            };
        }
        
        if (cat.subcategory_letter) {
            grouped[cat.category_number].subcategories.push({
                id: cat.id,
                letter: cat.subcategory_letter,
                name: cat.subcategory_name,
                full_name: cat.subcategory_name, // Updated to use subcategory_name
                description: cat.description
            });
        }
    });
    
    return grouped;
});

// Get unique main categories for first dropdown
export const mainCategories = derived(categoriesByNumber, ($categoriesByNumber) => {
    return Object.values($categoriesByNumber).sort((a, b) => 
        parseInt(a.number) - parseInt(b.number)
    );
});

// Get active competitions (entries still open)
export const activeCompetitions = derived(competitions, ($competitions) => {
    const now = new Date();
    return $competitions
        .filter(comp => comp.active && new Date(comp.entry_deadline) > now)
        .sort((a, b) => new Date(a.entry_deadline) - new Date(b.entry_deadline));
});

// Get all competitions for officer management
export const allCompetitions = derived(competitions, ($competitions) => {
    return $competitions.sort((a, b) => {
        // Helper function to parse timestamps safely
        const parseTimestamp = (timestamp) => {
            if (!timestamp) return new Date(0);
            try {
                let isoString = timestamp;
                if (timestamp.includes(' ') && !timestamp.includes('T')) {
                    isoString = timestamp.replace(' ', 'T');
                    if (!isoString.includes('+') && !isoString.includes('Z')) {
                        isoString += 'Z';
                    }
                }
                return new Date(isoString);
            } catch {
                return new Date(0);
            }
        };
        
        return parseTimestamp(b.created_at) - parseTimestamp(a.created_at);
    });
});

// =============================================
// Load Functions
// =============================================

// Load BJCP categories from database - FIXED to use direct query
export async function loadBjcpCategories(forceRefresh = false) {
    const now = new Date();
    const lastRefreshTime = get(lastRefresh);
    
    // Cache for 30 seconds unless force refresh
    if (!forceRefresh && lastRefreshTime && (now - lastRefreshTime) < 30000) {
        console.log('🎯 Using cached BJCP categories');
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        console.log('📋 Loading BJCP categories...');
        
        // FIXED: Use direct table query instead of RPC
        const { data, error: queryError } = await supabase
            .from('bjcp_categories')
            .select('*')
            .order('category_number', { ascending: true })
            .order('subcategory_letter', { ascending: true });

        if (queryError) {
            console.error('❌ Error loading BJCP categories:', queryError);
            throw queryError;
        }

        console.log(`✅ Loaded ${data?.length || 0} BJCP categories`);
        bjcpCategories.set(data || []);
        lastRefresh.set(now);
        
    } catch (err) {
        console.error('💥 Failed to load BJCP categories:', err);
        error.set(err.message || 'Failed to load BJCP categories');
    } finally {
        isLoading.set(false);
        isLoaded.set(true);
    }
}

// Load competitions from database - FIXED to use direct query
export async function loadCompetitions(forceRefresh = false) {
    const now = new Date();
    const lastRefreshTime = get(lastRefresh);
    
    // Cache for 30 seconds unless force refresh
    if (!forceRefresh && lastRefreshTime && (now - lastRefreshTime) < 30000) {
        console.log('🏆 Using cached competitions');
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        console.log('🏆 Loading competitions...');
        
        // FIXED: Use direct table query instead of RPC
        const { data, error: queryError } = await supabase
            .from('competitions')
            .select('*')
            .order('entry_deadline', { ascending: false });

        if (queryError) {
            console.error('❌ Error loading competitions:', queryError);
            throw queryError;
        }

        console.log(`✅ Loaded ${data?.length || 0} competitions`);
        competitions.set(data || []);
        lastRefresh.set(now);
        
    } catch (err) {
        console.error('💥 Failed to load competitions:', err);
        error.set(err.message || 'Failed to load competitions');
    } finally {
        isLoading.set(false);
        isLoaded.set(true);
    }
}

// Load all data needed for competition system
export async function loadCompetitionData(forceRefresh = false) {
    console.log('🚀 Loading all competition data...');
    
    try {
        await Promise.all([
            loadBjcpCategories(forceRefresh),
            loadCompetitions(forceRefresh)
        ]);
        
        console.log('✅ All competition data loaded successfully');
    } catch (err) {
        console.error('💥 Failed to load competition data:', err);
        throw err;
    }
}

// =============================================
// Utility Functions
// =============================================

// Get subcategories for a specific main category
export function getSubcategoriesForCategory(categoryNumber) {
    const categories = get(categoriesByNumber);
    return categories[categoryNumber]?.subcategories || [];
}

// Find a category by ID
export function getCategoryById(categoryId) {
    const categories = get(bjcpCategories);
    return categories.find(cat => cat.id === categoryId);
}

// Get competition by ID
export function getCompetitionById(competitionId) {
    const comps = get(competitions);
    return comps.find(comp => comp.id === competitionId);
}

// Check if entries are still open for a competition
export function areEntriesOpen(competition) {
    if (!competition) return false;
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    return competition.active && deadline > now;
}

// Get days until entry deadline
export function getDaysUntilDeadline(competition) {
    if (!competition) return null;
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

// Format competition deadline for display
export function formatDeadline(competition) {
    if (!competition) return '';
    const deadline = new Date(competition.entry_deadline);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    };
    return deadline.toLocaleDateString('en-US', options);
}

// =============================================
// Competition Management Functions (Officer Only)
// =============================================

// Create a new competition
export async function createCompetition(competitionData) {
    try {
        console.log('🏆 Creating new competition:', competitionData.name);
        
        const { data, error: insertError } = await supabase
            .from('competitions')
            .insert([{
                name: competitionData.name,
                description: competitionData.description,
                entry_deadline: competitionData.entry_deadline,
                judging_date: competitionData.judging_date,
                active: true
            }])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error creating competition:', insertError);
            throw insertError;
        }

        console.log('✅ Competition created successfully:', data.id);
        
        // Refresh competitions list
        await loadCompetitions(true);
        
        return data;
        
    } catch (err) {
        console.error('💥 Failed to create competition:', err);
        throw err;
    }
}

// Update a competition
export async function updateCompetition(competitionId, updates) {
    try {
        console.log('📝 Updating competition:', competitionId);
        
        const { data, error: updateError } = await supabase
            .from('competitions')
            .update(updates)
            .eq('id', competitionId)
            .select()
            .single();

        if (updateError) {
            console.error('❌ Error updating competition:', updateError);
            throw updateError;
        }

        console.log('✅ Competition updated successfully');
        
        // Refresh competitions list
        await loadCompetitions(true);
        
        return data;
        
    } catch (err) {
        console.error('💥 Failed to update competition:', err);
        throw err;
    }
}

// Deactivate a competition
export async function deactivateCompetition(competitionId) {
    try {
        console.log('🚫 Deactivating competition:', competitionId);
        
        const { error: updateError } = await supabase
            .from('competitions')
            .update({ active: false })
            .eq('id', competitionId);

        if (updateError) {
            console.error('❌ Error deactivating competition:', updateError);
            throw updateError;
        }

        console.log('✅ Competition deactivated successfully');
        
        // Refresh competitions list
        await loadCompetitions(true);
        
    } catch (err) {
        console.error('💥 Failed to deactivate competition:', err);
        throw err;
    }
}

// =============================================
// Store Helpers (following established patterns)
// =============================================

// Reset all stores to initial state
export function resetStores() {
    bjcpCategories.set([]);
    competitions.set([]);
    isLoaded.set(false);
    isLoading.set(false);
    error.set(null);
    lastRefresh.set(null);
    console.log('🔄 Competition stores reset');
}

// Force refresh all data
export async function forceRefresh() {
    console.log('🔄 Force refreshing competition data...');
    lastRefresh.set(null);
    await loadCompetitionData(true);
}

// Subscribe to store changes for debugging
if (typeof window !== 'undefined') {
    bjcpCategories.subscribe(value => {
        console.log('📋 BJCP Categories updated:', value.length, 'categories');
    });
    
    competitions.subscribe(value => {
        console.log('🏆 Competitions updated:', value.length, 'competitions');
    });
    
    error.subscribe(value => {
        if (value) {
            console.error('❌ Competition store error:', value);
        }
    });
}