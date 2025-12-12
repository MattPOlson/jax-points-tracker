<script>
  import { onMount, onDestroy } from "svelte";
  import { user } from "$lib/stores/user";
  import { userProfile } from "$lib/stores/userProfile";
  import {
    allSubmissions as storeAll,
    loadAllSubmissions,
    loading,
  } from "$lib/stores/viewAllStore.js";
  import { page } from "$app/stores";
  import { formatDate, formatSubmissionTime } from "$lib/utils/dateUtils.js";
  import { Hero, Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';

  let submissions = [];
  let filtered = [];
  let filters = {
    name: "",
    category: "",
    status: "",
    startDate: "",
    endDate: "",
  };
  let sortColumn = "event_date";
  let sortDirection = "desc";
  let showFilters = false;
  let cleanupFunctions = [];

  $: submissions = $storeAll || [];

  // Setup tab focus handler with F5 fix
  // Removed tab visibility handler - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  // Check if user is authorized
  $: isAuthorized = $user && $userProfile?.is_officer;

  // Load data when authorized
  $: if (isAuthorized) {
    loadSubmissions(true);
  }

  // Apply filters when submissions or filters change
  $: if (submissions) {
    applyFilters();
  }

  // Format date helper
  //function formatDate(dateString) {
  //  try {
  //    return new Date(dateString).toLocaleDateString('en-US', {
  //      year: 'numeric',
  //      month: 'short',
  //      day: 'numeric'
  //    });
  //  } catch {
  //    return 'Invalid Date';
  //  }
  //}

  // Format status helper
  function formatStatus(submission) {
    if (submission.approved === true)
      return { text: "Approved", icon: "✅", class: "status-approved" };
    if (submission.rejection_reason)
      return { text: "Rejected", icon: "❌", class: "status-rejected" };
    return { text: "Pending", icon: "⏳", class: "status-pending" };
  }

  // Get unique categories for filter dropdown
  $: categories = [
    ...new Set(submissions.map((s) => s.category).filter(Boolean)),
  ].sort();

  // Load submissions
  async function loadSubmissions(force = false) {
    try {
      await loadAllSubmissions(force);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  }

  // Apply filters and sorting
  function applyFilters() {
    let result = submissions.filter((s) => {
      const matchesName =
        filters.name === "" ||
        s.members?.name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchesCategory =
        filters.category === "" ||
        s.category?.toLowerCase().includes(filters.category.toLowerCase());
      const matchesStatus =
        filters.status === "" ||
        (filters.status === "approved" && s.approved === true) ||
        (filters.status === "rejected" && s.rejection_reason) ||
        (filters.status === "pending" &&
          s.approved === false &&
          !s.rejection_reason);

      const date = new Date(s.event_date);
      const afterStart =
        filters.startDate === "" || new Date(filters.startDate) <= date;
      const beforeEnd =
        filters.endDate === "" || new Date(filters.endDate) >= date;

      return (
        matchesName &&
        matchesCategory &&
        matchesStatus &&
        afterStart &&
        beforeEnd
      );
    });

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle special cases
      if (sortColumn === "members") {
        aVal = a.members?.name || "";
        bVal = b.members?.name || "";
      }

      // Handle dates
      if (sortColumn === "event_date" || sortColumn === "submitted_at") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Handle strings and dates
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    filtered = result;
  }

  // Sort table
  function sortTable(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }
    applyFilters();
  }

  // Clear all filters
  function clearFilters() {
    filters = {
      name: "",
      category: "",
      status: "",
      startDate: "",
      endDate: "",
    };
    applyFilters();
  }

  // Get filter stats
  $: filterStats = {
    total: submissions.length,
    filtered: filtered.length,
    approved: filtered.filter((s) => s.approved === true).length,
    pending: filtered.filter((s) => s.approved === false && !s.rejection_reason)
      .length,
    rejected: filtered.filter((s) => s.rejection_reason).length,
  };

  onMount(() => {
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);

    // Initial load if authorized
    if (isAuthorized) {
      loadSubmissions(true);
    }
  });

  onDestroy(() => {
    // Cleanup all event listeners
    cleanupFunctions.forEach((cleanup) => cleanup());
  });

  // Reload when navigating to view all page
  $: if ($page.url.pathname === "/officers/view-all" && isAuthorized) {
    loadSubmissions(true);
  }
</script>

<Container size="xl">
  <Hero title="View All Points" subtitle="Browse and filter all member submissions" icon="📊" center={true} />

  {#if $loading}
    <LoadingSpinner message="Loading all submissions..." />
  {:else if !$user}
    <EmptyState
      icon="🔒"
      title="Authentication Required"
      message="Please log in to view all submissions."
      actionLabel="Sign In"
      actionHref="/login"
    />
  {:else if !$userProfile?.is_officer}
    <EmptyState
      icon="⚠️"
      title="Access Restricted"
      message="Officer privileges are required to view all submissions."
      actionLabel="Back to Officer Tools"
      actionHref="/officers"
    />
  {:else}
    <!-- Filter Controls -->
    <div class="controls-section">
      <div class="controls-header">
        <button
          on:click={() => (showFilters = !showFilters)}
          class="filter-toggle"
          class:active={showFilters}
        >
          🔍 {showFilters ? "Hide" : "Show"} Filters
        </button>

        <div class="stats-summary">
          <span class="stat">Total: {filterStats.total}</span>
          {#if filterStats.filtered !== filterStats.total}
            <span class="stat filtered">Showing: {filterStats.filtered}</span>
          {/if}
        </div>
      </div>

      {#if showFilters}
        <div class="filters-grid">
          <div class="filter-group">
            <label for="name-filter">Member Name</label>
            <input
              id="name-filter"
              type="text"
              placeholder="Search by name..."
              bind:value={filters.name}
              on:input={applyFilters}
            />
          </div>

          <div class="filter-group">
            <label for="category-filter">Category</label>
            <select
              id="category-filter"
              bind:value={filters.category}
              on:change={applyFilters}
            >
              <option value="">All Categories</option>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label for="status-filter">Status</label>
            <select
              id="status-filter"
              bind:value={filters.status}
              on:change={applyFilters}
            >
              <option value="">All Status</option>
              <option value="approved">✅ Approved</option>
              <option value="pending">⏳ Pending</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              bind:value={filters.startDate}
              on:change={applyFilters}
            />
          </div>

          <div class="filter-group">
            <label for="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              bind:value={filters.endDate}
              on:change={applyFilters}
            />
          </div>

          <div class="filter-actions">
            <button on:click={clearFilters} class="clear-button">
              🗑️ Clear All
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Stats Cards -->
    {#if filtered.length > 0}
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card approved">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{filterStats.approved}</div>
              <div class="stat-label">Approved</div>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{filterStats.pending}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-number">{filterStats.rejected}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
          <div class="stat-card total">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-number">{filterStats.filtered}</div>
              <div class="stat-label">Showing</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="table-wrapper">
        <table class="desktop-table">
          <thead>
            <tr>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "members" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "members" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("members")}
              >
                Member
              </th>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "category" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "category" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("category")}
              >
                Category
              </th>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "description" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "description" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("description")}
              >
                Description
              </th>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "points" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "points" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("points")}
              >
                Points
              </th>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "event_date" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "event_date" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("event_date")}
              >
                Event Date
              </th>
              <th
                class="sortable"
                class:sort-asc={sortColumn === "submitted_at" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "submitted_at" &&
                  sortDirection === "desc"}
                on:click={() => sortTable("submitted_at")}
              >
                Submitted
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as s}
              <tr class="submission-row">
                <td class="member-cell">
                  <div class="member-info">
                    <div class="member-avatar">
                      {(s.members?.name || "U")[0].toUpperCase()}
                    </div>
                    <span class="member-name"
                      >{s.members?.name || "Unknown"}</span
                    >
                  </div>
                </td>
                <td class="category-cell">
                  <span class="category-badge">{s.category}</span>
                </td>
                <td class="description-cell">{s.description}</td>
                <td class="points-cell">
                  <span class="points-value">{s.points}</span>
                </td>
                <td class="date-cell">{formatDate(s.event_date)}</td>
                <td class="submitted-cell">
                  {s.submitted_at
                    ? formatDate(s.submitted_at)
                    : "Not available"}
                </td>
                <td class="status-cell">
                  <span class="status-badge {formatStatus(s).class}">
                    <span class="status-icon">{formatStatus(s).icon}</span>
                    {formatStatus(s).text}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="mobile-cards">
        {#each filtered as s}
          <div class="mobile-card">
            <div class="card-header">
              <div class="member-info">
                <div class="member-avatar">
                  {(s.members?.name || "U")[0].toUpperCase()}
                </div>
                <div class="member-details">
                  <div class="member-name">{s.members?.name || "Unknown"}</div>
                  <div class="submission-date">
                    Submitted {formatSubmissionTime(s.submitted_at)}
                  </div>
                </div>
              </div>
              <span class="status-badge {formatStatus(s).class}">
                <span class="status-icon">{formatStatus(s).icon}</span>
                {formatStatus(s).text}
              </span>
            </div>

            <div class="card-body">
              <div class="card-row">
                <span class="label">Category:</span>
                <span class="value">{s.category}</span>
              </div>
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
                  <span class="label">Rejection Reason:</span>
                  <span class="value rejection-text">{s.rejection_reason}</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <EmptyState
        icon="🔍"
        title="No Results Found"
        message="No submissions match your current filters."
      >
        <Button variant="secondary" on:click={clearFilters}>
          Clear Filters
        </Button>
      </EmptyState>
    {/if}
  {/if}
</Container>

<style>

  /* Controls Section */
  .controls-section {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .filter-toggle {
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

  .filter-toggle:hover {
    background-color: #4b5563;
  }

  .filter-toggle.active {
    background-color: #ff3e00;
  }

  .filter-toggle.active:hover {
    background-color: #e63600;
  }

  .stats-summary {
    display: flex;
    gap: 1rem;
  }

  .stat {
    font-weight: 500;
    color: #666;
  }

  .stat.filtered {
    color: #ff3e00;
    font-weight: 600;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
    text-align: left;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-group label {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .filter-group input,
  .filter-group select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .filter-group input:focus,
  .filter-group select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  .filter-actions {
    display: flex;
    align-items: end;
  }

  .clear-button {
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    height: fit-content;
  }

  .clear-button:hover {
    background-color: #4b5563;
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

  .stat-card.approved {
    border-left-color: #059669;
  }
  .stat-card.pending {
    border-left-color: #d97706;
  }
  .stat-card.rejected {
    border-left-color: #dc2626;
  }
  .stat-card.total {
    border-left-color: #ff3e00;
  }

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

  /* Table Styles */
  .table-wrapper {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    overflow-x: auto;
    text-align: left;
  }

  .desktop-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
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

  .member-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ff3e00;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .member-name {
    font-weight: 500;
    color: #333;
  }

  .category-badge {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .points-value {
    font-weight: 700;
    color: #ff3e00;
    font-size: 1.1rem;
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

  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #e5e7eb;
    text-align: left;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .member-details {
    display: flex;
    flex-direction: column;
  }

  .submission-date {
    font-size: 0.8rem;
    color: #666;
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


  /* Mobile Responsive */
  @media (max-width: 768px) {

    .controls-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .filters-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
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

    .table-wrapper {
      display: none;
    }

    .mobile-cards {
      display: block;
    }

    .card-header .member-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
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

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .controls-header {
      padding: 1rem;
    }

    .filters-grid {
      padding: 1rem;
    }

    .member-info {
      gap: 0.5rem;
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      font-size: 0.8rem;
    }

    .mobile-card {
      padding: 1rem;
    }
  }

  @media (min-width: 769px) {
    .mobile-cards {
      display: none;
    }
  }
</style>
