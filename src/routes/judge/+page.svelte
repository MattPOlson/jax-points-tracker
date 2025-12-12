<!-- Judge Access Portal -->
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
      // Load judge assignments for current user
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

      // Filter to competitions where judging is available
      availableCompetitions = userJudgeAssignments.filter(assignment => {
        const comp = assignment.competition;
        const now = new Date();
        const deadline = new Date(comp.entry_deadline);
        const judgingDate = new Date(comp.judging_date);

        // Judging is available if deadline has passed and results aren't published
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
      return { text: 'Results Published', class: 'status-completed' };
    } else if (now >= deadline && now <= judgingDate) {
      return { text: 'Judging Active', class: 'status-judging' };
    } else if (now > judgingDate) {
      return { text: 'Judging Complete', class: 'status-judging' };
    } else {
      return { text: 'Awaiting Deadline', class: 'status-waiting' };
    }
  }
</script>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    min-height: 100vh;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 1rem;
  }

  .hero h1 {
    color: #ff3e00;
    font-size: 3.5rem;
    font-weight: 100;
    text-transform: uppercase;
    margin: 0 0 1rem 0;
    letter-spacing: 3px;
  }

  .hero p {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .loading, .error-state, .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .competitions-grid {
    display: grid;
    gap: 1rem;
  }

  .competition-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .competition-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .competition-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .competition-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
    min-width: 0;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .status-judging {
    background: #fef3c7;
    color: #92400e;
  }

  .status-completed {
    background: #dcfce7;
    color: #166534;
  }

  .status-waiting {
    background: #e5e7eb;
    color: #6b7280;
  }

  .competition-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
  }

  .detail-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }

  .description {
    color: #666;
    margin-bottom: 1rem;
    font-style: italic;
  }

  .action-button {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .action-button:hover {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    transform: translateY(-1px);
  }

  .action-button:active {
    transform: translateY(0);
  }

  .info-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .info-section h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .info-section p {
    color: #666;
    line-height: 1.6;
    margin: 0 0 1rem;
  }

  .info-section ul {
    color: #666;
    line-height: 1.6;
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-section li {
    margin-bottom: 0.5rem;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
      letter-spacing: 2px;
    }
    .hero {
      padding: 2rem 1rem;
    }
    
    .competition-details {
      grid-template-columns: 1fr;
    }
    
    .competition-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0.5rem;
    }
    
    .hero h1 {
      font-size: 2rem;
    }
    
    .competition-card {
      padding: 1rem;
    }
  }
</style>

<div class="container">
  <!-- Hero Section -->
  <div class="hero">
    <h1>Judge Portal</h1>
    <p>Access your assigned competitions and submit scores</p>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading your judging assignments...</p>
    </div>
  {:else if error}
    <div class="error">
      {error}
    </div>
  {:else}
    <!-- Active Judging Session -->
    {#if $activeSession.sessionActive}
      <div class="info-section">
        <h3>🎯 Active Judging Session</h3>
        <p>You have an active judging session for <strong>{$activeSession.activeCompetition?.name}</strong></p>
        <button 
          class="action-button" 
          on:click={() => goto(`/judge/competition/${$activeSession.activeCompetition.id}`)}
        >
          🏆 Continue Judging
        </button>
      </div>
    {/if}

    <!-- Available Competitions -->
    {#if availableCompetitions.length > 0}
      <div class="section">
        <h2>📋 Available for Judging ({availableCompetitions.length})</h2>
        <div class="competitions-grid">
          {#each availableCompetitions as assignment}
            {@const competition = assignment.competition}
            {@const status = getCompetitionStatus(competition)}
            <div class="competition-card">
              <div class="competition-header">
                <h3 class="competition-name">{competition.name}</h3>
                <span class="status-badge {status.class}">{status.text}</span>
              </div>

              {#if competition.description}
                <p class="description">{competition.description}</p>
              {/if}

              <div class="competition-details">
                <div class="detail-item">
                  <span class="detail-label">Entry Deadline</span>
                  <span class="detail-value">{formatDate(competition.entry_deadline)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Judging Date</span>
                  <span class="detail-value">{formatDate(competition.judging_date)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Your Role</span>
                  <span class="detail-value">
                    {assignment.judge_role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <div class="role-badge">{assignment.judge_role === 'bjcp_judge' ? 'BJCP Certified' : assignment.judge_role === 'club_judge' ? 'Club Judge' : 'Guest Judge'}</div>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Assignment Notes</span>
                  <span class="detail-value">{assignment.assignment_notes || 'None'}</span>
                </div>
              </div>

              <button 
                class="action-button"
                on:click={() => startJudging(competition.id)}
                disabled={status.class !== 'status-judging'}
              >
                {#if status.class === 'status-judging'}
                  🏆 Start Judging
                {:else if status.class === 'status-completed'}
                  ✅ Judging Complete
                {:else}
                  ⏳ Not Yet Available
                {/if}
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- All Assignments (including not yet active) -->
    {#if userJudgeAssignments.length > availableCompetitions.length}
      <div class="section">
        <h2>📅 All Your Assignments ({userJudgeAssignments.length})</h2>
        <div class="competitions-grid">
          {#each userJudgeAssignments.filter(a => !availableCompetitions.find(ac => ac.id === a.id)) as assignment}
            {@const competition = assignment.competition}
            {@const status = getCompetitionStatus(competition)}
            <div class="competition-card" style="opacity: 0.7;">
              <div class="competition-header">
                <h3 class="competition-name">{competition.name}</h3>
                <span class="status-badge {status.class}">{status.text}</span>
              </div>

              <div class="competition-details">
                <div class="detail-item">
                  <span class="detail-label">Entry Deadline</span>
                  <span class="detail-value">{formatDate(competition.entry_deadline)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Judging Date</span>
                  <span class="detail-value">{formatDate(competition.judging_date)}</span>
                </div>
              </div>

              <div style="padding: 1rem; text-align: center; color: #666;">
                {#if status.class === 'status-waiting'}
                  Judging will be available after the entry deadline
                {:else}
                  This competition has been completed
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- No Assignments -->
    {#if userJudgeAssignments.length === 0}
      <div class="empty-state">
        <h3>No Judging Assignments</h3>
        <p>You haven't been assigned to judge any competitions yet.</p>
        <p>Contact the competition director if you believe this is an error.</p>
      </div>
    {/if}

    <!-- Information Section -->
    <div class="info-section">
      <h3>📱 Mobile-Friendly Judging</h3>
      <p>This judging interface is optimized for mobile devices. You can:</p>
      <ul>
        <li>Score entries using the BJCP 50-point scale</li>
        <li>Add detailed tasting notes for each entry</li>
        <li>Rank entries within categories</li>
        <li>Save your progress as you go</li>
        <li>Review and edit scores before final submission</li>
      </ul>
    </div>
  {/if}
</div>