<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { leaderboard, message, loadLeaderboard } from '$lib/stores/leaderboardStore.js';
  import { setupFocusReload } from '$lib/utils/focusReload.js';

  let cleanupFocus;
  let cleanupNavigation;

  onMount(() => {
    loadLeaderboard(true);
    cleanupNavigation = afterNavigate(() => loadLeaderboard(true));
    cleanupFocus = setupFocusReload(() => loadLeaderboard(true));
    return () => {
      if (cleanupFocus) cleanupFocus();
      if (cleanupNavigation) cleanupNavigation();
    };
  });
</script>

<h2>🏆 Leaderboard</h2>

{#if $leaderboard.length > 0}
  <div class="table-wrapper">
    <table class="desktop-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Member</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {#each $leaderboard as entry, index}
          <tr>
            <td>#{index + 1}</td>
            <td>{entry.name}</td>
            <td>{entry.points}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#each $leaderboard as entry, index}
      <div class="mobile-card">
        <div><strong>#{index + 1}</strong></div>
        <div><strong>Member:</strong> <span>{entry.name}</span></div>
        <div><strong>Points:</strong> <span>{entry.points}</span></div>
      </div>
    {/each}
  </div>
{:else if $message}
  <p class="message">{$message}</p>
{:else}
  <p class="message">No leaderboard data available.</p>
{/if}

<style>
  h2 {
    text-align: center;
    margin-top: 2rem;
    font-size: 1.75rem;
    color: #ff3e00;
  }

  .table-wrapper {
    max-width: 800px;
    margin: auto;
    padding: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }

  th {
    background: #f4f4f4;
    font-weight: bold;
  }

  .mobile-card {
    display: none;
  }

  .message {
    text-align: center;
    margin-top: 2rem;
    color: #555;
  }

  @media (max-width: 600px) {
    table.desktop-table {
      display: none;
    }

    .mobile-card {
      display: block;
      background: white;
      box-shadow: 0 2px 8px #0001;
      padding: 1rem;
      margin: 1rem auto;
      border-radius: 8px;
    }

    .mobile-card div {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .mobile-card strong {
      font-weight: 600;
    }
  }
</style>
