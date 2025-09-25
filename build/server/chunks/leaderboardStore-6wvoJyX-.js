import { w as writable } from './index-D3y4l4qv.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';

const leaderboard = writable([]);
const message = writable("");
const loading = writable(false);
let lastLoaded = 0;
const CACHE_MS = 1e4;
async function loadLeaderboard(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;
  loading.set(true);
  const { data, error } = await supabase.from("point_submissions").select(`
      points,
      approved,
      member_id,
      members(id, name)
    `).eq("approved", true);
  lastLoaded = Date.now();
  if (error) {
    console.error("Error loading leaderboard:", error);
    message.set("Failed to load leaderboard.");
    leaderboard.set([]);
    loading.set(false);
    return;
  }
  const totals = /* @__PURE__ */ new Map();
  for (const entry of data) {
    const id = entry.members?.id;
    const name = entry.members?.name;
    const points = entry.points || 0;
    if (!id || !name) continue;
    if (!totals.has(id)) totals.set(id, { name, points: 0 });
    totals.get(id).points += points;
  }
  leaderboard.set(
    Array.from(totals.values()).sort((a, b) => b.points - a.points).slice(0, 10)
  );
  message.set("");
  loading.set(false);
}

export { loading as a, leaderboard as b, loadLeaderboard as l, message as m };
//# sourceMappingURL=leaderboardStore-6wvoJyX-.js.map
