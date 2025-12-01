<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import {
    competitionJudgingStore,
    judgingSessionStore,
    activeSession
  } from '$lib/stores/competitionJudgingStore';
  import { Hero, Container, LoadingSpinner, Button, Badge, Card } from '$lib/components/ui';
  import { Scale, Calendar, User as UserIcon, Trophy, CheckCircle, Clock, Smartphone } from 'lucide-svelte';

  let availableCompetitions = [];
  let userJudgeAssignments = [];
  let isLoading = true;
  let error = null;

  onMount(() => {
    // CRITICAL FIX: Clear any existing sessions that don't belong to current user
    if ($activeSession.sessionActive && $activeSession.judgeId && $userProfile && $activeSession.judgeId !== $userProfile.id) {
      console.warn('Clearing session that belongs to different user');
      competitionJudgingStore.endSession();
    }

    loadJudgeData();
  });

  async function loadJudgeData() {
    if (!$userProfile) {
      error = 'Please log in to access judging features';
      isLoading = false;
      return;
    }

    isLoading = true;
    error = null;

    try {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('competition_judges')
        .select(`
          *,
          competition:competitions(
            id, name, description, entry_deadline, judging_date,
            active, results_published
          )
        `)
        .eq('judge_id', $userProfile.id)
        .eq('active', true)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      userJudgeAssignments = assignments || [];

      availableCompetitions = userJudgeAssignments.filter(assignment => {
        const comp = assignment.competition;
        const now = new Date();
        const deadline = new Date(comp.entry_deadline);
        const judgingDate = new Date(comp.judging_date);

        return now >= deadline && !comp.results_published;
      });

    } catch (err) {
      console.error('Error loading judge data:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function startJudging(competitionId) {
    try {
      await competitionJudgingStore.startJudgingSession(competitionId, $userProfile.id);
      goto(`/judge/competition/${competitionId}`);
    } catch (err) {
      console.error('Error starting judging session:', err);
      alert(`Failed to start judging: ${err.message}`);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getCompetitionStatus(competition) {
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    const judgingDate = new Date(competition.judging_date);

    if (competition.results_published) {
      return { text: 'Results Published', variant: 'success' };
    } else if (now >= deadline && now <= judgingDate) {
      return { text: 'Judging Active', variant: 'warning' };
    } else if (now > judgingDate) {
      return { text: 'Judging Complete', variant: 'info' };
    } else {
      return { text: 'Awaiting Deadline', variant: 'secondary' };
    }
  }
</script>

<svelte:head>
  <title>Judge Portal | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Judge Portal"
  subtitle="Access your assigned competitions and submit scores"
  backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
  large={true}
/>

<Container size="lg">
  {#if isLoading}
    <LoadingSpinner message="Loading your judging assignments..." />

  {:else if error}
    <Card accent accentColor="danger">
      <p class="error-text">{error}</p>
    </Card>

  {:else}
    <!-- Active Judging Session -->
    {#if $activeSession.sessionActive}
      <Card accent accentColor="warning" class="active-session">
        <div class="session-content">
          <div class="session-icon">
            <Trophy size={32} strokeWidth={1.5} color="var(--color-warning)" />
          </div>
          <div>
            <h3>Active Judging Session</h3>
            <p>You have an active judging session for <strong>{$activeSession.activeCompetition?.name}</strong></p>
          </div>
        </div>
        <Button
          variant="warning"
          fullWidth={true}
          on:click={() => goto(`/judge/competition/${$activeSession.activeCompetition.id}`)}
        >
          Continue Judging
        </Button>
      </Card>
    {/if}

    <!-- Available Competitions -->
    {#if availableCompetitions.length > 0}
      <section class="section">
        <h2 class="section-title">Available for Judging ({availableCompetitions.length})</h2>
        <div class="competitions-grid">
          {#each availableCompetitions as assignment}
            {@const competition = assignment.competition}
            {@const status = getCompetitionStatus(competition)}
            <Card hover={false}>
              <div class="competition-header">
                <h3 class="competition-name">{competition.name}</h3>
                <Badge variant={status.variant}>{status.text}</Badge>
              </div>

              {#if competition.description}
                <p class="description">{competition.description}</p>
              {/if}

              <div class="competition-details">
                <div class="detail-item">
                  <Calendar size={16} strokeWidth={2} />
                  <div>
                    <span class="detail-label">Entry Deadline</span>
                    <span class="detail-value">{formatDate(competition.entry_deadline)}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <Calendar size={16} strokeWidth={2} />
                  <div>
                    <span class="detail-label">Judging Date</span>
                    <span class="detail-value">{formatDate(competition.judging_date)}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <UserIcon size={16} strokeWidth={2} />
                  <div>
                    <span class="detail-label">Your Role</span>
                    <span class="detail-value">
                      {assignment.judge_role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {assignment.judge_role === 'bjcp_judge' ? 'BJCP Certified' : assignment.judge_role === 'club_judge' ? 'Club Judge' : 'Guest Judge'}
                    </Badge>
                  </div>
                </div>
                {#if assignment.assignment_notes}
                  <div class="detail-item">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value">{assignment.assignment_notes}</span>
                  </div>
                {/if}
              </div>

              <div class="competition-actions">
                <Button
                  variant={status.variant === 'warning' ? 'success' : 'secondary'}
                  fullWidth={true}
                  disabled={status.variant !== 'warning'}
                  on:click={() => startJudging(competition.id)}
                >
                  {#if status.variant === 'warning'}
                    Start Judging
                  {:else if status.variant === 'success'}
                    Judging Complete
                  {:else}
                    Not Yet Available
                  {/if}
                </Button>
              </div>
            </Card>
          {/each}
        </div>
      </section>
    {/if}

    <!-- All Assignments (including not yet active) -->
    {#if userJudgeAssignments.length > availableCompetitions.length}
      <section class="section">
        <h2 class="section-title">All Your Assignments ({userJudgeAssignments.length})</h2>
        <div class="competitions-grid">
          {#each userJudgeAssignments.filter(a => !availableCompetitions.find(ac => ac.id === a.id)) as assignment}
            {@const competition = assignment.competition}
            {@const status = getCompetitionStatus(competition)}
            <Card hover={false}>
              <div class="competition-header">
                <h3 class="competition-name">{competition.name}</h3>
                <Badge variant={status.variant}>{status.text}</Badge>
              </div>

              <div class="competition-details">
                <div class="detail-item">
                  <Calendar size={16} strokeWidth={2} />
                  <div>
                    <span class="detail-label">Entry Deadline</span>
                    <span class="detail-value">{formatDate(competition.entry_deadline)}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <Calendar size={16} strokeWidth={2} />
                  <div>
                    <span class="detail-label">Judging Date</span>
                    <span class="detail-value">{formatDate(competition.judging_date)}</span>
                  </div>
                </div>
              </div>

              <div class="info-message">
                <Clock size={20} strokeWidth={1.5} />
                <p>
                  {#if status.variant === 'secondary'}
                    Judging will be available after the entry deadline
                  {:else}
                    This competition has been completed
                  {/if}
                </p>
              </div>
            </Card>
          {/each}
        </div>
      </section>
    {/if}

    <!-- No Assignments -->
    {#if userJudgeAssignments.length === 0}
      <Card>
        <div class="empty-state">
          <Scale size={64} strokeWidth={1.5} color="var(--color-text-tertiary)" />
          <h3>No Judging Assignments</h3>
          <p>You haven't been assigned to judge any competitions yet.</p>
          <p>Contact the competition director if you believe this is an error.</p>
        </div>
      </Card>
    {/if}

    <!-- Information Section -->
    <Card class="info-card">
      <div class="info-header">
        <Smartphone size={32} strokeWidth={1.5} color="var(--color-brand-primary)" />
        <h3>Mobile-Friendly Judging</h3>
      </div>
      <p>This judging interface is optimized for mobile devices. You can:</p>
      <ul>
        <li>Score entries using the BJCP 50-point scale</li>
        <li>Add detailed tasting notes for each entry</li>
        <li>Rank entries within categories</li>
        <li>Save your progress as you go</li>
        <li>Review and edit scores before final submission</li>
      </ul>
    </Card>
  {/if}
</Container>

<style>
  .error-text {
    color: var(--color-danger);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }

  .active-session {
    margin-bottom: var(--space-8);
  }

  .session-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .session-icon {
    flex-shrink: 0;
  }

  .session-content h3 {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }

  .session-content p {
    margin: 0;
    color: var(--color-text-secondary);
  }

  .section {
    margin-bottom: var(--space-16);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
  }

  .competitions-grid {
    display: grid;
    gap: var(--space-8);
  }

  .competition-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .competition-name {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
    min-width: 0;
  }

  .description {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
    font-style: italic;
    line-height: var(--line-height-relaxed);
  }

  .competition-details {
    display: grid;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }

  .detail-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    color: var(--color-brand-primary);
  }

  .detail-item > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .detail-value {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .competition-actions {
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border-primary);
  }

  .info-message {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
  }

  .info-message p {
    margin: 0;
  }

  .empty-state {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-text-secondary);
  }

  .empty-state h3 {
    margin: var(--space-6) 0 var(--space-4) 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
  }

  .empty-state p {
    margin: var(--space-2) 0;
    line-height: var(--line-height-relaxed);
  }

  .info-card {
    margin-top: var(--space-16);
    margin-bottom: var(--space-8);
  }

  .info-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .info-header h3 {
    margin: 0;
    color: var(--color-brand-primary);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
  }

  .info-card p {
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin: 0 0 var(--space-4) 0;
  }

  .info-card ul {
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin: 0;
    padding-left: var(--space-8);
  }

  .info-card li {
    margin-bottom: var(--space-2);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .competition-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .session-content {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
