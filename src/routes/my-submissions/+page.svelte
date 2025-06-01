<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount, onDestroy } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  // -------------------------------
  // 0. Component state
  // -------------------------------
  let allSubmissions = [];  // always holds the full array from Supabase
  let submissions = [];     // derived: either allSubmissions or only pending
  let message = '';
  let showAll = false;
  let sortColumn = 'event_date';
  let sortDirection = 'desc';

  // -------------------------------
  // 1. Reactive derivation of "submissions" from "allSubmissions" + "showAll"
  // -------------------------------
  // Whenever allSubmissions or showAll changes, this recalculates.
  $: {
    if (!allSubmissions) {
      submissions = [];
      message = 'No submissions found.';
    } else if (showAll) {
      submissions = allSubmissions;
      message = allSubmissions.length > 0 ? '' : 'No submissions found.';
    } else {
      const pending = allSubmissions.filter(
        (sub) => sub.approved === false && sub.rejection_reason === null
      );
      submissions = pending;
      message = pending.length > 0 ? '' : 'No pending submissions found.';
    }
  }

  // -------------------------------
  // 2. loadAllSubmissions(): fetches full array from Supabase
  // -------------------------------
  async function loadAllSubmissions() {
    console.log('[submissions] loadAllSubmissions(): showAll =', showAll);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      message = 'Please log in to view your submissions.';
      allSubmissions = [];
      return;
    }

    const { data, error } = await supabase
      .from('point_submissions')
      .select(`
        id,
        category,
        description,
        points,
        event_date,
        approved,
        rejection_reason
      `)
      .eq('member_id', user.id)
      .order(sortColumn, { ascending: sortDirection === 'asc' });

    if (error) {
      console.error('[submissions]  → Error loading submissions:', error);
      message = 'Error loading your submissions.';
      allSubmissions = [];
      return;
    }

    allSubmissions = data;
    console.log('[submissions]  → fetched allSubmissions count =', data.length);
  }

  // -------------------------------
  // 3. Toggle “Show All” / “Show Pending Only”
  // -------------------------------
  function toggleView() {
    showAll = !showAll;
    console.log('[submissions] toggleView clicked → showAll =', showAll);
    // No need to fetch again—submissions will auto‐update from the reactive $: above
  }

  // -------------------------------
  // 4. Table‐sorting logic
  // -------------------------------
  function sortTable(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    console.log(
      `[submissions] sortTable: sortColumn = ${sortColumn}, sortDirection = ${sortDirection}`
    );
    loadAllSubmissions();
  }

  function formatStatus(sub) {
    if (sub.approved === true) return '✅ Approved';
    if (sub.rejection_reason) return '❌ Rejected';
    return '⏳ Pending';
  }

  // -------------------------------
  // 5. Rehydration on tab‑focus/visibility
  // -------------------------------
  function setupRehydration() {
    console.log('[submissions] setupRehydration() installing listeners');
    const handler = () => {
      console.log('[submissions] handler: tab visible or window focused → reload');
      loadAllSubmissions();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        handler();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', handler);

    return () => {
      console.log('[submissions] cleanupRehydration() removing listeners');
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', handler);
    };
  }

  // -------------------------------
  // 6. afterNavigate at top level
  // -------------------------------
  // Runs on client‑side navigation back to this route
  const cleanupNavigation = afterNavigate(() => {
    console.log('[submissions] afterNavigate → reload allSubmissions');
    loadAllSubmissions();
  });

  // -------------------------------
  // 7. onMount: initial fetch + set up rehydration
  // -------------------------------
  let cleanupRehydration;
  onMount(() => {
    console.log('[submissions] onMount → initial loadAllSubmissions + setupRehydration');
    loadAllSubmissions();
    cleanupRehydration = setupRehydration();

    return () => {
      if (cleanupRehydration) cleanupRehydration();
      if (cleanupNavigation) cleanupNavigation();
    };
  });
</script>

<h2>My Submissions</h2>

<div style="text-align:center; margin-top: 1rem;">
  <button on:click={toggleView}>
    {showAll ? 'Show Pending Only' : 'Show All'}
  </button>
</div>

{#if submissions.length > 0}
  <table>
    <thead>
      <tr>
        <th
          on:click={() => sortTable('category')}
          class:sort-asc={sortColumn === 'category' && sortDirection === 'asc'}
          class:sort-desc={sortColumn === 'category' && sortDirection === 'desc'}
        >
          Category
        </th>
        <th
          on:click={() => sortTable('description')}
          class:sort-asc={sortColumn === 'description' && sortDirection === 'asc'}
          class:sort-desc={sortColumn === 'description' && sortDirection === 'desc'}
        >
          Description
        </th>
        <th
          on:click={() => sortTable('points')}
          class:sort-asc={sortColumn === 'points' && sortDirection === 'asc'}
          class:sort-desc={sortColumn === 'points' && sortDirection === 'desc'}
        >
          Points
        </th>
        <th
          on:click={() => sortTable('event_date')}
          class:sort-asc={sortColumn === 'event_date' && sortDirection === 'asc'}
          class:sort-desc={sortColumn === 'event_date' && sortDirection === 'desc'}
        >
          Event Date
        </th>
        <th>Status</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      {#each submissions as s}
        <tr>
          <td>{s.category}</td>
          <td>{s.description}</td>
          <td>{s.points}</td>
          <td>{new Date(s.event_date).toLocaleDateString()}</td>
          <td>{formatStatus(s)}</td>
          <td>{s.rejection_reason ?? ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p style="text-align:center; color: #555;">{message}</p>
{/if}

<style>
  h2 {
    text-align: center;
    margin-top: 2rem;
  }

  table {
    margin: 2rem auto;
    border-collapse: collapse;
    width: 90%;
    max-width: 800px;
    font-size: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
  }

  th,
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  th:hover {
    background-color: #e2e8f0;
  }

  th.sort-asc::after {
    content: ' ▲';
    font-size: 0.75rem;
  }

  th.sort-desc::after {
    content: ' ▼';
    font-size: 0.75rem;
  }

  button {
    padding: 0.4rem 0.75rem;
    border: 1px solid #222;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  button:hover {
    background: #f0f0f0;
  }
</style>
