import { w as writable } from './index-D3y4l4qv.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';

const allSubmissions = writable([]);
const message = writable("");
const loading = writable(false);
let lastLoaded = 0;
const CACHE_MS = 1e4;
async function loadMySubmissions(userId, sortColumn = "event_date", sortDirection = "desc", force = false) {
  if (!userId) {
    message.set("Please log in to view your submissions.");
    allSubmissions.set([]);
    return;
  }
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;
  loading.set(true);
  const { data, error } = await supabase.from("point_submissions").select(`id, category, description, points, event_date, approved, rejection_reason`).eq("member_id", userId).order(sortColumn, { ascending: sortDirection === "asc" });
  lastLoaded = Date.now();
  if (error) {
    console.error("Error loading submissions:", error);
    message.set("Error loading your submissions.");
    allSubmissions.set([]);
    loading.set(false);
    return;
  }
  allSubmissions.set(data);
  message.set("");
  loading.set(false);
}

export { allSubmissions as a, loading as b, loadMySubmissions as l, message as m };
//# sourceMappingURL=mySubmissionsStore-DqnQVy7C.js.map
