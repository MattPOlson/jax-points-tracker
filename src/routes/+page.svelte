<script>
  import { user as authUser } from '$lib/stores/user';
  import { userProfile, loadUserProfile } from '$lib/stores/userProfile';
  import { loadApprovals } from '$lib/stores/approvalsStore';
  import { loadCategoryData } from '$lib/stores/categoryStore';
  import { loadLeaderboard } from '$lib/stores/leaderboardStore';
  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';
  import { loadCompetitionData, activeCompetitions } from '$lib/stores/bjcpCategoryStore';
  import { loadMyEntries, entryStats } from '$lib/stores/myCompetitionEntriesStore';
  import { page } from '$app/stores';
  import { version } from '$lib/version.js';
  import { Hero, Card, Button, Badge, Container } from '$lib/components/ui';

  $: isLoggedIn = $authUser !== null;
  $: isOfficer = $userProfile?.is_officer === true;

  // Initial load on login to homepage
  $: if ($page.url.pathname === '/' && $authUser?.id) {
    loadApprovals(true);
    loadCategoryData(true);
    loadLeaderboard(true);
    loadUserProfile(true);
    loadCompetitionData(true); // Load competition data
    loadMyEntries(true); // Load user's competition entries
  }

  // Removed auto-refresh on tab focus - causes issues with Supabase tab switching

  // Competition status for display
  $: competitionStatus = getCompetitionStatus($activeCompetitions, $entryStats);

  function getCompetitionStatus(competitions, stats) {
    if (!competitions || competitions.length === 0) {
      return { text: 'No active competitions', badge: null };
    }
    
    const activeCount = competitions.length;
    const userEntries = stats?.active || 0;
    
    if (userEntries > 0) {
      return { 
        text: `${activeCount} active competition${activeCount === 1 ? '' : 's'}`, 
        badge: `${userEntries} ${userEntries === 1 ? 'entry' : 'entries'}` 
      };
    }
    
    return { 
      text: `${activeCount} active competition${activeCount === 1 ? '' : 's'}`, 
      badge: 'Enter now!' 
    };
  }

  // Navigation items configuration
  const navItems = [
    { href: '/submit', label: 'Submit Points', icon: '📝', description: 'Submit your brewing achievements' },
    { href: '/my-submissions', label: 'My Submissions', icon: '📋', description: 'Track your submission status' },
    { href: '/competitions', label: 'Competitions', icon: '🏆', description: 'Enter beer competitions', isCompetition: true },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏅', description: 'See who\'s brewing the best' },
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

<Container size="sm">
  <main>
    <Hero
      title="JAX Member Portal"
      subtitle="Have Fun Brew Better Beer!"
      icon="🍻"
      center={true}
    />

    {#if isLoggedIn && $userProfile}
      <Card accent accentColor="primary">
        <div class="welcome-content">
          <p>Welcome back, <strong>{$userProfile.name || 'Brewer'}</strong>!</p>
          {#if $userProfile.points}
            <p class="points-display">
              Your current points:
              <span class="points-value">{$userProfile.points}</span>
            </p>
          {/if}
        </div>
      </Card>
    {:else if isLoggedIn}
      <Card accent accentColor="primary">
        <div class="welcome-content">
          <p>Welcome back, Brewer!</p>
        </div>
      </Card>
    {:else}
      <Card accent accentColor="primary">
        <div class="welcome-content">
          <p>Sign in to track your brewing achievements and compete with fellow brewers!</p>
          <Button variant="primary" size="lg" on:click={() => window.location.href = '/login'}>
            Get Started
          </Button>
        </div>
      </Card>
    {/if}

    <div class="nav-section">
      <h2>Quick Actions</h2>
      <div class="nav-links">
        {#each visibleNavItems as item}
          <a href={item.href} class="nav-card">
            <span class="nav-icon">{item.icon}</span>
            <div class="nav-content">
              <span class="nav-label">{item.label}</span>
              <span class="nav-description">{item.description}</span>
              {#if item.isCompetition && isLoggedIn && competitionStatus}
                <div class="competition-status">
                  <span class="status-text">{competitionStatus.text}</span>
                  {#if competitionStatus.badge}
                    <Badge variant="primary" size="sm">{competitionStatus.badge}</Badge>
                  {/if}
                </div>
              {/if}
            </div>
          </a>
        {/each}

        {#each visibleOfficerItems as item}
          <a href={item.href} class="nav-card">
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
</Container>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    justify-content: center;
    padding: var(--space-4) 0;
    text-align: center;
  }

  .welcome-content {
    text-align: center;
  }

  .welcome-content p {
    margin: var(--space-2) 0;
    color: var(--color-text-primary);
  }

  .points-display {
    font-size: var(--font-size-lg);
    margin-top: var(--space-4) !important;
  }

  .points-value {
    color: var(--color-brand-primary);
    font-weight: var(--font-weight-bold);
    font-size: 1.3em;
  }

  .nav-section {
    margin-top: var(--space-12);
  }

  .nav-section h2 {
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-6);
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .nav-card {
    display: flex;
    align-items: center;
    text-decoration: none;
    background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-primary-light) 100%);
    color: var(--color-text-primary);
    border: 2px solid var(--color-brand-primary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
    box-shadow: var(--shadow-sm);
  }

  .nav-card:hover {
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-brand-primary);
  }

  .nav-icon {
    font-size: var(--font-size-2xl);
    margin-right: var(--space-4);
    min-width: 2rem;
  }

  .nav-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    flex: 1;
  }

  .nav-label {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    margin-bottom: var(--space-1);
  }

  .nav-description {
    font-size: var(--font-size-sm);
    opacity: 0.7;
    transition: opacity var(--transition-base);
  }

  .nav-card:hover .nav-description {
    opacity: 0.9;
  }

  .competition-status {
    margin-top: var(--space-2);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .status-text {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .nav-card:hover .status-text {
    color: rgba(255, 255, 255, 0.9);
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    main {
      padding: var(--space-16) var(--space-4) var(--space-4);
      justify-content: flex-start;
    }

    .nav-section h2 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-4);
    }

    .nav-links {
      gap: var(--space-3);
    }

    .nav-card {
      padding: var(--space-3);
    }

    .nav-icon {
      font-size: var(--font-size-xl);
      margin-right: var(--space-3);
      min-width: 1.75rem;
    }

    .nav-label {
      font-size: var(--font-size-sm);
    }

    .nav-description {
      font-size: var(--font-size-xs);
    }
  }

  /* Desktop styles */
  @media (min-width: 640px) {
    .nav-links {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      gap: var(--space-6);
    }

    .nav-card {
      flex-direction: column;
      text-align: center;
      padding: var(--space-6);
      min-width: 200px;
      max-width: 250px;
    }

    .nav-icon {
      font-size: var(--font-size-4xl);
      margin-right: 0;
      margin-bottom: var(--space-2);
      min-width: auto;
    }

    .nav-content {
      align-items: center;
      text-align: center;
    }

    .nav-label {
      font-size: var(--font-size-lg);
    }

    .nav-description {
      font-size: var(--font-size-base);
    }

    .competition-status {
      align-items: center;
      margin-top: var(--space-3);
    }
  }

  .version-footer {
    text-align: center;
    padding: var(--space-4);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }
</style>

<footer class="version-footer">
  <small>{version.display}</small>
</footer>