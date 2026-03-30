<script>
  import { onMount } from 'svelte';
  import { leaderboard, message, loading, availableYears, selectedYear, loadLeaderboard, loadAvailableYears } from '$lib/stores/leaderboardStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Badge } from '$lib/components/ui';
  import { Trophy, Medal, Award, Crown, ChevronDown } from 'lucide-svelte';

  const currentYear = new Date().getFullYear();

  async function loadData(force = false) {
    try {
      await loadLeaderboard($selectedYear, force);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  async function onYearChange(e) {
    selectedYear.set(Number(e.target.value));
    await loadData(true);
  }

  function getRankClass(rank) {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  onMount(async () => {
    await loadAvailableYears();
    await loadData(true);
  });
</script>

<Hero
  title="Leaderboard"
  subtitle="Top Brewers in the JAX Community"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">

  <!-- Year Selector -->
  <div class="year-selector-bar">
    <span class="season-label">
      {$selectedYear === currentYear ? `${currentYear} Season (Current)` : `${$selectedYear} Season`}
    </span>
    <div class="select-wrapper">
      <select class="year-select" value={$selectedYear} on:change={onYearChange}>
        {#each $availableYears as year}
          <option value={year}>
            {year}{year === currentYear ? ' (Current)' : ''}
          </option>
        {/each}
      </select>
      <ChevronDown size={16} class="select-chevron" />
    </div>
  </div>

  {#if $loading}
    <LoadingSpinner message="Loading leaderboard..." />
  {:else if $leaderboard.length > 0}
    <div class="leaderboard-container">

      <!-- Top 3 Podium (Desktop) -->
      {#if $leaderboard.length >= 3}
        <div class="podium-section">
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
        </div>
      {/if}

      <!-- Full Rankings Table -->
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
                <div class="points">{entry.points.toLocaleString()} pts</div>
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
      title="No Points Yet for {$selectedYear}"
      message={$selectedYear === currentYear
        ? "No points have been submitted for this season yet. Start brewing!"
        : "No points data found for the {$selectedYear} season."}
      actionLabel="Refresh"
      on:action={() => loadData(true)}
    />
  {/if}

</Container>

<style>
  /* Year Selector */
  .year-selector-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: var(--space-6) 0 var(--space-4);
    padding: var(--space-3) var(--space-5);
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-gold);
  }

  .season-label {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .year-select {
    appearance: none;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .year-select:focus {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  .select-wrapper :global(.select-chevron) {
    position: absolute;
    right: var(--space-3);
    pointer-events: none;
    color: var(--color-text-secondary);
  }

  /* Leaderboard Layout */
  .leaderboard-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  /* Podium */
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
    text-align: center;
  }

  .podium-card:hover {
    transform: translateY(-5px);
  }

  .podium-card.champion {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fff 0%, #fffdf0 100%);
    transform: scale(1.1);
  }

  .crown-icon,
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-weight: 700;
    font-size: 1.5rem;
    color: white;
  }

  .first-base  { background: linear-gradient(135deg, #ffd700, #ffed4e); height: 60px; }
  .second-base { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); height: 50px; }
  .third-base  { background: linear-gradient(135deg, #cd7f32, #deb887); height: 40px; }

  /* Table */
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

  .rank-row { transition: background-color var(--transition-base); }
  .rank-row:hover { background-color: var(--color-bg-secondary); }
  .rank-row.rank-gold   { background: linear-gradient(135deg, #fffbf0, #fff8e1); }
  .rank-row.rank-silver { background: linear-gradient(135deg, #f8fafc, #f1f5f9); }
  .rank-row.rank-bronze { background: linear-gradient(135deg, #fefaf5, #fdf7f0); }

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
  .mobile-cards { display: none; }

  .mobile-card {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-border-primary);
  }

  .mobile-card.rank-gold   { border-left-color: #ffd700; background: linear-gradient(135deg, #fffbf0, #fff8e1); }
  .mobile-card.rank-silver { border-left-color: #c0c0c0; background: linear-gradient(135deg, #f8fafc, #f1f5f9); }
  .mobile-card.rank-bronze { border-left-color: #cd7f32; background: linear-gradient(135deg, #fefaf5, #fdf7f0); }

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

  .rank-number { font-weight: var(--font-weight-bold); color: var(--color-text-primary); }

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

  @media (max-width: 768px) {
    .podium { display: none; }
    .table-wrapper { display: none; }
    .mobile-cards { display: block; }

    .year-selector-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
  }

  @media (min-width: 769px) {
    .mobile-cards { display: none; }
  }

  @media (max-width: 480px) {
    .leaderboard-container { gap: 2rem; }
    .mobile-card { padding: 0.875rem; }
    .card-body .name { font-size: 1rem; }
    .card-body .points { font-size: 1.1rem; }
  }
</style>
