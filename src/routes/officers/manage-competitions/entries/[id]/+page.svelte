<!-- src/routes/officers/manage-competitions/entries/[id]/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import { competitionJudgingStore } from '$lib/stores/competitionJudgingStore';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { jsPDF } from "jspdf";
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';

  let showAccessDeniedModal = false;
  let isAuthorized = false;

  // Access control is layered:
  //   1. officers/+layout enforces the is_officer baseline for every /officers route.
  //   2. Entry management is intentionally restricted further to Competition
  //      Directors only, so non-CD officers get the in-page access-denied modal below.
  $: if ($userProfile) {
    if ($userProfile.role === 'competition_director') {
      isAuthorized = true;
      showAccessDeniedModal = false;
    } else {
      isAuthorized = false;
      showAccessDeniedModal = true;
    }
  }

  // Load data when authorization status changes
  $: if (isAuthorized && competitionId && !competition) {
    loadCompetitionAndEntries();
  }

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let competition = null;
  let entries = [];
  let filteredEntries = [];
  let isLoading = true;
  let searchQuery = '';
  let sortColumn = 'entry_number';
  let sortDirection = 'asc';
  let selectedEntries = new Set();
  let selectAll = false;

  // Table assignment state
  let tables = [];
  let bulkTableId = '';

  onMount(() => {
    setupEventHandlers();
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

  // Load competition and entries data
  async function loadCompetitionAndEntries() {
    isLoading = true;
    
    try {
      // Load competition details
      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();
      
      if (compError) throw compError;
      competition = compData;

      // Load entries with member details
      const { data: entriesData, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
          *,
          members!inner(
            name,
            email,
            phone
          ),
          bjcp_category:bjcp_categories(
            id,
            category_number,
            subcategory_letter,
            subcategory_name,
            category_name
          )
        `)
        .eq('competition_id', competitionId)
        .order('entry_number');
      
      if (entriesError) throw entriesError;
      
      entries = entriesData || [];

      // Load judging tables for this competition
      const { data: tablesData } = await supabase
        .from('judging_tables')
        .select('*')
        .eq('competition_id', competitionId)
        .order('table_number');
      tables = tablesData || [];

      filterAndSortEntries();
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load competition entries');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  // Filter and sort entries
  function filterAndSortEntries() {
    let filtered = [...entries];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.entry_number?.toLowerCase().includes(query) ||
        entry.beer_name?.toLowerCase().includes(query) ||
        entry.members?.name?.toLowerCase().includes(query) ||
        entry.members?.email?.toLowerCase().includes(query) ||
        entry.bjcp_category?.category_name?.toLowerCase().includes(query) ||
        `${entry.bjcp_category?.category_number}${entry.bjcp_category?.subcategory_letter}`.toLowerCase().includes(query) ||
        entry.special_ingredients?.toLowerCase().includes(query) ||
        entry.notes?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortColumn) {
        case 'entry_number':
          aVal = a.entry_number || '';
          bVal = b.entry_number || '';
          break;
        case 'member_name':
          aVal = a.members?.name || '';
          bVal = b.members?.name || '';
          break;
        case 'beer_name':
          aVal = a.beer_name || '';
          bVal = b.beer_name || '';
          break;
        case 'category':
          aVal = `${a.bjcp_category?.category_number || ''}${a.bjcp_category?.subcategory_letter || ''}`;
          bVal = `${b.bjcp_category?.category_number || ''}${b.bjcp_category?.subcategory_letter || ''}`;
          break;
        case 'paid':
          aVal = a.is_paid ? 1 : 0;
          bVal = b.is_paid ? 1 : 0;
          break;
        case 'submitted_at':
          // Handle space-separated datetime format for sorting
          const parseDateTime = (dateString) => {
            if (!dateString) return new Date(0);
            let isoString = dateString;
            if (dateString.includes(' ') && !dateString.includes('T')) {
              // Replace space with 'T'
              isoString = dateString.replace(' ', 'T');
              
              // Truncate microseconds to milliseconds if present (6 digits to 3)
              if (isoString.includes('.')) {
                const [datePart, fractionalPart] = isoString.split('.');
                const milliseconds = fractionalPart.substring(0, 3);
                isoString = `${datePart}.${milliseconds}`;
              }
              
              // Add timezone if missing
              if (!isoString.includes('+') && !isoString.includes('Z')) {
                isoString += 'Z';
              }
            }
            return new Date(isoString);
          };
          aVal = parseDateTime(a.submitted_at);
          bVal = parseDateTime(b.submitted_at);
          break;
        default:
          aVal = a[sortColumn] || '';
          bVal = b[sortColumn] || '';
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    filteredEntries = filtered;
  }

  // Handle column sort
  function handleSort(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    filterAndSortEntries();
  }

  // Toggle entry selection
  function toggleSelection(entryId) {
    if (selectedEntries.has(entryId)) {
      selectedEntries.delete(entryId);
    } else {
      selectedEntries.add(entryId);
    }
    selectedEntries = new Set(selectedEntries);
  }

  // Toggle select all
  function toggleSelectAll() {
    if (selectAll) {
      selectedEntries.clear();
    } else {
      filteredEntries.forEach(entry => selectedEntries.add(entry.id));
    }
    selectedEntries = new Set(selectedEntries);
    selectAll = !selectAll;
  }

  // Update payment status
  async function updatePaymentStatus(entryId, isPaid) {
    try {
      const { error } = await supabase
        .from('competition_entries')
        .update({ 
          is_paid: isPaid,
          payment_date: isPaid ? new Date().toISOString() : null
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Update local data
      const entryIndex = entries.findIndex(e => e.id === entryId);
      if (entryIndex !== -1) {
        entries[entryIndex].is_paid = isPaid;
        entries[entryIndex].payment_date = isPaid ? new Date().toISOString() : null;
        filterAndSortEntries();
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast.error('Failed to update payment status');
    }
  }

// Print labels function for competition entries - PDF-based for mobile compatibility
function printLabels() {
  const entriesToPrint = selectedEntries.size > 0
    ? filteredEntries.filter(e => selectedEntries.has(e.id))
    : filteredEntries;

  if (entriesToPrint.length === 0) {
    toast.error('No entries selected for printing');
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

  // Officer labels are always 2.25" x 2.25"
  const labelWidth = 2.25;
  const labelHeight = 2.25;

  let currentX = marginX;
  let currentY = marginY;
  let isFirstLabelOnPage = true;

  // Process each entry (2 labels per entry)
  entriesToPrint.forEach(entry => {
    // Create 2 copies of each label
    for (let copy = 0; copy < 2; copy++) {
      // Check if label fits on current row
      if (!isFirstLabelOnPage && currentX + labelWidth > pageWidth - marginX) {
        // Move to next row
        currentX = marginX;
        currentY += labelHeight + labelSpacing;
      }

      // Check if label fits on current page
      if (currentY + labelHeight > pageHeight - marginY) {
        // Add new page
        doc.addPage();
        currentX = marginX;
        currentY = marginY;
        isFirstLabelOnPage = true;
      }

      // Draw label border
      doc.setDrawColor(0);
      doc.setLineWidth(0.01);
      doc.rect(currentX, currentY, labelWidth, labelHeight);

      // Label content
      let yPos = currentY + 0.2;

      // Competition name header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const compName = competition?.name || 'Competition';
      const compNameLines = doc.splitTextToSize(compName, labelWidth - 0.2);
      doc.text(compNameLines, currentX + labelWidth / 2, yPos, { align: 'center' });
      yPos += compNameLines.length * 0.12 + 0.1;

      // Horizontal line under header
      doc.setLineWidth(0.01);
      doc.line(currentX + 0.125, yPos, currentX + labelWidth - 0.125, yPos);
      yPos += 0.25;

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

  // Assign a single entry to a table
  async function assignEntryToTable(entryId, tableId) {
    try {
      await competitionJudgingStore.assignEntryToTable(entryId, tableId || null);
      const idx = entries.findIndex(e => e.id === entryId);
      if (idx !== -1) {
        entries[idx].table_id = tableId || null;
        filterAndSortEntries();
      }
    } catch (err) {
      console.error('Error assigning entry to table:', err);
      toast.error('Failed to update table assignment');
    }
  }

  // Bulk-assign selected entries to a table
  async function bulkAssignToTable() {
    if (bulkTableId === undefined) return;
    const entryIds = [...selectedEntries];
    if (entryIds.length === 0) return;
    try {
      await competitionJudgingStore.bulkAssignEntriesToTable(entryIds, bulkTableId || null);
      entryIds.forEach(id => {
        const idx = entries.findIndex(e => e.id === id);
        if (idx !== -1) entries[idx].table_id = bulkTableId || null;
      });
      entries = [...entries];
      filterAndSortEntries();
      selectedEntries.clear();
      selectedEntries = new Set();
      bulkTableId = '';
    } catch (err) {
      console.error('Error bulk-assigning entries to table:', err);
      toast.error('Failed to bulk-assign entries to table');
    }
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString || dateString === null || dateString === undefined) {
      return 'No date';
    }
    
    try {
      // Convert to string in case it's not already
      const dateStr = String(dateString).trim();
      
      // Handle PostgreSQL timestamp format: "2025-08-29 03:43:21.894974"
      let isoString = dateStr;
      
      // Convert space-separated format to ISO format
      if (dateStr.includes(' ') && !dateStr.includes('T')) {
        // Replace space with 'T'
        isoString = dateStr.replace(' ', 'T');
        
        // Truncate microseconds to milliseconds if present (6 digits to 3)
        if (isoString.includes('.')) {
          const [datePart, fractionalPart] = isoString.split('.');
          const milliseconds = fractionalPart.substring(0, 3);
          isoString = `${datePart}.${milliseconds}`;
        }
        
        // Add timezone if missing
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateStr, '->', isoString);
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }

  // Navigate back
  function navigateBack() {
    goto('/officers/manage-competitions');
  }

  // Handle access denied modal
  function handleAccessDenied() {
    showAccessDeniedModal = false;
    goto('/officers/manage-competitions');
  }

  // Export entries to CSV
  function exportToCSV() {
    // Use filtered entries if search is active, otherwise use selected entries or all entries
    const entriesToExport = selectedEntries.size > 0 
      ? filteredEntries.filter(entry => selectedEntries.has(entry.id))
      : filteredEntries;
    
    if (entriesToExport.length === 0) {
      toast.error('No entries to export');
      return;
    }

    // CSV headers
    const headers = [
      'Entry Number',
      'Member Name', 
      'Beer Name',
      'Category Number',
      'Category Name',
      'Subcategory Name',
      'Paid',
      'Submitted Date'
    ];

    // Convert entries to CSV format
    const csvRows = [
      headers.join(','), // Header row
      ...entriesToExport.map(entry => [
        entry.entry_number || '',
        `"${entry.members?.name || ''}"`, // Quoted for names with commas
        `"${entry.beer_name || ''}"`, // Quoted for beer names with commas
        `${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''}`,
        `"${entry.bjcp_category?.category_name || ''}"`,
        `"${entry.bjcp_category?.subcategory_name || ''}"`,
        entry.is_paid ? 'Yes' : 'No',
        formatDate(entry.submitted_at)
      ].join(','))
    ];

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${competition?.name || 'competition'}_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Print judging sheets for internal competition
  function printJudgingSheets() {
    const entriesToPrint = selectedEntries.size > 0 
      ? filteredEntries.filter(entry => selectedEntries.has(entry.id))
      : filteredEntries;
    
    if (entriesToPrint.length === 0) {
      toast.error('No entries to print judging sheets for');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate the judging sheet HTML
    const judgingSheetHtml = generateJudgingSheetHtml(entriesToPrint);
    
    printWindow.document.write(judgingSheetHtml);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  // Generate HTML for judging sheets
  function generateJudgingSheetHtml(entries) {
    const competitionName = competition?.name || 'Competition';
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Judging Sheet - ${competitionName}</title>
          <style>
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            
            body {
              font-family: 'DM Sans', Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .competition-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .judge-info {
              margin: 20px 0;
              border: 1px solid #666;
              padding: 15px;
            }
            
            .judge-line {
              display: inline-block;
              border-bottom: 1px solid #333;
              width: 200px;
              height: 20px;
              margin: 0 10px;
            }
            
            .entries-section {
              margin: 20px 0;
            }
            
            .entry-item {
              border: 1px solid #ccc;
              margin-bottom: 15px;
              padding: 10px;
              background-color: #fafafa;
            }
            
            .entry-header {
              font-weight: bold;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            
            .entry-number {
              font-size: 14px;
              color: #000;
            }
            
            .beer-style {
              color: var(--color-text-secondary);
              font-size: 11px;
            }
            
            .tasting-notes {
              margin-top: 10px;
            }
            
            .notes-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .notes-lines {
              border-bottom: 1px solid #ccc;
              height: 80px;
              margin-bottom: 10px;
            }
            
            .top-picks {
              margin-top: 40px;
              border: 2px solid #333;
              padding: 20px;
              background-color: #f0f0f0;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .top-picks-title {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 20px;
            }
            
            .pick-line {
              margin: 15px 0;
              font-size: 14px;
            }
            
            .pick-number {
              display: inline-block;
              border-bottom: 2px solid #333;
              width: 100px;
              height: 25px;
              margin-left: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="competition-title">${competitionName} - Judging Sheet</div>
            <div>Date: ${currentDate}</div>
          </div>
          
          <div class="judge-info">
            <strong>Judge Name:</strong> <span class="judge-line"></span>
            <strong style="margin-left: var(--space-10);">Signature:</strong> <span class="judge-line"></span>
          </div>
          
          <div class="entries-section">
            ${entries.map(entry => `
              <div class="entry-item">
                <div class="entry-header">
                  <div class="entry-number">Entry #${entry.entry_number}</div>
                  <div class="beer-style">
                    ${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''} - 
                    ${entry.bjcp_category?.category_name || 'Unknown Category'}${entry.bjcp_category?.subcategory_name ? ` - ${entry.bjcp_category.subcategory_name}` : ''}
                  </div>
                </div>
                ${entry.beer_notes ? `<div><strong>Additional Notes:</strong> ${entry.beer_notes}</div>` : ''}
                <div class="tasting-notes">
                  <div class="notes-label">Tasting Notes:</div>
                  <div class="notes-lines"></div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="top-picks">
            <div class="top-picks-title">Your Top 3 Picks</div>
            <div class="pick-line">
              <strong>1st Place Entry #:</strong> <span class="pick-number"></span>
            </div>
            <div class="pick-line">
              <strong>2nd Place Entry #:</strong> <span class="pick-number"></span>
            </div>
            <div class="pick-line">
              <strong>3rd Place Entry #:</strong> <span class="pick-number"></span>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Reactive statements
  $: filterAndSortEntries(), searchQuery, sortColumn, sortDirection;
  $: selectAll = selectedEntries.size === filteredEntries.length && filteredEntries.length > 0;
</script>

<style>

  .competition-info {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--color-brand-gold);
    margin-bottom: 2rem;
  }

  .competition-info h2 {
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input {
    flex: 1;
    min-width: 250px;
    padding: 0.75rem;
    border: 1px solid var(--color-gray-250);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }


  .selected-count {
    padding: 0.5rem 1rem;
    background: var(--color-warning-bg);
    border-radius: var(--radius-md);
    color: var(--color-warning-text);
    font-weight: 500;
  }

  .entries-table {
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
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  th:hover {
    background: var(--color-gray-150);
  }

  .sort-indicator {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-brand-gold);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-gray-150);
  }

  tr:hover {
    background: var(--color-gray-50);
  }

  .checkbox-cell {
    width: 50px;
  }

  .entry-number {
    font-weight: 600;
    color: var(--color-brand-gold);
  }

  .category-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--color-gray-200);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .payment-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    padding: 0;
    border: none;
    background: var(--color-gray-250);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: background 0.3s;
  }

  .toggle-switch.active {
    background: var(--color-success);
  }

  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  .toggle-switch.active::after {
    transform: translateX(24px);
  }


  /* Mobile Entry Cards */
  .entries-cards {
    display: none;
  }

  .entry-card {
    background: white;
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--color-brand-gold);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .entry-info h4 {
    margin: 0;
    color: var(--color-brand-gold);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .entry-info .beer-name {
    color: var(--color-text-primary);
    font-size: 1rem;
    margin: 0.25rem 0 0;
  }

  .entry-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .entry-details {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-gray-50);
    border-radius: var(--radius-sm);
  }

  .detail-group {
    display: flex;
    flex-direction: column;
  }

  .detail-group .label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .detail-group .value {
    font-size: 1rem;
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .member-info {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--color-info-bg-subtle);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-info-border);
  }

  .member-info h5 {
    margin: 0 0 0.5rem;
    color: var(--color-info-hover);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .member-info .name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .member-info .email {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .payment-status-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-sm);
    margin-top: 1rem;
  }

  .category-mobile {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: var(--color-gray-200);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input {
      width: 100%;
    }

    .entries-table {
      display: none;
    }

    .entries-cards {
      display: block;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .entry-details {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .entry-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .entry-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  /* Ensure table is hidden on mobile */
  @media (min-width: 769px) {
    .entries-cards {
      display: none;
    }

    .entries-table {
      display: block;
    }
  }

  /* Bulk action bar */
  .bulk-action-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--color-warning-bg);
    border: 1px solid var(--color-warning-border);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .bulk-action-bar label {
    font-weight: 500;
    color: var(--color-warning-text);
    white-space: nowrap;
  }

  .bulk-action-bar select {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
  }

  /* Table cell select */
  .table-select {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    min-width: 130px;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: var(--radius-lg);
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .modal h2 {
    color: var(--color-brand-gold);
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .modal p {
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .modal-button {
    background: var(--color-brand-gold);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: var(--radius-md);
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .modal-button:hover {
    background: var(--color-alert-orange);
  }

  .category-sub {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
  }
</style>

<!-- Access Denied Modal -->
{#if showAccessDeniedModal}
  <div class="modal-overlay">
    <div class="modal">
      <h2>🔒 Access Restricted</h2>
      <p>
        Only Competition Directors can access competition entries. This restriction helps maintain the integrity of competitions by ensuring that brewer information remains confidential until after judging is complete.
      </p>
      <p>
        If you need access to this page, please contact an administrator to have your role updated to Competition Director.
      </p>
      <button class="modal-button" on:click={handleAccessDenied}>
        Return to Competitions
      </button>
    </div>
  </div>
{/if}

{#if isAuthorized}
<Container size="xl">
  <Hero title="Competition Entries" subtitle="Manage entries and print labels" icon="📋" center={true} />

  {#if isLoading}
    <LoadingSpinner message="Loading entries..." />
  {:else if competition}
    <!-- Competition Info -->
    <div class="competition-info">
      <h2>{competition.name}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Total Entries</span>
          <span class="info-value">{entries.length}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Paid Entries</span>
          <span class="info-value">{entries.filter(e => e.is_paid).length}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Entry Fee</span>
          <span class="info-value">${competition.entry_fee || 0}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total Fees</span>
          <span class="info-value">${entries.filter(e => e.is_paid).length * (competition.entry_fee || 0)}</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <input
        type="text"
        class="search-input"
        placeholder="Search entries..."
        bind:value={searchQuery}
      />
      {#if selectedEntries.size > 0}
        <span class="selected-count">{selectedEntries.size} selected</span>
      {/if}
      <Button
        variant="primary"
        on:click={printLabels}
        disabled={filteredEntries.length === 0}
      >
        🖨️ Print Labels {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </Button>
      <Button
        variant="success"
        on:click={exportToCSV}
        disabled={filteredEntries.length === 0}
      >
        📊 Export CSV {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </Button>
      <Button
        variant="info"
        on:click={printJudgingSheets}
        disabled={filteredEntries.length === 0}
      >
        📝 Print Judging Sheets {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </Button>
      <Button variant="secondary" on:click={navigateBack}>
        ← Back
      </Button>
    </div>

    <!-- Bulk action bar (shown when entries are selected and tables exist) -->
    {#if selectedEntries.size > 0 && tables.length > 0}
      <div class="bulk-action-bar">
        <label for="bulk-table-select">Assign {selectedEntries.size} selected to table:</label>
        <select id="bulk-table-select" bind:value={bulkTableId}>
          <option value="">— No Table —</option>
          {#each tables as table}
            <option value={table.id}>Table {table.table_number}: {table.table_name}</option>
          {/each}
        </select>
        <Button variant="primary" on:click={bulkAssignToTable}>
          Apply
        </Button>
      </div>
    {/if}

    {#if filteredEntries.length === 0}
      <EmptyState
        icon="📋"
        title="No entries found"
        message={searchQuery ? 'Try adjusting your search' : 'No entries have been submitted yet'}
      />
    {:else}
      <!-- Entries Table -->
      <div class="entries-table">
        <table>
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  on:change={toggleSelectAll}
                />
              </th>
              <th on:click={() => handleSort('entry_number')}>
                Entry #
                {#if sortColumn === 'entry_number'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              <th on:click={() => handleSort('member_name')}>
                Member
                {#if sortColumn === 'member_name'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              <th on:click={() => handleSort('beer_name')}>
                Beer Name
                {#if sortColumn === 'beer_name'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              <th on:click={() => handleSort('category')}>
                Category
                {#if sortColumn === 'category'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              <th>
                Style
              </th>
              <th on:click={() => handleSort('paid')}>
                Paid
                {#if sortColumn === 'paid'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              <th on:click={() => handleSort('submitted_at')}>
                Submitted
                {#if sortColumn === 'submitted_at'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </th>
              {#if tables.length > 0}
                <th>Table</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each filteredEntries as entry}
              <tr>
                <td class="checkbox-cell">
                  <input 
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    on:change={() => toggleSelection(entry.id)}
                  />
                </td>
                <td>
                  <span class="entry-number">{entry.entry_number}</span>
                </td>
                <td>
                  <div>{entry.members?.name}</div>
                  <small>{entry.members?.email}</small>
                </td>
                <td>{entry.beer_name || '-'}</td>
                <td>
                  {#if entry.bjcp_category}
                    {entry.bjcp_category.category_number} {entry.bjcp_category.category_name}
                  {:else}
                    -
                  {/if}
                </td>
                <td>
                  <span class="category-badge">
                    {entry.bjcp_category?.category_number || ''}{entry.bjcp_category?.subcategory_letter || ''}
                  </span>
                  {#if entry.bjcp_category?.subcategory_name}
                    <br><small>{entry.bjcp_category.subcategory_name}</small>
                  {/if}
                </td>
                <td>
                  <div class="payment-toggle">
                    <button
                      type="button"
                      class="toggle-switch {entry.is_paid ? 'active' : ''}"
                      role="switch"
                      aria-checked={entry.is_paid}
                      aria-label="Mark entry as paid"
                      on:click={() => updatePaymentStatus(entry.id, !entry.is_paid)}
                    ></button>
                    <span>{entry.is_paid ? 'Paid' : 'Unpaid'}</span>
                  </div>
                </td>
                <td>{formatDate(entry.submitted_at)}</td>
                {#if tables.length > 0}
                  <td>
                    <select
                      class="table-select"
                      value={entry.table_id || ''}
                      on:change={(e) => assignEntryToTable(entry.id, e.target.value || null)}
                    >
                      <option value="">No Table</option>
                      {#each tables as table}
                        <option value={table.id}>Table {table.table_number}: {table.table_name}</option>
                      {/each}
                    </select>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="entries-cards">
        {#each filteredEntries as entry}
          <div class="entry-card">
            <!-- Header with entry number and actions -->
            <div class="entry-header">
              <div class="entry-info">
                <h4>#{entry.entry_number}</h4>
                <div class="beer-name">{entry.beer_name || 'No name provided'}</div>
              </div>
              <div class="entry-actions">
                <input 
                  type="checkbox"
                  checked={selectedEntries.has(entry.id)}
                  on:change={() => toggleSelection(entry.id)}
                />
              </div>
            </div>

            <!-- Entry details grid -->
            <div class="entry-details">
              <div class="detail-group">
                <span class="label">Category</span>
                <div class="value">
                  {#if entry.bjcp_category}
                    {entry.bjcp_category.category_number} {entry.bjcp_category.category_name}
                  {:else}
                    -
                  {/if}
                </div>
              </div>
              <div class="detail-group">
                <span class="label">Style</span>
                <div class="value">
                  <span class="category-mobile">
                    {entry.bjcp_category?.category_number || ''}{entry.bjcp_category?.subcategory_letter || ''}
                  </span>
                  {#if entry.bjcp_category?.subcategory_name}
                    <br><small class="category-sub">{entry.bjcp_category.subcategory_name}</small>
                  {/if}
                </div>
              </div>
              <div class="detail-group">
                <span class="label">Submitted</span>
                <span class="value">{formatDate(entry.submitted_at)}</span>
              </div>
            </div>

            <!-- Member information -->
            <div class="member-info">
              <h5>Brewer Information</h5>
              <div class="name">{entry.members?.name}</div>
              <div class="email">{entry.members?.email}</div>
            </div>

            <!-- Payment status with toggle -->
            <div class="payment-status-mobile">
              <div class="payment-toggle">
                <button
                  type="button"
                  class="toggle-switch {entry.is_paid ? 'active' : ''}"
                  role="switch"
                  aria-checked={entry.is_paid}
                  aria-label="Mark entry as paid"
                  on:click={() => updatePaymentStatus(entry.id, !entry.is_paid)}
                ></button>
                <span>{entry.is_paid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</Container>
{/if}