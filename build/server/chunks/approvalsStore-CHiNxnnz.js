import { w as writable } from './index-Ct3aIOD7.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';

const approvals = writable([]);
const message = writable("");
const loading = writable(false);
let lastLoaded = 0;
const CACHE_MS = 1e4;
async function loadApprovals(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;
  loading.set(true);
  const { data, error } = await supabase.from("point_submissions").select(`
      id,
      category,
      description,
      points,
      event_date,
      submitted_at,
      member_id,
      member:member_id ( name )
    `).eq("approved", false).order("event_date", { ascending: false });
  lastLoaded = Date.now();
  if (error) {
    console.error("Supabase query error:", error);
    message.set(`Failed to load submissions: ${error.message}`);
    approvals.set([]);
    loading.set(false);
    return;
  }
  approvals.set(data);
  message.set(data.length === 0 ? "No pending submissions found to review." : "");
  loading.set(false);
}

export { approvals as a, loading as b, loadApprovals as l, message as m };
//# sourceMappingURL=approvalsStore-CHiNxnnz.js.map
