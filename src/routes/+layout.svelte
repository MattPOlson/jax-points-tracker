<script>
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import toast, { Toaster } from 'svelte-french-toast';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Home, LogOut, User } from 'lucide-svelte';

  let subscription;

  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      userProfile.set(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      userProfile.set(null);
    }
  }

  async function checkForApprovals(userId) {
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
      console.error('Approval check failed:', error);
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return;

    const init = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const currentUser = session?.user ?? null;
        user.set(currentUser);

        if (currentUser) {
          await fetchUserProfile(currentUser.id);
          await checkForApprovals(currentUser.id);
        }

        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            // Use setTimeout to make auth operations non-blocking for tab switching
            setTimeout(async () => {
              const u = session?.user ?? null;
              user.set(u);

              if (event === 'SIGNED_IN' && u) {
                await fetchUserProfile(u.id);
                await checkForApprovals(u.id);
                if (window.location.pathname === '/login') goto('/');
              }

              if (event === 'SIGNED_OUT') {
                userProfile.set(null);
              }
            }, 0);
          }
        );

        subscription = data.subscription;
      } catch (error) {
        console.error('Auth initialization failed:', error);
        user.set(null);
        userProfile.set(null);
      }
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });

  onDestroy(() => {
    if (subscription) subscription.unsubscribe();
  });

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      user.set(null);
      userProfile.set(null);
      goto('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to log out');
    }
  }

  function handleGoBack() {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home if no history
      goto('/');
    }
  }
</script>

<!-- Header with Logo - appears on all pages -->
<div class="header-bar">
  <a href="/" class="header-logo-link">
    <img src="/JaxGator.png" alt="Jacksonville Ale Exchange" class="jax-logo" />
  </a>
  <div class="header-text">
    <div class="header-club-name">JACKSONVILLE ALE EXCHANGE</div>
    <h1 class="portal-title">MEMBER PORTAL</h1>
  </div>
  <nav class="header-nav" aria-label="Site navigation">
    <button on:click={handleGoBack} class="nav-button" title="Go back" aria-label="Go back to previous page">
      <ArrowLeft size={20} />
    </button>
    <a href="/" class="nav-button" title="Home" aria-label="Go to homepage">
      <Home size={20} />
    </a>
    {#if $user}
      <button on:click={handleLogout} class="nav-button logout-btn" title="Logout" aria-label="Logout">
        <LogOut size={20} />
      </button>
      <div class="user-avatar" title={$userProfile?.name || $user.email}>
        <User size={20} strokeWidth={2} color="white" />
      </div>
    {:else}
      <a href="/login" aria-label="Login" class="nav-button">
        <User size={20} strokeWidth={2} />
      </a>
    {/if}
  </nav>
</div>

<Toaster 
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: 'border-radius: 6px; background: white; color: #333;'
  }}
/>
<slot />

<style>
  .header-bar {
    background: var(--color-brand-primary);
    padding: 0 var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    box-shadow: 0 3px 16px rgba(0, 0, 0, 0.4);
    border-bottom: 3px solid var(--color-brand-gold);
    position: sticky;
    top: 0;
    z-index: 200;
    min-height: 90px;
    overflow: visible;
  }

  .header-logo-link {
    display: flex;
    align-items: flex-end;
    text-decoration: none;
    flex-shrink: 0;
  }

  .jax-logo {
    height: 110px;
    width: auto;
    object-fit: contain;
    margin-top: -20px;
    margin-bottom: -10px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
    transition: transform 0.2s ease;
  }

  .header-logo-link:hover .jax-logo {
    transform: scale(1.03);
  }

  .header-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    flex: 1;
  }

  .header-club-name {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 4px;
    text-transform: uppercase;
    font-family: 'Trebuchet MS', Arial, sans-serif;
    line-height: 1;
  }

  .portal-title {
    font-size: var(--font-size-4xl);
    font-weight: 900;
    color: white;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', Arial, sans-serif;
    line-height: 1.1;
  }

  /* Nav integrated into header */
  .header-nav {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-button);
    width: 40px;
    height: 40px;
    transition: all 0.2s ease;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    flex-shrink: 0;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
  }

  .logout-btn:hover {
    background: rgba(220, 38, 38, 0.3);
    border-color: rgba(220, 38, 38, 0.5);
    color: #fca5a5;
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-button);
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .header-bar {
      padding: 0 var(--space-4);
      gap: var(--space-3);
      min-height: 72px;
    }

    .jax-logo {
      height: 88px;
      margin-top: -16px;
      margin-bottom: -8px;
    }

    .portal-title {
      font-size: var(--font-size-2xl);
      letter-spacing: 2px;
    }

    .header-club-name {
      font-size: 0.6rem;
      letter-spacing: 3px;
    }
  }

  @media (max-width: 480px) {
    .header-bar {
      padding: 0 var(--space-3);
      gap: var(--space-2);
      min-height: 64px;
    }

    .jax-logo {
      height: 76px;
      margin-top: -12px;
      margin-bottom: -6px;
    }

    .portal-title {
      font-size: var(--font-size-lg);
      letter-spacing: 1px;
    }

    .header-club-name {
      display: none;
    }

    .header-nav {
      gap: var(--space-1);
    }

    .nav-button,
    .user-avatar {
      width: 36px;
      height: 36px;
    }
  }
</style>