<script>
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabaseClient";
  import { userProfile } from "$lib/stores/userProfile";
  import {
    allSubmissions as storeAll,
    message as storeMessage,
    loadMySubmissions,
    loading,
  } from "$lib/stores/mySubmissionsStore.js";
  import { formatDate, formatSubmissionTime } from "$lib/utils/dateUtils.js";
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Card } from '$lib/components/ui';
  import { CheckCircle, Clock, XCircle, Trophy, ClipboardList, List } from 'lucide-svelte';

  let submissions = [];
  let message = "";
  let showAll = false;
  let sortColumn = "event_date";
  let sortDirection = "desc";
  let lastUserId = null;
  let currentUserId;
  let cleanupFunctions = [];

  $: currentUserId = $userProfile?.id;

  // Setup tab focus handler - removed problematic reload for tab switching fix
  function setupEventHandlers() {
    // Previously had auto-reload on tab visibility change, but this caused issues
    // with Supabase connection handling during tab switching
    return () => {
      // No cleanup needed now
    };
  }

  // Load submissions when user changes
  $: if (currentUserId && currentUserId !== lastUserId) {
    lastUserId = currentUserId;
    loadAllSubmissions(true);
  }

  // Derive filtered/pending submissions
  $: {
    const list = $storeAll;
    if ($storeMessage) {
      submissions = list ?? [];
      message = $storeMessage;
    } else if (!list) {
      submissions = [];
      message = "No submissions found.";
    } else if (showAll) {
      submissions = list;
      message = list.length > 0 ? "" : "No submissions found.";
    } else {
      const pending = list.filter(
        (sub) => sub.approved === false && sub.rejection_reason === null,
      );
      submissions = pending;
      message = pending.length > 0 ? "" : "No pending submissions found.";
    }
  }

  async function loadAllSubmissions(force = false) {
    if (!currentUserId) {
      message = "Please log in to view your submissions.";
      storeAll.set([]);
      return;
    }

    await loadMySubmissions(currentUserId, sortColumn, sortDirection, force);
    message = $storeMessage;
  }

  function toggleView() {
    showAll = !showAll;
    console.log("[submissions] toggleView clicked → showAll =", showAll);
  }

  function sortTable(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }
    console.log(
      `[submissions] sortTable: sortColumn = ${sortColumn}, sortDirection = ${sortDirection}`,
    );
    loadAllSubmissions(true);
  }

  function formatStatus(sub) {
    if (sub.approved === true) return { text: "Approved", iconComponent: CheckCircle, class: "status-approved" };
    if (sub.rejection_reason) return { text: "Rejected", iconComponent: XCircle, class: "status-rejected" };
    return { text: "Pending", iconComponent: Clock, class: "status-pending" };
  }

 // function formatDate(dateString) {
 //   try {
 //     return new Date(dateString).toLocaleDateString('en-US', {
 //       year: 'numeric',
 //       month: 'short',
 //       day: 'numeric'
 //     });
 //   } catch {
 //     return 'Invalid Date';
 //   }
 // }

  function getStatusCounts() {
    // Use the full store data, not the filtered submissions
    const allSubs = $storeAll || [];
    console.log('Stats calculation - allSubs:', allSubs.length, allSubs);
    
    const approved = allSubs.filter(s => s.approved === true).length;
    const rejected = allSubs.filter(s => s.rejection_reason).length;
    const pending = allSubs.filter(s => s.approved === false && !s.rejection_reason).length;
    const totalPoints = allSubs
      .filter(s => s.approved === true)
      .reduce((sum, s) => sum + (s.points || 0), 0);
    
    console.log('Stats result:', { approved, rejected, pending, totalPoints });
    return { approved, rejected, pending, totalPoints };
  }

  // Make stats reactive to the store data - only calculate when we have data
  $: stats = $storeAll && $storeAll.length > 0 ? getStatusCounts() : { approved: 0, rejected: 0, pending: 0, totalPoints: 0 };

  // Reload when navigating to submissions page
  $: if ($page.url.pathname === "/my-submissions" && currentUserId) {
    console.log("[submissions] $page.url.pathname triggered reload");
    loadAllSubmissions(true);
  }

  onMount(() => {
    console.log("[submissions] onMount → initial loadAllSubmissions");
    loadAllSubmissions(true);
    
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);
  });

  onDestroy(() => {
    // Cleanup all event listeners
    cleanupFunctions.forEach(cleanup => cleanup());
  });
</script>

<Hero
  title="My Submissions"
  subtitle="Track your brewing achievements and points"
  backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
  large={true}
/>

<Container size="lg">

  {#if $loading}
    <LoadingSpinner message="Loading your submissions..." />
  {:else if !currentUserId}
    <EmptyState
      title="Authentication Required"
      message="Please log in to view your submissions."
      actionLabel="Sign In"
      actionHref="/login"
    />
  {:else}
    <!-- Stats Overview -->
    {#if !$loading && $storeAll && $storeAll.length > 0}
      <div class="stats-section">
        <div class="stats-grid">
          <Card class="stat-card approved">
            <div class="stat-icon">
              <CheckCircle size={32} strokeWidth={1.5} color="var(--color-success)" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{stats?.approved || 0}</div>
              <div class="stat-label">Approved</div>
            </div>
          </Card>
          <Card class="stat-card pending">
            <div class="stat-icon">
              <Clock size={32} strokeWidth={1.5} color="var(--color-warning)" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{stats?.pending || 0}</div>
              <div class="stat-label">Pending</div>
            </div>
          </Card>
          <Card class="stat-card rejected">
            <div class="stat-icon">
              <XCircle size={32} strokeWidth={1.5} color="var(--color-danger)" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{stats?.rejected || 0}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </Card>
          <Card class="stat-card points">
            <div class="stat-icon">
              <Trophy size={32} strokeWidth={1.5} color="var(--color-brand-primary)" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{stats?.totalPoints?.toLocaleString() || 0}</div>
              <div class="stat-label">Total Points</div>
            </div>
          </Card>
        </div>
      </div>
    {:else if !$loading && currentUserId}
      <!-- Debug info - only show when not loading and user is logged in -->
      <div class="debug-info" style="background: #f0f0f0; padding: 1rem; margin: 1rem 0; font-family: monospace; text-align: left;">
        <div>Store All Length: {$storeAll?.length || 0}</div>
        <div>Store Message: {$storeMessage || 'none'}</div>
        <div>Loading: {$loading}</div>
        <div>Current User ID: {currentUserId || 'none'}</div>
        <div>Data: {JSON.stringify($storeAll?.slice(0, 2) || [], null, 2)}</div>
      </div>
    {/if}

    <!-- Filter Controls -->
    <div class="controls-section">
      <Button
        variant={showAll ? 'primary' : 'secondary'}
        on:click={toggleView}
      >
        {#if showAll}
          <List size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Show All
        {:else}
          <Clock size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Pending Only
        {/if}
      </Button>
      
      <div class="view-info">
        <span class="count-display">
          {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
          {showAll ? 'total' : 'pending'}
        </span>
      </div>
    </div>

    {#if submissions.length > 0}
      <div class="submissions-container">
        <!-- Desktop Table -->
        <div class="table-wrapper">
          <table class="desktop-table">
            <thead>
              <tr>
                <th
                  on:click={() => sortTable("category")}
                  class="sortable"
                  class:sort-asc={sortColumn === "category" && sortDirection === "asc"}
                  class:sort-desc={sortColumn === "category" && sortDirection === "desc"}>
                  Category
                </th>
                <th
                  on:click={() => sortTable("description")}
                  class="sortable"
                  class:sort-asc={sortColumn === "description" && sortDirection === "asc"}
                  class:sort-desc={sortColumn === "description" && sortDirection === "desc"}>
                  Description
                </th>
                <th
                  on:click={() => sortTable("points")}
                  class="sortable"
                  class:sort-asc={sortColumn === "points" && sortDirection === "asc"}
                  class:sort-desc={sortColumn === "points" && sortDirection === "desc"}>
                  Points
                </th>
                <th
                  on:click={() => sortTable("event_date")}
                  class="sortable"
                  class:sort-asc={sortColumn === "event_date" && sortDirection === "asc"}
                  class:sort-desc={sortColumn === "event_date" && sortDirection === "desc"}>
                  Event Date
                </th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {#each submissions as s}
                <tr class="submission-row">
                  <td class="category-cell">{s.category}</td>
                  <td class="description-cell">{s.description}</td>
                  <td class="points-cell">{s.points}</td>
                  <td class="date-cell">{formatDate(s.event_date)}</td>
                  <td class="status-cell">
                    <span class="status-badge {formatStatus(s).class}">
                      <svelte:component this={formatStatus(s).iconComponent} size={16} strokeWidth={2} />
                      {formatStatus(s).text}
                    </span>
                  </td>
                  <td class="reason-cell">
                    {#if s.rejection_reason}
                      <span class="rejection-reason">{s.rejection_reason}</span>
                    {:else}
                      <span class="no-reason">—</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards">
          {#each submissions as s}
            <div class="mobile-card">
              <div class="card-header">
                <div class="category-badge">{s.category}</div>
                <span class="status-badge {formatStatus(s).class}">
                  <svelte:component this={formatStatus(s).iconComponent} size={16} strokeWidth={2} />
                  {formatStatus(s).text}
                </span>
              </div>
              
              <div class="card-body">
                <div class="card-row">
                  <span class="label">Description:</span>
                  <span class="value">{s.description}</span>
                </div>
                <div class="card-row">
                  <span class="label">Points:</span>
                  <span class="value points-value">{s.points}</span>
                </div>
                <div class="card-row">
                  <span class="label">Event Date:</span>
                  <span class="value">{formatDate(s.event_date)}</span>
                </div>
                {#if s.rejection_reason}
                  <div class="card-row rejection-row">
                    <span class="label">Reason:</span>
                    <span class="value rejection-text">{s.rejection_reason}</span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">
          {#if showAll}
            <ClipboardList size={64} strokeWidth={1.5} color="var(--color-text-tertiary)" />
          {:else}
            <Clock size={64} strokeWidth={1.5} color="var(--color-text-tertiary)" />
          {/if}
        </div>
        <h3>
          {#if showAll}
            No Submissions Found
          {:else}
            No Pending Submissions
          {/if}
        </h3>
        <p>{message}</p>
        {#if !showAll && $storeAll && $storeAll.length > 0}
          <button on:click={toggleView} class="toggle-button">
            View All Submissions
          </button>
        {:else}
          <a href="/submit" class="submit-button">Submit Points</a>
        {/if}
      </div>
    {/if}
  {/if}
</Container>

<style>

  /* Stats Section */
  .stats-section {
    margin-bottom: var(--space-8);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    max-width: 800px;
    margin: 0 auto;
  }

  :global(.stat-card) {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    border-left: 4px solid;
  }

  :global(.stat-card.approved) { border-left-color: var(--color-success); }
  :global(.stat-card.pending) { border-left-color: var(--color-warning); }
  :global(.stat-card.rejected) { border-left-color: var(--color-danger); }
  :global(.stat-card.points) { border-left-color: var(--color-brand-primary); }

  .stat-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
    padding: var(--space-4);
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  .count-display {
    font-weight: 500;
    color: #666;
  }

  /* Table Styles */
  .submissions-container {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .table-wrapper {
    overflow-x: auto;
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
    white-space: nowrap;
  }

  .desktop-table th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    transition: background-color 0.2s;
  }

  .desktop-table th.sortable:hover {
    background: #f1f5f9;
  }

  .desktop-table th.sort-asc::after {
    content: " ▲";
    font-size: 0.75rem;
    color: var(--color-brand-primary);
  }

  .desktop-table th.sort-desc::after {
    content: " ▼";
    font-size: 0.75rem;
    color: var(--color-brand-primary);
  }

  .desktop-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .submission-row {
    transition: background-color 0.2s;
  }

  .submission-row:hover {
    background-color: #f8fafc;
  }

  .category-cell {
    font-weight: 500;
    color: #333;
  }

  .points-cell {
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge.status-approved {
    background: #dcfce7;
    color: #166534;
  }

  .status-badge.status-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .status-badge.status-rejected {
    background: #fecaca;
    color: #991b1b;
  }

  .rejection-reason {
    color: #dc2626;
    font-style: italic;
    font-size: 0.9rem;
  }

  .no-reason {
    color: #9ca3af;
  }

  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem;
  }

  .mobile-card:last-child {
    border-bottom: none;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .category-badge {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-row .label {
    font-weight: 500;
    color: #666;
    min-width: 100px;
  }

  .card-row .value {
    font-weight: 600;
    color: #333;
    text-align: right;
  }

  .points-value {
    color: var(--color-brand-primary);
  }

  .rejection-row {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .rejection-text {
    color: #dc2626;
    font-style: italic;
  }

  /* Empty State - minimal styles, EmptyState component handles most */
  .empty-state {
    background: white;
    border-radius: var(--radius-md);
    padding: var(--space-12) var(--space-8);
    box-shadow: var(--shadow-md);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);
  }

  .empty-state h3 {
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    margin-bottom: var(--space-4);
    text-transform: none;
  }

  .empty-state p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-8);
    font-size: var(--font-size-lg);
  }

  .submit-button,
  .toggle-button {
    background-color: var(--color-brand-primary);
    color: white;
    text-decoration: none;
    border: none;
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-8);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    display: inline-block;
    transition: all var(--transition-base);
  }

  .submit-button:hover,
  .toggle-button:hover {
    background-color: var(--color-brand-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .controls-section {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .table-wrapper {
      display: none;
    }

    .mobile-cards {
      display: block;
    }

  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .card-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .card-row .value {
      text-align: left;
    }
  }

  @media (min-width: 769px) {
    .mobile-cards {
      display: none;
    }
  }
</style>