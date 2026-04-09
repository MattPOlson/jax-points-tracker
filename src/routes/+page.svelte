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
  import { Hero, Button, Badge, Container, OverlappingCard, ActionCard } from '$lib/components/ui';
  import { FileEdit, ClipboardCheck, Trophy, Award, User as UserIcon, Settings } from 'lucide-svelte';

  $: isLoggedIn = $authUser !== null;
  $: isOfficer = $userProfile?.is_officer === true;

  // Initial load on login to homepage
  $: if ($page.url.pathname === '/' && $authUser?.id) {
    loadApprovals(true);
    loadCategoryData(true);
    loadLeaderboard(true);
    loadUserProfile(true);
    loadCompetitionData(true);
    loadMyEntries(true);
  }

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
</script>

<main>
  <Hero
    title="Have Fun Brew Better Beer!"
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    large={true}
  />

  <OverlappingCard>
    {#if isLoggedIn && $userProfile}
      <p class="cta-text">Welcome back, <strong>{$userProfile.name || 'Brewer'}</strong>!</p>
      {#if $userProfile.points}
        <p class="points-display">
          Your current points:
          <span class="points-value">{$userProfile.points}</span>
        </p>
      {/if}
    {:else if isLoggedIn}
      <p class="cta-text">Welcome back, Brewer!</p>
    {:else}
      <p class="cta-text">Sign in to track your brewing achievements and compete with fellow brewers!</p>
      <Button variant="primary" size="lg" on:click={() => window.location.href = '/login'}>
        Get Started
      </Button>
    {/if}
  </OverlappingCard>

  <Container size="lg">
    <section class="quick-actions-section">
      <h2 class="section-title">Quick Actions</h2>

      <div class="action-grid">
        <ActionCard
          href="/submit"
          title="Submit Points"
          description="Log your brewing achievements and earn points for competitions, homebrew events, and club activities."
          featured={true}
        >
          <FileEdit slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>

        <ActionCard
          href="/my-submissions"
          title="My Submissions"
          description="Track your submission status"
        >
          <ClipboardCheck slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>

        <ActionCard
          href="/competitions"
          title="Competitions"
          description="Enter beer competitions"
        >
          <Trophy slot="icon" size={64} strokeWidth={1.5} />
          {#if isLoggedIn && competitionStatus}
            <div class="competition-status">
              <span class="status-text">{competitionStatus.text}</span>
              {#if competitionStatus.badge}
                <Badge variant="primary">{competitionStatus.badge}</Badge>
              {/if}
            </div>
          {/if}
        </ActionCard>

        <ActionCard
          href="/leaderboard"
          title="Leaderboard"
          description="See who's brewing the best"
        >
          <Award slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>

        {#if isLoggedIn}
          <ActionCard
            href="/profile"
            title="My Profile"
            description="Manage your account"
          >
            <UserIcon slot="icon" size={64} strokeWidth={1.5} />
          </ActionCard>
        {/if}

        {#if isOfficer}
          <ActionCard
            href="/officers"
            title="Officer Tools"
            description="Admin dashboard"
          >
            <Settings slot="icon" size={64} strokeWidth={1.5} />
          </ActionCard>
        {/if}
      </div>
    </section>
  </Container>
</main>

<footer class="version-footer">
  <small>{version.display}</small>
</footer>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .cta-text {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
    line-height: var(--line-height-relaxed);
  }

  .cta-text:last-child {
    margin-bottom: 0;
  }

  .cta-text strong {
    color: var(--color-brand-primary);
    font-weight: 700;
  }

  .points-display {
    font-size: var(--font-size-lg);
    margin-top: var(--space-4);
    margin-bottom: 0;
    color: var(--color-text-secondary);
  }

  .points-value {
    display: inline-block;
    color: var(--color-brand-gold);
    font-family: var(--font-family-display);
    font-weight: 700;
    font-size: 3rem;
    line-height: 1;
    letter-spacing: 2px;
    text-shadow: 0 0 24px var(--color-brand-gold-glow, rgba(201, 162, 39, 0.3));
    vertical-align: middle;
    margin-left: var(--space-2);
  }

  .quick-actions-section {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-4) var(--space-20);
    text-align: center;
  }

  .section-title {
    font-family: var(--font-family-display);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    margin-bottom: var(--space-10);
    position: relative;
    display: inline-block;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 2.5rem;
    height: 2px;
    background: var(--color-brand-gold);
    border-radius: var(--radius-full);
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  /* Stagger animation delays for each card */
  .action-grid > :global(*:nth-child(1)) { --card-delay: 0.05s; }
  .action-grid > :global(*:nth-child(2)) { --card-delay: 0.15s; }
  .action-grid > :global(*:nth-child(3)) { --card-delay: 0.25s; }
  .action-grid > :global(*:nth-child(4)) { --card-delay: 0.35s; }
  .action-grid > :global(*:nth-child(5)) { --card-delay: 0.45s; }
  .action-grid > :global(*:nth-child(6)) { --card-delay: 0.55s; }

  .competition-status {
    margin-top: var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .status-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .version-footer {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    letter-spacing: 1px;
    position: relative;
  }

  .version-footer::before {
    content: '';
    display: block;
    width: 3rem;
    height: 1px;
    background: var(--color-brand-gold);
    opacity: 0.4;
    margin: 0 auto var(--space-4);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .action-grid {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .quick-actions-section {
      padding: var(--space-2) var(--space-3) var(--space-12);
    }
  }

  @media (max-width: 640px) {
    .action-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .quick-actions-section {
      padding: var(--space-2) var(--space-3) var(--space-10);
    }

    .section-title {
      font-size: 0.95rem;
      margin-bottom: var(--space-6);
    }
  }
</style>
