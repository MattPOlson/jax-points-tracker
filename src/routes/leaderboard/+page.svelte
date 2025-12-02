<script>
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { leaderboard, message, loadLeaderboard, loading } from '$lib/stores/leaderboardStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Badge, Card } from '$lib/components/ui';
  import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-svelte';

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

<Hero
  title="Leaderboard"
  subtitle="Top Brewers in the JAX Community"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">

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
                <div class="medal-icon">
                  <Medal size={48} strokeWidth={1.5} color="#c0c0c0" />
                </div>
                <div class="name">{$leaderboard[1].name}</div>
                <div class="points">{$leaderboard[1].points.toLocaleString()}</div>
                <div class="rank-label">2nd Place</div>
              </div>
              <div class="podium-base second-base">2</div>
            </div>

            <!-- First Place -->
            <div class="podium-position first">
              <div class="podium-card champion">
                <div class="crown-icon">
                  <Crown size={36} strokeWidth={1.5} color="#ffd700" />
                </div>
                <div class="medal-icon">
                  <Trophy size={56} strokeWidth={1.5} color="#ffd700" />
                </div>
                <div class="name">{$leaderboard[0].name}</div>
                <div class="points">{$leaderboard[0].points.toLocaleString()}</div>
                <div class="rank-label">Champion</div>
              </div>
              <div class="podium-base first-base">1</div>
            </div>

            <!-- Third Place -->
            <div class="podium-position third">
              <div class="podium-card">
                <div class="medal-icon">
                  <Award size={48} strokeWidth={1.5} color="#cd7f32" />
                </div>
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
                    {#if index === 0}
                      <Trophy size={20} strokeWidth={2} color="#ffd700" />
                    {:else if index === 1}
                      <Medal size={20} strokeWidth={2} color="#c0c0c0" />
                    {:else if index === 2}
                      <Award size={20} strokeWidth={2} color="#cd7f32" />
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
                  {#if index === 0}
                    <Trophy size={20} strokeWidth={2} color="#ffd700" />
                  {:else if index === 1}
                    <Medal size={20} strokeWidth={2} color="#c0c0c0" />
                  {:else if index === 2}
                    <Award size={20} strokeWidth={2} color="#cd7f32" />
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
      title="No Data Available"
      message={$message}
      actionLabel="Try Again"
      on:action={() => loadData(true)}
    />
  {:else}
    <EmptyState
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
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: 1.5rem;
    box-shadow: var(--shadow-card);
    border: 2px solid var(--color-border-primary);
    margin-bottom: 0.5rem;
    transition: transform var(--transition-base);
    min-width: 140px;
  }

  .podium-card:hover {
    transform: translateY(-5px);
  }

  .podium-card.champion {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fff 0%, #fffdf0 100%);
    transform: scale(1.1);
  }

  .crown-icon {
    margin-bottom: var(--space-2);
    display: flex;
    justify-content: center;
  }

  .medal-icon {
    margin-bottom: var(--space-2);
    display: flex;
    justify-content: center;
  }

  .podium-card .name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }

  .podium-card .points {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-2);
  }

  .rank-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
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
    color: var(--color-brand-primary);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-8);
    text-align: center;
  }

  .table-wrapper {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .desktop-table {
    width: 100%;
    border-collapse: collapse;
  }

  .desktop-table th {
    background: var(--color-bg-secondary);
    padding: var(--space-4);
    text-align: left;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-border-primary);
  }

  .desktop-table td {
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .rank-row {
    transition: background-color var(--transition-base);
  }

  .rank-row:hover {
    background-color: var(--color-bg-secondary);
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
    gap: var(--space-2);
    font-weight: var(--font-weight-semibold);
  }

  .name-cell {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .points-cell {
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    font-size: var(--font-size-lg);
  }


  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-border-primary);
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
    margin-bottom: var(--space-3);
  }

  .rank-section {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .rank-number {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .card-body .name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }

  .card-body .points {
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    font-size: var(--font-size-xl);
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