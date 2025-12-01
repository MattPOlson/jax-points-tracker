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
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Card, Badge } from '$lib/components/ui';
  import { Beer, Search, X, Edit, Trash2, Save, Trophy, DollarSign, Calendar, Medal, CheckCircle, Clock, RefreshCw, Plus, Printer, AlertTriangle, Circle, FileText } from 'lucide-svelte';

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

  let previousMainCategory = "";

  // Get available subcategories for editing
  $: availableSubcategories = editForm.main_category
    ? $categoriesByNumber[editForm.main_category]?.subcategories || []
    : [];

  // Reset subcategory when main category changes (but not during initialization)
  $: if (editForm.main_category && editForm.main_category !== previousMainCategory && previousMainCategory !== "") {
    editForm.subcategory = "";
    editForm.bjcp_category_id = "";
    previousMainCategory = editForm.main_category;
  } else if (editForm.main_category && previousMainCategory === "") {
    // First time setting, just track it
    previousMainCategory = editForm.main_category;
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
    previousMainCategory = "";
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
<Hero
  title="My Competition Entries"
  subtitle="Manage your beer competition submissions"
  backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
  large={true}
/>

<Container size="lg">

  <!-- Filters Section -->
  {#if $isLoaded && $myEntries.length > 0}
    <div class="filters-section">
      <div class="filters-header">
        <h3>
          <Search size={20} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.5rem;" />
          Filter Entries
        </h3>
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
          <X size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Clear All Filters
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
            <option value="medal-winners">Medal Winners Only</option>
            <option value="1st-place">1st Place</option>
            <option value="2nd-place">2nd Place</option>
            <option value="3rd-place">3rd Place</option>
            <option value="honorable-mention">Honorable Mention</option>
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
            <option value="active">Active (Can Edit)</option>
            <option value="past">Past (Closed)</option>
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
            <option value="paid">Paid</option>
            <option value="pending">Pending Payment</option>
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
    <LoadingSpinner message="Loading your entries..." />

    <!-- Error State -->
  {:else if $error}
    <div class="error-container">
      <h2>
        <X size={24} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.5rem;" />
        Error Loading Entries
      </h2>
      <p>{$error}</p>
      <Button on:click={() => loadMyEntries(true)} variant="primary">
        <RefreshCw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        Retry
      </Button>
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
      <Button
        on:click={() => goto("/competitions/submit-entry")}
        variant="primary"
      >
        <Plus size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        Submit New Entry
      </Button>
      <Button
        on:click={printEntries}
        variant="primary"
        disabled={filteredEntries.length === 0}
      >
        <Printer size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        Print Entry Labels
      </Button>
      <Button on:click={() => loadMyEntries(true)} variant="secondary">
        <RefreshCw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        Refresh
      </Button>
    </div>

    <!-- No Entries State -->
    {#if $myEntries.length === 0}
      <EmptyState
        title="No Entries Yet"
        message="You haven't submitted any competition entries."
      >
        <Button
          on:click={() => goto("/competitions/submit-entry")}
          variant="primary"
        >
          <Beer size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Submit Your First Entry
        </Button>
      </EmptyState>

    <!-- No Entries Match Filters -->
    {:else if filteredEntries.length === 0}
      <EmptyState
        title="No Entries Match Filters"
        message="No entries found matching your current filter selection."
      >
        <div class="empty-state-actions">
          <Button
            on:click={() => {
              selectedCompetitionId = 'all';
              selectedCategory = 'all';
              selectedAwardFilter = 'all';
              selectedStatusFilter = 'all';
              selectedPaymentFilter = 'all';
            }}
            variant="secondary"
          >
            <X size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
            Clear All Filters
          </Button>
          <Button
            on:click={() => goto("/competitions/submit-entry")}
            variant="primary"
          >
            <Plus size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
            Submit New Entry
          </Button>
        </div>
      </EmptyState>

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
                  <Calendar size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                  Deadline: {formatDeadline(compGroup.entries[0])}
                </span>
                {#if compGroup.entries.some(entry => entry.can_edit)}
                  <span class="status active">
                    <CheckCircle size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                    Active
                  </span>
                {:else}
                  <span class="status closed">
                    <X size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                    Closed
                  </span>
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
                            <p>
                              <X size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                              {saveError}
                            </p>
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
                          <Button
                            type="button"
                            on:click={cancelEdit}
                            variant="secondary"
                            disabled={saving}
                          >
                            <X size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            on:click={saveEdit}
                            variant="primary"
                            disabled={saving ||
                              !editForm.beer_name.trim() ||
                              !editForm.bjcp_category_id}
                          >
                            {#if saving}
                              <RefreshCw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem; animation: spin 1s linear infinite;" />
                              Saving...
                            {:else}
                              <Save size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                              Save Changes
                            {/if}
                          </Button>
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
                          <Button
                            on:click={() => startEdit(entry)}
                            variant="primary"
                          >
                            <Edit size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                            Edit
                          </Button>
                        {/if}

                        <!-- Delete Button -->
                        {#if canEditEntry(entry)}
                          <Button
                            on:click={() => confirmDelete(entry)}
                            variant="secondary"
                          >
                            <Trash2 size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                            Delete
                          </Button>
                        {/if}

                        <!-- View Scoresheet Button (for past competitions) -->
                        {#if !canEditEntry(entry)}
                          <a
                            href="/competitions/my-entries/scoresheet/{entry.id}"
                            class="scoresheet-button"
                          >
                            <FileText size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                            View Scoresheet
                          </a>
                        {/if}

                        <!-- Deadline Warning -->
                        {#if entry.can_edit && entry.days_until_deadline <= 7}
                          <div class="deadline-warning">
                            <AlertTriangle size={16} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                            {entry.days_until_deadline} day{entry.days_until_deadline !==
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
</Container>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal-overlay" on:click={cancelDelete}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>
        <Trash2 size={24} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.5rem;" />
        Delete Entry
      </h2>
      <p>Are you sure you want to delete this competition entry?</p>
      <p><strong>This action cannot be undone.</strong></p>

      <div class="modal-actions">
        <Button on:click={cancelDelete} variant="secondary">
          <X size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Cancel
        </Button>
        <Button on:click={confirmDeleteEntry} variant="primary">
          <Trash2 size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
          Delete Entry
        </Button>
      </div>
    </div>
  </div>
{/if}


<!-- =============================================
     Styles
     ============================================= -->
<style>

  /* Filters Section */
  .filters-section {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
    margin-bottom: var(--space-8);
    overflow: hidden;
  }

  .filters-header {
    background: var(--color-bg-secondary);
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .filters-header h3 {
    color: var(--color-brand-primary);
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .clear-filters-button {
    background: var(--color-text-secondary);
    color: white;
    border: none;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-button);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: background 0.2s;
  }

  .clear-filters-button:hover:not(:disabled) {
    background: var(--color-text-primary);
  }

  .clear-filters-button:disabled {
    background: var(--color-border-secondary);
    color: var(--color-text-tertiary);
    cursor: not-allowed;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    padding: var(--space-6);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .filter-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .filter-select {
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    font-size: var(--font-size-sm);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--color-brand-primary);
    box-shadow: 0 0 0 3px var(--color-brand-primary-light);
  }

  .filter-results {
    background: var(--color-bg-secondary);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-secondary);
  }

  .results-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  /* Loading and Error States */
  .error-container {
    text-align: center;
    padding: var(--space-12) var(--space-8);
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
  }

  /* Statistics Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .stat-card {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
    padding: var(--space-6);
    text-align: center;
  }

  .stat-number {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-2);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    justify-content: flex-end;
  }

  .empty-state-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    margin-top: var(--space-6);
    flex-wrap: wrap;
  }

  /* Competition Groups */
  .entries-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .competition-group {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
    overflow: hidden;
  }

  .competition-header {
    background: var(--color-bg-secondary);
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .competition-header h2 {
    color: var(--color-brand-primary);
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }

  .competition-meta {
    display: flex;
    gap: var(--space-4);
    align-items: center;
    font-size: var(--font-size-sm);
  }

  .deadline {
    color: var(--color-text-secondary);
  }

  .status {
    padding: var(--space-1) var(--space-3);
    border-radius: 15px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .status.active {
    background: var(--color-success-bg);
    color: var(--color-success);
  }

  .status.closed {
    background: var(--color-danger-bg);
    color: var(--color-danger);
  }

  /* Entries List */
  .entries-list {
    display: flex;
    flex-direction: column;
  }

  .entry-card {
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border-tertiary);
  }

  .entry-card:last-child {
    border-bottom: none;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-4);
  }

  .entry-header h3 {
    color: var(--color-text-primary);
    margin: 0;
    font-size: var(--font-size-lg);
  }

  .entry-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
  }

  .entry-number {
    font-family: monospace;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    background: var(--color-bg-tertiary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-button);
    position: relative;
  }

  .entry-number.blurred {
    background: var(--color-danger-bg);
    color: transparent;
    text-shadow: 0 0 8px var(--color-danger);
    cursor: help;
  }

  .entry-number.blurred::after {
    content: "Hidden until judged";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-danger);
    color: white;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-button);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }

  .payment-status {
    font-size: var(--font-size-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: 12px;
    font-weight: var(--font-weight-semibold);
  }

  .payment-status.paid {
    background: var(--color-success-bg);
    color: var(--color-success);
  }

  .payment-status.pending {
    background: var(--color-warning-bg);
    color: var(--color-warning);
  }

  /* Entry Details */
  .entry-details {
    margin-top: var(--space-4);
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .info-row {
    display: flex;
    gap: var(--space-4);
  }

  .info-row .label {
    min-width: 100px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .info-row .value {
    color: var(--color-text-secondary);
    flex: 1;
  }

  .info-row.results .value.award {
    font-weight: var(--font-weight-semibold);
    color: var(--color-success);
  }

  /* Edit Form */
  .edit-form {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin-top: var(--space-4);
  }

  .form-group {
    margin-bottom: var(--space-4);
  }

  .form-group label {
    display: block;
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-2);
    color: var(--color-text-primary);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--space-2);
    border: 2px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    font-size: var(--font-size-sm);
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  .error-message {
    background: var(--color-danger-bg);
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-button);
    padding: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .error-message p {
    margin: 0;
    color: var(--color-danger);
    font-size: var(--font-size-sm);
  }

  /* Entry Actions */
  .entry-actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
  }


  .deadline-warning {
    background: var(--color-warning-bg);
    color: var(--color-warning);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-button);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  /* Edit Actions */
  .edit-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-end;
    margin-top: var(--space-4);
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
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    padding: var(--space-8);
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    color: var(--color-danger);
    margin: 0 0 var(--space-4) 0;
  }

  .modal-content p {
    margin: var(--space-2) 0;
    color: var(--color-text-primary);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-end;
    margin-top: var(--space-8);
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {

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
    background: var(--color-brand-primary);
    color: white;
    padding: var(--space-2) var(--space-4);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    transition: background 0.2s;
  }

  .scoresheet-button:hover {
    background: var(--color-brand-primary-hover);
    color: white;
    text-decoration: none;
  }

</style>
