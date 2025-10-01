import { w as writable } from './index-Ct3aIOD7.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';

const categories = writable([]);
const placementOptions = writable([]);
const monthlyEvents = writable([]);
const floridaCircuitEvents = writable([]);
const isLoaded = writable(false);
const isLoading = writable(false);
const clubEventTypes = writable([]);
let lastFetched = 0;
const CACHE_MS = 1e4;
async function loadCategoryData(force = false) {
  const now = Date.now();
  if (!force && now - lastFetched < CACHE_MS) return;
  isLoading.set(true);
  try {
    const [catRes, placementRes, monthlyRes, floridaRes] = await Promise.all([
      supabase.from("categories").select("*").eq("active", true),
      supabase.from("point_categories").select("*").eq("active", true),
      supabase.from("monthly_challenge").select("*").eq("active", true),
      supabase.from("florida_circuit_events").select("*").eq("active", true)
    ]);
    const { data: clubEventTypesData, error: clubEventTypesError } = await supabase.from("club_events_types").select("*").eq("active", true).order("event_type");
    if (catRes.error || placementRes.error || monthlyRes.error || floridaRes.error) {
      console.error("Supabase query failed:", { catRes, placementRes, monthlyRes, floridaRes });
      throw catRes.error || placementRes.error || monthlyRes.error || floridaRes.error;
    }
    if (clubEventTypesError) {
      console.error("Error loading club event types:", clubEventTypesError);
    } else {
      clubEventTypes.set(clubEventTypesData || []);
    }
    categories.set(catRes.data);
    placementOptions.set(placementRes.data);
    monthlyEvents.set(monthlyRes.data);
    floridaCircuitEvents.set(floridaRes.data);
    lastFetched = now;
    isLoaded.set(true);
  } catch (err) {
    console.error("❌ Failed to load category data:", err);
    isLoaded.set(false);
  } finally {
    isLoading.set(false);
  }
}

export { isLoaded as a, clubEventTypes as b, categories as c, floridaCircuitEvents as f, isLoading as i, loadCategoryData as l, monthlyEvents as m, placementOptions as p };
//# sourceMappingURL=categoryStore-D9lRjhjd.js.map
