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

  let submissions = [];
  let message = "";
  let showAll = false;
  let sortColumn = "event_date";
  let sortDirection = "desc";
  let lastUserId = null;
  let currentUserId;
  let cleanupFunctions = [];

  $: currentUserId = $userProfile?.id;

  // Setup tab focus handler with F5 fix
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    if (sub.approved === true) return { text: "Approved", icon: "✅", class: "status-approved" };
    if (sub.rejection_reason) return { text: "Rejected", icon: "❌", class: "status-rejected" };
    return { text: "Pending", icon: "⏳", class: "status-pending" };
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

<main>
  <div class="hero-section">
    <h1>📋 My Submissions</h1>
    <p class="subtitle">Track your brewing achievements and points</p>
  </div>

  {#if $loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your submissions...</p>
    </div>
  {:else if !currentUserId}
    <div class="empty-state">
      <div class="empty-icon">🔒</div>
      <h3>Authentication Required</h3>
      <p>Please log in to view your submissions.</p>
      <a href="/login" class="login-button">Sign In</a>
    </div>
  {:else}
    <!-- Stats Overview -->
    {#if !$loading && $storeAll && $storeAll.length > 0}
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card approved">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{stats?.approved || 0}</div>
              <div class="stat-label">Approved</div>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{stats?.pending || 0}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-number">{stats?.rejected || 0}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
          <div class="stat-card points">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-number">{stats?.totalPoints?.toLocaleString() || 0}</div>
              <div class="stat-label">Total Points</div>
            </div>
          </div>
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
      <button on:click={toggleView} class="filter-button {showAll ? 'active' : ''}">
        {showAll ? "📋 Show All" : "⏳ Pending Only"}
      </button>
      
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
                      <span class="status-icon">{formatStatus(s).icon}</span>
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
                  <span class="status-icon">{formatStatus(s).icon}</span>
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
            📋
          {:else}
            ⏳
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
</main>

<style>
  /* Base styles */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 1200px;
    text-align: center;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3.5rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 62, 0, 0.2);
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Stats Section */
  .stats-section {
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .stat-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 4px solid;
  }

  .stat-card.approved { border-left-color: #059669; }
  .stat-card.pending { border-left-color: #d97706; }
  .stat-card.rejected { border-left-color: #dc2626; }
  .stat-card.points { border-left-color: #ff3e00; }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .filter-button {
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-button:hover {
    background-color: #4b5563;
    transform: translateY(-1px);
  }

  .filter-button.active {
    background-color: #ff3e00;
  }

  .filter-button.active:hover {
    background-color: #e63600;
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
    color: #ff3e00;
  }

  .desktop-table th.sort-desc::after {
    content: " ▼";
    font-size: 0.75rem;
    color: #ff3e00;
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
    font-weight: 700;
    color: #ff3e00;
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
    color: #ff3e00;
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

  /* Empty State */
  .empty-state {
    background: white;
    border-radius: 6px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .login-button,
  .submit-button,
  .toggle-button {
    background-color: #ff3e00;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-block;
    transition: all 0.2s ease;
  }

  .login-button:hover,
  .submit-button:hover,
  .toggle-button:hover {
    background-color: #e63600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    main {
      padding: 4.5rem 1rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

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

    .empty-state {
      padding: 2rem 1rem;
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