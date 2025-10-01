import { d as derived, w as writable } from './index-Ct3aIOD7.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';
import { u as userProfile } from './userProfile-BAUZwBX2.js';
import { l as get_store_value } from './ssr-CFMHIens.js';

const competitions = writable([]);
const isLoading = writable(false);
const error = writable(null);
const lastRefresh = writable(null);
const stats = derived(competitions, ($competitions) => {
  console.log("📊 Computing stats for competitions:", $competitions);
  if (!Array.isArray($competitions) || $competitions.length === 0) {
    const defaultStats = { total: 0, active: 0, totalEntries: 0, avgEntries: 0 };
    console.log("📊 Using default stats:", defaultStats);
    return defaultStats;
  }
  const total = $competitions.length;
  const active = $competitions.filter((comp) => comp.is_active).length;
  const totalEntries = $competitions.reduce((sum, comp) => sum + (comp.entry_count || 0), 0);
  const avgEntries = total > 0 ? Math.round(totalEntries / total * 10) / 10 : 0;
  const computedStats = { total, active, totalEntries, avgEntries };
  console.log("📊 Computed stats:", computedStats);
  return computedStats;
});
const filteredCompetitions = derived(competitions, ($competitions) => {
  return Array.isArray($competitions) ? $competitions : [];
});
async function loadCompetitions(forceRefresh2 = false) {
  const $userProfile = get_store_value(userProfile);
  if (!$userProfile?.is_officer) {
    console.warn("User is not officer or profile not loaded yet");
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const lastRefreshTime = get_store_value(lastRefresh);
  if (!forceRefresh2 && lastRefreshTime && now - lastRefreshTime < 3e4) {
    console.log("Using cached competition data");
    return;
  }
  isLoading.set(true);
  error.set(null);
  try {
    console.log("Loading fresh competition data...");
    const { data: competitionsData, error: competitionsError } = await supabase.from("competitions").select("*").order("entry_deadline", { ascending: false });
    if (competitionsError) {
      throw competitionsError;
    }
    console.log("Competitions fetched:", competitionsData?.length);
    const competitionsWithCounts = await Promise.all(
      (competitionsData || []).map(async (comp) => {
        const { count, error: countError } = await supabase.from("competition_entries").select("*", { count: "exact", head: true }).eq("competition_id", comp.id);
        if (countError) {
          console.warn("Warning getting count for competition", comp.id, ":", countError);
        }
        const now2 = /* @__PURE__ */ new Date();
        const deadline = new Date(comp.entry_deadline);
        const is_active = comp.active && deadline > now2;
        let status = "closed";
        if (is_active) {
          status = "open";
        } else if (comp.judging_date && new Date(comp.judging_date) >= now2 && !comp.results_published) {
          status = "judging";
        } else if (comp.results_published) {
          status = "completed";
        }
        return {
          ...comp,
          entry_count: count || 0,
          is_active,
          status
        };
      })
    );
    console.log("Competition data with counts:", competitionsWithCounts?.length);
    competitions.set(competitionsWithCounts || []);
    lastRefresh.set(now);
    console.log("Loading complete");
  } catch (err) {
    console.error("Failed to load competitions:", err);
    error.set(err.message || "Failed to load competitions");
    competitions.set([]);
  } finally {
    isLoading.set(false);
  }
}
async function loadCompetitionEntries(competitionId) {
  if (!competitionId) {
    console.warn("No competition ID provided");
    return [];
  }
  try {
    console.log("Loading entries for competition:", competitionId);
    const { data: entriesData, error: entriesError } = await supabase.from("competition_entries").select("*").eq("competition_id", competitionId).order("entry_number", { ascending: true });
    if (entriesError) {
      throw entriesError;
    }
    if (!entriesData || entriesData.length === 0) {
      console.log("No entries found for this competition");
      return [];
    }
    const memberIds = [...new Set(entriesData.map((entry) => entry.member_id))];
    const { data: membersData } = await supabase.from("members").select("id, name, email, phone").in("id", memberIds);
    const categoryIds = [...new Set(entriesData.map((entry) => entry.bjcp_category_id).filter(Boolean))];
    const { data: categoriesData } = await supabase.from("bjcp_categories").select("id, category_name, category_number, subcategory_letter, subcategory_name").in("id", categoryIds);
    const entriesWithDetails = entriesData.map((entry) => {
      const member = membersData?.find((m) => m.id === entry.member_id);
      const category = categoriesData?.find((c) => c.id === entry.bjcp_category_id);
      return {
        ...entry,
        member_name: member?.name || "Unknown",
        member_email: member?.email || "",
        member_phone: member?.phone || "",
        category_name: category?.category_name || "Unknown Category",
        category_number: category?.category_number || "",
        subcategory_letter: category?.subcategory_letter || "",
        subcategory_name: category?.subcategory_name || "",
        category_display: category ? `${category.category_number}${category.subcategory_letter || ""} - ${category.category_name}${category.subcategory_name ? ": " + category.subcategory_name : ""}` : "Unknown Category"
      };
    });
    console.log("Loaded", entriesWithDetails.length, "entries with full details");
    return entriesWithDetails;
  } catch (err) {
    console.error("Failed to load competition entries:", err);
    throw err;
  }
}
async function createCompetition(competitionData) {
  const { ranking_groups, ...competitionInfo } = competitionData;
  const { data, error: insertError } = await supabase.from("competitions").insert([competitionInfo]).select().single();
  if (insertError) throw insertError;
  if (competitionData.category_system === "custom" && ranking_groups && ranking_groups.length > 0) {
    const rankingGroupsData = ranking_groups.map((group, index) => ({
      competition_id: data.id,
      group_name: group.name,
      group_description: group.description || null,
      bjcp_category_ids: group.categories,
      group_order: index + 1
    }));
    const { error: groupsError } = await supabase.from("competition_ranking_groups").insert(rankingGroupsData);
    if (groupsError) {
      console.error("Error creating ranking groups:", groupsError);
    }
  }
  await loadCompetitions(true);
  return data;
}
async function updateCompetition(competitionId, updates) {
  const { data, error: updateError } = await supabase.from("competitions").update(updates).eq("id", competitionId).select().single();
  if (updateError) throw updateError;
  await loadCompetitions(true);
  return data;
}
async function deleteCompetition(competitionId) {
  const { error: deleteError } = await supabase.from("competitions").delete().eq("id", competitionId);
  if (deleteError) throw deleteError;
  await loadCompetitions(true);
}
function resetStore() {
  competitions.set([]);
  isLoading.set(false);
  error.set(null);
  lastRefresh.set(null);
}
async function forceRefresh() {
  lastRefresh.set(null);
  await loadCompetitions(true);
}
const competitionManagementStore = {
  subscribe: derived(
    [competitions, isLoading, error, stats, filteredCompetitions],
    ([competitions2, isLoading2, error2, stats2, filteredCompetitions2]) => ({
      competitions: competitions2,
      isLoading: isLoading2,
      error: error2,
      stats: stats2,
      filteredCompetitions: filteredCompetitions2
    })
  ).subscribe,
  loadCompetitions,
  loadCompetitionEntries,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  forceRefresh,
  initialize: async () => {
    console.log("Initializing competition management store");
    await loadCompetitions(false);
  }
};
userProfile.subscribe(($userProfile) => {
  console.log("User profile changed in store:", $userProfile);
  if ($userProfile?.is_officer) {
    console.log("User is officer, loading competitions");
    loadCompetitions(false);
  } else {
    console.log("User is not officer or profile not loaded yet");
    resetStore();
  }
});

export { competitions as a, competitionManagementStore as c, error as e, isLoading as i, stats as s };
//# sourceMappingURL=competitionManagementStore-CIPoqnzm.js.map
