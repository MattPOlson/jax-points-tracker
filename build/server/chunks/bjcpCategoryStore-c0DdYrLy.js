import { d as derived, w as writable } from './index-D3y4l4qv.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';
import { l as get_store_value } from './ssr-DUmth7AN.js';

const bjcpCategories = writable([]);
const competitions = writable([]);
const isLoaded = writable(false);
const isLoading = writable(false);
const error = writable(null);
const lastRefresh = writable(null);
const categoriesByNumber = derived(bjcpCategories, ($bjcpCategories) => {
  const grouped = {};
  $bjcpCategories.forEach((cat) => {
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
        full_name: cat.subcategory_name,
        // Updated to use subcategory_name
        description: cat.description
      });
    }
  });
  return grouped;
});
const mainCategories = derived(categoriesByNumber, ($categoriesByNumber) => {
  return Object.values($categoriesByNumber).sort(
    (a, b) => parseInt(a.number) - parseInt(b.number)
  );
});
const activeCompetitions = derived(competitions, ($competitions) => {
  const now = /* @__PURE__ */ new Date();
  return $competitions.filter((comp) => comp.active && new Date(comp.entry_deadline) > now).sort((a, b) => new Date(a.entry_deadline) - new Date(b.entry_deadline));
});
derived(competitions, ($competitions) => {
  return $competitions.sort((a, b) => {
    const parseTimestamp = (timestamp) => {
      if (!timestamp) return /* @__PURE__ */ new Date(0);
      try {
        let isoString = timestamp;
        if (timestamp.includes(" ") && !timestamp.includes("T")) {
          isoString = timestamp.replace(" ", "T");
          if (!isoString.includes("+") && !isoString.includes("Z")) {
            isoString += "Z";
          }
        }
        return new Date(isoString);
      } catch {
        return /* @__PURE__ */ new Date(0);
      }
    };
    return parseTimestamp(b.created_at) - parseTimestamp(a.created_at);
  });
});
async function loadBjcpCategories(forceRefresh = false) {
  const now = /* @__PURE__ */ new Date();
  const lastRefreshTime = get_store_value(lastRefresh);
  if (!forceRefresh && lastRefreshTime && now - lastRefreshTime < 3e4) {
    console.log("🎯 Using cached BJCP categories");
    return;
  }
  isLoading.set(true);
  error.set(null);
  try {
    console.log("📋 Loading BJCP categories...");
    const { data, error: queryError } = await supabase.from("bjcp_categories").select("*").order("category_number", { ascending: true }).order("subcategory_letter", { ascending: true });
    if (queryError) {
      console.error("❌ Error loading BJCP categories:", queryError);
      throw queryError;
    }
    console.log(`✅ Loaded ${data?.length || 0} BJCP categories`);
    bjcpCategories.set(data || []);
    lastRefresh.set(now);
  } catch (err) {
    console.error("💥 Failed to load BJCP categories:", err);
    error.set(err.message || "Failed to load BJCP categories");
  } finally {
    isLoading.set(false);
    isLoaded.set(true);
  }
}
async function loadCompetitions(forceRefresh = false) {
  const now = /* @__PURE__ */ new Date();
  const lastRefreshTime = get_store_value(lastRefresh);
  if (!forceRefresh && lastRefreshTime && now - lastRefreshTime < 3e4) {
    console.log("🏆 Using cached competitions");
    return;
  }
  isLoading.set(true);
  error.set(null);
  try {
    console.log("🏆 Loading competitions...");
    const { data, error: queryError } = await supabase.from("competitions").select("*").order("entry_deadline", { ascending: false });
    if (queryError) {
      console.error("❌ Error loading competitions:", queryError);
      throw queryError;
    }
    console.log(`✅ Loaded ${data?.length || 0} competitions`);
    competitions.set(data || []);
    lastRefresh.set(now);
  } catch (err) {
    console.error("💥 Failed to load competitions:", err);
    error.set(err.message || "Failed to load competitions");
  } finally {
    isLoading.set(false);
    isLoaded.set(true);
  }
}
async function loadCompetitionData(forceRefresh = false) {
  console.log("🚀 Loading all competition data...");
  try {
    await Promise.all([
      loadBjcpCategories(forceRefresh),
      loadCompetitions(forceRefresh)
    ]);
    console.log("✅ All competition data loaded successfully");
  } catch (err) {
    console.error("💥 Failed to load competition data:", err);
    throw err;
  }
}
function getDaysUntilDeadline(competition) {
  if (!competition) return null;
  const now = /* @__PURE__ */ new Date();
  const deadline = new Date(competition.entry_deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
function formatDeadline(competition) {
  if (!competition) return "";
  const deadline = new Date(competition.entry_deadline);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  };
  return deadline.toLocaleDateString("en-US", options);
}
if (typeof window !== "undefined") {
  bjcpCategories.subscribe((value) => {
    console.log("📋 BJCP Categories updated:", value.length, "categories");
  });
  competitions.subscribe((value) => {
    console.log("🏆 Competitions updated:", value.length, "competitions");
  });
  error.subscribe((value) => {
    if (value) {
      console.error("❌ Competition store error:", value);
    }
  });
}

export { activeCompetitions as a, isLoaded as b, categoriesByNumber as c, competitions as d, error as e, formatDeadline as f, getDaysUntilDeadline as g, bjcpCategories as h, isLoading as i, loadCompetitionData as l, mainCategories as m };
//# sourceMappingURL=bjcpCategoryStore-c0DdYrLy.js.map
