<!-- Competition Entry Scoresheet Details Page -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { ArrowLeft, FileText } from 'lucide-svelte';

  // Get entry ID from URL
  $: entryId = $page.params.entryId;

  let scoresheet = null;
  let isLoading = true;
  let error = null;

  onMount(() => {
    if (!$userProfile) {
      goto('/auth');
      return;
    }
    loadScoresheet();
  });

  async function loadScoresheet() {
    isLoading = true;
    error = null;

    try {
      console.log('Loading scoresheet for entry:', entryId);

      // First, verify the entry belongs to the current user
      const { data: entryData, error: entryError } = await supabase
        .from('competition_entries')
        .select(`
          *,
          competition:competitions(id, name, description, judging_date),
          category:bjcp_categories(id, category_name, category_number, subcategory_letter, subcategory_name)
        `)
        .eq('id', entryId)
        .eq('member_id', $userProfile.id)
        .single();

      if (entryError) throw entryError;
      if (!entryData) {
        throw new Error('Entry not found or you do not have permission to view this scoresheet.');
      }

      // Get judging sessions for this entry
      const { data: sessions, error: sessionsError } = await supabase
        .from('competition_judging_sessions')
        .select(`
          *,
          judge:members!competition_judging_sessions_judge_id_fkey(id, name)
        `)
        .eq('entry_id', entryId)
        .eq('competition_id', entryData.competition_id)
        .order('judged_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        error = 'No scoresheets found for this entry. Results may not be available yet.';
        return;
      }

      scoresheet = {
        entry: entryData,
        sessions: sessions.map(session => ({
          id: session.id,
          judge: session.judge,
          total_score: session.total_score,
          judge_notes: session.judge_notes,
          scoresheet_data: session.scoresheet_data,
          judged_at: session.judged_at,
          private_notes: session.private_notes,
          // Simple scoresheet data (fallback)
          aroma_score: session.aroma_score,
          appearance_score: session.appearance_score,
          flavor_score: session.flavor_score,
          mouthfeel_score: session.mouthfeel_score,
          overall_score: session.overall_score
        }))
      };

    } catch (err) {
      console.error('Error loading scoresheet:', err);
      error = err.message || 'Failed to load scoresheet data';
    } finally {
      isLoading = false;
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Never';
    try {
      // Handle space-separated datetime format
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        isoString = dateString.replace(' ', 'T');
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  function getScoreColor(score) {
    if (score >= 45) return '#059669'; // Excellent
    if (score >= 38) return '#0891b2'; // Very Good
    if (score >= 30) return '#eab308'; // Good
    if (score >= 21) return '#f59e0b'; // Fair
    return '#dc2626'; // Poor
  }

  function getScoreDescription(score) {
    if (score >= 45) return 'Excellent';
    if (score >= 38) return 'Very Good';
    if (score >= 30) return 'Good';
    if (score >= 21) return 'Fair';
    if (score > 0) return 'Poor';
    return '';
  }

  function goBack() {
    goto('/competitions/my-entries');
  }
</script>

<svelte:head>
  <title>Scoresheet Details | JAX Members Portal</title>
</svelte:head>

<style>

  .entry-info {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin-bottom: var(--space-8);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
  }

  .entry-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4);
  }

  .entry-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
    font-weight: var(--font-weight-medium);
  }

  .meta-value {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .judge-session {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: var(--space-8);
    margin-bottom: var(--space-8);
    box-shadow: var(--shadow-card);
  }

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-8);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .judge-info h2 {
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .judge-date {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .total-score {
    background: linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-hover) 100%);
    color: white;
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-card);
    text-align: center;
    min-width: 120px;
  }

  .score-value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-light);
    margin: 0;
  }

  .score-label {
    font-size: var(--font-size-sm);
    opacity: 0.9;
    margin: var(--space-1) 0 0;
  }

  .score-description {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    margin: var(--space-2) 0 0;
  }

  .score-breakdown {
    margin-bottom: var(--space-8);
  }

  .breakdown-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-4);
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
  }

  .score-item {
    background: var(--color-bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-card);
    text-align: center;
    border: 2px solid var(--color-border-secondary);
  }

  .score-item-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
    font-weight: var(--font-weight-medium);
  }

  .score-item-value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .score-item-max {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-top: var(--space-1);
  }

  .judge-notes {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    border-left: 4px solid var(--color-success);
  }

  .notes-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4);
  }

  .notes-text {
    color: var(--color-text-primary);
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }

  .controls {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .loading, .error-state, .empty-state {
    text-align: center;
    padding: var(--space-12) var(--space-4);
    color: var(--color-text-secondary);
  }

  .error {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    padding: var(--space-4);
    border-radius: var(--radius-card);
    margin-bottom: var(--space-4);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {

    .session-header {
      flex-direction: column;
      align-items: stretch;
    }

    .total-score {
      min-width: auto;
    }

    .score-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .entry-meta {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .score-grid {
      grid-template-columns: 1fr;
    }

    .header {
      padding: 1.5rem;
    }

    .judge-session {
      padding: 1.5rem;
    }
  }
</style>

<Hero
  title="Scoresheet Details"
  subtitle="View detailed judge feedback and scores"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  <!-- Controls -->
  <div class="controls">
    <Button variant="secondary" on:click={goBack}>
      <ArrowLeft size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
      Back to My Entries
    </Button>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <LoadingSpinner message="Loading scoresheet details..." />
  <!-- Error State -->
  {:else if error}
    <div class="error">
      {error}
    </div>
  <!-- Scoresheet Content -->
  {:else if scoresheet}
    <!-- Entry Information -->
    <div class="entry-info">
      <h2 class="entry-title">Entry #{scoresheet.entry.entry_number}: {scoresheet.entry.beer_name}</h2>

      <div class="entry-meta">
        <div class="meta-item">
          <span class="meta-label">Competition</span>
          <span class="meta-value">{scoresheet.entry.competition.name}</span>
        </div>

        {#if scoresheet.entry.category}
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value">
              {scoresheet.entry.category.category_number}{scoresheet.entry.category.subcategory_letter} - {scoresheet.entry.category.category_name}
              {#if scoresheet.entry.category.subcategory_name}
                ({scoresheet.entry.category.subcategory_name})
              {/if}
            </span>
          </div>
        {/if}

        <div class="meta-item">
          <span class="meta-label">Judging Date</span>
          <span class="meta-value">{formatDate(scoresheet.entry.competition.judging_date)}</span>
        </div>
      </div>
    </div>

    <!-- Judge Sessions -->
    {#each scoresheet.sessions as session}
      <div class="judge-session">
        <div class="session-header">
          <div class="judge-info">
            <h2>Judge: {session.judge.name}</h2>
            {#if session.judged_at}
              <div class="judge-date">Judged: {formatDate(session.judged_at)}</div>
            {/if}
          </div>

          <div class="total-score" style="background: {session.total_score ? getScoreColor(session.total_score) : '#6b7280'}">
            <div class="score-value">{session.total_score || 'N/A'}/50</div>
            <div class="score-label">Total Score</div>
            {#if session.total_score}
              <div class="score-description">{getScoreDescription(session.total_score)}</div>
            {/if}
          </div>
        </div>

        <!-- Score Breakdown -->
        {#if session.aroma_score !== null || session.appearance_score !== null || session.flavor_score !== null || session.mouthfeel_score !== null || session.overall_score !== null}
          <div class="score-breakdown">
            <h3 class="breakdown-title">BJCP Score Breakdown</h3>
            <div class="score-grid">
              {#if session.aroma_score !== null}
                <div class="score-item">
                  <div class="score-item-label">Aroma</div>
                  <div class="score-item-value">{session.aroma_score}</div>
                  <div class="score-item-max">out of 12</div>
                </div>
              {/if}

              {#if session.appearance_score !== null}
                <div class="score-item">
                  <div class="score-item-label">Appearance</div>
                  <div class="score-item-value">{session.appearance_score}</div>
                  <div class="score-item-max">out of 3</div>
                </div>
              {/if}

              {#if session.flavor_score !== null}
                <div class="score-item">
                  <div class="score-item-label">Flavor</div>
                  <div class="score-item-value">{session.flavor_score}</div>
                  <div class="score-item-max">out of 20</div>
                </div>
              {/if}

              {#if session.mouthfeel_score !== null}
                <div class="score-item">
                  <div class="score-item-label">Mouthfeel</div>
                  <div class="score-item-value">{session.mouthfeel_score}</div>
                  <div class="score-item-max">out of 5</div>
                </div>
              {/if}

              {#if session.overall_score !== null}
                <div class="score-item">
                  <div class="score-item-label">Overall</div>
                  <div class="score-item-value">{session.overall_score}</div>
                  <div class="score-item-max">out of 10</div>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Judge Notes -->
        {#if session.judge_notes}
          <div class="judge-notes">
            <h3 class="notes-title">Judge Notes</h3>
            <p class="notes-text">{session.judge_notes}</p>
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div class="empty-state">
      <h3>No Scoresheet Found</h3>
      <p>The scoresheet for this entry could not be loaded.</p>
    </div>
  {/if}
</Container>