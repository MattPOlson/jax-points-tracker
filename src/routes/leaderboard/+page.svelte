<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  let leaderboard = [];
  let message = '';

  onMount(async () => {
    const { data, error } = await supabase
      .from('point_submissions')
      .select(`
        points,
        approved,
        member_id,
        members ( id, name )
      `)
      .eq('approved', true);

    if (error) {
      console.error('Error loading leaderboard:', error);
      message = 'Failed to load leaderboard.';
      return;
    }

    const totals = new Map();

    for (const entry of data) {
      const id = entry.members?.id;
      const name = entry.members?.name;
      const points = entry.points || 0;
      if (!id || !name) continue;

      if (!totals.has(id)) {
        totals.set(id, { name, points: 0 });
      }
      totals.get(id).points += points;
    }

    leaderboard = Array.from(totals.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  });
</script>

<h2>🏆 Leaderboard</h2>

{#if leaderboard.length > 0}
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
        {#each leaderboard as entry, index}
          <tr>
            <td>#{index + 1}</td>
            <td>{entry.name}</td>
            <td>{entry.points}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#each leaderboard as entry, index}
      <div class="mobile-card">
        <div><strong>#{index + 1}</strong></div>
        <div><strong>Member:</strong> <span>{entry.name}</span></div>
        <div><strong>Points:</strong> <span>{entry.points}</span></div>
      </div>
    {/each}
  </div>
{:else if message}
  <p class="message">{message}</p>
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
