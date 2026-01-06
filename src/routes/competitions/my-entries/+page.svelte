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
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { jsPDF } from "jspdf";

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

  // Print labels function for my entries - PDF-based for mobile compatibility
  function printEntries() {
    if (!filteredEntries || filteredEntries.length === 0) {
      alert('No entries available to print');
      return;
    }

    // Create PDF document (8.5" x 11")
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });

    // Page dimensions and margins
    const pageWidth = 8.5;
    const pageHeight = 11;
    const marginX = 0.5;
    const marginY = 0.5;
    const labelSpacing = 0.1875; // Spacing between labels
    const labelWidth = 2.25;

    let currentX = marginX;
    let currentY = marginY;
    let currentRowHeight = 0; // Track the height of the current row
    let isFirstLabelOnPage = true;

    // Process each entry (3 labels per entry)
    filteredEntries.forEach(entry => {
      const isIntraclub = entry.competition?.competition_type === 'intraclub';
      const labelHeight = isIntraclub ? 2.25 : 1.5;

      // Create 3 copies of each label
      for (let copy = 0; copy < 3; copy++) {
        // Check if label fits on current row
        if (!isFirstLabelOnPage && currentX + labelWidth > pageWidth - marginX) {
          // Move to next row
          currentX = marginX;
          currentY += currentRowHeight + labelSpacing;
          currentRowHeight = 0;
        }

        // Check if label fits on current page
        if (currentY + labelHeight > pageHeight - marginY) {
          // Add new page
          doc.addPage();
          currentX = marginX;
          currentY = marginY;
          currentRowHeight = 0;
          isFirstLabelOnPage = true;
        }

        // Update row height if this label is taller
        currentRowHeight = Math.max(currentRowHeight, labelHeight);

        // Draw label border
        doc.setDrawColor(0);
        doc.setLineWidth(0.01);
        doc.rect(currentX, currentY, labelWidth, labelHeight);

        // Label content
        let yPos = currentY + 0.2;

        // Competition name header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const compName = entry.competition?.name || 'Competition';
        const compNameLines = doc.splitTextToSize(compName, labelWidth - 0.2);
        doc.text(compNameLines, currentX + labelWidth / 2, yPos, { align: 'center' });
        yPos += compNameLines.length * 0.12 + 0.1;

        // Horizontal line under header
        doc.setLineWidth(0.01);
        doc.line(currentX + 0.125, yPos, currentX + labelWidth - 0.125, yPos);
        yPos += 0.25;

        if (isIntraclub) {
          // Officer label format (no member name, no beer name)

          // Entry number
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text('Entry #:', currentX + 0.15, yPos);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 62, 0); // Orange color
          doc.text(entry.entry_number || '', currentX + 0.75, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPos += 0.25;

          // Beer style
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const styleCode = `${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''}`;
          const categoryName = entry.bjcp_category?.category_name || '';
          doc.text(`Style: ${styleCode}`, currentX + 0.15, yPos);
          yPos += 0.16;

          if (categoryName) {
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(categoryName, labelWidth - 0.3);
            doc.text(lines, currentX + 0.15, yPos);
            yPos += lines.length * 0.13;
          }

          if (entry.bjcp_category?.subcategory_name) {
            doc.setFontSize(8);
            const subLines = doc.splitTextToSize(entry.bjcp_category.subcategory_name, labelWidth - 0.3);
            doc.text(subLines, currentX + 0.15, yPos);
            yPos += subLines.length * 0.12;
          }

          if (entry.beer_notes) {
            yPos += 0.08;
            doc.setFontSize(8);
            const notesLines = doc.splitTextToSize(`Special: ${entry.beer_notes}`, labelWidth - 0.3);
            doc.text(notesLines, currentX + 0.15, yPos);
          }

        } else {
          // Member label format (with member name and beer name)

          // Entry number
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Entry #: `, currentX + 0.1, yPos);
          doc.setFont('helvetica', 'bold');
          doc.text(entry.entry_number || '', currentX + 0.55, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += 0.13;

          // Member name
          const memberName = $userProfile?.name || $userProfile?.email || 'Unknown';
          doc.setFontSize(8);
          doc.text(`Member: `, currentX + 0.1, yPos);
          doc.setFont('helvetica', 'bold');
          const memberLines = doc.splitTextToSize(memberName, labelWidth - 0.7);
          doc.text(memberLines, currentX + 0.5, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += memberLines.length * 0.11;

          // Beer name
          doc.text(`Beer: `, currentX + 0.1, yPos);
          doc.setFont('helvetica', 'bold');
          const beerLines = doc.splitTextToSize(entry.beer_name || 'Unknown', labelWidth - 0.5);
          doc.text(beerLines, currentX + 0.35, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += beerLines.length * 0.11;

          // Style
          const styleCode = `${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''}`;
          doc.setFontSize(8);
          doc.text(`Style: ${styleCode}`, currentX + 0.1, yPos);
          yPos += 0.11;

          if (entry.bjcp_category?.category_name) {
            doc.setFontSize(7);
            const catLines = doc.splitTextToSize(entry.bjcp_category.category_name, labelWidth - 0.2);
            doc.text(catLines, currentX + 0.1, yPos);
            yPos += catLines.length * 0.1;
          }

          if (entry.bjcp_category?.subcategory_name) {
            doc.setFontSize(7);
            const subLines = doc.splitTextToSize(entry.bjcp_category.subcategory_name, labelWidth - 0.2);
            doc.text(subLines, currentX + 0.1, yPos);
          }
        }

        // Move to next position (advance horizontally)
        currentX += labelWidth + labelSpacing;
        isFirstLabelOnPage = false;
      }
    });

    // Generate PDF and open in new tab (without auto-printing)
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open PDF in new window - user can manually print when ready
    window.open(pdfUrl, '_blank');

    // Clean up after a delay
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 10000); // Give more time for the PDF to load
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
<Container size="lg">
  <Hero
    title="MY COMPETITION ENTRIES"
    subtitle="Manage your beer competition submissions"
    icon="🍺"
    center={true}
  />

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
    <LoadingSpinner message="Loading your entries..." />

    <!-- Error State -->
  {:else if $error}
    <div class="error-container">
      <h2>❌ Error Loading Entries</h2>
      <p>{$error}</p>
      <Button on:click={() => loadMyEntries(true)} variant="primary">
        🔄 Retry
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
        ➕ Submit New Entry
      </Button>
      <Button
        on:click={printEntries}
        variant="primary"
        disabled={filteredEntries.length === 0}
      >
        🖨️ Print Entry Labels
      </Button>
      <Button on:click={() => loadMyEntries(true)} variant="secondary">
        🔄 Refresh
      </Button>
    </div>

    <!-- No Entries State -->
    {#if $myEntries.length === 0}
      <EmptyState
        icon="📝"
        title="No Entries Yet"
        message="You haven't submitted any competition entries."
      >
        <Button
          on:click={() => goto("/competitions/submit-entry")}
          variant="primary"
        >
          🍺 Submit Your First Entry
        </Button>
      </EmptyState>

    <!-- No Entries Match Filters -->
    {:else if filteredEntries.length === 0}
      <EmptyState
        icon="🔍"
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
            ✨ Clear All Filters
          </Button>
          <Button
            on:click={() => goto("/competitions/submit-entry")}
            variant="primary"
          >
            ➕ Submit New Entry
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
                  Deadline: {formatDeadline(compGroup.entries[0])}
                </span>
                {#if compGroup.entries.some(entry => entry.can_edit)}
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
                          <Button
                            type="button"
                            on:click={cancelEdit}
                            variant="secondary"
                            disabled={saving}
                          >
                            ❌ Cancel
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
                              🔄 Saving...
                            {:else}
                              ✅ Save Changes
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
                            ✏️ Edit
                          </Button>
                        {/if}

                        <!-- Delete Button -->
                        {#if canEditEntry(entry)}
                          <Button
                            on:click={() => confirmDelete(entry)}
                            variant="secondary"
                          >
                            🗑️ Delete
                          </Button>
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
</Container>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal-overlay" on:click={cancelDelete}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>🗑️ Delete Entry</h2>
      <p>Are you sure you want to delete this competition entry?</p>
      <p><strong>This action cannot be undone.</strong></p>

      <div class="modal-actions">
        <Button on:click={cancelDelete} variant="secondary">
          ❌ Cancel
        </Button>
        <Button on:click={confirmDeleteEntry} variant="primary">
          🗑️ Delete Entry
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
  .error-container {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
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
