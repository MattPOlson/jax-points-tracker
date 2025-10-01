import { d as derived, w as writable } from './index-Ct3aIOD7.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';
import { u as userProfile } from './userProfile-BAUZwBX2.js';
import { l as get_store_value } from './ssr-CFMHIens.js';

const myEntries = writable([]);
const isLoaded = writable(false);
const isLoading = writable(false);
const error = writable(null);
const lastRefresh = writable(null);
derived(myEntries, ($myEntries) => {
  const grouped = {};
  $myEntries.forEach((entry) => {
    const compId = entry.competition.id;
    if (!grouped[compId]) {
      grouped[compId] = {
        competition: entry.competition,
        entries: []
      };
    }
    grouped[compId].entries.push(entry);
  });
  return Object.values(grouped).sort(
    (a, b) => new Date(b.competition.entry_deadline) - new Date(a.competition.entry_deadline)
  );
});
derived(myEntries, ($myEntries) => {
  const now = /* @__PURE__ */ new Date();
  return $myEntries.filter(
    (entry) => entry.competition.active && new Date(entry.competition.entry_deadline) > now
  );
});
derived(myEntries, ($myEntries) => {
  const now = /* @__PURE__ */ new Date();
  return $myEntries.filter(
    (entry) => !entry.competition.active || new Date(entry.competition.entry_deadline) <= now
  );
});
const entryStats = derived(myEntries, ($myEntries) => {
  const stats = {
    total: $myEntries.length,
    active: 0,
    past: 0,
    pending_payment: 0,
    paid: 0
  };
  const now = /* @__PURE__ */ new Date();
  $myEntries.forEach((entry) => {
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
async function loadMyEntries(forceRefresh = false) {
  const now = /* @__PURE__ */ new Date();
  const lastRefreshTime = get_store_value(lastRefresh);
  let attempts = 0;
  let userProfileValue = get_store_value(userProfile);
  while (!userProfileValue?.id && attempts < 10) {
    console.log(`⏳ Waiting for user profile... (attempt ${attempts + 1})`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    userProfileValue = get_store_value(userProfile);
    attempts++;
  }
  if (!userProfileValue?.id) {
    console.log("❌ No user ID available after waiting - user may not be logged in");
    error.set("User not logged in");
    isLoaded.set(true);
    return;
  }
  const userId = userProfileValue.id;
  if (!forceRefresh && lastRefreshTime && now - lastRefreshTime < 3e4) {
    console.log("🍺 Using cached competition entries");
    return;
  }
  isLoading.set(true);
  error.set(null);
  try {
    console.log("🍺 Loading my competition entries...");
    const { data, error: queryError } = await supabase.from("competition_entries").select(`
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
                    placement,
                    judge_notes
                )
            `).eq("member_id", userId).order("submitted_at", { ascending: false });
    if (queryError) {
      console.error("❌ Error loading entries:", queryError);
      throw queryError;
    }
    const processedEntries = (data || []).map((entry) => ({
      ...entry,
      // Add computed fields
      category_display: entry.bjcp_category ? `${entry.bjcp_category.category_number}${entry.bjcp_category.subcategory_letter} - ${entry.bjcp_category.subcategory_name}` : "Unknown Category",
      can_edit: entry.competition.active && new Date(entry.competition.entry_deadline) > now,
      days_until_deadline: entry.competition.active ? Math.ceil((new Date(entry.competition.entry_deadline) - now) / (1e3 * 60 * 60 * 24)) : 0,
      has_results: entry.results && entry.results.length > 0,
      result: entry.results?.[0] || null
    }));
    console.log(`✅ Loaded ${processedEntries.length} competition entries`);
    myEntries.set(processedEntries);
    lastRefresh.set(now);
  } catch (err) {
    console.error("💥 Failed to load competition entries:", err);
    error.set(err.message || "Failed to load competition entries");
  } finally {
    isLoading.set(false);
    isLoaded.set(true);
  }
}
function canEditEntry(entry) {
  if (!entry) return false;
  const now = /* @__PURE__ */ new Date();
  return entry.competition.active && new Date(entry.competition.entry_deadline) > now;
}
function formatDeadline(entry) {
  if (!entry?.competition?.entry_deadline) return "";
  const deadline = new Date(entry.competition.entry_deadline);
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  };
  return deadline.toLocaleDateString("en-US", options);
}
function getAwardDisplay(result) {
  if (!result) return null;
  switch (result.placement) {
    case "1":
      return "🥇 1st Place";
    case "2":
      return "🥈 2nd Place";
    case "3":
      return "🥉 3rd Place";
    case "HM":
      return "🏅 Honorable Mention";
    default:
      return result.score ? `Score: ${result.score}/50` : "No Results";
  }
}
function getPaymentStatus(entry) {
  return entry.entry_fee_paid ? { text: "✅ Paid", class: "paid" } : { text: "⏳ Pending", class: "pending" };
}
if (typeof window !== "undefined") {
  myEntries.subscribe((value) => {
    console.log("🍺 My entries updated:", value.length, "entries");
  });
  error.subscribe((value) => {
    if (value) {
      console.error("❌ My entries store error:", value);
    }
  });
}

export { isLoading as a, error as b, getAwardDisplay as c, canEditEntry as d, entryStats as e, formatDeadline as f, getPaymentStatus as g, isLoaded as i, loadMyEntries as l, myEntries as m };
//# sourceMappingURL=myCompetitionEntriesStore-BFF7TTtw.js.map
