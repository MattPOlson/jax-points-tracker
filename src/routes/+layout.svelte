<script>
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import toast, { Toaster } from 'svelte-french-toast';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Home, LogOut, User } from 'lucide-svelte';
  import NotificationPermission from '$lib/components/NotificationPermission.svelte';
  import InstallPrompt from '$lib/components/InstallPrompt.svelte';

  let subscription;

  $: userInitial = $userProfile?.name?.charAt(0)?.toUpperCase() || $user?.email?.charAt(0)?.toUpperCase() || '';

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
  <div></div>
  <div class="header-center">
    <a href="/" class="header-logo-link">
      <img src="/JAX-Profile-Final-1.svg" alt="Jacksonville Ale Exchange" class="jax-logo" />
    </a>
    <div class="header-text">
      <div class="header-club-name">JACKSONVILLE ALE EXCHANGE</div>
      <span class="portal-title">MEMBER PORTAL</span>
    </div>
  </div>
  <nav class="header-nav" aria-label="Site navigation">
    <button on:click={handleGoBack} class="nav-button" title="Go back" aria-label="Go back to previous page">
      <ArrowLeft size={20} />
    </button>
    <a href="/" class="nav-button" title="Home" aria-label="Go to homepage">
      <Home size={20} />
    </a>
    {#if $user}
      <NotificationPermission />
      <button on:click={handleLogout} class="nav-button logout-btn" title="Logout" aria-label="Logout">
        <LogOut size={20} />
      </button>
      <div class="user-avatar" title={$userProfile?.name || $user.email}>
        {#if userInitial}
          <span class="avatar-initial">{userInitial}</span>
        {:else}
          <User size={20} strokeWidth={2} color="white" />
        {/if}
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
<InstallPrompt />
<slot />

<style>
  .header-bar {
    background: var(--color-brand-primary);
    padding: 0 var(--space-6);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
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
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }

  .jax-logo {
    height: 80px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
    transition: transform 0.2s ease;
  }

  .header-logo-link:hover .jax-logo {
    transform: scale(1.03);
  }

  .header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
  }

  .header-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }

  .header-club-name {
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-brand-gold);
    letter-spacing: 4px;
    text-transform: uppercase;
    font-family: var(--font-family-display);
    line-height: 1;
    opacity: 0.85;
  }

  .portal-title {
    font-size: var(--font-size-4xl);
    font-weight: 700;
    color: white;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 5px;
    font-family: var(--font-family-display);
    line-height: 1.1;
    display: block;
  }

  /* Nav integrated into header */
  .header-nav {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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
    background: var(--color-brand-gold);
    border: 1px solid rgba(201, 162, 39, 0.5);
    border-radius: var(--radius-button);
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .avatar-initial {
    font-family: var(--font-family-display);
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--color-brand-primary);
    letter-spacing: 0;
    line-height: 1;
    text-transform: uppercase;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .header-bar {
      padding: 0 var(--space-4);
      min-height: 72px;
    }

    .jax-logo {
      height: 64px;
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
      min-height: 64px;
    }

    .jax-logo {
      height: 52px;
    }

    .header-center {
      gap: var(--space-2);
    }

    .portal-title {
      font-size: var(--font-size-xl);
      letter-spacing: 2px;
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