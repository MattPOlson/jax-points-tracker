<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  let submissions = [];
  let message = '';
  let showAll = false;
  let sortColumn = 'event_date';
  let sortDirection = 'desc';

  onMount(loadSubmissions);

async function loadSubmissions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    message = 'Please log in to view your submissions.';
    return;
  }

  let query = supabase
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

  if (!showAll) {
    query = query.eq('approved', false).is('rejection_reason', null);
  }

  const { data, error } = await query;

  if (!error) {
    submissions = data;
  } else {
    message = 'Error loading your submissions.';
  }
}

  function toggleView() {
    showAll = !showAll;
    loadSubmissions();
  }

  function formatStatus(sub) {
    if (sub.approved === true) return '✅ Approved';
    if (sub.rejection_reason) return '❌ Rejected';
    return '⏳ Pending';
  }

  
function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  loadSubmissions();
}
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
  <p style="text-align:center;">No Pending submissions found.</p>
{/if}

{#if message}
  <p style="color:red; text-align:center;">{message}</p>
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

  th, td {
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
