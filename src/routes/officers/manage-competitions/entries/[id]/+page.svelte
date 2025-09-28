<!-- src/routes/officers/manage-competitions/entries/[id]/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';

  let showAccessDeniedModal = false;

  // Check Competition Director status - only Comp Directors can access entries
  $: if ($userProfile && $userProfile.role !== 'competition_director') {
    showAccessDeniedModal = true;
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

  onMount(() => {
    loadCompetitionAndEntries();
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
      filterAndSortEntries();
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Failed to load competition entries');
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
      alert('Failed to update payment status');
    }
  }

// Fixed print labels function for competition entries
function printLabels() {
  const entriesToPrint = selectedEntries.size > 0 
    ? filteredEntries.filter(e => selectedEntries.has(e.id))
    : filteredEntries;
  
  if (entriesToPrint.length === 0) {
    alert('No entries selected for printing');
    return;
  }

  // Create print window
  const printWindow = window.open('', '_blank');
  
  // Generate label HTML - create 3 copies of each label (for 3 bottles per entry)
  const labelsHtml = entriesToPrint.flatMap(entry => {
    const labelTemplate = `
      <div class="label">
        <div class="label-header">
          <strong>${competition?.name || 'Competition'}</strong>
        </div>
        <div class="entry-number">
          Entry #: <span>${entry.entry_number}</span>
        </div>
        <div class="beer-style">
          Style: <span>${entry.bjcp_category?.category_number || ''}${entry.bjcp_category?.subcategory_letter || ''}</span> - ${entry.bjcp_category?.category_name || ''}
          ${entry.bjcp_category?.subcategory_name ? `<br><small>${entry.bjcp_category.subcategory_name}</small>` : ''}
          ${entry.beer_notes ? `<br><small>Special: ${entry.beer_notes}</small>` : ''}
        </div>
        ${entry.notes ? `
          <div class="notes">
            Notes: ${entry.notes}
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
      <title>Competition Entry Labels</title>
      <style>
        @page {
          size: 8.5in 11in;
          margin: 0.5in;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .labels-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.1875in;
          justify-content: flex-start;
        }
        .label {
          width: 2.25in;
          height: 2.25in;
          padding: 0.125in;
          box-sizing: border-box;
          border: 1px solid #000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-bottom: 0.1875in;
          break-inside: avoid;
        }
        .label-header {
          font-size: 10pt;
          text-align: center;
          margin-bottom: 0.1in;
          border-bottom: 1px solid #000;
          padding-bottom: 0.05in;
        }
        .entry-number {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 0.1in;
        }
        .entry-number span {
          font-size: 18pt;
          color: #ff3e00;
        }
        .beer-style {
          font-size: 10pt;
          margin-bottom: 0.1in;
        }
        .beer-style span {
          font-weight: bold;
          font-size: 12pt;
        }
        .beer-style small {
          font-size: 9pt;
        }
        .special, .notes {
          font-size: 9pt;
          margin-top: 0.05in;
          padding-top: 0.05in;
          border-top: 1px solid #ccc;
        }
        @media print {
          .label {
            border: 1px solid #000 !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="labels-container">
        ${labelsHtml}
      </div>
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
      alert('No entries to export');
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
      alert('No entries to print judging sheets for');
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
              font-family: Arial, sans-serif;
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
              color: #666;
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
            <strong style="margin-left: 40px;">Signature:</strong> <span class="judge-line"></span>
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
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .hero h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .hero h1 .emoji {
    font-size: 1em;
  }

  .hero .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
  }

  .competition-info {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    margin-bottom: 2rem;
  }

  .competition-info h2 {
    margin: 0 0 1rem 0;
    color: #333;
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
    color: #666;
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
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
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
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

  .btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .selected-count {
    padding: 0.5rem 1rem;
    background: #fef3c7;
    border-radius: 6px;
    color: #92400e;
    font-weight: 500;
  }

  .entries-table {
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
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  th:hover {
    background: #ebebeb;
  }

  .sort-indicator {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #ff3e00;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background: #f9f9f9;
  }

  .checkbox-cell {
    width: 50px;
  }

  .entry-number {
    font-weight: 600;
    color: #ff3e00;
  }

  .category-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border-radius: 4px;
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
    background: #ddd;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .toggle-switch.active {
    background: #059669;
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

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
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

  /* Mobile Entry Cards */
  .entries-cards {
    display: none;
  }

  .entry-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
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
    color: #ff3e00;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .entry-info .beer-name {
    color: #333;
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
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
  }

  .detail-group {
    display: flex;
    flex-direction: column;
  }

  .detail-group .label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .detail-group .value {
    font-size: 1rem;
    color: #333;
    font-weight: 600;
  }

  .member-info {
    margin-top: 1rem;
    padding: 1rem;
    background: #f0f9ff;
    border-radius: 4px;
    border: 1px solid #bfdbfe;
  }

  .member-info h5 {
    margin: 0 0 0.5rem;
    color: #1d4ed8;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .member-info .name {
    font-weight: 600;
    color: #333;
  }

  .member-info .email {
    color: #666;
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
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-top: 1rem;
  }

  .category-mobile {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border-radius: 4px;
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
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .modal h2 {
    color: #ff3e00;
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .modal p {
    color: #333;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .modal-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .modal-button:hover {
    background: #e63600;
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

<div class="container">
  <!-- Hero Section -->
  <div class="hero">
    <h1><span class="emoji">📋</span> Competition Entries</h1>
    <p class="subtitle">Manage entries and print labels</p>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading entries...</p>
    </div>
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
      <button 
        class="btn btn-primary"
        on:click={printLabels}
        disabled={filteredEntries.length === 0}
      >
        🖨️ Print Labels {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </button>
      <button 
        class="btn btn-success"
        on:click={exportToCSV}
        disabled={filteredEntries.length === 0}
      >
        📊 Export CSV {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </button>
      <button 
        class="btn btn-info"
        on:click={printJudgingSheets}
        disabled={filteredEntries.length === 0}
      >
        📝 Print Judging Sheets {selectedEntries.size > 0 ? `(${selectedEntries.size})` : '(All)'}
      </button>
      <button class="btn btn-secondary" on:click={navigateBack}>
        ← Back
      </button>
    </div>

    {#if filteredEntries.length === 0}
      <div class="empty-state">
        <h3>No entries found</h3>
        <p>
          {#if searchQuery}
            Try adjusting your search
          {:else}
            No entries have been submitted yet
          {/if}
        </p>
      </div>
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
                  <span class="category-badge">
                    {entry.bjcp_category?.category_number || ''}{entry.bjcp_category?.subcategory_letter || ''}
                  </span>
                  {#if entry.bjcp_category?.category_name}
                    <br><small>{entry.bjcp_category.category_name}</small>
                  {/if}
                </td>
                <td>
                  <div class="payment-toggle">
                    <div 
                      class="toggle-switch {entry.is_paid ? 'active' : ''}"
                      on:click={() => updatePaymentStatus(entry.id, !entry.is_paid)}
                    ></div>
                    <span>{entry.is_paid ? 'Paid' : 'Unpaid'}</span>
                  </div>
                </td>
                <td>{formatDate(entry.submitted_at)}</td>
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
                  <span class="category-mobile">
                    {entry.bjcp_category?.category_number || ''}{entry.bjcp_category?.subcategory_letter || ''}
                  </span>
                  {#if entry.bjcp_category?.category_name}
                    <br><small style="color: #666; font-size: 0.8rem;">{entry.bjcp_category.category_name}</small>
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
                <div 
                  class="toggle-switch {entry.is_paid ? 'active' : ''}"
                  on:click={() => updatePaymentStatus(entry.id, !entry.is_paid)}
                ></div>
                <span>{entry.is_paid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>