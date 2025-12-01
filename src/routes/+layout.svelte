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

<div class="topbar">
  <button on:click={handleGoBack} class="nav-button" title="Go back" aria-label="Go back to previous page">
    <ArrowLeft size={24} />
  </button>

  <a href="/" class="nav-button" title="Home" aria-label="Go to homepage">
    <Home size={24} />
  </a>


  {#if $user}
    <button on:click={handleLogout} class="nav-button logout-btn" title="Logout" aria-label="Logout">
      <LogOut size={24} />
    </button>
    <div class="user-info" title={$userProfile?.name || $user.email}>
      <div class="login-icon logged-in" title="You are logged in">
        <User size={24} strokeWidth={2} color="white" />
      </div>
      {#if $userProfile?.name}
        <span class="user-name">{$userProfile.name}</span>
      {/if}
    </div>
  {:else}
    <a href="/login" aria-label="Login" class="login-icon">
      <User size={24} strokeWidth={2} color="#333" />
    </a>
  {/if}
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
    border-radius: 6px; /* Match your design system */
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
    color: #333; 
    text-decoration: none;
  }

  .nav-button:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: #f8fafc;
    transform: translateY(-1px);
  }

  .logout-btn:hover {
    background: #fef2f2;
    color: #dc2626;
  }


  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .login-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 6px; /* Match your design system */
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
    text-decoration: none;
  }

  .login-icon:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: #f8fafc;
    transform: translateY(-1px);
  }

  .login-icon.logged-in {
    background: #2563eb; /* Match your nav-button color */
    cursor: default;
    pointer-events: none;
  }

  .login-icon.logged-in:hover {
    transform: none;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .topbar {
      top: 0.75rem;
      right: 1rem;
      gap: 0.75rem;
    }

    .nav-button,
    .login-icon {
      width: 44px;
      height: 44px;
    }

    .user-name {
      display: none; /* Hide username on mobile to save space */
    }
  }

  @media (max-width: 480px) {
    .topbar {
      top: 0.5rem;
      right: 0.75rem;
      gap: 0.5rem;
    }

    .nav-button,
    .login-icon {
      width: 40px;
      height: 40px;
    }

    .nav-button svg,
    .login-icon svg {
      width: 20px;
      height: 20px;
    }
  }
</style>