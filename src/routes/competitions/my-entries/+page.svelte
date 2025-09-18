<!-- src/routes/competitions/my-entries/+page.svelte -->
<!-- JAX Members Portal - My Competition Entries -->
<script>
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { userProfile } from "$lib/stores/userProfile.js";
  import {
    myEntries,
    entriesByCompetition,
    entryStats,
    loadMyEntries,
    updateEntry,
    deleteEntry,
    canEditEntry,
    formatDeadline,
    getAwardDisplay,
    getPaymentStatus,
    isLoaded,
    isLoading,
    error,
  } from "$lib/stores/myCompetitionEntriesStore.js";
  import {
    bjcpCategories,
    mainCategories,
    categoriesByNumber,
    loadCompetitionData,
  } from "$lib/stores/bjcpCategoryStore.js";
  import { supabase } from "$lib/supabaseClient.js";

  // =============================================
  // Component Lifecycle
  // =============================================

  // =============================================
  // Component State
  // =============================================
  let editingEntry = null;
  let showDeleteConfirm = null;
  let editForm = {
    beer_name: "",
    beer_notes: "",
    bjcp_category_id: "",
    main_category: "",
    subcategory: "",
  };
  let saving = false;
  let saveError = null;


  // =============================================
  // Filter State
  // =============================================
  let selectedCompetitionId = "all"; // Default to show all competitions
  let selectedCategory = "all"; // Filter by BJCP category
  let selectedAwardFilter = "all"; // Filter by awards: all, medal-winners, specific placements
  let selectedStatusFilter = "all"; // Filter by active/past: all, active, past
  let selectedPaymentFilter = "all"; // Filter by payment: all, paid, pending
  
  // =============================================
  // Reactive Variables
  // =============================================

  // Get available subcategories for editing
  $: availableSubcategories = editForm.main_category
    ? $categoriesByNumber[editForm.main_category]?.subcategories || []
    : [];

  // Reset subcategory when main category changes
  $: if (editForm.main_category) {
    editForm.subcategory = "";
    editForm.bjcp_category_id = "";
  }

  // Set bjcp_category_id when subcategory is selected
  $: if (editForm.subcategory) {
    editForm.bjcp_category_id = editForm.subcategory;
  }

  // =============================================
  // Filtering Logic
  // =============================================

  // Get unique competitions from entries for dropdown
  $: availableCompetitions = $myEntries.reduce((acc, entry) => {
    const compId = entry.competition.id;
    if (!acc.find(c => c.id === compId)) {
      acc.push({
        id: compId,
        name: entry.competition.name,
        active: entry.competition.active,
        entry_deadline: entry.competition.entry_deadline
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(b.entry_deadline) - new Date(a.entry_deadline));

  // Get unique categories from entries for dropdown
  $: availableCategories = $myEntries.reduce((acc, entry) => {
    if (entry.bjcp_category) {
      const catNum = entry.bjcp_category.category_number;
      const catName = entry.bjcp_category.category_name;
      const key = `${catNum} - ${catName}`;
      if (!acc.find(c => c.key === key)) {
        acc.push({
          key,
          number: catNum,
          name: catName
        });
      }
    }
    return acc;
  }, []).sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // Apply all filters
  $: filteredEntries = $myEntries.filter(entry => {
    // Competition filter
    if (selectedCompetitionId !== "all" && entry.competition.id !== selectedCompetitionId) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && entry.bjcp_category) {
      const entryCategory = `${entry.bjcp_category.category_number} - ${entry.bjcp_category.category_name}`;
      if (entryCategory !== selectedCategory) {
        return false;
      }
    }

    // Award filter
    if (selectedAwardFilter !== "all") {
      if (selectedAwardFilter === "medal-winners") {
        // Only entries with 1st, 2nd, 3rd place, or HM
        if (!entry.result || !['1', '2', '3', 'HM'].includes(entry.result.placement)) {
          return false;
        }
      } else if (selectedAwardFilter === "1st-place") {
        if (!entry.result || entry.result.placement !== '1') {
          return false;
        }
      } else if (selectedAwardFilter === "2nd-place") {
        if (!entry.result || entry.result.placement !== '2') {
          return false;
        }
      } else if (selectedAwardFilter === "3rd-place") {
        if (!entry.result || entry.result.placement !== '3') {
          return false;
        }
      } else if (selectedAwardFilter === "honorable-mention") {
        if (!entry.result || entry.result.placement !== 'HM') {
          return false;
        }
      }
    }

    // Status filter (active vs past competitions)
    if (selectedStatusFilter !== "all") {
      if (selectedStatusFilter === "active" && !entry.can_edit) {
        return false;
      } else if (selectedStatusFilter === "past" && entry.can_edit) {
        return false;
      }
    }

    // Payment filter
    if (selectedPaymentFilter !== "all") {
      if (selectedPaymentFilter === "paid" && !entry.entry_fee_paid) {
        return false;
      } else if (selectedPaymentFilter === "pending" && entry.entry_fee_paid) {
        return false;
      }
    }

    return true;
  });

  // Group filtered entries by competition (same logic as original entriesByCompetition)
  $: filteredEntriesByCompetition = filteredEntries.reduce((acc, entry) => {
    const compId = entry.competition.id;
    if (!acc[compId]) {
      acc[compId] = {
        competition: entry.competition,
        entries: []
      };
    }
    acc[compId].entries.push(entry);
    return acc;
  }, {});

  // Convert to array and sort (same as original)
  $: filteredEntriesByCompetitionArray = Object.values(filteredEntriesByCompetition).sort((a, b) => 
    new Date(b.competition.entry_deadline) - new Date(a.competition.entry_deadline)
  );

  // Calculate filtered stats
  $: filteredStats = {
    total: filteredEntries.length,
    active: filteredEntries.filter(entry => entry.can_edit).length,
    paid: filteredEntries.filter(entry => entry.entry_fee_paid).length,
    pending_payment: filteredEntries.filter(entry => !entry.entry_fee_paid).length
  };

  // =============================================
  // Lifecycle
  // =============================================
  onMount(async () => {
    // Redirect if not logged in
    if (!$userProfile?.id) {
      goto("/login");
      return;
    }

    // Load data
    try {
      await Promise.all([loadMyEntries(), loadCompetitionData()]);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  });


  // =============================================
  // Edit Functions
  // =============================================

  function startEdit(entry) {
    editingEntry = entry.id;
    editForm = {
      beer_name: entry.beer_name,
      beer_notes: entry.beer_notes || "",
      bjcp_category_id: entry.bjcp_category.id,
      main_category: entry.bjcp_category.category_number,
      subcategory: entry.bjcp_category.id,
    };
    saveError = null;
  }

  function cancelEdit() {
    editingEntry = null;
    editForm = {
      beer_name: "",
      beer_notes: "",
      bjcp_category_id: "",
      main_category: "",
      subcategory: "",
    };
    saveError = null;
  }

  async function saveEdit() {
    if (!editingEntry) return;

    saving = true;
    saveError = null;

    try {
      await updateEntry(editingEntry, {
        beer_name: editForm.beer_name.trim(),
        beer_notes: editForm.beer_notes.trim(),
        bjcp_category_id: editForm.bjcp_category_id,
      });

      // Success - close edit mode
      editingEntry = null;
      editForm = {
        beer_name: "",
        beer_notes: "",
        bjcp_category_id: "",
        main_category: "",
        subcategory: "",
      };
    } catch (err) {
      console.error("Failed to update entry:", err);
      saveError = err.message || "Failed to update entry";
    } finally {
      saving = false;
    }
  }

  // =============================================
  // Delete Functions
  // =============================================

  function confirmDelete(entry) {
    showDeleteConfirm = entry.id;
  }

  function cancelDelete() {
    showDeleteConfirm = null;
  }

  async function confirmDeleteEntry() {
    if (!showDeleteConfirm) return;

    try {
      await deleteEntry(showDeleteConfirm);
      showDeleteConfirm = null;
    } catch (err) {
      console.error("Failed to delete entry:", err);
      // Could add error handling here
    }
  }

  // =============================================
  // Helper Functions
  // =============================================

  function getCategoryDisplayName(subcategory) {
    return subcategory ? `${subcategory.letter} - ${subcategory.name}` : "";
  }

  // Print labels function for my entries
  function printEntries() {
    if (!filteredEntries || filteredEntries.length === 0) {
      alert('No entries available to print');
      return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    
    // Generate label HTML including Member Name and Beer Name
    // Create 3 copies of each label (for 3 bottles per entry)
    const labelsHtml = filteredEntries.flatMap(entry => {
      const labelTemplate = `
        <div class="label">
          <div class="label-header">
            <strong>${entry.competition?.name || 'Competition'}</strong>
          </div>
          <div class="entry-number">
            Entry #: <span>${entry.entry_number}</span>
          </div>
          <div class="member-name">
            Member: <span>${$userProfile?.name || $userProfile?.email || 'Unknown'}</span>
          </div>
          <div class="beer-name">
            Beer: <span>${entry.beer_name || 'Unknown'}</span>
          </div>
          <div class="beer-style">
            Style: <span>${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''}</span>
            ${entry.bjcp_category?.category_name ? `<br><small>${entry.bjcp_category.category_name}</small>` : ''}
            ${entry.bjcp_category?.subcategory_name ? `<br><small>${entry.bjcp_category.subcategory_name}</small>` : ''}
          </div>
          ${entry.beer_notes? `
            <div class="special">
              Special: <span>${entry.beer_notes}</span>
            </div>
          ` : ''}
          ${entry.notes ? `
            <div class="notes">
              Notes: <span>${entry.notes}</span>
            </div>
          ` : ''}
        </div>
      `;
      // Return 3 copies of each label
      return [labelTemplate, labelTemplate, labelTemplate];
    }).join('');

    // Write print document with updated CSS for 3.375" x 2.125" labels
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Competition Entry Labels</title>
        <style>
          @page {
            size: 8.5in 11in;
            margin: 0.25in;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.2;
          }
          
          .label {
            width: 2.25in;
            height: 1.5in;
            border: 1px solid #000;
            float: left;
            padding: 0.1in;
            box-sizing: border-box;
            margin-right: 0.125in;
            margin-bottom: 0.125in;
            page-break-inside: avoid;
            overflow: hidden;
          }
          
          .label:nth-child(2n) {
            margin-right: 0;
          }
          
          .label-header {
            text-align: center;
            border-bottom: 1px solid #000;
            margin-bottom: 0.05in;
            padding-bottom: 0.02in;
            font-weight: bold;
            font-size: 11px;
          }
          
          .entry-number, .member-name, .beer-name, .beer-style, .special, .notes {
            margin-bottom: 0.03in;
            font-size: 9px;
          }
          
          .entry-number span, .member-name span, .beer-name span, .beer-style span, .special span, .notes span {
            font-weight: bold;
          }
          
          .beer-style small {
            font-size: 9px;
          }

          @media print {
            body {
              margin: 0 !important;
            }
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${labelsHtml}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print after a short delay
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  // =============================================
  // Scoresheet Functions
  // =============================================
  

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'Never';
    try {
      // Handle space-separated datetime format
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        isoString = dateString.replace(' ', 'T');
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }
</script>

<!-- =============================================
     Page Head
     ============================================= -->
<svelte:head>
  <title>My Competition Entries | JAX Members Portal</title>
</svelte:head>

<!-- =============================================
     Main Content
     ============================================= -->
<div class="container">
  <!-- Hero Section -->
  <section class="hero">
    <h1>🍺 MY COMPETITION ENTRIES</h1>
    <p>Manage your beer competition submissions</p>
  </section>

  <!-- Filters Section -->
  {#if $isLoaded && $myEntries.length > 0}
    <div class="filters-section">
      <div class="filters-header">
        <h3>🔍 Filter Entries</h3>
        <button
          class="clear-filters-button"
          on:click={() => {
            selectedCompetitionId = 'all';
            selectedCategory = 'all';
            selectedAwardFilter = 'all';
            selectedStatusFilter = 'all';
            selectedPaymentFilter = 'all';
          }}
          disabled={selectedCompetitionId === 'all' && selectedCategory === 'all' && selectedAwardFilter === 'all' && selectedStatusFilter === 'all' && selectedPaymentFilter === 'all'}
        >
          ✨ Clear All Filters
        </button>
      </div>

      <div class="filters-grid">
        <!-- Competition Filter -->
        {#if availableCompetitions.length > 1}
          <div class="filter-group">
            <label for="competition-filter" class="filter-label">Competition</label>
            <select
              id="competition-filter"
              bind:value={selectedCompetitionId}
              class="filter-select"
            >
              <option value="all">All Competitions ({$myEntries.length})</option>
              {#each availableCompetitions as competition}
                <option value={competition.id}>
                  {competition.name}
                </option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Category Filter -->
        {#if availableCategories.length > 1}
          <div class="filter-group">
            <label for="category-filter" class="filter-label">BJCP Category</label>
            <select
              id="category-filter"
              bind:value={selectedCategory}
              class="filter-select"
            >
              <option value="all">All Categories</option>
              {#each availableCategories as category}
                <option value={category.key}>
                  {category.key}
                </option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Award Filter -->
        <div class="filter-group">
          <label for="award-filter" class="filter-label">Awards</label>
          <select
            id="award-filter"
            bind:value={selectedAwardFilter}
            class="filter-select"
          >
            <option value="all">All Entries</option>
            <option value="medal-winners">🏅 Medal Winners Only</option>
            <option value="1st-place">🥇 1st Place</option>
            <option value="2nd-place">🥈 2nd Place</option>
            <option value="3rd-place">🥉 3rd Place</option>
            <option value="honorable-mention">🏅 Honorable Mention</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <label for="status-filter" class="filter-label">Competition Status</label>
          <select
            id="status-filter"
            bind:value={selectedStatusFilter}
            class="filter-select"
          >
            <option value="all">All</option>
            <option value="active">🟢 Active (Can Edit)</option>
            <option value="past">🔴 Past (Closed)</option>
          </select>
        </div>

        <!-- Payment Filter -->
        <div class="filter-group">
          <label for="payment-filter" class="filter-label">Payment Status</label>
          <select
            id="payment-filter"
            bind:value={selectedPaymentFilter}
            class="filter-select"
          >
            <option value="all">All</option>
            <option value="paid">✅ Paid</option>
            <option value="pending">⏳ Pending Payment</option>
          </select>
        </div>
      </div>

      <!-- Filter Results Summary -->
      <div class="filter-results">
        <span class="results-text">
          Showing {filteredEntries.length} of {$myEntries.length} entries
        </span>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if $isLoading && !$isLoaded}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your entries...</p>
    </div>

    <!-- Error State -->
  {:else if $error}
    <div class="error-container">
      <h2>❌ Error Loading Entries</h2>
      <p>{$error}</p>
      <button on:click={() => loadMyEntries(true)} class="retry-button">
        🔄 Retry
      </button>
    </div>

    <!-- Loaded State -->
  {:else if $isLoaded}
    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{filteredStats.total}</div>
        <div class="stat-label">Total Entries</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{filteredStats.active}</div>
        <div class="stat-label">Active Entries</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{filteredStats.paid}</div>
        <div class="stat-label">Paid Entries</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{filteredStats.pending_payment}</div>
        <div class="stat-label">Pending Payment</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button
        on:click={() => goto("/competitions/submit-entry")}
        class="primary-button"
      >
        ➕ Submit New Entry
      </button>
      <button 
        on:click={printEntries}
        class="primary-button"
        disabled={filteredEntries.length === 0}
      >
        🖨️ Print Entry Labels
      </button>
      <button on:click={() => loadMyEntries(true)} class="secondary-button">
        🔄 Refresh
      </button>
    </div>

    <!-- No Entries State -->
    {#if $myEntries.length === 0}
      <div class="empty-state">
        <h2>📝 No Entries Yet</h2>
        <p>You haven't submitted any competition entries.</p>
        <button
          on:click={() => goto("/competitions/submit-entry")}
          class="primary-button"
        >
          🍺 Submit Your First Entry
        </button>
      </div>

    <!-- No Entries Match Filters -->
    {:else if filteredEntries.length === 0}
      <div class="empty-state">
        <h2>🔍 No Entries Match Filters</h2>
        <p>No entries found matching your current filter selection.</p>
        <div class="empty-state-actions">
          <button
            on:click={() => {
              selectedCompetitionId = 'all';
              selectedCategory = 'all';
              selectedAwardFilter = 'all';
              selectedStatusFilter = 'all';
              selectedPaymentFilter = 'all';
            }}
            class="secondary-button"
          >
            ✨ Clear All Filters
          </button>
          <button
            on:click={() => goto("/competitions/submit-entry")}
            class="primary-button"
          >
            ➕ Submit New Entry
          </button>
        </div>
      </div>

      <!-- Entries List -->
    {:else}
      <div class="entries-container">
        {#each filteredEntriesByCompetitionArray as compGroup}
          <div class="competition-group">
            <!-- Competition Header -->
            <div class="competition-header">
              <h2>{compGroup.competition.name}</h2>
              <div class="competition-meta">
                <span class="deadline">
                  Deadline: {formatDeadline(compGroup.entries[0])}
                </span>
                {#if compGroup.competition.active}
                  <span class="status active">🟢 Active</span>
                {:else}
                  <span class="status closed">🔴 Closed</span>
                {/if}
              </div>
            </div>

            <!-- Entries for this competition -->
            <div class="entries-list">
              {#each compGroup.entries as entry}
                <div class="entry-card">
                  <!-- Entry Header -->
                  <div class="entry-header">
                    <h3>{entry.beer_name}</h3>
                    <div class="entry-meta">
                      {#if entry.competition.results_published}
                        <span class="entry-number">#{entry.entry_number}</span>
                      {:else}
                        <span
                          class="entry-number blurred"
                          title="Entry number hidden until results are published"
                        >
                          #{entry.entry_number}
                        </span>
                      {/if}
                      <span
                        class="payment-status {getPaymentStatus(entry).class}"
                      >
                        {getPaymentStatus(entry).text}
                      </span>
                    </div>
                  </div>

                  <!-- Entry Details -->
                  <div class="entry-details">
                    <!-- Editing Mode -->
                    {#if editingEntry === entry.id}
                      <div class="edit-form">
                        <!-- Error Message -->
                        {#if saveError}
                          <div class="error-message">
                            <p>❌ {saveError}</p>
                          </div>
                        {/if}

                        <!-- Beer Name -->
                        <div class="form-group">
                          <label for="edit-beer-name">Beer Name *</label>
                          <input
                            type="text"
                            id="edit-beer-name"
                            bind:value={editForm.beer_name}
                            disabled={saving}
                            required
                          />
                        </div>

                        <!-- Main Category -->
                        <div class="form-group">
                          <label for="edit-main-category">BJCP Category *</label
                          >
                          <select
                            id="edit-main-category"
                            bind:value={editForm.main_category}
                            disabled={saving}
                            required
                          >
                            <option value="">Select main category...</option>
                            {#each $mainCategories as category}
                              <option value={category.number}>
                                {category.number} - {category.name}
                              </option>
                            {/each}
                          </select>
                        </div>

                        <!-- Subcategory -->
                        {#if editForm.main_category && availableSubcategories.length > 0}
                          <div class="form-group">
                            <label for="edit-subcategory"
                              >BJCP Subcategory *</label
                            >
                            <select
                              id="edit-subcategory"
                              bind:value={editForm.subcategory}
                              disabled={saving}
                              required
                            >
                              <option value="">Select subcategory...</option>
                              {#each availableSubcategories as subcategory}
                                <option value={subcategory.id}>
                                  {getCategoryDisplayName(subcategory)}
                                </option>
                              {/each}
                            </select>
                          </div>
                        {/if}

                        <!-- Beer Notes -->
                        <div class="form-group">
                          <label for="edit-beer-notes">Beer Notes</label>
                          <textarea
                            id="edit-beer-notes"
                            bind:value={editForm.beer_notes}
                            disabled={saving}
                            rows="3"
                            maxlength="500"
                          ></textarea>
                        </div>

                        <!-- Edit Actions -->
                        <div class="edit-actions">
                          <button
                            type="button"
                            on:click={cancelEdit}
                            class="cancel-button"
                            disabled={saving}
                          >
                            ❌ Cancel
                          </button>
                          <button
                            type="button"
                            on:click={saveEdit}
                            class="save-button"
                            disabled={saving ||
                              !editForm.beer_name.trim() ||
                              !editForm.bjcp_category_id}
                          >
                            {#if saving}
                              🔄 Saving...
                            {:else}
                              ✅ Save Changes
                            {/if}
                          </button>
                        </div>
                      </div>

                      <!-- View Mode -->
                    {:else}
                      <div class="entry-info">
                        <div class="info-row">
                          <span class="label">Category:</span>
                          <span class="value">{entry.category_display}</span>
                        </div>

                        {#if entry.beer_notes}
                          <div class="info-row">
                            <span class="label">Notes:</span>
                            <span class="value">{entry.beer_notes}</span>
                          </div>
                        {/if}

                        <div class="info-row">
                          <span class="label">Submitted:</span>
                          <span class="value">
                            {(() => {
                              if (!entry.submitted_at) return 'N/A';
                              try {
                                let isoString = entry.submitted_at;
                                if (entry.submitted_at.includes(' ') && !entry.submitted_at.includes('T')) {
                                  isoString = entry.submitted_at.replace(' ', 'T');
                                  if (!isoString.includes('+') && !isoString.includes('Z')) {
                                    isoString += 'Z';
                                  }
                                }
                                return new Date(isoString).toLocaleDateString();
                              } catch {
                                return 'Invalid Date';
                              }
                            })()}
                          </span>
                        </div>

                        <!-- Results (if available) -->
                        {#if entry.has_results}
                          <div class="info-row results">
                            <span class="label">Result:</span>
                            <span class="value award">
                              {getAwardDisplay(entry.result)}
                            </span>
                          </div>

                        {/if}
                      </div>

                      <!-- Entry Actions -->
                      <div class="entry-actions">
                        <!-- Edit Button -->
                        {#if canEditEntry(entry)}
                          <button
                            on:click={() => startEdit(entry)}
                            class="edit-button"
                          >
                            ✏️ Edit
                          </button>
                        {/if}

                        <!-- Delete Button -->
                        {#if canEditEntry(entry)}
                          <button
                            on:click={() => confirmDelete(entry)}
                            class="delete-button"
                          >
                            🗑️ Delete
                          </button>
                        {/if}

                        <!-- View Scoresheet Button (for past competitions) -->
                        {#if !canEditEntry(entry)}
                          <a
                            href="/competitions/my-entries/scoresheet/{entry.id}"
                            class="scoresheet-button"
                          >
                            📋 View Scoresheet
                          </a>
                        {/if}

                        <!-- Deadline Warning -->
                        {#if entry.can_edit && entry.days_until_deadline <= 7}
                          <div class="deadline-warning">
                            ⚠️ {entry.days_until_deadline} day{entry.days_until_deadline !==
                            1
                              ? "s"
                              : ""} left to edit
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal-overlay" on:click={cancelDelete}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>🗑️ Delete Entry</h2>
      <p>Are you sure you want to delete this competition entry?</p>
      <p><strong>This action cannot be undone.</strong></p>

      <div class="modal-actions">
        <button on:click={cancelDelete} class="cancel-button">
          ❌ Cancel
        </button>
        <button on:click={confirmDeleteEntry} class="delete-button">
          🗑️ Delete Entry
        </button>
      </div>
    </div>
  </div>
{/if}


<!-- =============================================
     Styles
     ============================================= -->
<style>
  /* Container and Layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 1rem;
  }

  .hero h1 {
    color: #ff3e00;
    font-size: 2.5rem;
    font-weight: 100;
    text-transform: uppercase;
    margin: 0 0 0.5rem 0;
    letter-spacing: 2px;
  }

  .hero p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }

  /* Filters Section */
  .filters-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .filters-header {
    background: #f8f9fa;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filters-header h3 {
    color: #ff3e00;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .clear-filters-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .clear-filters-button:hover:not(:disabled) {
    background: #4b5563;
  }

  .clear-filters-button:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .filter-select {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    color: #333;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .filter-select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
  }

  .filter-results {
    background: #f8f9fa;
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
  }

  .results-text {
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Loading and Error States */
  .loading-container,
  .error-container {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .retry-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #e63600;
  }

  /* Statistics Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    padding: 1.5rem;
    text-align: center;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ff3e00;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: flex-end;
  }

  .primary-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.2s;
  }

  .primary-button:hover:not(:disabled) {
    background: #e63600;
  }

  .primary-button:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .secondary-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
  }

  .secondary-button:hover {
    background: #4b5563;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .empty-state h2 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  .empty-state-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  /* Competition Groups */
  .entries-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .competition-group {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    overflow: hidden;
  }

  .competition-header {
    background: #f8f9fa;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }

  .competition-header h2 {
    color: #ff3e00;
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .competition-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 0.9rem;
  }

  .deadline {
    color: #666;
  }

  .status {
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .status.active {
    background: #d1fae5;
    color: #059669;
  }

  .status.closed {
    background: #fee2e2;
    color: #dc2626;
  }

  /* Entries List */
  .entries-list {
    display: flex;
    flex-direction: column;
  }

  .entry-card {
    padding: 1.5rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .entry-card:last-child {
    border-bottom: none;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .entry-header h3 {
    color: #333;
    margin: 0;
    font-size: 1.1rem;
  }

  .entry-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .entry-number {
    font-family: monospace;
    font-size: 0.9rem;
    color: #666;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    position: relative;
  }

  .entry-number.blurred {
    background: #fee2e2;
    color: transparent;
    text-shadow: 0 0 8px #dc2626;
    cursor: help;
  }

  .entry-number.blurred::after {
    content: "Hidden until judged";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #dc2626;
    color: white;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .payment-status {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .payment-status.paid {
    background: #d1fae5;
    color: #059669;
  }

  .payment-status.pending {
    background: #fef3c7;
    color: #d97706;
  }

  /* Entry Details */
  .entry-details {
    margin-top: 1rem;
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .info-row {
    display: flex;
    gap: 1rem;
  }

  .info-row .label {
    min-width: 100px;
    font-weight: 600;
    color: #374151;
  }

  .info-row .value {
    color: #6b7280;
    flex: 1;
  }

  .info-row.results .value.award {
    font-weight: 600;
    color: #059669;
  }

  /* Edit Form */
  .edit-form {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #ff3e00;
  }

  .error-message {
    background: #fee;
    border: 1px solid #dc2626;
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .error-message p {
    margin: 0;
    color: #dc2626;
    font-size: 0.9rem;
  }

  /* Entry Actions */
  .entry-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .edit-button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .edit-button:hover {
    background: #1d4ed8;
  }

  .delete-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .delete-button:hover {
    background: #b91c1c;
  }

  .deadline-warning {
    background: #fef3c7;
    color: #d97706;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Edit Actions */
  .edit-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .cancel-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .cancel-button:hover:not(:disabled) {
    background: #4b5563;
  }

  .save-button {
    background: #059669;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .save-button:hover:not(:disabled) {
    background: #047857;
  }

  .save-button:disabled,
  .cancel-button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  /* Modal */
  .modal-overlay {
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
    border-radius: 6px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    color: #dc2626;
    margin: 0 0 1rem 0;
  }

  .modal-content p {
    margin: 0.5rem 0;
    color: #374151;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .filters-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .filters-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .empty-state-actions {
      flex-direction: column;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .action-buttons {
      flex-direction: column;
    }

    .entry-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .entry-meta {
      flex-direction: row;
      align-items: center;
    }

    .competition-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .info-row {
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-row .label {
      min-width: auto;
    }

    .entry-actions {
      justify-content: flex-start;
    }

    .edit-actions {
      flex-direction: column;
    }

    .modal-content {
      margin: 1rem;
    }

    .modal-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: 1.75rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-number {
      font-size: 2rem;
    }

    .competition-header {
      padding: 1rem;
    }

    .entry-card {
      padding: 1rem;
    }

    .edit-form {
      padding: 1rem;
    }

  }


  .scoresheet-button {
    background: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .scoresheet-button:hover {
    background: #2563eb;
    color: white;
    text-decoration: none;
  }

</style>
