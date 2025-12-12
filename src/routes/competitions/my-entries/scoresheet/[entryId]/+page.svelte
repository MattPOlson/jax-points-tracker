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
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .entry-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem;
  }

  .entry-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .meta-value {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .judge-session {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .judge-info h2 {
    color: #333;
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .judge-date {
    font-size: 0.875rem;
    color: #666;
  }

  .total-score {
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    text-align: center;
    min-width: 120px;
  }

  .score-value {
    font-size: 2rem;
    font-weight: 100;
    margin: 0;
  }

  .score-label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0.25rem 0 0;
  }

  .score-description {
    font-size: 1rem;
    font-weight: 500;
    margin: 0.5rem 0 0;
  }

  .score-breakdown {
    margin-bottom: 2rem;
  }

  .breakdown-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .score-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 2px solid #e2e8f0;
  }

  .score-item-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .score-item-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .score-item-max {
    font-size: 0.75rem;
    color: #999;
    margin-top: 0.25rem;
  }

  .judge-notes {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1.5rem;
    border-left: 4px solid #059669;
  }

  .notes-title {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem;
  }

  .notes-text {
    color: #374151;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .loading, .error-state, .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
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

<Container size="lg">
  <Hero
    title="SCORESHEET DETAILS"
    icon="📋"
    center={true}
  />

  <!-- Controls -->
  <div class="controls">
    <Button variant="secondary" on:click={goBack}>
      ← Back to My Entries
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