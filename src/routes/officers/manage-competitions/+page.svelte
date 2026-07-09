<!-- src/routes/officers/manage-competitions/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { competitionManagementStore, competitions, isLoading, error, stats } from '$lib/stores/competitionManagementStore';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import OverlappingCard from "$lib/components/ui/OverlappingCard.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { Trophy, RefreshCw, Plus, AlertTriangle, Pencil, FileText, Users, BarChart3, Play, Pause, Trash2 } from 'lucide-svelte';
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';
  

  let searchQuery = '';
  let filterStatus = 'all'; // all, active, upcoming, past
  let showDeleteConfirm = false;
  let competitionToDelete = null;

  // Initialize store
  onMount(() => {
    competitionManagementStore.initialize();
    const cleanup = setupEventHandlers();
    
    // Return cleanup function
    return () => {
      cleanup();
    };
  });

  // Removed tab switching reload - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  onDestroy(() => {
    // Cleanup handled by setupEventHandlers return
  });

  // Filtered competitions based on search and status
  $: filteredCompetitions = (() => {
    let comps = [];

    switch (filterStatus) {
      case 'active':
        comps = ($competitions || []).filter(c => c.is_active);
        break;
      case 'upcoming':
        comps = ($competitions || []).filter(c => {
          const now = new Date();
          const deadline = new Date(c.entry_deadline);
          return !c.is_active && deadline > now;
        });
        break;
      case 'past':
        comps = ($competitions || []).filter(c => {
          const now = new Date();
          const deadline = new Date(c.entry_deadline);
          return deadline <= now;
        });
        break;
      default:
        comps = $competitions || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      comps = comps.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    return comps;
  })();

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'Invalid Date';
    
    try {
      // Handle space-separated datetime format (e.g., "2025-08-29 03:43:21.894974")
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // Replace space with 'T' and add timezone if missing
        isoString = dateString.replace(' ', 'T');
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          // Assume local timezone if no timezone specified
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString, '->', isoString);
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }

  // Format date for form input
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Get days until deadline
  function getDaysUntilDeadline(competition) {
    if (!competition.entry_deadline) return 0;
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  // Format deadline with time
  function formatDeadline(competition) {
    if (!competition.entry_deadline) return 'No deadline set';
    const deadline = new Date(competition.entry_deadline);
    return deadline.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get status badge
  function getStatusBadge(competition) {
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    
    if (!competition.active) {
      return { text: 'Inactive', class: 'badge-inactive' };
    } else if (deadline < now) {
      return { text: 'Closed', class: 'badge-closed' };
    } else if (deadline - now < 7 * 24 * 60 * 60 * 1000) {
      return { text: 'Closing Soon', class: 'badge-warning' };
    } else {
      return { text: 'Active', class: 'badge-active' };
    }
  }

  // Get status for mobile cards
  function getMobileStatus(competition) {
    if (!competition.active) return 'closed';
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    if (deadline < now) return 'closed';
    return 'open';
  }

  // Toggle competition status
  async function toggleStatus(competition) {
    try {
      const { updateCompetition } = await import('$lib/stores/competitionManagementStore');
      await updateCompetition(competition.id, { active: !competition.active });
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  }

  // Delete competition
  async function deleteCompetition() {
    if (!competitionToDelete) return;
    
    try {
      const { deleteCompetition: deleteComp } = await import('$lib/stores/competitionManagementStore');
      await deleteComp(competitionToDelete.id);
      showDeleteConfirm = false;
      competitionToDelete = null;
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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

  // Navigate to results page
  function navigateToResults(competitionId) {
    goto(`/officers/manage-competitions/results/${competitionId}`);
  }

  function navigateToJudges(competitionId) {
    goto(`/officers/manage-competitions/judges/${competitionId}`);
  }

  function navigateToJudgingDashboard(competitionId) {
    goto(`/officers/manage-competitions/judging-dashboard/${competitionId}`);
  }

  // Force refresh
  async function forceRefresh() {
    const { loadCompetitions } = await import('$lib/stores/competitionManagementStore');
    await loadCompetitions(true);
  }
</script>

<style>

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--color-gray-500);
  }

  .stat-card .label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .stat-card .value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-text-primary);
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
    border: 1px solid var(--color-gray-250);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .filter-select {
    padding: 0.75rem;
    border: 1px solid var(--color-gray-250);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background: white;
  }

  .competitions-table {
    background: white;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: var(--color-gray-100);
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-gray-250);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-gray-150);
  }

  tr:hover {
    background: var(--color-gray-50);
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-xl);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .badge-active {
    background: var(--color-success-bg);
    color: var(--color-success);
  }

  .badge-inactive {
    background: var(--color-warning-bg);
    color: var(--color-warning);
  }

  .badge-closed {
    background: var(--color-danger-bg-soft);
    color: var(--color-danger);
  }

  .badge-warning {
    background: var(--color-warning-bg-soft);
    color: var(--color-warning-hover);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn-small {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }

  .btn-small :global(svg) {
    flex-shrink: 0;
  }

  .btn-edit {
    background: var(--color-gray-600);
    color: white;
  }

  .btn-edit:hover {
    background: var(--color-gray-700);
  }

  .btn-toggle {
    background: var(--color-success);
    color: white;
  }

  .btn-toggle:hover {
    background: var(--color-success-hover);
  }

  .btn-toggle.inactive {
    background: var(--color-danger);
  }

  .btn-toggle.inactive:hover {
    background: var(--color-danger-hover);
  }

  .btn-entries {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-entries:hover {
    background: var(--color-gray-600);
  }

  .btn-results {
    background: var(--color-warning-hover);
    color: white;
  }

  .btn-results:hover {
    background: var(--color-warning-orange);
  }

  .btn-judges {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-judges:hover {
    background: var(--color-gray-600);
  }

  .btn-dashboard {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-dashboard:hover {
    background: var(--color-gray-600);
  }

  .btn-delete {
    background: var(--color-danger);
    color: white;
  }

  .btn-delete:hover {
    background: var(--color-danger-hover);
  }

  .error {
    background: var(--color-danger-bg-soft);
    color: var(--color-danger);
    padding: 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
  }

  /* Mobile Competition Cards - Vertical Layout */
  .competition-cards {
    display: none;
  }

  .competition-card {
    background: white;
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--color-gray-500);
  }

  .competition-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .competition-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    flex: 1;
    min-width: 0;
  }

  .competition-status {
    flex-shrink: 0;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-xl);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-open {
    background: var(--color-info-bg);
    color: var(--color-info-hover);
  }

  .status-judging {
    background: var(--color-warning-bg);
    color: var(--color-warning-text);
  }

  .status-completed {
    background: var(--color-success-bg);
    color: var(--color-success-bg-strong);
  }

  .status-closed {
    background: var(--color-gray-100);
    color: var(--color-gray-500);
  }

  /* Competition details grid */
  .competition-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
  }

  .detail-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .detail-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  /* Action buttons - vertical stack */
  .competition-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-btn {
    width: 100%;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-align: center;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  /* Button color variants */
  .btn-view {
    background: var(--color-gray-600);
    color: white;
  }

  .btn-view:hover {
    background: var(--color-gray-700);
  }

  .btn-edit-mobile {
    background: var(--color-gray-600);
    color: white;
  }

  .btn-edit-mobile:hover {
    background: var(--color-gray-700);
  }

  .btn-results-mobile {
    background: var(--color-warning-hover);
    color: white;
  }

  .btn-results-mobile:hover {
    background: var(--color-warning-orange);
  }

  .btn-entries-mobile {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-entries-mobile:hover {
    background: var(--color-gray-600);
  }

  .btn-judges-mobile {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-judges-mobile:hover {
    background: var(--color-gray-600);
  }

  .btn-dashboard-mobile {
    background: var(--color-gray-500);
    color: white;
  }

  .btn-dashboard-mobile:hover {
    background: var(--color-gray-600);
  }

  .btn-toggle-mobile {
    background: var(--color-success);
    color: white;
  }

  .btn-toggle-mobile:hover {
    background: var(--color-success-hover);
  }

  .btn-toggle-mobile.inactive {
    background: var(--color-danger);
  }

  .btn-toggle-mobile.inactive:hover {
    background: var(--color-danger-hover);
  }

  .btn-delete-mobile {
    background: var(--color-danger);
    color: white;
  }

  .btn-delete-mobile:hover {
    background: var(--color-danger-hover);
  }

  /* Entry count badge */
  .entry-count {
    background: rgba(100, 116, 139, 0.1);
    color: var(--color-gray-700);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-xl);
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }

  /* Deadline formatting */
  .deadline-info {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
  }

  .deadline-urgent {
    color: var(--color-danger);
    font-weight: 600;
  }

  .deadline-soon {
    color: var(--color-warning-amber);
    font-weight: 500;
  }

  /* Competition description */
  .competition-description {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-gray-200);
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
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
    border-radius: var(--radius-md);
    max-width: 500px;
    width: 90%;
  }

  .modal-content h3 {
    margin-top: 0;
    color: var(--color-danger);
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  /* Mobile styles */
  @media (max-width: 768px) {

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .competitions-table {
      display: none;
    }

    .competition-cards {
      display: block;
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input, .filter-select {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .competition-details {
      grid-template-columns: 1fr;
    }
  }

  /* Ensure cards are hidden on desktop */
  @media (min-width: 769px) {
    .competition-cards {
      display: none;
    }
    
    .competitions-table {
      display: block;
    }
  }
</style>

<Hero
  title="Manage Competitions"
  subtitle="Create and manage brewing competitions"
  backgroundImage="/Jax-Banner.jpg"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  <!-- Statistics -->
  {#if !$isLoading}
    <OverlappingCard>
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
    </OverlappingCard>
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
    <Button variant="secondary" on:click={forceRefresh}>
      <RefreshCw size={16} strokeWidth={2} class="icon-inline" />
      Refresh
    </Button>
    <Button variant="primary" on:click={navigateToCreate}>
      <Plus size={16} strokeWidth={2} class="icon-inline" />
      Create Competition
    </Button>
  </div>

  <!-- Error State -->
  {#if $error}
    <div class="error">
      <AlertTriangle size={18} strokeWidth={2} class="icon-inline" />
      {$error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if $isLoading}
    <LoadingSpinner message="Loading competitions..." />
  {:else if filteredCompetitions.length === 0}
    <!-- Empty State -->
    <EmptyState
      icon="🏆"
      title="No competitions found"
      message={searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Create your first competition to get started'}
    >
      {#if filterStatus === 'all' && !searchQuery}
        <Button variant="primary" on:click={navigateToCreate}>
          Create First Competition
        </Button>
      {/if}
    </EmptyState>
  {:else}
    <!-- Desktop Table View -->
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
              <td>{formatDeadline(competition)}</td>
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
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    class="btn btn-small btn-entries"
                    on:click={() => navigateToEntries(competition.id)}
                  >
                    <FileText size={14} /> Entries
                  </button>
                  <button
                    class="btn btn-small btn-judges"
                    on:click={() => navigateToJudges(competition.id)}
                  >
                    <Users size={14} /> Judges
                  </button>
                  <button
                    class="btn btn-small btn-dashboard"
                    on:click={() => navigateToJudgingDashboard(competition.id)}
                  >
                    <BarChart3 size={14} /> Dashboard
                  </button>
                  <button
                    class="btn btn-small btn-results"
                    on:click={() => navigateToResults(competition.id)}
                  >
                    <Trophy size={14} /> Results
                  </button>
                  <button
                    class="btn btn-small btn-toggle {competition.active ? 'inactive' : ''}"
                    on:click={() => toggleStatus(competition)}
                  >
                    {#if competition.active}
                      <Pause size={14} /> Disable
                    {:else}
                      <Play size={14} /> Enable
                    {/if}
                  </button>
                  {#if competition.entry_count === 0}
                    <button
                      class="btn btn-small btn-delete"
                      on:click={() => {
                        competitionToDelete = competition;
                        showDeleteConfirm = true;
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="competition-cards">
      {#each filteredCompetitions as competition}
        <div class="competition-card">
          <!-- Header with name and status -->
          <div class="competition-header">
            <h3 class="competition-name">{competition.name}</h3>
            <div class="competition-status">
              <span class="status-badge status-{getMobileStatus(competition)}">
                {getStatusBadge(competition).text}
              </span>
            </div>
          </div>

          <!-- Competition details grid -->
          <div class="competition-details">
            <div class="detail-item">
              <span class="detail-label">Entries</span>
              <span class="detail-value">{competition.entry_count || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Entry Fee</span>
              <span class="detail-value">${competition.entry_fee || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Max Entries</span>
              <span class="detail-value">{competition.max_entries_per_member || 'No limit'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value {competition.active ? '' : 'deadline-urgent'}">
                {competition.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <!-- Deadline info -->
          <div class="deadline-info">
            <strong>Entry Deadline:</strong>
            <span class="{getDaysUntilDeadline(competition) <= 3 ? 'deadline-urgent' : getDaysUntilDeadline(competition) <= 7 ? 'deadline-soon' : ''}">
              {formatDeadline(competition)}
            </span>
            {#if getDaysUntilDeadline(competition) > 0}
              <span class="deadline-countdown">
                ({getDaysUntilDeadline(competition)} days left)
              </span>
            {/if}
          </div>

          <!-- Description (if exists) -->
          {#if competition.description}
            <div class="competition-description">
              {competition.description}
            </div>
          {/if}

          <!-- Action buttons - vertical stack -->
          <div class="competition-actions">
            <button
              class="action-btn btn-edit-mobile"
              on:click={() => navigateToEdit(competition.id)}
            >
              <Pencil size={16} /> Edit Competition
            </button>

            <button
              class="action-btn btn-entries-mobile"
              on:click={() => navigateToEntries(competition.id)}
            >
              <FileText size={16} /> Manage Entries ({competition.entry_count || 0})
            </button>

            <button
              class="action-btn btn-judges-mobile"
              on:click={() => navigateToJudges(competition.id)}
            >
              <Users size={16} /> Manage Judges
            </button>

            <button
              class="action-btn btn-dashboard-mobile"
              on:click={() => navigateToJudgingDashboard(competition.id)}
            >
              <BarChart3 size={16} /> Judging Dashboard
            </button>

            <button
              class="action-btn btn-results-mobile"
              on:click={() => navigateToResults(competition.id)}
            >
              <Trophy size={16} /> Enter Results
            </button>

            <button
              class="action-btn btn-toggle-mobile {competition.active ? 'inactive' : ''}"
              on:click={() => toggleStatus(competition)}
            >
              {#if competition.active}
                <Pause size={16} /> Disable Competition
              {:else}
                <Play size={16} /> Enable Competition
              {/if}
            </button>

            {#if competition.entry_count === 0}
              <button
                class="action-btn btn-delete-mobile"
                on:click={() => {
                  competitionToDelete = competition;
                  showDeleteConfirm = true;
                }}
              >
                <Trash2 size={16} /> Delete Competition
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Container>

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