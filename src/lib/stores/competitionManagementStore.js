// src/lib/stores/competitionManagementStore.js
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from '$lib/stores/userProfile';

// Store for all competitions (officer view)
const allCompetitions = writable([]);
const isLoading = writable(true);
const error = writable(null);
const lastFetch = writable(null);

// Cache duration (30 seconds following established pattern)
const CACHE_DURATION = 30000;

// Load all competitions with entry counts
async function loadCompetitions(forceRefresh = false) {
  console.log('🔍 loadCompetitions called, forceRefresh:', forceRefresh);
  
  const profile = get(userProfile);
  console.log('👤 User profile:', profile);
  
  // Check if user is an officer
  if (!profile?.is_officer) {
    console.error('❌ User is not an officer or profile not loaded');
    error.set('Unauthorized: Officer access required');
    isLoading.set(false);
    return;
  }

  const now = Date.now();
  const last = get(lastFetch);
  
  // Use cache if available and not forcing refresh
  if (!forceRefresh && last && (now - last) < CACHE_DURATION && get(allCompetitions).length > 0) {
    console.log('📦 Using cached data');
    return;
  }

  console.log('🔄 Loading fresh competition data...');
  isLoading.set(true);
  error.set(null);

  try {
    // Try to use the RPC function first, fall back to direct query if it doesn't exist
    let competitionsData;
    
    try {
      // Attempt to use the optimized RPC function
      console.log('🚀 Attempting to call get_competitions_with_stats RPC...');
      const { data, error } = await supabase
        .rpc('get_competitions_with_stats');
      
      if (error) {
        console.error('❌ RPC error:', error);
        throw error;
      }
      
      console.log('✅ RPC successful, data:', data);
      competitionsData = data;
    } catch (rpcError) {
      console.log('⚠️ RPC function not available, using direct query. Error:', rpcError.message);
      
      // Fallback: Query competitions directly and get counts separately
      console.log('📊 Fetching competitions table directly...');
      const { data: comps, error: compsError } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (compsError) {
        console.error('❌ Error fetching competitions:', compsError);
        throw compsError;
      }
      
      console.log('✅ Competitions fetched:', comps);
      
      // Get entry counts for each competition
      console.log('📈 Getting entry counts for each competition...');
      competitionsData = await Promise.all((comps || []).map(async (comp) => {
        const { count, error: countError } = await supabase
          .from('competition_entries')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', comp.id);
        
        if (countError) {
          console.warn(`⚠️ Error getting count for competition ${comp.id}:`, countError);
        }
        
        return {
          ...comp,
          entry_count: count || 0
        };
      }));
      
      console.log('✅ Competition data with counts:', competitionsData);
    }

    // Sort by created_at desc (newest first)
    const sortedCompetitions = (competitionsData || []).sort((a, b) => {
      const dateA = new Date(b.created_at || b.entry_deadline || 0);
      const dateB = new Date(a.created_at || a.entry_deadline || 0);
      return dateA - dateB;
    });

    console.log('📝 Setting sorted competitions:', sortedCompetitions);
    allCompetitions.set(sortedCompetitions);
    lastFetch.set(now);
  } catch (err) {
    console.error('❌ Error loading competitions:', err);
    error.set(err.message || 'Failed to load competitions');
    allCompetitions.set([]);
  } finally {
    console.log('✨ Loading complete');
    isLoading.set(false);
  }
}

// Create a new competition
async function createCompetition(competitionData) {
  const profile = get(userProfile);
  
  if (!profile?.is_officer) {
    throw new Error('Unauthorized: Officer access required');
  }

  try {
    const { data, error: insertError } = await supabase
      .from('competitions')
      .insert([{
        ...competitionData,
        created_by: profile.id
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Refresh the competitions list
    await loadCompetitions(true);
    
    return { success: true, data };
  } catch (err) {
    console.error('Error creating competition:', err);
    return { success: false, error: err.message };
  }
}

// Update an existing competition
async function updateCompetition(competitionId, updates) {
  const profile = get(userProfile);
  
  if (!profile?.is_officer) {
    throw new Error('Unauthorized: Officer access required');
  }

  try {
    const { data, error: updateError } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', competitionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Refresh the competitions list
    await loadCompetitions(true);
    
    return { success: true, data };
  } catch (err) {
    console.error('Error updating competition:', err);
    return { success: false, error: err.message };
  }
}

// Delete a competition (only if no entries)
async function deleteCompetition(competitionId) {
  const profile = get(userProfile);
  
  if (!profile?.is_officer) {
    throw new Error('Unauthorized: Officer access required');
  }

  try {
    // First check if competition has entries
    const { data: entries, error: entriesError } = await supabase
      .from('competition_entries')
      .select('id')
      .eq('competition_id', competitionId)
      .limit(1);

    if (entriesError) throw entriesError;

    if (entries && entries.length > 0) {
      throw new Error('Cannot delete competition with existing entries');
    }

    // Delete the competition
    const { error: deleteError } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (deleteError) throw deleteError;

    // Refresh the competitions list
    await loadCompetitions(true);
    
    return { success: true };
  } catch (err) {
    console.error('Error deleting competition:', err);
    return { success: false, error: err.message };
  }
}

// Toggle competition status (active/inactive)
async function toggleCompetitionStatus(competitionId, newStatus) {
  return updateCompetition(competitionId, { active: newStatus });
}

// Derived stores for filtering
const activeCompetitions = derived(
  allCompetitions,
  $allCompetitions => $allCompetitions.filter(c => c.active)
);

const upcomingCompetitions = derived(
  allCompetitions,
  $allCompetitions => $allCompetitions.filter(c => {
    const deadline = new Date(c.entry_deadline);
    return deadline > new Date() && c.active;
  })
);

const pastCompetitions = derived(
  allCompetitions,
  $allCompetitions => $allCompetitions.filter(c => {
    const deadline = new Date(c.entry_deadline);
    return deadline <= new Date() || !c.active;
  })
);

// Competition statistics
const competitionStats = derived(
  allCompetitions,
  $allCompetitions => {
    const total = $allCompetitions.length;
    const active = $allCompetitions.filter(c => c.active).length;
    const totalEntries = $allCompetitions.reduce((sum, c) => sum + (c.entry_count || 0), 0);
    const avgEntries = total > 0 ? Math.round(totalEntries / total) : 0;

    return {
      total,
      active,
      totalEntries,
      avgEntries
    };
  }
);

// Initialize store
function initializeStore() {
  console.log('🚀 Initializing competition management store');
  
  // Reset store when user profile changes
  const unsubscribe = userProfile.subscribe(profile => {
    console.log('👤 User profile changed in store:', profile);
    
    if (profile?.is_officer) {
      console.log('✅ User is officer, loading competitions');
      loadCompetitions();
    } else {
      console.log('⚠️ User is not officer or profile not loaded yet');
      allCompetitions.set([]);
      error.set(null);
      isLoading.set(false);
    }
  });
  
  console.log('✅ Store initialization complete');
  return unsubscribe;
}

// Export store and functions
export const competitionManagementStore = {
  subscribe: allCompetitions.subscribe,
  isLoading: isLoading,
  error: error,
  activeCompetitions: activeCompetitions,
  upcomingCompetitions: upcomingCompetitions,
  pastCompetitions: pastCompetitions,
  stats: competitionStats,
  loadCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  toggleCompetitionStatus,
  initialize: initializeStore
};