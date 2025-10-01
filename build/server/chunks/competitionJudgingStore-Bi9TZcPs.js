import { w as writable, d as derived } from './index-Ct3aIOD7.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';
import { l as get_store_value } from './ssr-CFMHIens.js';

const judgeStore = writable({
  judges: [],
  loading: false,
  error: null,
  lastUpdate: null
});
const judgingSessionStore = writable({
  activeCompetition: null,
  assignedEntries: [],
  currentEntry: null,
  judgeId: null,
  sessionActive: false,
  loading: false,
  error: null
});
const JUDGE_ROLES = {
  BJCP_JUDGE: "bjcp_judge",
  CLUB_JUDGE: "club_judge",
  GUEST_JUDGE: "guest_judge"
};
class CompetitionJudgingStore {
  // Load judges for a competition
  async loadJudges(competitionId) {
    judgeStore.update((store) => ({ ...store, loading: true, error: null }));
    try {
      const { data, error } = await supabase.from("competition_judges").select(`
          *,
          judge:members!competition_judges_judge_id_fkey(id, name, email, phone),
          competition:competitions(id, name, judging_date)
        `).eq("competition_id", competitionId).order("assigned_at", { ascending: false });
      if (error) throw error;
      judgeStore.update((store) => ({
        ...store,
        judges: data || [],
        loading: false,
        lastUpdate: Date.now()
      }));
      return data;
    } catch (err) {
      console.error("Error loading judges:", err);
      judgeStore.update((store) => ({
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
        assigned_at: (/* @__PURE__ */ new Date()).toISOString(),
        assigned_by: judgeData.assigned_by,
        active: true
      };
      const { data, error } = await supabase.from("competition_judges").insert([assignmentData]).select(`
          *,
          judge:members!competition_judges_judge_id_fkey(id, name, email, phone),
          competition:competitions(id, name, judging_date)
        `).single();
      if (error) throw error;
      judgeStore.update((store) => ({
        ...store,
        judges: [...store.judges, data]
      }));
      return data;
    } catch (err) {
      console.error("Error assigning judge:", err);
      throw err;
    }
  }
  // Remove judge assignment
  async removeJudge(assignmentId) {
    try {
      const { error } = await supabase.from("competition_judges").update({ active: false, removed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", assignmentId);
      if (error) throw error;
      judgeStore.update((store) => ({
        ...store,
        judges: store.judges.filter((j) => j.id !== assignmentId)
      }));
    } catch (err) {
      console.error("Error removing judge:", err);
      throw err;
    }
  }
  // Start judging session for a judge
  async startJudgingSession(competitionId, judgeId) {
    this.endSession();
    judgingSessionStore.update((store) => ({ ...store, loading: true, error: null }));
    try {
      const { data: assignment, error: assignmentError } = await supabase.from("competition_judges").select("*").eq("competition_id", competitionId).eq("judge_id", judgeId).eq("active", true).single();
      if (assignmentError || !assignment) {
        throw new Error("Judge not assigned to this competition");
      }
      const { data: competition, error: compError } = await supabase.from("competitions").select("*").eq("id", competitionId).single();
      if (compError) throw compError;
      const now = /* @__PURE__ */ new Date();
      const deadline = new Date(competition.entry_deadline);
      const judgingDate = new Date(competition.judging_date);
      if (now < deadline) {
        throw new Error("Competition entry deadline has not passed yet");
      }
      const { data: entries, error: entriesError } = await supabase.from("competition_entries").select(`
          *,
          category:bjcp_categories(id, category_name, category_number, subcategory_letter, subcategory_name)
        `).eq("competition_id", competitionId).order("bjcp_category_id", { ascending: true }).order("entry_number", { ascending: true });
      if (entriesError) throw entriesError;
      const { data: existingJudging, error: judgingError } = await supabase.from("competition_judging_sessions").select("*").eq("competition_id", competitionId).eq("judge_id", judgeId);
      if (judgingError) {
        console.warn("Error loading existing judging sessions:", judgingError);
      }
      const entriesWithJudging = entries.map((entry) => {
        const judgingSession = existingJudging?.find((j) => j.entry_id === entry.id);
        const hasValidScores = judgingSession && (judgingSession.aroma_score !== null || judgingSession.appearance_score !== null || judgingSession.flavor_score !== null || judgingSession.mouthfeel_score !== null || judgingSession.overall_score !== null);
        return {
          ...entry,
          judging: judgingSession || null,
          hasBeenJudged: !!hasValidScores
        };
      });
      judgingSessionStore.update((store) => ({
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
      console.error("Error starting judging session:", err);
      judgingSessionStore.update((store) => ({
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
      const sessionStore = get_store_value(judgingSessionStore);
      const judgingSession = {
        competition_id: sessionStore.activeCompetition.id,
        entry_id: entryId,
        judge_id: sessionStore.judgeId,
        aroma_score: judgingData.aroma_score || null,
        appearance_score: judgingData.appearance_score || null,
        flavor_score: judgingData.flavor_score || null,
        mouthfeel_score: judgingData.mouthfeel_score || null,
        overall_score: judgingData.overall_score || null,
        // total_score is auto-calculated by database as a generated column
        judge_notes: judgingData.judge_notes || null,
        private_notes: judgingData.private_notes || null,
        scoresheet_data: judgingData.scoresheet_data || null,
        // Store full scoresheet data
        judged_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data: existing } = await supabase.from("competition_judging_sessions").select("id").eq("competition_id", sessionStore.activeCompetition.id).eq("entry_id", entryId).eq("judge_id", sessionStore.judgeId).single();
      let result;
      if (existing) {
        result = await supabase.from("competition_judging_sessions").update(judgingSession).eq("id", existing.id).select().single();
      } else {
        result = await supabase.from("competition_judging_sessions").insert([judgingSession]).select().single();
      }
      if (result.error) throw result.error;
      judgingSessionStore.update((store) => {
        const updatedEntries = store.assignedEntries.map((entry) => {
          if (entry.id === entryId) {
            const hasValidScores = result.data && (result.data.aroma_score !== null || result.data.appearance_score !== null || result.data.flavor_score !== null || result.data.mouthfeel_score !== null || result.data.overall_score !== null);
            return {
              ...entry,
              judging: result.data,
              hasBeenJudged: !!hasValidScores
            };
          }
          return entry;
        });
        let updatedCurrentEntry = store.currentEntry;
        if (store.currentEntry && store.currentEntry.id === entryId) {
          updatedCurrentEntry = updatedEntries.find((e) => e.id === entryId);
        }
        return {
          ...store,
          assignedEntries: updatedEntries,
          currentEntry: updatedCurrentEntry
        };
      });
      return result.data;
    } catch (err) {
      console.error("Error saving judging results:", err);
      throw err;
    }
  }
  // Get judging progress for a judge
  getJudgingProgress() {
    const sessionStore = get_store_value(judgingSessionStore);
    if (!sessionStore.assignedEntries.length) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    const total = sessionStore.assignedEntries.length;
    const completed = sessionStore.assignedEntries.filter((e) => e.hasBeenJudged).length;
    const percentage = Math.round(completed / total * 100);
    return { total, completed, percentage };
  }
  // Navigate to next/previous entry
  setCurrentEntry(entryIndex) {
    judgingSessionStore.update((store) => {
      const entry = store.assignedEntries[entryIndex] || null;
      return {
        ...store,
        currentEntry: entry
      };
    });
  }
  // End judging session
  endSession() {
    judgingSessionStore.update((store) => ({
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
    judgeStore.update((store) => ({ ...store, error: null }));
    judgingSessionStore.update((store) => ({ ...store, error: null }));
  }
}
const competitionJudgingStore = new CompetitionJudgingStore();
const judgeList = derived(judgeStore, ($store) => $store.judges);
const isLoadingJudges = derived(judgeStore, ($store) => $store.loading);
const judgeError = derived(judgeStore, ($store) => $store.error);
const activeSession = derived(judgingSessionStore, ($store) => $store);
const isJudging = derived(judgingSessionStore, ($store) => $store.sessionActive);
const currentEntry = derived(judgingSessionStore, ($store) => $store.currentEntry);

export { activeSession as a, currentEntry as b, competitionJudgingStore as c, isLoadingJudges as d, judgeError as e, isJudging as i, judgeList as j };
//# sourceMappingURL=competitionJudgingStore-Bi9TZcPs.js.map
