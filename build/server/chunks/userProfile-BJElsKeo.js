import { w as writable } from './index-D3y4l4qv.js';
import { B as BROWSER } from './false-CRHihH2U.js';
import { s as supabase } from './supabaseClient-D_8i9Ohq.js';

const browser = BROWSER;
const userProfile = writable(null);
const isLoadingProfile = writable(false);
let lastLoaded = 0;
const CACHE_MS = 1e4;
async function loadUserProfile(force = false) {
  if (!force && Date.now() - lastLoaded < CACHE_MS) return;
  isLoadingProfile.set(true);
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("User not logged in or failed to retrieve auth user:", authError);
      userProfile.set(null);
      return;
    }
    const { data, error } = await supabase.from("members").select("*").eq("id", user.id).single();
    if (error) {
      console.error("Failed to load user profile:", error);
      userProfile.set(null);
    } else {
      if (browser) ;
      else {
        userProfile.set(data);
        lastLoaded = Date.now();
      }
    }
  } catch (err) {
    console.error("❌ Failed to load user profile:", err);
    userProfile.set(null);
  } finally {
    isLoadingProfile.set(false);
  }
}

export { isLoadingProfile as i, loadUserProfile as l, userProfile as u };
//# sourceMappingURL=userProfile-BJElsKeo.js.map
