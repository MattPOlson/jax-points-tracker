<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { allSubmissions as storeAll, loadAllSubmissions } from '$lib/stores/viewAllStore.js';
  import { setupFocusReload } from '$lib/utils/focusReload.js';

  let submissions = [];
  let filtered = [];
  let filters = {
    name: '',
    category: '',
    status: '',
    startDate: '',
    endDate: ''
  };
  let isMobile = false;
  let cleanupFocus;
  let cleanupNavigation;
  let lastUserId = null;

  $: submissions = $storeAll;

  $: if ($user?.id && $user.id !== lastUserId) {
    lastUserId = $user.id;
    loadSubmissions(true);
  }

  cleanupNavigation = afterNavigate(() => loadSubmissions(true));

  onMount(() => {
    isMobile = window.innerWidth < 768;
    const resize = () => (isMobile = window.innerWidth < 768);
    window.addEventListener('resize', resize);
    loadSubmissions(true);
    cleanupFocus = setupFocusReload(() => loadSubmissions(true));

    return () => {
      if (cleanupFocus) cleanupFocus();
      if (cleanupNavigation) cleanupNavigation();
      window.removeEventListener('resize', resize);
    };
  });

  async function loadSubmissions(force = false) {
    await loadAllSubmissions(force);
    applyFilters();
  }

  function applyFilters() {
    filtered = submissions.filter((s) => {
      const matchesName = filters.name === '' || s.members?.name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchesCategory = filters.category === '' || s.category?.toLowerCase().includes(filters.category.toLowerCase());
      const matchesStatus =
        filters.status === '' ||
        (filters.status === 'approved' && s.approved === true) ||
        (filters.status === 'rejected' && s.rejection_reason) ||
        (filters.status === 'pending' && s.approved === false && !s.rejection_reason);
      const date = new Date(s.event_date);
      const afterStart = filters.startDate === '' || new Date(filters.startDate) <= date;
      const beforeEnd = filters.endDate === '' || new Date(filters.endDate) >= date;
      return matchesName && matchesCategory && matchesStatus && afterStart && beforeEnd;
    });
  }
</script>

<main>
  <h2>All Point Submissions</h2>
  <div class="filters">
    <input type="text" placeholder="Filter by name" bind:value={filters.name} on:input={applyFilters}>
    <input type="text" placeholder="Filter by category" bind:value={filters.category} on:input={applyFilters}>
    <select bind:value={filters.status} on:change={applyFilters}>
      <option value="">All</option>
      <option value="approved">Approved</option>
      <option value="pending">Pending</option>
      <option value="rejected">Rejected</option>
    </select>
    <input type="date" bind:value={filters.startDate} on:change={applyFilters}>
    <input type="date" bind:value={filters.endDate} on:change={applyFilters}>
  </div>

  {#if filtered.length > 0}
    {#if isMobile}
      {#each filtered as s}
        <div class="mobile-card">
          <div><strong>Name:</strong> {s.members?.name ?? 'Unknown'}</div>
          <div><strong>Category:</strong> {s.category}</div>
          <div><strong>Description:</strong> {s.description}</div>
          <div><strong>Points:</strong> {s.points}</div>
          <div><strong>Date:</strong> {new Date(s.event_date).toLocaleDateString()}</div>
          <div><strong>Status:</strong> {s.approved ? '✅ Approved' : s.rejection_reason ? '❌ Rejected' : '⏳ Pending'}</div>
        </div>
      {/each}
    {:else}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Points</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as s}
            <tr>
              <td>{s.members?.name ?? 'Unknown'}</td>
              <td>{s.category}</td>
              <td>{s.description}</td>
              <td>{s.points}</td>
              <td>{new Date(s.event_date).toLocaleDateString()}</td>
              <td>{s.approved ? '✅ Approved' : s.rejection_reason ? '❌ Rejected' : '⏳ Pending'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <p class="message">No submissions found.</p>
  {/if}
</main>

<style>
  main {
    padding: 2rem 1rem;
    max-width: 1000px;
    margin: auto;
  }
  h2 {
    text-align: center;
    color: #ff3e00;
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }
  input, select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
  }
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  .mobile-card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    box-shadow: 0 0 5px #0001;
  }
  .message {
    text-align: center;
    margin-top: 1rem;
    color: #666;
  }
</style>