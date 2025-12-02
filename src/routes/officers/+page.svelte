<script>
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { competitionManagementStore } from '$lib/stores/competitionManagementStore';
  import { Hero, Container, LoadingSpinner, EmptyState, Badge, Card, ActionCard } from '$lib/components/ui';
  import { FileCheck, List, Trophy, Users, BarChart, ClipboardList, UserCheck, TrendingUp } from 'lucide-svelte';

  let isLoading = true;
  let accessDenied = false;
  let statsLoading = true;

  // Stats data
  let pendingReviews = 0;
  let activeMembers = 0;
  let pointsThisMonth = 0;
  let activeCompetitions = 0;
  let totalCompetitionEntries = 0;

  $: if ($user !== undefined && $userProfile !== undefined) {
    isLoading = false;

    if (!$user) {
      goto('/login');
    } else if ($userProfile && !$userProfile.is_officer) {
      accessDenied = true;
    } else if ($userProfile && $userProfile.is_officer) {
      accessDenied = false;
      loadDashboardStats();
      competitionManagementStore.initialize();
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      if ($userProfile?.is_officer) {
        loadDashboardStats();
      }
    }
  });

  $: if ($competitionManagementStore.stats) {
    activeCompetitions = $competitionManagementStore.stats.active;
    totalCompetitionEntries = $competitionManagementStore.stats.totalEntries;
  }

  async function loadDashboardStats() {
    try {
      statsLoading = true;

      const { data: pendingData, error: pendingError } = await supabase
        .from('point_submissions')
        .select('id')
        .neq('approved', true);

      if (pendingError) throw pendingError;
      pendingReviews = pendingData?.length || 0;

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id')
        .eq('active', true);

      if (membersError) throw membersError;
      activeMembers = membersData?.length || 0;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const { data: pointsData, error: pointsError } = await supabase
        .from('point_submissions')
        .select('points')
        .gte('submitted_at', firstDayOfMonth.toISOString())
        .lt('submitted_at', firstDayOfNextMonth.toISOString())
        .eq('approved', true);

      if (pointsError) throw pointsError;
      pointsThisMonth = pointsData?.reduce((sum, submission) => sum + (submission.points || 0), 0) || 0;

      await competitionManagementStore.loadCompetitions();

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      pendingReviews = 0;
      activeMembers = 0;
      pointsThisMonth = 0;
    } finally {
      statsLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Officer Tools | JAX Members Portal</title>
</svelte:head>

{#if isLoading}
  <Container size="lg">
    <LoadingSpinner message="Verifying permissions..." />
  </Container>
{:else if !$user}
  <Container size="lg">
    <EmptyState
      title="Authentication Required"
      message="Please log in to access officer tools."
      actionLabel="Sign In"
      actionHref="/login"
    />
  </Container>
{:else if accessDenied}
  <Container size="lg">
    <EmptyState
      title="Access Restricted"
      message="You are not authorized to view this page. Officer privileges are required."
      actionLabel="Return Home"
      actionHref="/"
    />
  </Container>
{:else}
  <Hero
    title="Officer Dashboard"
    subtitle="Administrative Tools & Club Management"
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    compact={true}
  />

  <Container size="lg">
    {#if $userProfile?.name}
      <Card accent accentColor="primary" class="welcome-card">
        <div class="welcome-content">
          <p>Welcome, Officer <strong>{$userProfile.name}</strong>!</p>
          <Badge variant="primary">Administrative Privileges</Badge>
        </div>
      </Card>
    {/if}

    <!-- Quick Stats Section -->
    <section class="stats-section">
      <h2 class="section-title">Quick Overview</h2>
      <div class="stats-grid">
        <Card>
          <div class="stat-card">
            <div class="stat-icon">
              <ClipboardList size={32} strokeWidth={1.5} color="var(--color-warning)" />
            </div>
            <div class="stat-content">
              <div class="stat-label">Pending Reviews</div>
              <div class="stat-value">
                {#if statsLoading}
                  <div class="stat-loading"></div>
                {:else}
                  {pendingReviews}
                {/if}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon">
              <UserCheck size={32} strokeWidth={1.5} color="var(--color-success)" />
            </div>
            <div class="stat-content">
              <div class="stat-label">Active Members</div>
              <div class="stat-value">
                {#if statsLoading}
                  <div class="stat-loading"></div>
                {:else}
                  {activeMembers}
                {/if}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon">
              <TrendingUp size={32} strokeWidth={1.5} color="var(--color-brand-primary)" />
            </div>
            <div class="stat-content">
              <div class="stat-label">Points This Month</div>
              <div class="stat-value">
                {#if statsLoading}
                  <div class="stat-loading"></div>
                {:else}
                  {pointsThisMonth.toLocaleString()}
                {/if}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon">
              <Trophy size={32} strokeWidth={1.5} color="var(--color-info)" />
            </div>
            <div class="stat-content">
              <div class="stat-label">Active Competitions</div>
              <div class="stat-value">
                {#if $competitionManagementStore.isLoading}
                  <div class="stat-loading"></div>
                {:else}
                  {activeCompetitions}
                {/if}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>

    <!-- Administrative Tools Section -->
    <section class="tools-section">
      <h2 class="section-title">Administrative Tools</h2>
      <div class="tools-grid">
        <ActionCard
          href="/officers/approvals"
          title="Review Submissions"
          description="Approve or deny point submissions"
        >
          <FileCheck slot="icon" size={64} strokeWidth={1.5} />
          {#if !statsLoading && pendingReviews > 0}
            <Badge variant="warning">{pendingReviews} pending</Badge>
          {/if}
        </ActionCard>

        <ActionCard
          href="/officers/view-all"
          title="View All Points"
          description="Browse all member points and submissions"
        >
          <List slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>

        <ActionCard
          href="/officers/manage-competitions"
          title="Manage Competitions"
          description="Create and manage brewing competitions"
        >
          <Trophy slot="icon" size={64} strokeWidth={1.5} />
          {#if !$competitionManagementStore.isLoading}
            <div class="tool-stats">
              <Badge variant="primary">{activeCompetitions} Active</Badge>
              <Badge variant="secondary">{totalCompetitionEntries} Entries</Badge>
            </div>
          {/if}
        </ActionCard>

        <ActionCard
          href="/officers/members"
          title="Manage Members"
          description="View and manage member accounts"
        >
          <Users slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>

        <ActionCard
          href="/officers/reports"
          title="Generate Reports"
          description="Create activity and performance reports"
        >
          <BarChart slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>
      </div>
    </section>
  </Container>
{/if}

<style>
  .welcome-card {
    margin-top: var(--space-16);
    margin-bottom: var(--space-12);
  }

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .welcome-content p {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  .stats-section {
    margin-bottom: var(--space-16);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
    text-align: center;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .stat-icon {
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }

  .stat-value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
  }

  .stat-loading {
    width: 60px;
    height: 36px;
    background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .tools-section {
    margin-bottom: var(--space-20);
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-8);
  }

  .tool-stats {
    margin-top: var(--space-4);
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .welcome-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .tools-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .stat-value {
      font-size: var(--font-size-2xl);
    }
  }
</style>
