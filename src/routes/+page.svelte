<script>
  import { user as authUser } from '$lib/stores/user';
  import { userProfile, loadUserProfile } from '$lib/stores/userProfile';
  import { onTabFocus } from '$lib/utils/focusRefresher.js';
  import { loadApprovals } from '$lib/stores/approvalsStore';
  import { loadCategoryData } from '$lib/stores/categoryStore';
  import { loadLeaderboard } from '$lib/stores/leaderboardStore';
  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';
  import { page } from '$app/stores';

  $: isLoggedIn = $authUser !== null;
  $: isOfficer = $userProfile?.is_officer === true;

  // Initial load on login to homepage
  $: if ($page.url.pathname === '/' && $authUser?.id) {
    loadApprovals(true);
    loadCategoryData(true);
    loadLeaderboard(true);
    loadUserProfile(true);
  }

  // Auto-refresh on tab focus with tab reload fix
  $: if ($authUser?.id) {
    onTabFocus(() => {
      // Use window.location.reload() to fix tab switching issues
      window.location.reload();
    });
  }

  // Navigation items configuration
  const navItems = [
    { href: '/submit', label: 'Submit Points', icon: '📝', description: 'Submit your brewing achievements' },
    { href: '/my-submissions', label: 'My Submissions', icon: '📋', description: 'Track your submission status' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', description: 'See who\'s brewing the best' },
    { href: '/profile', label: 'My Profile', icon: '👤', description: 'Manage your account', authRequired: true }
  ];

  const officerItems = [
    { href: '/officers', label: 'Officer Tools', icon: '⚙️', description: 'Admin dashboard', officerRequired: true }
  ];

  // Filter nav items based on auth status
  $: visibleNavItems = navItems.filter(item => {
    if (item.authRequired && !isLoggedIn) return false;
    return true;
  });

  $: visibleOfficerItems = officerItems.filter(item => {
    if (item.officerRequired && !isOfficer) return false;
    return true;
  });
</script>

<main>
  <div class="hero-section">
    <h1>🍻 JAX Members Portal</h1>
    <p class="subtitle">Have Fun Brew Better Beer!</p>
    
    {#if isLoggedIn && $userProfile}
      <div class="welcome-message">
        <p>Welcome back, <strong>{$userProfile.name || 'Brewer'}</strong>!</p>
        {#if $userProfile.points}
          <p class="points-display">Your current points: <span class="points-value">{$userProfile.points}</span></p>
        {/if}
      </div>
    {:else if isLoggedIn}
      <div class="welcome-message">
        <p>Welcome back, Brewer!</p>
      </div>
    {:else}
      <div class="welcome-message">
        <p>Sign in to track your brewing achievements and compete with fellow brewers!</p>
        <a href="/login" class="cta-button">Get Started</a>
      </div>
    {/if}
  </div>

  <div class="nav-section">
    <h2>Quick Actions</h2>
    <div class="nav-links">
      {#each visibleNavItems as item}
        <a href={item.href} class="nav-button">
          <span class="nav-icon">{item.icon}</span>
          <div class="nav-content">
            <span class="nav-label">{item.label}</span>
            <span class="nav-description">{item.description}</span>
          </div>
        </a>
      {/each}
      
      {#each visibleOfficerItems as item}
        <a href={item.href} class="nav-button officer-button">
          <span class="nav-icon">{item.icon}</span>
          <div class="nav-content">
            <span class="nav-label">{item.label}</span>
            <span class="nav-description">{item.description}</span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</main>

<style>
  /* Base styles */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 600px;
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
    text-align: center;
    word-wrap: keep-all;
    overflow-wrap: normal;
  }

  .subtitle {
    margin-bottom: 2rem;
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
  }

  .welcome-message {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .welcome-message p {
    margin: 0.5rem 0;
    color: #333;
  }

  .points-display {
    font-size: 1.1rem;
    margin-top: 1rem !important;
  }

  .points-value {
    color: #ff3e00;
    font-weight: 700;
    font-size: 1.3em;
  }

  .cta-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background-color: #ff3e00;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .cta-button:hover {
    background-color: #e63600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  .nav-section h2 {
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-transform: none;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .nav-button {
    display: flex;
    align-items: center;
    text-decoration: none;
    background-color: white;
    color: #333;
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .nav-button:hover {
    background-color: #2563eb;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    border-color: #2563eb;
  }

  .officer-button {
    border-color: #ff3e00;
    background: linear-gradient(135deg, #fff 0%, #fef7f0 100%);
  }

  .officer-button:hover {
    background-color: #ff3e00;
    border-color: #ff3e00;
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  .nav-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
    min-width: 2rem;
  }

  .nav-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .nav-label {
    font-weight: 500;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .nav-description {
    font-size: 0.85rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .nav-button:hover .nav-description {
    opacity: 0.9;
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    main {
      padding: 4.5rem 1rem 1rem;
      justify-content: flex-start;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .welcome-message {
      padding: 1rem;
      margin: 1rem 0;
    }

    .nav-section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .nav-links {
      gap: 0.75rem;
    }

    .nav-button {
      padding: 0.875rem;
    }

    .nav-icon {
      font-size: 1.25rem;
      margin-right: 0.75rem;
      min-width: 1.75rem;
    }

    .nav-label {
      font-size: 0.95rem;
    }

    .nav-description {
      font-size: 0.8rem;
    }
  }

  /* Desktop styles */
  @media (min-width: 640px) {
    main {
      width: 75%;
      max-width: 800px;
    }

    h1 {
      font-size: 4rem;
    }

    .subtitle {
      font-size: 1.25rem;
    }

    .welcome-message {
      padding: 2rem;
    }

    .nav-links {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .nav-button {
      flex-direction: column;
      text-align: center;
      padding: 1.5rem;
      min-width: 200px;
      max-width: 250px;
    }

    .nav-icon {
      font-size: 2rem;
      margin-right: 0;
      margin-bottom: 0.5rem;
      min-width: auto;
    }

    .nav-content {
      align-items: center;
      text-align: center;
    }

    .nav-label {
      font-size: 1.1rem;
    }

    .nav-description {
      font-size: 0.9rem;
    }
  }
</style>