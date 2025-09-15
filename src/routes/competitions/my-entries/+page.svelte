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
  // Scoresheet Modal State
  // =============================================
  let showScoresheetModal = false;
  let selectedScoresheet = null;
  let loadingScoresheet = false;
  let scoresheetError = null;

  // =============================================
  // Competition Filter State
  // =============================================
  let selectedCompetitionId = "all"; // Default to show all competitions
  
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
  // Competition Filtering Logic
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

  // Filter entries by selected competition
  $: filteredEntries = selectedCompetitionId === "all" 
    ? $myEntries 
    : $myEntries.filter(entry => entry.competition.id === selectedCompetitionId);

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
  
  // Load scoresheet data for user's own entry (with security check)
  async function loadScoresheetData(entry) {
    loadingScoresheet = true;
    scoresheetError = null;
    selectedScoresheet = null;

    try {
      console.log('Loading scoresheet for my entry:', entry.id);
      
      // Security check: ensure the entry belongs to the current user
      if (entry.member_id !== $userProfile?.id) {
        throw new Error('You can only view scoresheets for your own entries.');
      }
      
      // Get judging sessions for this entry
      const { data: sessions, error: sessionsError } = await supabase
        .from('competition_judging_sessions')
        .select(`
          *,
          judge:members!competition_judging_sessions_judge_id_fkey(id, name),
          entry:competition_entries!inner(
            id, 
            entry_number, 
            beer_name, 
            member_id, 
            bjcp_category_id,
            category:bjcp_categories(id, category_name, category_number, subcategory_letter, subcategory_name)
          )
        `)
        .eq('entry_id', entry.id)
        .eq('competition_id', entry.competition_id)
        .eq('entry.member_id', $userProfile.id); // Additional security check

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        scoresheetError = 'No scoresheets found for this entry. Results may not be available yet.';
        showScoresheetModal = true;
        return;
      }

      selectedScoresheet = {
        entry: {
          id: entry.id,
          entry_number: entry.entry_number,
          beer_name: entry.beer_name,
          member_id: entry.member_id
        },
        competition: entry.competition,
        category: sessions[0].entry?.category,
        sessions: sessions.map(session => ({
          id: session.id,
          judge: session.judge,
          total_score: session.total_score,
          judge_notes: session.judge_notes,
          scoresheet_data: session.scoresheet_data,
          judged_at: session.judged_at,
          // Simple scoresheet data (fallback)
          aroma_score: session.aroma_score,
          appearance_score: session.appearance_score,
          flavor_score: session.flavor_score,
          mouthfeel_score: session.mouthfeel_score,
          overall_score: session.overall_score
        }))
      };

      showScoresheetModal = true;

    } catch (err) {
      console.error('Error loading scoresheet:', err);
      scoresheetError = err.message || 'Failed to load scoresheet data';
      showScoresheetModal = true;
    } finally {
      loadingScoresheet = false;
    }
  }

  // Close scoresheet modal
  function closeScoresheetModal() {
    showScoresheetModal = false;
    selectedScoresheet = null;
    scoresheetError = null;
  }

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

  <!-- Competition Filter -->
  {#if $isLoaded && availableCompetitions.length > 1}
    <div class="filter-section">
      <div class="filter-container">
        <label for="competition-filter" class="filter-label">
          Filter by Competition:
        </label>
        <select 
          id="competition-filter"
          bind:value={selectedCompetitionId}
          class="competition-select"
        >
          <option value="all">All Competitions ({$myEntries.length})</option>
          {#each availableCompetitions as competition}
            <option value={competition.id}>
              {competition.name} ({filteredEntries.filter(e => e.competition.id === competition.id).length})
            </option>
          {/each}
        </select>
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
    {#if filteredEntries.length === 0 && selectedCompetitionId === "all"}
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

    <!-- No Entries for Selected Competition -->
    {:else if filteredEntries.length === 0 && selectedCompetitionId !== "all"}
      <div class="empty-state">
        <h2>🔍 No Entries Found</h2>
        <p>No entries found for the selected competition.</p>
        <button
          on:click={() => selectedCompetitionId = "all"}
          class="secondary-button"
        >
          📋 Show All Entries
        </button>
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

                          {#if entry.result?.judge_notes}
                            <div class="info-row">
                              <span class="label">Judge Notes:</span>
                              <span class="value"
                                >{entry.result.judge_notes}</span
                              >
                            </div>
                          {/if}
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
                          <button
                            on:click={() => loadScoresheetData(entry)}
                            class="scoresheet-button"
                            disabled={loadingScoresheet}
                          >
                            {#if loadingScoresheet}
                              🔄 Loading...
                            {:else}
                              📋 View Scoresheet
                            {/if}
                          </button>
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

<!-- Scoresheet Modal -->
{#if showScoresheetModal}
  <div class="modal-overlay" on:click={closeScoresheetModal}>
    <div class="modal-content scoresheet-modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>📋 Scoresheet Details</h2>
        <button class="close-button" on:click={closeScoresheetModal}>✕</button>
      </div>

      {#if loadingScoresheet}
        <div class="modal-body">
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading scoresheet...</p>
          </div>
        </div>
      {:else if scoresheetError}
        <div class="modal-body">
          <div class="error-state">
            <p class="error-message">{scoresheetError}</p>
          </div>
        </div>
      {:else if selectedScoresheet}
        <div class="modal-body scoresheet-body">
          <!-- Entry Information -->
          <div class="entry-info-header">
            <h3>Entry #{selectedScoresheet.entry.entry_number}: {selectedScoresheet.entry.beer_name}</h3>
            <p class="competition-info">Competition: {selectedScoresheet.competition.name}</p>
            {#if selectedScoresheet.category}
              <p class="category-info">
                {selectedScoresheet.category.category_number}{selectedScoresheet.category.subcategory_letter} - {selectedScoresheet.category.category_name}
                {#if selectedScoresheet.category.subcategory_name}
                  ({selectedScoresheet.category.subcategory_name})
                {/if}
              </p>
            {/if}
          </div>

          <!-- Judge Sessions -->
          {#if selectedScoresheet.sessions && selectedScoresheet.sessions.length > 0}
            {#each selectedScoresheet.sessions as session, index}
              <div class="judge-session">
                <div class="session-header">
                  <h4>Judge: {session.judge.name}</h4>
                  <div class="session-meta">
                    <span class="total-score">Total Score: {session.total_score || 'N/A'}/50</span>
                    {#if session.judged_at}
                      <span class="judged-date">
                        Judged: {formatDate(session.judged_at)}
                      </span>
                    {/if}
                  </div>
                </div>

                <!-- BJCP Scoresheet Data (if available) -->
                {#if session.scoresheet_data}
                  <div class="bjcp-scoresheet">
                    <h5>📊 BJCP Scoresheet</h5>
                    
                    <!-- Score Breakdown -->
                    <div class="score-grid">
                      {#if session.scoresheet_data.aroma_score}
                        <div class="score-item">
                          <span class="score-label">Aroma</span>
                          <span class="score-value">{session.scoresheet_data.aroma_score}/12</span>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.appearance_score}
                        <div class="score-item">
                          <span class="score-label">Appearance</span>
                          <span class="score-value">{session.scoresheet_data.appearance_score}/3</span>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.flavor_score}
                        <div class="score-item">
                          <span class="score-label">Flavor</span>
                          <span class="score-value">{session.scoresheet_data.flavor_score}/20</span>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.mouthfeel_score}
                        <div class="score-item">
                          <span class="score-label">Mouthfeel</span>
                          <span class="score-value">{session.scoresheet_data.mouthfeel_score}/5</span>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.overall_score}
                        <div class="score-item">
                          <span class="score-label">Overall</span>
                          <span class="score-value">{session.scoresheet_data.overall_score}/10</span>
                        </div>
                      {/if}
                    </div>

                    <!-- Comments -->
                    <div class="comments-section">
                      {#if session.scoresheet_data.aroma_comments}
                        <div class="comment-item">
                          <h6>Aroma</h6>
                          <p>{session.scoresheet_data.aroma_comments}</p>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.appearance_comments}
                        <div class="comment-item">
                          <h6>Appearance</h6>
                          <p>{session.scoresheet_data.appearance_comments}</p>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.flavor_comments}
                        <div class="comment-item">
                          <h6>Flavor</h6>
                          <p>{session.scoresheet_data.flavor_comments}</p>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.mouthfeel_comments}
                        <div class="comment-item">
                          <h6>Mouthfeel</h6>
                          <p>{session.scoresheet_data.mouthfeel_comments}</p>
                        </div>
                      {/if}
                      {#if session.scoresheet_data.overall_comments}
                        <div class="comment-item">
                          <h6>Overall Impression</h6>
                          <p>{session.scoresheet_data.overall_comments}</p>
                        </div>
                      {/if}
                    </div>

                    <!-- Descriptors (if any are selected) -->
                    {#if session.scoresheet_data.descriptors}
                      {@const selectedDescriptors = Object.entries(session.scoresheet_data.descriptors).filter(([key, value]) => value)}
                      {#if selectedDescriptors.length > 0}
                        <div class="descriptors-section">
                          <h6>Descriptors</h6>
                          <div class="descriptor-tags">
                            {#each selectedDescriptors as [descriptor, _]}
                              <span class="descriptor-tag">{descriptor.replace('_', ' ')}</span>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    {/if}
                  </div>
                {:else}
                  <!-- Simple scoresheet fallback -->
                  <div class="simple-scoresheet">
                    <h5>📝 Basic Scoresheet</h5>
                    <div class="score-grid">
                      {#if session.aroma_score}
                        <div class="score-item">
                          <span class="score-label">Aroma</span>
                          <span class="score-value">{session.aroma_score}/12</span>
                        </div>
                      {/if}
                      {#if session.appearance_score}
                        <div class="score-item">
                          <span class="score-label">Appearance</span>
                          <span class="score-value">{session.appearance_score}/3</span>
                        </div>
                      {/if}
                      {#if session.flavor_score}
                        <div class="score-item">
                          <span class="score-label">Flavor</span>
                          <span class="score-value">{session.flavor_score}/20</span>
                        </div>
                      {/if}
                      {#if session.mouthfeel_score}
                        <div class="score-item">
                          <span class="score-label">Mouthfeel</span>
                          <span class="score-value">{session.mouthfeel_score}/5</span>
                        </div>
                      {/if}
                      {#if session.overall_score}
                        <div class="score-item">
                          <span class="score-label">Overall</span>
                          <span class="score-value">{session.overall_score}/10</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}

                <!-- Judge Notes -->
                {#if session.judge_notes}
                  <div class="judge-notes-section">
                    <h6>Judge Notes</h6>
                    <p class="judge-notes-text">{session.judge_notes}</p>
                  </div>
                {/if}
              </div>

              {#if index < selectedScoresheet.sessions.length - 1}
                <hr class="session-divider">
              {/if}
            {/each}
          {:else}
            <div class="no-scoresheets">
              <p>No detailed scoresheets available for this entry.</p>
            </div>
          {/if}
        </div>
      {/if}
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

  /* Competition Filter */
  .filter-section {
    margin-bottom: 2rem;
  }

  .filter-container {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .competition-select {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    color: #333;
    min-width: 250px;
    cursor: pointer;
  }

  .competition-select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
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

    .filter-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .competition-select {
      width: 100%;
      min-width: unset;
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

    .scoresheet-modal {
      width: 98%;
      margin: 1rem;
      max-height: 95vh;
    }

    .score-grid {
      grid-template-columns: 1fr;
    }

    .descriptor-tags {
      justify-content: center;
    }
  }

  /* Scoresheet Modal Styles */
  .scoresheet-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    max-width: 800px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .scoresheet-modal h3 {
    color: #ff3e00;
    margin: 0 0 1.5rem 0;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-right: 3rem;
  }

  .close-scoresheet {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .close-scoresheet:hover {
    background: #f3f4f6;
    color: #333;
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
  }

  .scoresheet-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .scoresheet-button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  /* Scoresheet Content */
  .scoresheet-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .scoresheet-section {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 6px;
    border-left: 4px solid #ff3e00;
  }

  .scoresheet-section h4 {
    color: #ff3e00;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .score-item {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .score-item .label {
    font-weight: 600;
    color: #374151;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .score-item .value {
    font-size: 1.2rem;
    color: #ff3e00;
    font-weight: 700;
  }

  .total-score {
    background: #ff3e00;
    color: white;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
    margin: 1rem 0;
  }

  .total-score .label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
    display: block;
  }

  .total-score .value {
    font-size: 2rem;
    font-weight: 700;
  }

  .comment-item {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    margin-bottom: 1rem;
  }

  .comment-item:last-child {
    margin-bottom: 0;
  }

  .comment-item .label {
    font-weight: 600;
    color: #374151;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .comment-item .text {
    color: #6b7280;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .descriptor-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .descriptor-tag {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .no-scoresheet {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    background: #f9fafb;
    border-radius: 6px;
    border: 2px dashed #d1d5db;
  }

  .no-scoresheet .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    display: block;
  }
</style>
