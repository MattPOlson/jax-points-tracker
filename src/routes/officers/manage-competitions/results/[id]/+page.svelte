<!-- src/routes/officers/manage-competitions/results/[id]/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  
  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let competition = null;
  let entries = [];
  let filteredEntries = [];
  let categories = [];
  let isLoading = true;
  let isSaving = false;
  let searchQuery = '';
  let categoryFilter = 'all';
  let statusFilter = 'all';
  let unsavedChanges = new Set();

  // Results tracking
  let resultsData = new Map();

  // Check if current user is Comp Director for displaying brewer names
  $: isCompDirector = $userProfile?.role === 'competition_director';

  // Helper function to get brewer name display
  function getBrewerNameDisplay(brewerName) {
    if (isCompDirector) {
      return brewerName || 'Unknown';
    }
    return 'Hidden'; // Hidden for non-Comp Directors
  }

  // Helper function to get brewer email display
  function getBrewerEmailDisplay(brewerEmail) {
    if (isCompDirector) {
      return brewerEmail || '';
    }
    return 'Hidden'; // Hidden for non-Comp Directors
  }

  // Helper function to get CSS class for brewer name
  function getBrewerNameClass() {
    return isCompDirector ? '' : 'brewer-name-hidden';
  }

  // Helper function to get beer name display
  function getBeerNameDisplay(beerName) {
    if (isCompDirector) {
      return beerName || 'Unknown Beer';
    }
    return 'Hidden'; // Hidden for non-Comp Directors
  }

  // Helper functions for ranking points calculation
  function getPointsForRanking(rankPosition) {
    // Point system: 1st=3pts, 2nd=2pts, 3rd=1pt, others=0pts
    switch (rankPosition) {
      case 1: return 3;
      case 2: return 2;
      case 3: return 1;
      default: return 0;
    }
  }

  function calculateEntryPoints(entryId, categoryId, rankings, rankingGroups) {
    // Get all rankings for this entry from all judges
    let entryRankings = [];
    
    // Check if entry belongs to a custom ranking group
    let groupId = null;
    for (const group of rankingGroups) {
      let categoryIds;
      try {
        categoryIds = Array.isArray(group.bjcp_category_ids) 
          ? group.bjcp_category_ids 
          : JSON.parse(group.bjcp_category_ids);
      } catch (e) {
        console.warn('Failed to parse bjcp_category_ids for group:', group.id);
        continue;
      }
      
      if (categoryIds.includes(categoryId)) {
        groupId = group.id;
        break;
      }
    }
    
    if (groupId) {
      // For custom ranking groups
      entryRankings = rankings.filter(r => 
        r.entry_id === entryId && r.ranking_group_id === groupId
      );
    } else {
      // For individual categories
      entryRankings = rankings.filter(r => 
        r.entry_id === entryId && r.bjcp_category_id === categoryId
      );
    }

    // Calculate total points from all judges
    const totalPoints = entryRankings.reduce((sum, ranking) => {
      return sum + getPointsForRanking(ranking.rank_position);
    }, 0);

    return {
      totalPoints,
      judgeCount: entryRankings.length,
      rankings: entryRankings
    };
  }

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

      // Load entries with separate queries to avoid schema cache issues
      const { data: entriesData, error: entriesError } = await supabase
        .from('competition_entries')
        .select('*')
        .eq('competition_id', competitionId)
        .order('entry_number');
      
      if (entriesError) throw entriesError;

      if (!entriesData || entriesData.length === 0) {
        entries = [];
        filteredEntries = [];
        isLoading = false;
        return;
      }

      // Get member data
      const memberIds = [...new Set(entriesData.map(entry => entry.member_id))];
      const { data: membersData } = await supabase
        .from('members')
        .select('id, name, email')
        .in('id', memberIds);

      // Get category data  
      const categoryIds = [...new Set(entriesData.map(entry => entry.bjcp_category_id).filter(Boolean))];
      const { data: categoriesData } = await supabase
        .from('bjcp_categories')
        .select('id, category_name, category_number, subcategory_letter, subcategory_name')
        .in('id', categoryIds);

      // Get existing results
      const { data: resultsData, error: resultsError } = await supabase
        .from('competition_results')
        .select('*')
        .eq('competition_id', competitionId);

      if (resultsError) {
        console.warn('No existing results found:', resultsError);
      }

      // Load rankings data
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('competition_rankings')
        .select(`
          *,
          entry:competition_entries!inner(id, entry_number, beer_name),
          judge:members!competition_rankings_judge_id_fkey(id, name),
          category:bjcp_categories(category_name, category_number, subcategory_letter),
          ranking_group:competition_ranking_groups(id, group_name, group_description)
        `)
        .eq('competition_id', competitionId)
        .order('bjcp_category_id')
        .order('rank_position');

      const rankings = rankingsData || [];

      // Load ranking groups for custom category system
      const { data: groupsData, error: groupsError } = await supabase
        .from('competition_ranking_groups')
        .select('*')
        .eq('competition_id', competitionId)
        .order('group_order');

      const rankingGroups = groupsData || [];

      // Combine all data manually
      entries = entriesData.map(entry => {
        const member = membersData?.find(m => m.id === entry.member_id);
        const category = categoriesData?.find(c => c.id === entry.bjcp_category_id);
        const result = resultsData?.find(r => r.entry_id === entry.id);

        // Calculate ranking points for this entry
        const rankingPoints = calculateEntryPoints(entry.id, entry.bjcp_category_id, rankings, rankingGroups);

        return {
          ...entry,
          member_name: member?.name || 'Unknown',
          member_email: member?.email || '',
          category_name: category?.category_name || 'Unknown Category',
          category_number: category?.category_number || '',
          subcategory_letter: category?.subcategory_letter || '',
          subcategory_name: category?.subcategory_name || '',
          category_display: category 
            ? `${category.category_number}${category.subcategory_letter || ''} - ${category.category_name}`
            : 'Unknown Category',
          // Results data
          score: result?.score || '',
          placement: result?.placement || '',
          judge_notes: result?.judge_notes || '',
          has_results: !!result,
          // Ranking points
          ranking_points: rankingPoints.totalPoints,
          judge_count: rankingPoints.judgeCount
        };
      });

      // Extract unique categories for filter
      categories = [...new Set(entries.map(e => ({
        value: `${e.category_number}${e.subcategory_letter}`,
        label: e.category_display
      }))).values()].sort((a, b) => a.value.localeCompare(b.value));

      filterEntries();
      
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Failed to load competition entries');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  // Filter entries based on search and filters
  function filterEntries() {
    let filtered = [...entries];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const currentUserProfile = $userProfile;
      const isCompDirector = currentUserProfile?.role === 'competition_director';

      filtered = filtered.filter(entry =>
        entry.entry_number?.toLowerCase().includes(query) ||
        entry.category_display?.toLowerCase().includes(query) ||
        // Only allow member name/email/beer name search for Competition Directors
        (isCompDirector && (
          entry.member_name?.toLowerCase().includes(query) ||
          entry.member_email?.toLowerCase().includes(query) ||
          entry.beer_name?.toLowerCase().includes(query)
        ))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(entry => 
        `${entry.category_number}${entry.subcategory_letter}` === categoryFilter
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'complete') {
        filtered = filtered.filter(entry => entry.has_results && entry.score);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(entry => !entry.has_results || !entry.score);
      }
    }
    
    filteredEntries = filtered;
  }

  // Update entry results
  function updateEntryResults(entryId, field, value) {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      entry[field] = value;
      unsavedChanges.add(entryId);
      // Trigger Svelte reactivity for Set
      unsavedChanges = unsavedChanges;
      
      // Update has_results status
      entry.has_results = entry.score && entry.score > 0;
      
      // Re-filter to update status indicators
      filterEntries();
    }
  }

  // Save individual entry results
  async function saveEntryResults(entryId, skipToast = false) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) {
      throw new Error(`Entry with ID ${entryId} not found`);
    }

    const wasCalledFromSaveAll = skipToast;
    if (!wasCalledFromSaveAll) {
      isSaving = true;
    }

    try {
      const resultData = {
        competition_id: competitionId,
        entry_id: entryId,
        score: entry.score || null,
        placement: entry.placement || null,
        judge_notes: entry.judge_notes || null,
        updated_at: new Date().toISOString()
      };

      // Check if result exists
      const { data: existingResult } = await supabase
        .from('competition_results')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('entry_id', entryId)
        .single();

      let error;
      if (existingResult) {
        // Update existing result
        const result = await supabase
          .from('competition_results')
          .update(resultData)
          .eq('id', existingResult.id);
        error = result.error;
      } else {
        // Insert new result
        const result = await supabase
          .from('competition_results')
          .insert([resultData]);
        error = result.error;
      }

      if (error) throw error;

      unsavedChanges.delete(entryId);
      // Trigger Svelte reactivity for Set
      unsavedChanges = unsavedChanges;
      entry.has_results = true;
      
      // Show success feedback only for individual saves
      if (!skipToast) {
        showToast('Results saved successfully', 'success');
      }

    } catch (err) {
      console.error('Error saving results:', err);
      if (!skipToast) {
        alert('Failed to save results');
      }
      throw err; // Re-throw for saveAllResults to handle
    } finally {
      if (!wasCalledFromSaveAll) {
        isSaving = false;
      }
    }
  }

  // Save all results
  async function saveAllResults() {
    if (unsavedChanges.size === 0) {
      alert('No unsaved changes to save');
      return;
    }

    try {
      isSaving = true;
      let successCount = 0;
      let errorCount = 0;
      
      // Process each entry sequentially to avoid race conditions
      for (const entryId of Array.from(unsavedChanges)) {
        try {
          await saveEntryResults(entryId, true);
          successCount++;
        } catch (err) {
          console.error(`Error saving entry ${entryId}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        showToast(`All ${successCount} results saved successfully`, 'success');
      } else {
        showToast(`${successCount} results saved, ${errorCount} failed`, errorCount > successCount ? 'error' : 'success');
      }
    } catch (err) {
      console.error('Error saving all results:', err);
      alert('Failed to save all results');
    } finally {
      isSaving = false;
    }
  }

  // Publish results (make them visible to public)
  async function publishResults() {
    if (!confirm('Are you sure you want to publish these results? This will make them visible to all members.')) {
      return;
    }

    try {
      isSaving = true;

      const { error } = await supabase
        .from('competitions')
        .update({ 
          results_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      if (error) throw error;

      competition.results_published = true;
      showToast('Results published successfully', 'success');

    } catch (err) {
      console.error('Error publishing results:', err);
      alert('Failed to publish results');
    } finally {
      isSaving = false;
    }
  }

  // Simple toast notification
  function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#6b7280'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  // Get completion stats
  $: completionStats = {
    total: entries.length,
    completed: entries.filter(e => e.has_results && e.score).length,
    get percentage() {
      return this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;
    }
  };

  // Reactive statements
  $: filterEntries(), searchQuery, categoryFilter, statusFilter;
</script>

<style>

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
    text-transform: none;
    font-size: 1.5rem;
    font-weight: 600;
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

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-completed {
    background: #dcfce7;
    color: #166534;
  }

  .status-judging {
    background: #fef3c7;
    color: #92400e;
  }

  .status-open {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input, .filter-select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
  }

  .search-input {
    flex: 1;
    min-width: 250px;
  }

  .filter-select {
    min-width: 150px;
  }


  .results-table {
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
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }

  tr:hover {
    background: #f9f9f9;
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

  .score-input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    width: 80px;
  }

  .placement-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    background: white;
    width: 120px;
  }

  .notes-input {
    width: 100%;
    min-height: 60px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    resize: vertical;
    font-family: inherit;
  }

  .status-complete {
    color: #059669;
  }

  .status-pending {
    color: #dc2626;
  }

  .unsaved-indicator {
    color: #dc2626;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }


  /* Entry cards for mobile */
  .entry-cards {
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
    align-items: center;
    margin-bottom: 1rem;
  }

  .results-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input, .filter-select {
      width: 100%;
    }

    .results-table {
      display: none;
    }

    .entry-cards {
      display: block;
    }

    .results-inputs {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
  }

  /* Brewer name privacy styles */
  .brewer-name-hidden {
    color: #999;
    font-style: italic;
    font-weight: normal;
  }
</style>

<Container size="xl">
  <Hero title="Enter Results" subtitle="Record judging scores and placements" icon="🏆" center={true} />

  {#if isLoading}
    <LoadingSpinner message="Loading competition entries..." />
  {:else if competition}
    <!-- Competition Info -->
    <div class="competition-info">
      <h2>{competition.name}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Status</span>
          <span class="info-value">
            <span class="status-badge {competition.results_published ? 'status-completed' : 'status-judging'}">
              {competition.results_published ? 'Results Published' : 'Judging In Progress'}
            </span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Total Entries</span>
          <span class="info-value">{completionStats.total}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Results Entered</span>
          <span class="info-value">{completionStats.completed} of {completionStats.total} ({completionStats.percentage}%)</span>
        </div>
        <div class="info-item">
          <span class="info-label">Unsaved Changes</span>
          <span class="info-value {unsavedChanges.size > 0 ? 'status-pending' : 'status-complete'}">{unsavedChanges.size}</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <input
        type="text"
        class="search-input"
        placeholder={isCompDirector ? "Search by entry number, member, or beer name..." : "Search by entry number or category..."}
        bind:value={searchQuery}
      />
      <select class="filter-select" bind:value={categoryFilter}>
        <option value="all">All Categories</option>
        {#each categories as category}
          <option value={category.value}>{category.label}</option>
        {/each}
      </select>
      <select class="filter-select" bind:value={statusFilter}>
        <option value="all">All Status</option>
        <option value="pending">Results Pending</option>
        <option value="complete">Results Complete</option>
      </select>
      <Button
        variant="success"
        on:click={saveAllResults}
        disabled={isSaving || unsavedChanges.size === 0}
      >
        {isSaving ? 'Saving...' : `Save All Results ${unsavedChanges.size > 0 ? `(${unsavedChanges.size})` : ''}`}
      </Button>
      <Button
        variant="primary"
        on:click={publishResults}
        disabled={isSaving || competition.results_published}
      >
        {competition.results_published ? 'Results Published' : 'Publish Results'}
      </Button>
      <Button variant="secondary" on:click={() => goto('/officers/manage-competitions')}>
        Back
      </Button>
    </div>

    {#if filteredEntries.length === 0}
      <EmptyState
        icon="🏆"
        title="No entries found"
        message={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No entries have been submitted yet'}
      />
    {:else}
      <!-- Desktop Table View -->
      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>Entry #</th>
              <th>Member</th>
              <th>Beer Name</th>
              <th>Category</th>
              <th>Ranking Points</th>
              <th>Score</th>
              <th>Placement</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredEntries as entry}
              <tr>
                <td><span class="entry-number">{entry.entry_number}</span></td>
                <td>
                  <div class="{getBrewerNameClass()}">{getBrewerNameDisplay(entry.member_name)}</div>
                  <small class="{getBrewerNameClass()}">{getBrewerEmailDisplay(entry.member_email)}</small>
                </td>
                <td class="{getBrewerNameClass()}">{getBeerNameDisplay(entry.beer_name)}</td>
                <td><span class="category-badge">{entry.category_display}</span></td>
                <td>
                  <span style="font-weight: 600; color: {entry.ranking_points > 0 ? '#059669' : '#666'};">
                    {entry.ranking_points} {entry.ranking_points === 1 ? 'pt' : 'pts'}
                  </span>
                  {#if entry.judge_count > 0}
                    <br><small style="color: #666;">{entry.judge_count} judge{entry.judge_count === 1 ? '' : 's'}</small>
                  {/if}
                </td>
                <td>
                  <input
                    type="number"
                    class="score-input"
                    placeholder="0-50"
                    min="0"
                    max="50"
                    bind:value={entry.score}
                    on:input={() => updateEntryResults(entry.id, 'score', entry.score)}
                  />
                </td>
                <td>
                  <select 
                    class="placement-select"
                    bind:value={entry.placement}
                    on:change={() => updateEntryResults(entry.id, 'placement', entry.placement)}
                  >
                    <option value="">No Placement</option>
                    <option value="1">1st Place</option>
                    <option value="2">2nd Place</option>
                    <option value="3">3rd Place</option>
                    <option value="HM">Honorable Mention</option>
                  </select>
                </td>
                <td>
                  <span class="{entry.has_results && entry.score ? 'status-complete' : 'status-pending'}">
                    {entry.has_results && entry.score ? '✅ Complete' : '❌ Pending'}
                  </span>
                  {#if unsavedChanges.has(entry.id)}
                    <span class="unsaved-indicator">*</span>
                  {/if}
                </td>
                <td>
                  <button 
                    class="btn btn-primary" 
                    style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
                    on:click={() => saveEntryResults(entry.id)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="entry-cards">
        {#each filteredEntries as entry}
          <div class="entry-card">
            <div class="entry-header">
              <span class="entry-number">Entry #{entry.entry_number}</span>
              <span class="{entry.has_results && entry.score ? 'status-complete' : 'status-pending'}">
                {entry.has_results && entry.score ? '✅ Complete' : '❌ Pending'}
                {#if unsavedChanges.has(entry.id)}
                  <span class="unsaved-indicator">*</span>
                {/if}
              </span>
            </div>
            <div style="margin-bottom: 1rem;">
              <div class="{getBrewerNameClass()}"><strong>{getBrewerNameDisplay(entry.member_name)}</strong></div>
              <div class="{getBrewerNameClass()}">{getBeerNameDisplay(entry.beer_name)}</div>
              <span class="category-badge">{entry.category_display}</span>
              <div style="margin-top: 0.5rem;">
                <span style="font-size: 0.875rem; color: #666;">Ranking Points: </span>
                <span style="font-weight: 600; color: {entry.ranking_points > 0 ? '#059669' : '#666'};">
                  {entry.ranking_points} {entry.ranking_points === 1 ? 'pt' : 'pts'}
                </span>
                {#if entry.judge_count > 0}
                  <span style="font-size: 0.875rem; color: #666;"> ({entry.judge_count} judge{entry.judge_count === 1 ? '' : 's'})</span>
                {/if}
              </div>
            </div>
            <div class="results-inputs">
              <div>
                <label style="display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #666;">Score (0-50)</label>
                <input
                  type="number"
                  class="score-input"
                  placeholder="Enter score"
                  min="0"
                  max="50"
                  style="width: 100%;"
                  bind:value={entry.score}
                  on:input={() => updateEntryResults(entry.id, 'score', entry.score)}
                />
              </div>
              <div>
                <label style="display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #666;">Placement</label>
                <select 
                  class="placement-select" 
                  style="width: 100%;"
                  bind:value={entry.placement}
                  on:change={() => updateEntryResults(entry.id, 'placement', entry.placement)}
                >
                  <option value="">No Placement</option>
                  <option value="1">1st Place</option>
                  <option value="2">2nd Place</option>
                  <option value="3">3rd Place</option>
                  <option value="HM">Honorable Mention</option>
                </select>
              </div>
            </div>
            <div style="margin-top: 1rem;">
              <label style="display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #666;">Judge Notes</label>
              <textarea
                class="notes-input"
                placeholder="Optional judging notes..."
                bind:value={entry.judge_notes}
                on:input={() => updateEntryResults(entry.id, 'judge_notes', entry.judge_notes)}
              ></textarea>
            </div>
            <button 
              class="btn btn-primary" 
              style="margin-top: 1rem; width: 100%;"
              on:click={() => saveEntryResults(entry.id)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Results...' : 'Save Results'}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</Container>