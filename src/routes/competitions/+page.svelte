<!-- src/routes/competitions/+page.svelte -->
<!-- JAX Members Portal - Competitions Landing Page -->
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

  // =============================================
  // Tab Switching Fix (CRITICAL) - Commented for now
  // =============================================
  let cleanup;

  // =============================================
  // Component State
  // =============================================
  let userEntriesLoaded = false;
  let hasJudgeAssignments = false;

  // =============================================
  // Lifecycle
  // =============================================
  onMount(async () => {
    // Load competition data
    try {
      await loadCompetitionData();
      
      // Load user entries if logged in
      if ($userProfile?.id) {
        await loadMyEntries();
        userEntriesLoaded = true;
        
        // Check for judge assignments
        await checkJudgeAssignments($userProfile.id);
      }
    } catch (err) {
      console.error('Failed to load competition data:', err);
    }
  });

  onDestroy(() => {
    if (cleanup) cleanup();
  });

  // =============================================
  // Navigation Functions
  // =============================================
  
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
      return { text: `${daysLeft} days left`, class: 'status-open' };
    } else if (daysLeft > 0) {
      return { text: `${daysLeft} days left`, class: 'status-closing' };
    } else {
      return { text: 'Entries closed', class: 'status-closed' };
    }
  }

  // Reactive statement to check judge assignments when user profile changes
  $: if ($userProfile?.id && !hasJudgeAssignments) {
    checkJudgeAssignments($userProfile.id);
  }
</script>

<svelte:head>
  <title>Competitions | JAX Members Portal</title>
</svelte:head>

<div class="container">
  <!-- Hero Section -->
  <section class="hero">
    <h1>🏆 COMPETITIONS</h1>
    <p>Submit entries, track your progress, and compete with fellow brewers</p>
  </section>

  <!-- Quick Actions Grid -->
  <section class="quick-actions">
    <div class="action-cards">
      
      <!-- Submit Entry Card -->
      <div class="action-card primary" on:click={() => navigateTo('/competitions/submit-entry')}>
        <div class="card-icon">🍺</div>
        <div class="card-content">
          <h3>Submit Entry</h3>
          <p>Enter your beer into a competition</p>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <!-- My Entries Card -->
      <div class="action-card" on:click={() => navigateTo('/competitions/my-entries')}>
        <div class="card-icon">📋</div>
        <div class="card-content">
          <h3>My Entries</h3>
          <p>View and manage your submissions</p>
          {#if userEntriesLoaded && $entryStats.total > 0}
            <div class="card-stats">
              <span class="stat-badge">{$entryStats.total} entries</span>
              <span class="stat-badge active">{$entryStats.active} active</span>
            </div>
          {/if}
        </div>
        <div class="card-arrow">→</div>
      </div>

      <!-- Results Card -->
      <div class="action-card" on:click={() => navigateTo('/competitions/results')}>
        <div class="card-icon">🏅</div>
        <div class="card-content">
          <h3>Results</h3>
          <p>View competition winners and scores</p>
        </div>
        <div class="card-arrow">→</div>
      </div>

      <!-- Judge Portal Card (only show if user has judge assignments) -->
      {#if $userProfile && hasJudgeAssignments}
        <div class="action-card judge-card" on:click={() => navigateTo('/judge')}>
          <div class="card-icon">⚖️</div>
          <div class="card-content">
            <h3>Judge Portal</h3>
            <p>Access your assigned competitions for judging</p>
          </div>
          <div class="card-arrow">→</div>
        </div>
      {/if}

    </div>
  </section>

  <!-- Active Competitions Section -->
  <section class="competitions-section">
    <h2>🚀 ACTIVE COMPETITIONS</h2>
    
    {#if $isLoading && !$isLoaded}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading competitions...</p>
      </div>
    
    {:else if $error}
      <div class="error-container">
        <p>❌ {$error}</p>
        <button on:click={() => loadCompetitionData(true)} class="retry-button">
          🔄 Retry
        </button>
      </div>

    {:else if $isLoaded && $activeCompetitions.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No Active Competitions</h3>
        <p>Check back later for new competitions, or contact an officer for more information.</p>
      </div>

    {:else if $isLoaded}
      <div class="competitions-grid">
        {#each $activeCompetitions as competition}
          <div class="competition-card">
            <div class="competition-header">
              <h3>{competition.name}</h3>
              <div class="competition-status {getCompetitionStatus(competition).class}">
                {getCompetitionStatus(competition).text}
              </div>
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
              <button 
                class="submit-entry-btn"
                on:click={() => navigateTo('/competitions/submit-entry')}
              >
                🍺 Submit Entry
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Quick Info Section -->
  <section class="info-section">
    <div class="info-grid">
      
      <div class="info-card">
        <div class="info-icon">📝</div>
        <h4>How to Enter</h4>
        <ul>
          <li>Select an active competition</li>
          <li>Choose your BJCP category</li>
          <li>Provide beer details and notes</li>
          <li>Submit before the deadline</li>
        </ul>
      </div>

      <div class="info-card">
        <div class="info-icon">🏆</div>
        <h4>Judging Process</h4>
        <ul>
          <li>Anonymous judging by certified judges</li>
          <li>BJCP style guidelines used</li>
          <li>Scores and feedback provided</li>
          <li>Awards for top entries</li>
        </ul>
      </div>

      <div class="info-card">
        <div class="info-icon">💰</div>
        <h4>Entry Fees</h4>
        <ul>
          <li>Check with officers for fee structure</li>
          <li>Multiple entries allowed</li>
          <li>Payment status tracked in portal</li>
          <li>Fee goes toward prizes and judging</li>
        </ul>
      </div>
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Hero Section */
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

  /* Quick Actions Section */
  .quick-actions {
    margin-bottom: 4rem;
  }

  .action-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .action-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    border-left: 4px solid #ddd;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .action-card.primary {
    border-left-color: #ff3e00;
    background: linear-gradient(135deg, #fff 0%, #fff8f6 100%);
  }

  .action-card.primary:hover {
    box-shadow: 0 4px 20px rgba(255, 62, 0, 0.2);
  }

  .action-card.officer {
    border-left-color: #2563eb;
    background: linear-gradient(135deg, #fff 0%, #f6f8ff 100%);
  }

  .action-card.judge-card {
    border-left-color: #059669;
    background: linear-gradient(135deg, #fff 0%, #f0fdf4 100%);
  }

  .action-card.judge-card:hover {
    box-shadow: 0 4px 20px rgba(5, 150, 105, 0.2);
  }

  .card-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .card-content {
    flex: 1;
  }

  .card-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #333;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .card-content p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .card-stats {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stat-badge {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .stat-badge.active {
    background: #fef3c7;
    color: #d97706;
  }

  .card-arrow {
    font-size: 1.5rem;
    color: #ff3e00;
    font-weight: bold;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .action-card:hover .card-arrow {
    opacity: 1;
  }

  /* Competitions Section */
  .competitions-section {
    margin-bottom: 4rem;
  }

  .competitions-section h2 {
    color: #ff3e00;
    font-size: 2rem;
    font-weight: 100;
    text-transform: uppercase;
    margin: 0 0 2rem 0;
    letter-spacing: 2px;
    text-align: center;
  }

  .competitions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .competition-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .competition-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 62, 0, 0.15);
  }

  .competition-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .competition-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
    font-weight: 600;
    flex: 1;
  }

  .competition-status {
    padding: 0.4rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-open {
    background: #d1fae5;
    color: #059669;
  }

  .status-closing {
    background: #fef3c7;
    color: #d97706;
  }

  .status-closed {
    background: #fee2e2;
    color: #dc2626;
  }

  .competition-details {
    padding: 0 1.5rem 1rem 1.5rem;
  }

  .description {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .competition-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
  }

  .meta-item .label {
    font-weight: 600;
    color: #374151;
    min-width: 100px;
  }

  .meta-item .value {
    color: #6b7280;
  }

  .competition-actions {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid #f3f4f6;
  }

  .submit-entry-btn {
    width: 100%;
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  .submit-entry-btn:hover {
    background: #e63600;
  }

  /* Loading and Error States */
  .loading-container, .error-container, .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #e63600;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .empty-state h3 {
    color: #ff3e00;
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  /* Info Section */
  .info-section {
    margin-bottom: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .info-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #2563eb;
    padding: 2rem;
  }

  .info-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .info-card h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.5rem;
    list-style-type: none;
  }

  .info-card li {
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
    position: relative;
  }

  .info-card li:before {
    content: "•";
    color: #ff3e00;
    font-weight: bold;
    position: absolute;
    left: -1rem;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }

    .hero h1 {
      font-size: 2.5rem;
      letter-spacing: 2px;
    }

    .hero {
      padding: 2rem 1rem;
    }

    .action-cards {
      grid-template-columns: 1fr;
    }

    .action-card {
      flex-direction: column;
      text-align: center;
      padding: 1.5rem;
    }

    .competitions-grid {
      grid-template-columns: 1fr;
    }

    .competition-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .competition-status {
      align-self: flex-end;
    }

    .meta-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .meta-item .label {
      min-width: auto;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: 2rem;
    }

    .action-card {
      padding: 1rem;
    }

    .competitions-section h2 {
      font-size: 1.5rem;
    }

    .competition-card {
      margin: 0 0.5rem;
    }
  }
</style>