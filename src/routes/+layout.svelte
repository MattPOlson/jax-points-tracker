<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import toast, { Toaster } from 'svelte-french-toast';
  import { goto, afterNavigate } from '$app/navigation';
  import { get } from 'svelte/store';

  let subscription;
  let unsubscribeVisibilityAndFocus;

  // ----------------------------------------------------------
  // 1. Run afterNavigate at the top level (not inside onMount)
  // ----------------------------------------------------------
  afterNavigate(() => {
    // Whenever SvelteKit does a client-side navigation (e.g. clicking a <a href="…">),
    // re-fetch the profile if the user is still logged in.
    const curr = get(user);
    if (curr) {
      console.log('[layout] afterNavigate → re-fetching profile for', curr.id);
      fetchUserProfile(curr.id);
    }
  });

  // ----------------------------------------------------------
  // 2. Helper: Load the “members” record into userProfile
  // ----------------------------------------------------------
  async function fetchUserProfile(userId) {
    console.log('[layout] fetchUserProfile running for userId=', userId);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      console.log('[layout]  → fetched profile:', data);
      userProfile.set(data);
    } catch (err) {
      console.error('[layout]  → fetchUserProfile error:', err);
      userProfile.set(null);
    }
  }

  // ----------------------------------------------------------
  // 3. Helper: Check for approvals since last_login_at
  // ----------------------------------------------------------
  async function checkForApprovals(userId) {
    console.log('[layout] checkForApprovals running for userId=', userId);
    try {
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('last_login_at')
        .eq('id', userId)
        .single();
      if (memberError) throw memberError;

      const lastLogin = member?.last_login_at || '1970-01-01T00:00:00Z';

      const { data: newApprovals, error: approvalsError } = await supabase
        .from('point_submissions')
        .select('category, description, event_date')
        .eq('member_id', userId)
        .eq('approved', true)
        .gt('updated_at', lastLogin);
      if (approvalsError) throw approvalsError;

      if (newApprovals?.length) {
        newApprovals.forEach(sub => {
          toast.success(
            `🎉 Your "${sub.description}" submission for ${sub.category} was approved!`,
            { duration: 8000 }
          );
        });
      }

      await supabase
        .from('members')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('[layout]  → checkForApprovals error:', error);
    }
  }

  // ----------------------------------------------------------
  // 4. Handle tab‐visibility & window focus to rehydrate
  // ----------------------------------------------------------
  function setupTabVisibilityAndFocusRehydration() {
    // This handler runs when the tab/window becomes visible/focused again.
    const handler = async () => {
      console.log('[layout] handler: tab visible or window focused → rehydrating userProfile');
      // Use getUser() instead of getSession() so we do not re-trigger onAuthStateChange.
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('[layout]  → getUser returned:', currentUser);

      user.set(currentUser);

      if (currentUser) {
        // If there is a currentUser, re-fetch their profile & approvals
        await fetchUserProfile(currentUser.id);
        await checkForApprovals(currentUser.id);
      } else {
        userProfile.set(null);
      }
    };

    // Listen for visibilitychange
    const visibilityListener = () => {
      if (document.visibilityState === 'visible') {
        handler();
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);

    // Also listen for window focus (some browsers fire this instead)
    window.addEventListener('focus', handler);

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', visibilityListener);
      window.removeEventListener('focus', handler);
    };
  }

  // ----------------------------------------------------------
  // 5. onMount: initial session check + supabase.auth listener
  // ----------------------------------------------------------
  onMount(() => {
    // Only run in browser—never on the server
    if (typeof window === 'undefined') return;

    const init = async () => {
      try {
        // 5.1) Check existing session upon layout mount
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        console.log('[layout] onMount: initial session →', session);

        const currentUser = session?.user ?? null;
        user.set(currentUser);

        if (currentUser) {
          // If already logged in, populate profile + approvals
          await fetchUserProfile(currentUser.id);
          await checkForApprovals(currentUser.id);
        }

        // 5.2) Subscribe to Supabase auth state changes
        // We only redirect on SIGNED_IN if we are currently on /login
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`[layout] onAuthStateChange event="${event}" session=`, session);
            const u = session?.user ?? null;
            const prevUser = get(user);
            user.set(u);

            if (event === 'SIGNED_IN' && u) {
              // Only trigger redirect if the current path is /login
              if (window.location.pathname === '/login') {
                console.log('[layout]  → SIGNED_IN and on /login → redirecting to "/"');
                await fetchUserProfile(u.id);
                await checkForApprovals(u.id);
                goto('/');
              } else {
                // If we signed in elsewhere or got a refresh, just re-fetch profile
                console.log('[layout]  → SIGNED_IN but not on /login, re-fetching profile');
                await fetchUserProfile(u.id);
                await checkForApprovals(u.id);
              }
            }
            if (event === 'SIGNED_OUT') {
              console.log('[layout]  → SIGNED_OUT, clearing userProfile');
              userProfile.set(null);
            }
          }
        );
        subscription = data.subscription;

        // 5.3) Set up the tab visibility + focus rehydration
        unsubscribeVisibilityAndFocus = setupTabVisibilityAndFocusRehydration();
      } catch (error) {
        console.error('[layout]  → Error initializing auth in layout:', error);
        user.set(null);
        userProfile.set(null);
      }
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
      if (unsubscribeVisibilityAndFocus) unsubscribeVisibilityAndFocus();
    };
  });

  // ----------------------------------------------------------
  // 6. Logout helper: signs out & clears stores
  // ----------------------------------------------------------
  async function handleLogout() {
    console.log('[layout] handleLogout called');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      user.set(null);
      userProfile.set(null);
      goto('/login');
    } catch (err) {
      console.error('[layout]  → Error logging out:', err);
      toast.error('Failed to log out');
    }
  }
</script>

<!-- === Topbar / Navigation === -->
<div class="topbar">
  <a href="/" class="nav-button" title="Home">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </a>

  {#if $user}
    <!-- Show “Logout” button + green icon when logged in -->
    <button on:click={handleLogout} class="nav-button" title="Logout">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
    <div class="login-icon logged-in" title="You are logged in">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="2">
        <circle cx="20" cy="14" r="8" />
        <path d="M6 34c0-6 8-10 14-10s14 4 14 10" />
      </svg>
    </div>
  {:else}
    <!-- Show “Login” icon when not logged in -->
    <a href="/login" aria-label="Login" class="login-icon">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" stroke-width="2">
        <circle cx="20" cy="14" r="8" />
        <path d="M6 34c0-6 8-10 14-10s14 4 14 10" />
      </svg>
    </a>
  {/if}
</div>

<Toaster />
<slot />

<style>
  .topbar {
    position: fixed;
    top: 1rem;
    right: 1.5rem;
    z-index: 100;
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s, background 0.2s;
    cursor: pointer;
    color: #333; 
    text-decoration: none;
  }
  .nav-button:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: #f0f0f0;
  }
  .login-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s, background 0.2s;
    cursor: pointer;
  }
  .login-icon:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: #f0f0f0;
  }
  .login-icon.logged-in {
    background: #4caf50;
    cursor: default;
    pointer-events: none;
  }
</style>
