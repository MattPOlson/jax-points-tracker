<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import toast, { Toaster } from 'svelte-french-toast';
  import { goto } from '$app/navigation';


  let subscription;

  onMount(() => {
    const init = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const currentUser = session?.user ?? null;
        user.set(currentUser);

        if (currentUser) {
          await checkForApprovals(currentUser.id);
        }

        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('Auth state changed:', _event, session?.user?.id);
          const u = session?.user ?? null;
          user.set(u);

          if (u) {
            await checkForApprovals(u.id);
          }
        });

        subscription = data.subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        user.set(null);
      }
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      user.set(null);
      goto('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  }

  async function checkForApprovals(userId) {
    try {
      // Fetch last login timestamp
      const { data: member } = await supabase
        .from('members')
        .select('last_login_at')
        .eq('id', userId)
        .single();

      const lastLogin = member?.last_login_at;

      // Look for approved submissions since last login
      const { data: newApprovals } = await supabase
        .from('point_submissions')
        .select('category, description, event_date')
        .eq('member_id', userId)
        .eq('approved', true)
        .gt('updated_at', lastLogin || '1970-01-01');

      if (newApprovals?.length) {
        newApprovals.forEach(sub => {
          toast.success(`🎉 Your "${sub.description}" submission for ${sub.category} was approved!`, {duration: 8000 });
        });
      }

      // Update login timestamp
      await supabase
        .from('members')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error checking approvals:', error);
    }
  }
</script>

<div class="topbar">
  <a href="/" class="nav-button" title="Home">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </a>
  {#if $user}
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
  color: #333;
  text-decoration: none;
}
.nav-button:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
}
.login-icon:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  background: #f0f0f0;
}
.login-icon.logged-in {
  background: #4caf50;
  cursor: default;
  pointer-events: none;
}
</style>