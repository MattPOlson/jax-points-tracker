<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import AuthForm from '$lib/components/AuthForm.svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { page } from '$app/stores';
  import { Hero, Container, LoadingSpinner } from '$lib/components/ui';

 // import { isLoaded as categoriesLoaded } from '$lib/stores/categoryStore';
 // import { isLoaded as approvalsLoaded } from '$lib/stores/approvalsStore';

  import { loadApprovals } from '$lib/stores/approvalsStore';
  import { loadCategoryData } from '$lib/stores/categoryStore';
  import { loadLeaderboard } from '$lib/stores/leaderboardStore';
  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';

  let subscription;
  let splash = false;
  let splashTimeout;
  let isLoading = false;
  let isMobile = false;
  let authView = 'sign_in';
  // True while the user arrived via a password-recovery link and hasn't set
  // a new password yet — keeps the form visible even though a session exists.
  let recovering = false;

  // Detect mobile device
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // Load data when user is authenticated and on home page
  $: if ($page.url.pathname === '/' && $user?.id && !isLoading) {
    loadAllData();
  }

  async function loadAllData() {
    isLoading = true;
    try {
      await Promise.all([
        loadApprovals(true),
        loadCategoryData(true),
        loadLeaderboard(true), // Fixed typo: was loadleaderboardData
        loadMySubmissions(true)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      isLoading = false;
    }
  }

  function startSplash() {
    splash = true;
    splashTimeout = setTimeout(() => {
      splash = false;
    }, 8000); // Reduced from 10s to 8s
  }

  onMount(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      // A password-recovery link lands here with a session in the URL hash —
      // don't bounce to the dashboard before the user sets a new password.
      if (window.location.hash.includes('type=recovery')) {
        recovering = true;
        authView = 'update_password';
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        user.set(session.user);
        // Don't show splash for existing sessions, just navigate
        goto('/');
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Use setTimeout to make auth operations non-blocking for tab switching
      setTimeout(() => {
        if (event === 'PASSWORD_RECOVERY') {
          recovering = true;
          authView = 'update_password';
        } else if (event === 'SIGNED_IN' && session?.user && !recovering) {
          user.set(session.user);
          startSplash(); // Show splash for new sign-ins
          goto('/');
        } else if (event === 'SIGNED_OUT') {
          user.set(null);
          recovering = false;
          splash = false;
          clearTimeout(splashTimeout);
        }
      }, 0);
    });

    subscription = data.subscription;

    return () => {
      if (subscription) subscription.unsubscribe();
      clearTimeout(splashTimeout);
    };
  });

  onDestroy(() => {
    if (subscription) subscription.unsubscribe();
    clearTimeout(splashTimeout);
  });
</script>

{#if splash}
  <Container>
    <LoadingSpinner message="Loading your dashboard..." />
    <p style="text-align: center; color: var(--color-text-secondary); margin-top: var(--space-4);">
      <small>This may take a few moments</small>
    </p>
  </Container>
{:else if !$user || recovering}
  <div class="login-container" class:mobile={isMobile}>
    <!-- Hero with Background -->
    <Hero
      title="Have Fun Brew Better Beer!"
      subtitle="Sign in to track your brewing achievements and compete with fellow brewers!"
      center={true}
      backgroundImage="/Jax-Banner.png"
      overlay={true}
      large={true}
    />

    <div class="auth-wrapper" class:mobile={isMobile}>
      <div class="auth-brand-header">
        <span class="auth-welcome">Welcome to the</span>
        <span class="auth-portal-name">Member Portal</span>
      </div>
      <AuthForm
        bind:view={authView}
        on:passwordUpdated={() => {
          recovering = false;
          authView = 'sign_in';
          goto('/');
        }}
      />
    </div>
  </div>
{:else}
  <!-- User is signed in but not showing splash - redirect to dashboard -->
  <div class="redirect-message">
    <p>Redirecting to dashboard...</p>
  </div>
{/if}

<style>
  .login-container {
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
  }

  .auth-wrapper {
    background: var(--color-bg-card);
    border-radius: var(--radius-card);
    box-shadow: 0 12px 48px rgba(26, 42, 68, 0.18);
    padding: var(--space-8);
    width: 100%;
    max-width: 400px;
    margin: -6rem auto var(--space-8) auto;
    position: relative;
    z-index: 10;
    border-top: 4px solid var(--color-brand-gold);
  }

  .auth-brand-header {
    text-align: center;
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border-primary);
  }

  .auth-welcome {
    display: block;
    font-family: var(--font-family-display);
    font-size: 0.7rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--color-brand-gold);
    margin-bottom: var(--space-1);
  }

  .auth-portal-name {
    display: block;
    font-family: var(--font-family-display);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--color-brand-primary);
    line-height: 1.1;
  }

  .auth-wrapper.mobile {
    border-radius: var(--radius-card);
    padding: var(--space-6);
    max-width: 350px;
    border-top: 4px solid var(--color-brand-gold);
  }

  /* Responsive design to match your main page breakpoints */
  @media (max-width: 768px) {
    .auth-wrapper {
      margin: -4rem auto var(--space-6) auto;
      padding: var(--space-6);
      max-width: 350px;
    }
  }

  @media (max-width: 480px) {
    .auth-wrapper {
      padding: 1.5rem;
      margin: -3rem auto var(--space-4) auto;
    }
  }

  .redirect-message {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
  }

</style>