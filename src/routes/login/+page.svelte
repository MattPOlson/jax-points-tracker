<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
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
        if (event === 'SIGNED_IN' && session?.user) {
          user.set(session.user);
          startSplash(); // Show splash for new sign-ins
          goto('/');
        } else if (event === 'SIGNED_OUT') {
          user.set(null);
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
{:else if !$user}
  <div class="login-container" class:mobile={isMobile}>
    <!-- Header with Logo -->
    <div class="header-bar">
      <img src="/JaxLogo.png" alt="JAX Logo" class="jax-logo" />
      <h1 class="portal-title">JAX MEMBER PORTAL</h1>
    </div>

    <!-- Hero with Background -->
    <Hero
      title="Have Fun Brew Better Beer!"
      subtitle="Sign in to track your brewing achievements and compete with fellow brewers!"
      center={true}
      backgroundImage="/brewery.png"
      overlay={true}
      large={true}
    />

    <div class="auth-wrapper" class:mobile={isMobile}>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#1a2a44',
                brandAccent: '#2c456b',
              },
              space: {
                inputPadding: isMobile ? '12px' : '14px',
                buttonPadding: isMobile ? '12px 16px' : '14px 20px',
              },
              fontSizes: {
                baseInputSize: isMobile ? '16px' : '14px', // Prevents zoom on iOS
                baseButtonSize: isMobile ? '16px' : '16px',
              },
              radii: {
                borderRadiusButton: '6px',
                buttonBorderRadius: '6px',
                inputBorderRadius: '6px',
              }
            }
          }
        }}
        providers={[]}
        showLinks={true}
        magicLink={true}
        view={isMobile ? 'sign_in' : undefined}
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
  }

  .header-bar {
    background: white;
    padding: var(--space-4) var(--space-8);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .jax-logo {
    height: 50px;
    width: auto;
  }

  .portal-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .auth-wrapper {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: var(--space-8);
    width: 100%;
    max-width: 400px;
    margin: -6rem auto var(--space-8) auto;
    position: relative;
    z-index: 10;
  }

  .auth-wrapper.mobile {
    border-radius: var(--radius-card);
    padding: var(--space-6);
    max-width: 350px;
  }

  /* Responsive design to match your main page breakpoints */
  @media (max-width: 768px) {
    .header-bar {
      padding: var(--space-3) var(--space-4);
    }

    .jax-logo {
      height: 40px;
    }

    .portal-title {
      font-size: var(--font-size-lg);
    }

    .auth-wrapper {
      margin: -4rem auto var(--space-6) auto;
      padding: var(--space-6);
      max-width: 350px;
    }
  }

  @media (max-width: 480px) {
    .header-bar {
      padding: var(--space-2) var(--space-3);
      gap: var(--space-2);
    }

    .jax-logo {
      height: 35px;
    }

    .portal-title {
      font-size: var(--font-size-base);
    }

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

  /* Override Supabase Auth UI styles */
  :global(.supabase-auth-ui_ui-container) {
    width: 100%;
  }

  :global(.supabase-auth-ui_ui-input) {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  :global(.supabase-auth-ui_ui-input:focus) {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  :global(.supabase-auth-ui_ui-button) {
    width: 100%;
    padding: 0.875rem;
    background-color: var(--color-brand-primary);
    color: white;
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    transition: background-color var(--transition-base);
  }

  :global(.supabase-auth-ui_ui-button:hover) {
    background-color: var(--color-brand-primary-hover);
  }

  :global(.supabase-auth-ui_ui-label) {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
  }

  :global(.supabase-auth-ui_ui-message) {
    margin: 1rem 0;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  :global(.supabase-auth-ui_ui-message.error) {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  :global(.supabase-auth-ui_ui-message.success) {
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }

</style>