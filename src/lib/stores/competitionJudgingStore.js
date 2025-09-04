// Competition judging store for managing judges and judging workflow
import { writable, derived, get } from 'svelte/store';
import { supabase } from '../supabaseClient.js';

// Judge assignment store
export const judgeStore = writable({
  judges: [],
  loading: false,
  error: null,
  lastUpdate: null
});

// Current judging session store
export const judgingSessionStore = writable({
  activeCompetition: null,
  assignedEntries: [],
  currentEntry: null,
  judgeId: null,
  sessionActive: false,
  loading: false,
  error: null
});

// Judging workflow states
export const JUDGING_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  PUBLISHED: 'published'
};

// Judge roles
export const JUDGE_ROLES = {
  BJCP_JUDGE: 'bjcp_judge',
  CLUB_JUDGE: 'club_judge',
  GUEST_JUDGE: 'guest_judge'
};

class CompetitionJudgingStore {
  
  // Load judges for a competition
  async loadJudges(competitionId) {
    judgeStore.update(store => ({ ...store, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('competition_judges')
        .select(`
          *,
          judge:members(id, name, email, phone),
          competition:competitions(id, name, judging_date)
        `)
        .eq('competition_id', competitionId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      judgeStore.update(store => ({
        ...store,
        judges: data || [],
        loading: false,
        lastUpdate: Date.now()
      }));

      return data;
    } catch (err) {
      console.error('Error loading judges:', err);
      judgeStore.update(store => ({
        ...store,
        loading: false,
        error: err.message
      }));
      throw err;
    }
  }

  // Assign a judge to a competition
  async assignJudge(competitionId, judgeData) {
    try {
      const assignmentData = {
        competition_id: competitionId,
        judge_id: judgeData.judge_id,
        judge_role: judgeData.judge_role || JUDGE_ROLES.CLUB_JUDGE,
        assignment_notes: judgeData.assignment_notes || null,
        assigned_at: new Date().toISOString(),
        assigned_by: judgeData.assigned_by,
        active: true
      };

      const { data, error } = await supabase
        .from('competition_judges')
        .insert([assignmentData])
        .select(`
          *,
          judge:members(id, name, email, phone),
          competition:competitions(id, name, judging_date)
        `)
        .single();

      if (error) throw error;

      // Update local store
      judgeStore.update(store => ({
        ...store,
        judges: [...store.judges, data]
      }));

      return data;
    } catch (err) {
      console.error('Error assigning judge:', err);
      throw err;
    }
  }

  // Remove judge assignment
  async removeJudge(assignmentId) {
    try {
      const { error } = await supabase
        .from('competition_judges')
        .update({ active: false, removed_at: new Date().toISOString() })
        .eq('id', assignmentId);

      if (error) throw error;

      // Update local store
      judgeStore.update(store => ({
        ...store,
        judges: store.judges.filter(j => j.id !== assignmentId)
      }));

    } catch (err) {
      console.error('Error removing judge:', err);
      throw err;
    }
  }

  // Start judging session for a judge
  async startJudgingSession(competitionId, judgeId) {
    judgingSessionStore.update(store => ({ ...store, loading: true, error: null }));

    try {
      // Verify judge assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('competition_judges')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('judge_id', judgeId)
        .eq('active', true)
        .single();

      if (assignmentError || !assignment) {
        throw new Error('Judge not assigned to this competition');
      }

      // Load competition details
      const { data: competition, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError) throw compError;

      // Check if judging is active (past deadline, before/on judging date)
      const now = new Date();
      const deadline = new Date(competition.entry_deadline);
      const judgingDate = new Date(competition.judging_date);
      
      if (now < deadline) {
        throw new Error('Competition entry deadline has not passed yet');
      }

      // Load entries to judge
      const { data: entries, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
          *,
          category:bjcp_categories(id, category_name, category_number, subcategory_letter, subcategory_name)
        `)
        .eq('competition_id', competitionId)
        .order('bjcp_category_id', { ascending: true })
        .order('entry_number', { ascending: true });

      if (entriesError) throw entriesError;

      // Load existing judging data for this judge
      const { data: existingJudging, error: judgingError } = await supabase
        .from('competition_judging_sessions')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('judge_id', judgeId);

      if (judgingError) {
        console.warn('No existing judging sessions found');
      }

      // Merge judging data with entries
      const entriesWithJudging = entries.map(entry => {
        const judgingSession = existingJudging?.find(j => j.entry_id === entry.id);
        return {
          ...entry,
          judging: judgingSession || null,
          hasBeenJudged: !!judgingSession?.score
        };
      });

      judgingSessionStore.update(store => ({
        ...store,
        activeCompetition: competition,
        assignedEntries: entriesWithJudging,
        judgeId,
        sessionActive: true,
        loading: false,
        currentEntry: entriesWithJudging[0] || null
      }));

      return {
        competition,
        entries: entriesWithJudging,
        assignment
      };

    } catch (err) {
      console.error('Error starting judging session:', err);
      judgingSessionStore.update(store => ({
        ...store,
        loading: false,
        error: err.message,
        sessionActive: false
      }));
      throw err;
    }
  }

  // Save judging results for an entry
  async saveJudgingResults(entryId, judgingData) {
    try {
      const sessionStore = get(judgingSessionStore);
      
      const judgingSession = {
        competition_id: sessionStore.activeCompetition.id,
        entry_id: entryId,
        judge_id: sessionStore.judgeId,
        aroma_score: judgingData.aroma_score || null,
        appearance_score: judgingData.appearance_score || null,
        flavor_score: judgingData.flavor_score || null,
        mouthfeel_score: judgingData.mouthfeel_score || null,
        overall_score: judgingData.overall_score || null,
        total_score: judgingData.total_score || null,
        judge_notes: judgingData.judge_notes || null,
        private_notes: judgingData.private_notes || null,
        judged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if session already exists
      const { data: existing } = await supabase
        .from('competition_judging_sessions')
        .select('id')
        .eq('competition_id', sessionStore.activeCompetition.id)
        .eq('entry_id', entryId)
        .eq('judge_id', sessionStore.judgeId)
        .single();

      let result;
      if (existing) {
        // Update existing session
        result = await supabase
          .from('competition_judging_sessions')
          .update(judgingSession)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new session
        result = await supabase
          .from('competition_judging_sessions')
          .insert([judgingSession])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update local store
      judgingSessionStore.update(store => {
        const updatedEntries = store.assignedEntries.map(entry => {
          if (entry.id === entryId) {
            return {
              ...entry,
              judging: result.data,
              hasBeenJudged: true
            };
          }
          return entry;
        });

        return {
          ...store,
          assignedEntries: updatedEntries
        };
      });

      return result.data;

    } catch (err) {
      console.error('Error saving judging results:', err);
      throw err;
    }
  }

  // Get judging progress for a judge
  getJudgingProgress() {
    const sessionStore = get(judgingSessionStore);
    if (!sessionStore.assignedEntries.length) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const total = sessionStore.assignedEntries.length;
    const completed = sessionStore.assignedEntries.filter(e => e.hasBeenJudged).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, percentage };
  }

  // Navigate to next/previous entry
  setCurrentEntry(entryIndex) {
    judgingSessionStore.update(store => {
      const entry = store.assignedEntries[entryIndex] || null;
      return {
        ...store,
        currentEntry: entry
      };
    });
  }

  // End judging session
  endSession() {
    judgingSessionStore.update(store => ({
      activeCompetition: null,
      assignedEntries: [],
      currentEntry: null,
      judgeId: null,
      sessionActive: false,
      loading: false,
      error: null
    }));
  }

  // Clear errors
  clearError() {
    judgeStore.update(store => ({ ...store, error: null }));
    judgingSessionStore.update(store => ({ ...store, error: null }));
  }
}

export const competitionJudgingStore = new CompetitionJudgingStore();

// Derived stores for convenience
export const judgeList = derived(judgeStore, $store => $store.judges);
export const isLoadingJudges = derived(judgeStore, $store => $store.loading);
export const judgeError = derived(judgeStore, $store => $store.error);

export const activeSession = derived(judgingSessionStore, $store => $store);
export const isJudging = derived(judgingSessionStore, $store => $store.sessionActive);
export const currentEntry = derived(judgingSessionStore, $store => $store.currentEntry);