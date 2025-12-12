<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { leaderboard, message, loadLeaderboard, loading } from '$lib/stores/leaderboardStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Badge } from '$lib/components/ui';

  let cleanupFunctions = [];

  // Removed tab focus handler - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  // Data loading function
  async function loadData(force = false) {
    try {
      await loadLeaderboard(force);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  // Get medal emoji for top 3 positions
  function getMedal(rank) {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  // Get rank styling class
  function getRankClass(rank) {
    switch (rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return '';
    }
  }

  onMount(() => {
    // Initial data load
    loadData(true);
    
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);
  });

  onDestroy(() => {
    // Cleanup all event listeners
    cleanupFunctions.forEach(cleanup => cleanup());
  });

  // Reload when navigating to leaderboard
  $: if ($page.url.pathname === '/leaderboard') {
    loadData(true);
  }
</script>

<Container size="lg">
  <Hero title="Leaderboard" subtitle="Top Brewers in the JAX Community" icon="🏆" center={true} />

  {#if $loading}
    <LoadingSpinner message="Loading leaderboard..." />
  {:else if $leaderboard.length > 0}
    <div class="leaderboard-container">
      <!-- Top 3 Podium (Desktop) -->
      <div class="podium-section">
        {#if $leaderboard.length >= 3}
          <div class="podium">
            <!-- Second Place -->
            <div class="podium-position second">
              <div class="podium-card">
                <div class="medal">🥈</div>
                <div class="name">{$leaderboard[1].name}</div>
                <div class="points">{$leaderboard[1].points.toLocaleString()}</div>
                <div class="rank-label">2nd Place</div>
              </div>
              <div class="podium-base second-base">2</div>
            </div>
            
            <!-- First Place -->
            <div class="podium-position first">
              <div class="podium-card champion">
                <div class="crown">👑</div>
                <div class="medal">🥇</div>
                <div class="name">{$leaderboard[0].name}</div>
                <div class="points">{$leaderboard[0].points.toLocaleString()}</div>
                <div class="rank-label">Champion</div>
              </div>
              <div class="podium-base first-base">1</div>
            </div>
            
            <!-- Third Place -->
            <div class="podium-position third">
              <div class="podium-card">
                <div class="medal">🥉</div>
                <div class="name">{$leaderboard[2].name}</div>
                <div class="points">{$leaderboard[2].points.toLocaleString()}</div>
                <div class="rank-label">3rd Place</div>
              </div>
              <div class="podium-base third-base">3</div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Full Leaderboard Table -->
      <div class="table-section">
        <h3>Complete Rankings</h3>
        
        <!-- Desktop Table -->
        <div class="table-wrapper">
          <table class="desktop-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Points</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {#each $leaderboard as entry, index}
                <tr class="rank-row {getRankClass(index + 1)}">
                  <td class="rank-cell">
                    <span class="rank-number">#{index + 1}</span>
                    {#if index < 3}
                      <span class="medal-small">{getMedal(index + 1)}</span>
                    {/if}
                  </td>
                  <td class="name-cell">{entry.name}</td>
                  <td class="points-cell">{entry.points.toLocaleString()}</td>
                  <td class="badge-cell">
                    {#if index === 0}
                      <Badge variant="warning">Champion</Badge>
                    {:else if index < 3}
                      <Badge variant="info">Top 3</Badge>
                    {:else if index < 10}
                      <Badge variant="success">Top 10</Badge>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards">
          {#each $leaderboard as entry, index}
            <div class="mobile-card {getRankClass(index + 1)}">
              <div class="card-header">
                <div class="rank-section">
                  <span class="rank-number">#{index + 1}</span>
                  {#if index < 3}
                    <span class="medal-mobile">{getMedal(index + 1)}</span>
                  {/if}
                </div>
                {#if index === 0}
                  <Badge variant="warning" size="sm">Champion</Badge>
                {:else if index < 3}
                  <Badge variant="info" size="sm">Top 3</Badge>
                {:else if index < 10}
                  <Badge variant="success" size="sm">Top 10</Badge>
                {/if}
              </div>
              <div class="card-body">
                <div class="name">{entry.name}</div>
                <div class="points">{entry.points.toLocaleString()} points</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if $message}
    <EmptyState
      icon="📊"
      title="No Data Available"
      message={$message}
      actionLabel="Try Again"
      on:action={() => loadData(true)}
    />
  {:else}
    <EmptyState
      icon="🏆"
      title="Leaderboard Coming Soon"
      message="No leaderboard data available yet. Start brewing and submitting points!"
      actionLabel="Refresh"
      on:action={() => loadData(true)}
    />
  {/if}
</Container>

<style>

  .leaderboard-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  /* Podium Styles */
  .podium-section {
    margin-bottom: 2rem;
  }

  .podium {
    display: flex;
    justify-content: center;
    align-items: end;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .podium-position {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .podium-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 2px solid #e5e7eb;
    margin-bottom: 0.5rem;
    transition: transform 0.2s ease;
    min-width: 140px;
  }

  .podium-card:hover {
    transform: translateY(-2px);
  }

  .podium-card.champion {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fff 0%, #fffdf0 100%);
    transform: scale(1.1);
  }

  .crown {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .medal {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .podium-card .name {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .podium-card .points {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ff3e00;
    margin-bottom: 0.5rem;
  }

  .rank-label {
    font-size: 0.8rem;
    color: #666;
    font-weight: 500;
  }

  .podium-base {
    width: 120px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-weight: 700;
    font-size: 1.5rem;
    color: white;
  }

  .first-base {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    height: 60px;
  }

  .second-base {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    height: 50px;
  }

  .third-base {
    background: linear-gradient(135deg, #cd7f32 0%, #deb887 100%);
    height: 40px;
  }

  /* Table Styles */
  .table-section h3 {
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-transform: none;
  }

  .table-wrapper {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .desktop-table {
    width: 100%;
    border-collapse: collapse;
  }

  .desktop-table th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e5e7eb;
  }

  .desktop-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .rank-row {
    transition: background-color 0.2s ease;
  }

  .rank-row:hover {
    background-color: #f8fafc;
  }

  .rank-row.rank-gold {
    background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
  }

  .rank-row.rank-silver {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .rank-row.rank-bronze {
    background: linear-gradient(135deg, #fefaf5 0%, #fdf7f0 100%);
  }

  .rank-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .medal-small {
    font-size: 1.2rem;
  }

  .name-cell {
    font-weight: 500;
    color: #333;
  }

  .points-cell {
    font-weight: 700;
    color: #ff3e00;
    font-size: 1.1rem;
  }


  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #e5e7eb;
  }

  .mobile-card.rank-gold {
    border-left-color: #ffd700;
    background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
  }

  .mobile-card.rank-silver {
    border-left-color: #c0c0c0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .mobile-card.rank-bronze {
    border-left-color: #cd7f32;
    background: linear-gradient(135deg, #fefaf5 0%, #fdf7f0 100%);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .rank-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rank-number {
    font-weight: 700;
    color: #333;
  }

  .medal-mobile {
    font-size: 1.25rem;
  }

  .card-body .name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .card-body .points {
    font-weight: 700;
    color: #ff3e00;
    font-size: 1.2rem;
  }


  /* Mobile Responsive */
  @media (max-width: 768px) {

    .podium {
      display: none; /* Hide podium on mobile */
    }

    .table-wrapper {
      display: none;
    }

    .mobile-cards {
      display: block;
    }

    .podium-card {
      padding: 1rem;
      min-width: 120px;
    }

    .medal {
      font-size: 1.5rem;
    }

    .podium-card .points {
      font-size: 1rem;
    }
  }

  @media (min-width: 769px) {
    .mobile-cards {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .leaderboard-container {
      gap: 2rem;
    }

    .mobile-card {
      padding: 0.875rem;
    }

    .card-body .name {
      font-size: 1rem;
    }

    .card-body .points {
      font-size: 1.1rem;
    }
  }
</style>