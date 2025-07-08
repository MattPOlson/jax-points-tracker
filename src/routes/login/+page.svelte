<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { page } from '$app/stores';

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
      
      if (event === 'SIGNED_IN' && session?.user) {
        user.set(session.user);
        startSplash(); // Show splash for new sign-ins
        goto('/');
      } else if (event === 'SIGNED_OUT') {
        user.set(null);
        splash = false;
        clearTimeout(splashTimeout);
      }
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
  <div class="splash-screen">
    <div class="splash-content">
      <div class="spinner"></div>
      <p>Loading your dashboard...</p>
      <small>This may take a few moments</small>
    </div>
  </div>
{:else if !$user}
  <div class="login-container" class:mobile={isMobile}>
    <div class="login-header">
      <h1>🍻 JAX Members Portal</h1>
      <p>{isMobile ? 'Sign in to continue' : 'Have Fun Brew Better Beer!'}</p>
    </div>
    
    <div class="auth-wrapper" class:mobile={isMobile}>
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#2563eb',
                brandAccent: '#1d4ed8',
              },
              space: {
                inputPadding: isMobile ? '12px' : '14px',
                buttonPadding: isMobile ? '12px 16px' : '14px 20px',
              },
              fontSizes: {
                baseInputSize: isMobile ? '16px' : '14px', // Prevents zoom on iOS
                baseButtonSize: isMobile ? '16px' : '16px',
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
    justify-content: center;
    align-items: center;
    background: #f8fafc; /* Match your app's light background */
    padding: 2rem;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-header h1 {
    color: #ff3e00; /* Match your main h1 color */
    text-transform: uppercase;
    font-size: 3rem;
    font-weight: 100;
    margin-bottom: 0.5rem;
    line-height: 1.1;
  }

  .login-header p {
    font-size: 1.1rem;
    color: #333; /* Match your subtitle color */
    margin: 0;
  }

  .auth-wrapper {
    background: white;
    border-radius: 6px; /* Match your nav-button border radius */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }

  .auth-wrapper.mobile {
    border-radius: 6px;
    padding: 1.5rem;
    max-width: 350px;
  }

  .login-container.mobile {
    padding: 1rem;
  }

  .login-container.mobile .login-header h1 {
    font-size: 2.5rem;
  }

  .login-container.mobile .login-header p {
    font-size: 1rem;
  }

  .splash-screen {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8fafc; /* Match your app's background */
  }

  .splash-content {
    text-align: center;
    color: #333;
  }

  .splash-content p {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
    color: #ff3e00; /* Match your brand color */
  }

  .splash-content small {
    font-size: 1rem;
    opacity: 0.7;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 62, 0, 0.2); /* Use your brand color */
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive design to match your main page breakpoints */
  @media (max-width: 480px) {
    .login-container {
      padding: 1rem;
    }

    .login-header h1 {
      font-size: 2.5rem; /* Match your main page mobile h1 size */
    }

    .login-header p {
      font-size: 0.9rem;
    }

    .auth-wrapper {
      padding: 1.5rem;
    }
  }

  @media (min-width: 640px) {
    .login-container {
      padding: 3rem 2rem;
    }

    .login-header h1 {
      font-size: 4rem; /* Match your main page desktop h1 size */
    }

    .login-header p {
      font-size: 1.125rem;
    }

    .auth-wrapper {
      padding: 2.5rem;
      max-width: 450px;
    }
  }

  .redirect-message {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: #666;
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
    border-color: #2563eb;
  }

  :global(.supabase-auth-ui_ui-button) {
    width: 100%;
    padding: 0.875rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  :global(.supabase-auth-ui_ui-button:hover) {
    background-color: #1d4ed8;
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

  /* Responsive design */
  @media (max-width: 640px) {
    .login-container {
      padding: 1rem;
    }

    .login-header h1 {
      font-size: 2rem;
    }

    .auth-wrapper {
      padding: 1.5rem;
    }
  }
</style>