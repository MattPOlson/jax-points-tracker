<!-- src/routes/officers/manage-competitions/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { competitionManagementStore } from '$lib/stores/competitionManagementStore';
  
  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  let searchQuery = '';
  let filterStatus = 'all'; // all, active, upcoming, past
  let showDeleteConfirm = false;
  let competitionToDelete = null;

  // Import the individual stores
  const { isLoading, error, stats, activeCompetitions, upcomingCompetitions, pastCompetitions } = competitionManagementStore;

  // Initialize store
  onMount(() => {
    console.log('🎯 Manage Competitions page mounted');
    console.log('📊 Current user profile:', $userProfile);
    console.log('🔐 Is officer?:', $userProfile?.is_officer);
    
    competitionManagementStore.initialize();
    console.log('✅ Competition store initialized');
    
    const cleanup = setupEventHandlers();
    
    // Subscribe to store for debugging
    const unsubscribe = competitionManagementStore.subscribe(value => {
      console.log('📦 Store updated with competitions:', value);
    });
    
    // Return cleanup function
    return () => {
      cleanup();
      unsubscribe();
    };
  });

  // Tab switching fix (CRITICAL - Supabase connection issue)
  function setupEventHandlers() {
    let isFirstLoad = true;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFirstLoad) {
        console.log('🔄 Tab became visible - doing F5 refresh');
        window.location.reload();
      }
      isFirstLoad = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  onDestroy(() => {
    // Cleanup handled by setupEventHandlers return
  });

  // Debug reactive statements
  $: {
    console.log('🔄 Reactive update:');
    console.log('  - isLoading:', $isLoading);
    console.log('  - error:', $error);
    console.log('  - competitions:', $competitionManagementStore);
    console.log('  - stats:', $stats);
  }

  // Import the individual stores
  //const { isLoading, error, stats, activeCompetitions, upcomingCompetitions, pastCompetitions } = competitionManagementStore;

  // Filtered competitions based on search and status
  $: filteredCompetitions = (() => {
    console.log('🔍 Computing filtered competitions...');
    let comps = [];
    
    switch (filterStatus) {
      case 'active':
        comps = $activeCompetitions || [];
        break;
      case 'upcoming':
        comps = $upcomingCompetitions || [];
        break;
      case 'past':
        comps = $pastCompetitions || [];
        break;
      default:
        comps = $competitionManagementStore || [];
    }

    console.log('📋 Competitions before filter:', comps);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      comps = comps.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    console.log('📋 Competitions after filter:', comps);
    return comps;
  })();

  // Format date for display
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Format date for form input
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Get status badge
  function getStatusBadge(competition) {
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    
    if (!competition.is_active) {
      return { text: 'Inactive', class: 'badge-inactive' };
    } else if (deadline < now) {
      return { text: 'Closed', class: 'badge-closed' };
    } else if (deadline - now < 7 * 24 * 60 * 60 * 1000) {
      return { text: 'Closing Soon', class: 'badge-warning' };
    } else {
      return { text: 'Active', class: 'badge-active' };
    }
  }

  // Toggle competition status
  async function toggleStatus(competition) {
    const result = await competitionManagementStore.toggleCompetitionStatus(
      competition.id, 
      !competition.is_active
    );
    
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  }

  // Delete competition
  async function deleteCompetition() {
    if (!competitionToDelete) return;
    
    const result = await competitionManagementStore.deleteCompetition(competitionToDelete.id);
    
    if (result.success) {
      showDeleteConfirm = false;
      competitionToDelete = null;
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  // Navigate to create page
  function navigateToCreate() {
    goto('/officers/manage-competitions/create');
  }

  // Navigate to edit page
  function navigateToEdit(competitionId) {
    goto(`/officers/manage-competitions/edit/${competitionId}`);
  }

  // Navigate to entries page
  function navigateToEntries(competitionId) {
    goto(`/officers/manage-competitions/entries/${competitionId}`);
  }

  // Force refresh
  function forceRefresh() {
    competitionManagementStore.loadCompetitions(true);
  }
</script>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .hero {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #ff3e00 0%, #ff6b35 100%);
    border-radius: 12px;
    color: white;
  }

  .hero h1 {
    font-size: 2.5rem;
    font-weight: 100;
    text-transform: uppercase;
    margin: 0.5rem 0;
  }

  .hero .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .stat-card .label {
    font-size: 0.875rem;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .stat-card .value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }

  .filter-select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: #ff3e00;
    color: white;
  }

  .btn-primary:hover {
    background: #e63600;
  }

  .btn-secondary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary:hover {
    background: #1d4ed8;
  }

  .competitions-table {
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: #f5f5f5;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #ddd;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background: #f9f9f9;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .badge-active {
    background: #d4f4dd;
    color: #059669;
  }

  .badge-inactive {
    background: #fef3c7;
    color: #d97706;
  }

  .badge-closed {
    background: #fee2e2;
    color: #dc2626;
  }

  .badge-warning {
    background: #fed7aa;
    color: #ea580c;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-edit {
    background: #2563eb;
    color: white;
  }

  .btn-toggle {
    background: #059669;
    color: white;
  }

  .btn-toggle.inactive {
    background: #dc2626;
  }

  .btn-entries {
    background: #8b5cf6;
    color: white;
  }

  .btn-delete {
    background: #dc2626;
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
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

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .competitions-table {
      overflow-x: auto;
    }

    table {
      min-width: 600px;
    }

    .actions {
      flex-direction: column;
    }

    .btn-small {
      width: 100%;
    }
  }

  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 6px;
    max-width: 500px;
    width: 90%;
  }

  .modal-content h3 {
    margin-top: 0;
    color: #dc2626;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
</style>

<div class="container">
  <!-- Hero Section -->
  <div class="hero">
    <div>🏆</div>
    <h1>Manage Competitions</h1>
    <p class="subtitle">Create and manage brewing competitions</p>
  </div>

  <!-- Statistics -->
  {#if !$isLoading}
    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Total Competitions</div>
        <div class="value">{$stats.total}</div>
      </div>
      <div class="stat-card">
        <div class="label">Active</div>
        <div class="value">{$stats.active}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Entries</div>
        <div class="value">{$stats.totalEntries}</div>
      </div>
      <div class="stat-card">
        <div class="label">Avg Entries</div>
        <div class="value">{$stats.avgEntries}</div>
      </div>
    </div>
  {/if}

  <!-- Controls -->
  <div class="controls">
    <input
      type="text"
      class="search-input"
      placeholder="Search competitions..."
      bind:value={searchQuery}
    />
    <select class="filter-select" bind:value={filterStatus}>
      <option value="all">All Competitions</option>
      <option value="active">Active Only</option>
      <option value="upcoming">Upcoming</option>
      <option value="past">Past/Closed</option>
    </select>
    <button class="btn btn-secondary" on:click={forceRefresh}>
      🔄 Refresh
    </button>
    <button class="btn btn-primary" on:click={navigateToCreate}>
      ➕ Create Competition
    </button>
  </div>

  <!-- Error State -->
  {#if $error}
    <div class="error">
      ⚠️ {$error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if $isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading competitions...</p>
    </div>
  {:else if filteredCompetitions.length === 0}
    <!-- Empty State -->
    <div class="empty-state">
      <h3>No competitions found</h3>
      <p>
        {#if searchQuery || filterStatus !== 'all'}
          Try adjusting your search or filters
        {:else}
          Create your first competition to get started
        {/if}
      </p>
      {#if filterStatus === 'all' && !searchQuery}
        <button class="btn btn-primary" on:click={navigateToCreate}>
          Create First Competition
        </button>
      {/if}
    </div>
  {:else}
    <!-- Competitions Table -->
    <div class="competitions-table">
      <table>
        <thead>
          <tr>
            <th>Competition</th>
            <th>Entry Deadline</th>
            <th>Status</th>
            <th>Entries</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredCompetitions as competition}
            <tr>
              <td>
                <strong>{competition.name}</strong>
                {#if competition.description}
                  <br />
                  <small>{competition.description}</small>
                {/if}
              </td>
              <td>{formatDate(competition.entry_deadline)}</td>
              <td>
                <span class="badge {getStatusBadge(competition).class}">
                  {getStatusBadge(competition).text}
                </span>
              </td>
              <td>{competition.entry_count || 0}</td>
              <td>
                <div class="actions">
                  <button 
                    class="btn btn-small btn-edit"
                    on:click={() => navigateToEdit(competition.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    class="btn btn-small btn-entries"
                    on:click={() => navigateToEntries(competition.id)}
                  >
                    📋 Entries
                  </button>
                  <button 
                    class="btn btn-small btn-toggle {competition.is_active ? 'inactive' : ''}"
                    on:click={() => toggleStatus(competition)}
                  >
                    {competition.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                  </button>
                  {#if competition.entry_count === 0}
                    <button 
                      class="btn btn-small btn-delete"
                      on:click={() => {
                        competitionToDelete = competition;
                        showDeleteConfirm = true;
                      }}
                    >
                      🗑️ Delete
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && competitionToDelete}
  <div class="modal">
    <div class="modal-content">
      <h3>⚠️ Delete Competition?</h3>
      <p>
        Are you sure you want to delete <strong>{competitionToDelete.name}</strong>?
        This action cannot be undone.
      </p>
      <div class="modal-actions">
        <button 
          class="btn btn-secondary"
          on:click={() => {
            showDeleteConfirm = false;
            competitionToDelete = null;
          }}
        >
          Cancel
        </button>
        <button 
          class="btn btn-delete"
          on:click={deleteCompetition}
        >
          Delete Competition
        </button>
      </div>
    </div>
  </div>
{/if}