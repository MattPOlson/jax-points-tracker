<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import { supabase } from '$lib/supabaseClient.js';
  import {
    competitions,
    activeCompetitions,
    loadCompetitionData,
    formatDeadline,
    getDaysUntilDeadline,
    isLoaded,
    isLoading,
    error
  } from '$lib/stores/bjcpCategoryStore.js';
  import {
    myEntries,
    entryStats,
    loadMyEntries
  } from '$lib/stores/myCompetitionEntriesStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Badge, Card, ActionCard } from '$lib/components/ui';
  import { Beer, ListChecks, Trophy, Scale, FileText, Award, DollarSign, CheckCircle } from 'lucide-svelte';

  let cleanup;
  let userEntriesLoaded = false;
  let hasJudgeAssignments = false;

  onMount(async () => {
    try {
      await loadCompetitionData();

      if ($userProfile?.id) {
        await loadMyEntries();
        userEntriesLoaded = true;
        await checkJudgeAssignments($userProfile.id);
      }
    } catch (err) {
      console.error('Failed to load competition data:', err);
    }
  });

  onDestroy(() => {
    if (cleanup) cleanup();
  });

  function navigateTo(path) {
    goto(path);
  }

  async function checkJudgeAssignments(userId) {
    try {
      const { data, error } = await supabase
        .from('competition_judges')
        .select('id')
        .eq('judge_id', userId)
        .eq('active', true)
        .limit(1);

      if (error) throw error;
      hasJudgeAssignments = data && data.length > 0;
    } catch (err) {
      console.error('Failed to check judge assignments:', err);
      hasJudgeAssignments = false;
    }
  }

  function getCompetitionStatus(competition) {
    const daysLeft = getDaysUntilDeadline(competition);
    if (daysLeft > 7) {
      return { text: `${daysLeft} days left`, variant: 'success' };
    } else if (daysLeft > 0) {
      return { text: `${daysLeft} days left`, variant: 'warning' };
    } else {
      return { text: 'Entries closed', variant: 'danger' };
    }
  }

  $: if ($userProfile?.id && !hasJudgeAssignments) {
    checkJudgeAssignments($userProfile.id);
  }
</script>

<svelte:head>
  <title>Competitions | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Beer Competitions"
  subtitle="Submit entries, track your progress, and compete with fellow brewers"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  <!-- Quick Actions Section -->
  <section class="quick-actions">
    <h2 class="section-title">Quick Actions</h2>
    <div class="action-grid">
      <ActionCard
        href="/competitions/submit-entry"
        title="Submit Entry"
        description="Enter your beer into a competition"
      >
        <Beer slot="icon" size={64} strokeWidth={1.5} />
      </ActionCard>

      <ActionCard
        href="/competitions/my-entries"
        title="My Entries"
        description="View and manage your submissions"
      >
        <ListChecks slot="icon" size={64} strokeWidth={1.5} />
        {#if userEntriesLoaded && $entryStats.total > 0}
          <div class="card-stats">
            <Badge variant="primary">{$entryStats.total} entries</Badge>
            <Badge variant="warning">{$entryStats.active} active</Badge>
          </div>
        {/if}
      </ActionCard>

      <ActionCard
        href="/competitions/results"
        title="Results"
        description="View competition winners and scores"
      >
        <Trophy slot="icon" size={64} strokeWidth={1.5} />
      </ActionCard>

      {#if $userProfile && hasJudgeAssignments}
        <ActionCard
          href="/judge"
          title="Judge Portal"
          description="Access your assigned competitions"
        >
          <Scale slot="icon" size={64} strokeWidth={1.5} />
        </ActionCard>
      {/if}
    </div>
  </section>

  <!-- Active Competitions Section -->
  <section class="competitions-section">
    <h2 class="section-title">Active Competitions</h2>

    {#if $isLoading && !$isLoaded}
      <LoadingSpinner message="Loading competitions..." />

    {:else if $error}
      <EmptyState
        title="Error Loading Competitions"
        message={$error}
        actionLabel="Retry"
        on:action={() => loadCompetitionData(true)}
      />

    {:else if $isLoaded && $activeCompetitions.length === 0}
      <EmptyState
        title="No Active Competitions"
        message="Check back later for new competitions, or contact an officer for more information."
      />

    {:else if $isLoaded}
      <div class="competitions-grid">
        {#each $activeCompetitions as competition}
          <Card hover={false}>
            <div class="competition-header">
              <h3>{competition.name}</h3>
              <Badge variant={getCompetitionStatus(competition).variant}>
                {getCompetitionStatus(competition).text}
              </Badge>
            </div>

            <div class="competition-details">
              {#if competition.description}
                <p class="description">{competition.description}</p>
              {/if}

              <div class="competition-meta">
                <div class="meta-item">
                  <span class="label">Entry Deadline:</span>
                  <span class="value">{formatDeadline(competition)}</span>
                </div>

                {#if competition.judging_date}
                  <div class="meta-item">
                    <span class="label">Judging Date:</span>
                    <span class="value">{new Date(competition.judging_date).toLocaleDateString()}</span>
                  </div>
                {/if}
              </div>
            </div>

            <div class="competition-actions">
              <Button
                variant="primary"
                fullWidth={true}
                on:click={() => navigateTo('/competitions/submit-entry')}
              >
                Submit Entry
              </Button>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Quick Info Section -->
  <section class="info-section">
    <h2 class="section-title">Competition Information</h2>
    <div class="info-grid">

      <Card>
        <div class="info-icon">
          <FileText size={48} strokeWidth={1.5} color="var(--color-brand-primary)" />
        </div>
        <h4>How to Enter</h4>
        <ul>
          <li>Select an active competition</li>
          <li>Choose your BJCP category</li>
          <li>Provide beer details and notes</li>
          <li>Submit before the deadline</li>
        </ul>
      </Card>

      <Card>
        <div class="info-icon">
          <CheckCircle size={48} strokeWidth={1.5} color="var(--color-brand-primary)" />
        </div>
        <h4>Judging Process</h4>
        <ul>
          <li>Anonymous judging by certified judges</li>
          <li>BJCP style guidelines used</li>
          <li>Scores and feedback provided</li>
          <li>Awards for top entries</li>
        </ul>
      </Card>

      <Card>
        <div class="info-icon">
          <DollarSign size={48} strokeWidth={1.5} color="var(--color-brand-primary)" />
        </div>
        <h4>Entry Fees</h4>
        <ul>
          <li>Check with officers for fee structure</li>
          <li>Multiple entries allowed</li>
          <li>Payment status tracked in portal</li>
          <li>Fee goes toward prizes and judging</li>
        </ul>
      </Card>
    </div>
  </section>
</Container>

<style>
  /* Quick Actions Section */
  .quick-actions {
    margin-top: var(--space-16);
    margin-bottom: var(--space-16);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
    text-align: center;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-8);
  }

  .card-stats {
    margin-top: var(--space-4);
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Competitions Section */
  .competitions-section {
    margin-bottom: var(--space-16);
  }

  .competitions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-8);
  }

  .competition-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .competition-header h3 {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    flex: 1;
  }

  .competition-details {
    margin-bottom: var(--space-6);
  }

  .description {
    margin: 0 0 var(--space-4) 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
  }

  .competition-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
  }

  .meta-item .label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    min-width: 120px;
  }

  .meta-item .value {
    color: var(--color-text-secondary);
  }

  .competition-actions {
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border-primary);
  }

  /* Info Section */
  .info-section {
    margin-bottom: var(--space-20);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-8);
  }

  .info-icon {
    margin-bottom: var(--space-4);
  }

  .info-section h4 {
    margin: 0 0 var(--space-4) 0;
    color: var(--color-brand-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }

  .info-section ul {
    margin: 0;
    padding-left: var(--space-6);
    list-style-type: none;
  }

  .info-section li {
    margin-bottom: var(--space-3);
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    position: relative;
  }

  .info-section li:before {
    content: "•";
    color: var(--color-brand-primary);
    font-weight: var(--font-weight-bold);
    position: absolute;
    left: calc(-1 * var(--space-6));
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .action-grid {
      grid-template-columns: 1fr;
    }

    .competitions-grid {
      grid-template-columns: 1fr;
    }

    .competition-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .meta-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-1);
    }

    .meta-item .label {
      min-width: auto;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
