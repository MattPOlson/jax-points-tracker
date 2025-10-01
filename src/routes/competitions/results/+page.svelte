<!-- src/routes/competitions/results/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Badge } from '$lib/components/ui';
  
  let competitions = [];
  let selectedCompetition = null;
  let results = [];
  let isLoading = true;
  let isLoadingResults = false;
  let error = null;

  onMount(() => {
    loadPublishedCompetitions();
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

  // Load competitions with published results
  async function loadPublishedCompetitions() {
    isLoading = true;
    error = null;

    try {
      console.log('Loading published competitions...');
      
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select('*')
        .eq('results_published', true)
        .order('judging_date', { ascending: false });

      if (competitionsError) throw competitionsError;

      competitions = competitionsData || [];
      console.log('Loaded', competitions.length, 'published competitions');

      // Auto-select the most recent competition if available
      if (competitions.length > 0) {
        selectedCompetition = competitions[0];
        await loadResultsForCompetition(competitions[0]);
      }

    } catch (err) {
      console.error('Error loading competitions:', err);
      error = err.message || 'Failed to load competitions';
    } finally {
      isLoading = false;
    }
  }

  // Handle competition selection from dropdown
  async function handleCompetitionSelect(event) {
    const competitionId = event.target.value;
    if (!competitionId) {
      selectedCompetition = null;
      results = [];
      return;
    }

    const competition = competitions.find(c => c.id === competitionId);
    if (competition) {
      selectedCompetition = competition;
      await loadResultsForCompetition(competition);
    }
  }

  // Load results for selected competition
  async function loadResultsForCompetition(competition) {
    isLoadingResults = true;
    error = null;

    try {
      console.log('Loading results for competition:', competition.name);

      // Get competition results with entry details (excluding judge notes for privacy)
      const { data: resultsData, error: resultsError } = await supabase
        .from('competition_results')
        .select('id, competition_id, entry_id, score, placement, created_at, updated_at')
        .eq('competition_id', competition.id);

      if (resultsError) throw resultsError;

      if (!resultsData || resultsData.length === 0) {
        results = [];
        return;
      }

      // Get entry details for each result
      const entryIds = resultsData.map(r => r.entry_id);
      const { data: entriesData, error: entriesError } = await supabase
        .from('competition_entries')
        .select('*')
        .in('id', entryIds);

      if (entriesError) throw entriesError;

      // Get member data
      const memberIds = [...new Set(entriesData.map(entry => entry.member_id))];
      const { data: membersData } = await supabase
        .from('members')
        .select('id, name')
        .in('id', memberIds);

      // Get category data
      const categoryIds = [...new Set(entriesData.map(entry => entry.bjcp_category_id).filter(Boolean))];
      const { data: categoriesData } = await supabase
        .from('bjcp_categories')
        .select('id, category_name, category_number, subcategory_letter, subcategory_name')
        .in('id', categoryIds);

      // Load ranking groups if using custom system
      let rankingGroups = [];
      if (competition.category_system === 'custom') {
        const { data: groupsData, error: groupsError } = await supabase
          .from('competition_ranking_groups')
          .select('*')
          .eq('competition_id', competition.id)
          .order('group_order');

        if (!groupsError) {
          rankingGroups = groupsData || [];
        }
      }

      // Load rankings data for points calculation
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('competition_rankings')
        .select(`
          *,
          entry:competition_entries!inner(id, entry_number, beer_name),
          judge:members!competition_rankings_judge_id_fkey(id, name),
          category:bjcp_categories(category_name, category_number, subcategory_letter),
          ranking_group:competition_ranking_groups(id, group_name, group_description)
        `)
        .eq('competition_id', competition.id)
        .order('bjcp_category_id')
        .order('rank_position');

      const rankings = rankingsData || [];

      // Combine all data
      results = resultsData.map(result => {
        const entry = entriesData.find(e => e.id === result.entry_id);
        const member = membersData?.find(m => m.id === entry?.member_id);
        const category = categoriesData?.find(c => c.id === entry?.bjcp_category_id);

        const categoryDisplay = category 
          ? `${category.category_number}${category.subcategory_letter || ''} - ${category.category_name}`
          : 'Unknown Category';

        // Find ranking group for this entry's category
        let rankingGroupName = null;
        if (rankingGroups.length > 0 && entry?.bjcp_category_id) {
          const group = rankingGroups.find(g => 
            g.bjcp_category_ids.includes(entry.bjcp_category_id)
          );
          rankingGroupName = group?.group_name || null;
        }

        // Calculate ranking points for this entry
        const rankingPoints = entry?.bjcp_category_id 
          ? calculateEntryPoints(entry.id, entry.bjcp_category_id, rankings, rankingGroups)
          : { totalPoints: 0, judgeCount: 0, rankings: [] };

        return {
          ...result,
          entry_number: entry?.entry_number || 'N/A',
          beer_name: entry?.beer_name || 'Unknown Beer',
          member_name: member?.name || 'Unknown Member',
          category_display: categoryDisplay,
          ranking_group_name: rankingGroupName,
          // Use ranking group for display if available, otherwise use individual category
          display_group: rankingGroupName || categoryDisplay,
          category_number: category?.category_number || '',
          subcategory_letter: category?.subcategory_letter || '',
          // Ranking points
          ranking_points: rankingPoints.totalPoints,
          judge_count: rankingPoints.judgeCount
        };
      });

      console.log('Loaded', results.length, 'results');

    } catch (err) {
      console.error('Error loading results:', err);
      error = err.message || 'Failed to load results';
    } finally {
      isLoadingResults = false;
    }
  }

  // Get placement display
  function getPlacementDisplay(placement) {
    switch (placement) {
      case '1':
        return { text: '1st Place', class: 'placement-first', medal: '🥇' };
      case '2':
        return { text: '2nd Place', class: 'placement-second', medal: '🥈' };
      case '3':
        return { text: '3rd Place', class: 'placement-third', medal: '🥉' };
      case 'HM':
        return { text: 'Honorable Mention', class: 'placement-hm', medal: '🏅' };
      default:
        return { text: 'No Placement', class: 'placement-none', medal: '' };
    }
  }

  // Calculate placement based on ranking points within each category/group, with score fallback
  function calculateRankingBasedPlacement(results) {
    const resultsByGroup = results.reduce((acc, result) => {
      const groupKey = result.display_group;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(result);
      return acc;
    }, {});

    // Process each group
    Object.keys(resultsByGroup).forEach(groupKey => {
      const groupResults = resultsByGroup[groupKey];
      
      // Check if any entries in this group have ranking points
      const hasRankingPoints = groupResults.some(result => result.ranking_points > 0);

      if (hasRankingPoints) {
        // Use ranking points system
        groupResults.sort((a, b) => {
          if (b.ranking_points !== a.ranking_points) {
            return b.ranking_points - a.ranking_points;
          }
          // Tiebreaker: use score
          return (b.score || 0) - (a.score || 0);
        });

        // Assign placement based on ranking points position
        let currentRank = 1;
        let previousPoints = null;

        groupResults.forEach((result, index) => {
          if (previousPoints !== null && result.ranking_points < previousPoints) {
            currentRank = index + 1;
          }

          // Only assign placement if there are ranking points
          if (result.ranking_points > 0) {
            if (currentRank === 1) {
              result.calculated_placement = '1';
            } else if (currentRank === 2) {
              result.calculated_placement = '2';
            } else if (currentRank === 3) {
              result.calculated_placement = '3';
            } else if (currentRank <= 6) { // Top 6 get honorable mention
              result.calculated_placement = 'HM';
            } else {
              result.calculated_placement = '';
            }
          } else {
            result.calculated_placement = '';
          }

          previousPoints = result.ranking_points;
        });
      } else {
        // Fallback to score-based system when no ranking points exist
        groupResults.sort((a, b) => {
          return (b.score || 0) - (a.score || 0);
        });

        // Assign placement based on score position
        let currentRank = 1;
        let previousScore = null;

        groupResults.forEach((result, index) => {
          const currentScore = result.score || 0;
          
          if (previousScore !== null && currentScore < previousScore) {
            currentRank = index + 1;
          }

          // Assign placement based on score (only for entries with scores > 0)
          if (currentScore > 0) {
            if (currentRank === 1) {
              result.calculated_placement = '1';
            } else if (currentRank === 2) {
              result.calculated_placement = '2';
            } else if (currentRank === 3) {
              result.calculated_placement = '3';
            } else if (currentRank <= 6) { // Top 6 get honorable mention
              result.calculated_placement = 'HM';
            } else {
              result.calculated_placement = '';
            }
          } else {
            result.calculated_placement = '';
          }

          previousScore = currentScore;
        });
      }
    });

    return resultsByGroup;
  }

  // Group results by category or ranking group and calculate ranking-based placements
  $: resultsByCategory = calculateRankingBasedPlacement(results);

  // Get awards summary based on calculated placements
  $: awardsSummary = {
    totalEntries: results.length,
    placedEntries: results.filter(r => r.calculated_placement && r.calculated_placement !== '').length,
    categories: Object.keys(resultsByCategory).length,
    averageScore: results.length > 0 
      ? Math.round((results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) * 10) / 10
      : 0
  };

  // Format date
  function formatDate(dateString) {
    if (!dateString) return 'No date set';
    try {
      // Handle space-separated datetime format (e.g., "2025-08-29 03:43:21.894974")
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // Replace space with 'T' and add timezone if missing
        isoString = dateString.replace(' ', 'T');
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          // Assume local timezone if no timezone specified
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString, '->', isoString);
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }

  // Navigate back to competitions
  function navigateToCompetitions() {
    goto('/competitions');
  }
</script>

<style>
  .competition-selector {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    margin-bottom: 2rem;
  }

  .selector-label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
  }

  .competition-select {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    color: #333;
  }

  .competition-select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
  }

  .results-summary {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    margin-bottom: 2rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .summary-item {
    text-align: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff3e00;
  }

  .category-section {
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .category-header {
    background: #f5f5f5;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #ddd;
  }

  .category-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
  }

  .results-table th {
    background: #fafafa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #ddd;
  }

  .results-table td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .results-table tr:hover {
    background: #f9f9f9;
  }

  .placement-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .placement-first {
    background: #fef3c7;
    color: #92400e;
  }

  .placement-second {
    background: #f3f4f6;
    color: #6b7280;
  }

  .placement-third {
    background: #fecaca;
    color: #b91c1c;
  }

  .placement-hm {
    background: #ddd6fe;
    color: #7c3aed;
  }

  .placement-none {
    background: #f9fafb;
    color: #6b7280;
  }

  .score-badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 600;
  }

  .entry-number {
    font-weight: 600;
    color: #ff3e00;
  }


  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  /* Mobile styles */
  @media (max-width: 768px) {

    .competition-grid {
      grid-template-columns: 1fr;
    }

    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .results-table {
      font-size: 0.875rem;
    }

    .results-table th,
    .results-table td {
      padding: 0.75rem 0.5rem;
    }


    .controls {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* Mobile Card Styles */
  .results-cards {
    display: none;
  }

  .result-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    padding: 1rem;
    border-left: 4px solid #ff3e00;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .entry-info {
    flex: 1;
  }

  .entry-number {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  .beer-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    margin: 0.25rem 0;
  }

  .member-name {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
  }

  .ranking-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .placement-badge-mobile {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
  }

  .placement-badge-mobile.placement-1 {
    background: linear-gradient(135deg, #ffd700, #ffed4a);
    color: #744210;
  }

  .placement-badge-mobile.placement-2 {
    background: linear-gradient(135deg, #c0c0c0, #e2e8f0);
    color: #4a5568;
  }

  .placement-badge-mobile.placement-3 {
    background: linear-gradient(135deg, #cd7f32, #d69e2e);
    color: #744210;
  }

  .placement-badge-mobile.placement-none {
    background: #f7fafc;
    color: #718096;
    border: 1px solid #e2e8f0;
  }

  .card-details {
    border-top: 1px solid #f1f5f9;
    padding-top: 1rem;
  }

  .detail-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .detail-item {
    text-align: center;
  }

  .detail-label {
    display: block;
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
  }


  /* Responsive visibility */
  @media (max-width: 768px) {
    .desktop-view {
      display: none;
    }

    .mobile-view {
      display: block;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0.5rem;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .result-card {
      padding: 0.75rem;
    }

    .detail-row {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
    }

    .detail-label {
      margin-bottom: 0;
    }
  }

</style>

<Container size="xl">
  <Hero title="Competition Results" subtitle="View published competition results and standings" icon="🏅" center={true} />

  <!-- Controls -->
  <div class="controls">
    <Button variant="secondary" on:click={navigateToCompetitions}>
      ← Back to Competitions
    </Button>
  </div>

  <!-- Error State -->
  {#if error}
    <div class="error">
      {error}
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <LoadingSpinner message="Loading competition results..." />
  {:else if competitions.length === 0}
    <EmptyState
      icon="📅"
      title="No Results Published"
      message="There are currently no competition results available to view. Check back after competitions have been judged and results published."
    />
  {:else}
    <!-- Competition Selector -->
    <div class="competition-selector">
      <div class="selector-label">Select Competition to View Results:</div>
      <select 
        class="competition-select" 
        on:change={handleCompetitionSelect}
        value={selectedCompetition?.id || ''}
      >
        <option value="">Choose a competition...</option>
        {#each competitions as competition}
          <option value={competition.id}>
            {competition.name} - Judged {formatDate(competition.judging_date)}
          </option>
        {/each}
      </select>
    </div>

    {#if selectedCompetition}
      <!-- Results Summary -->
      {#if !isLoadingResults && results.length > 0}
        <div class="results-summary">
          <h2 style="margin: 0 0 1.5rem 0; color: #333;">{selectedCompetition.name} - Results Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Entries</div>
              <div class="summary-value">{awardsSummary.totalEntries}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Awards Given</div>
              <div class="summary-value">{awardsSummary.placedEntries}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Categories</div>
              <div class="summary-value">{awardsSummary.categories}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Average Score</div>
              <div class="summary-value">{awardsSummary.averageScore}</div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Results by Category -->
      {#if isLoadingResults}
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading results...</p>
        </div>
      {:else if results.length === 0}
        <div class="empty-state">
          <h3>No Results Available</h3>
          <p>Results for this competition have not been entered yet.</p>
        </div>
      {:else}
        {#each Object.entries(resultsByCategory) as [categoryName, categoryResults]}
          <div class="category-section">
            <div class="category-header">
              <h3 class="category-title">{categoryName}</h3>
            </div>
            
            <!-- Desktop Table View -->
            <table class="results-table desktop-view">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Member</th>
                  <th>Beer Name</th>
                  <th>Ranking Points</th>
                  <th>Score</th>
                  <th>Placement</th>
                </tr>
              </thead>
              <tbody>
                {#each categoryResults as result}
                  <tr>
                    <td>
                      <span class="entry-number">{result.entry_number}</span>
                    </td>
                    <td>{result.member_name}</td>
                    <td>{result.beer_name}</td>
                    <td>
                      <span style="font-weight: 600; color: {result.ranking_points > 0 ? '#059669' : '#666'};">
                        {result.ranking_points} {result.ranking_points === 1 ? 'pt' : 'pts'}
                      </span>
                      {#if result.judge_count > 0}
                        <br><small style="color: #666;">{result.judge_count} judge{result.judge_count === 1 ? '' : 's'}</small>
                      {/if}
                    </td>
                    <td>
                      {#if result.score}
                        <span class="score-badge">{result.score}/50</span>
                      {:else}
                        <span class="score-badge">-/50</span>
                      {/if}
                    </td>
                    <td>
                      {#if result.calculated_placement}
                        <span class="placement-badge {getPlacementDisplay(result.calculated_placement).class}">
                          <span>{getPlacementDisplay(result.calculated_placement).medal}</span>
                          <span>{getPlacementDisplay(result.calculated_placement).text}</span>
                        </span>
                      {:else}
                        <span class="placement-badge placement-none">No Placement</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>

            <!-- Mobile Card View -->
            <div class="results-cards mobile-view">
              {#each categoryResults as result}
                <div class="result-card">
                  <div class="card-header">
                    <div class="entry-info">
                      <span class="entry-number">#{result.entry_number}</span>
                      <h4 class="beer-name">{result.beer_name}</h4>
                      <p class="member-name">{result.member_name}</p>
                    </div>
                    <div class="ranking-info">
                      {#if result.calculated_placement}
                        <div class="placement-badge-mobile {getPlacementDisplay(result.calculated_placement).class}">
                          <span class="medal">{getPlacementDisplay(result.calculated_placement).medal}</span>
                          <span class="placement-text">{getPlacementDisplay(result.calculated_placement).text}</span>
                        </div>
                      {:else}
                        <div class="placement-badge-mobile placement-none">No Placement</div>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="card-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <span class="detail-label">Points</span>
                        <span class="detail-value" style="color: {result.ranking_points > 0 ? '#059669' : '#666'}; font-weight: 600;">
                          {result.ranking_points} {result.ranking_points === 1 ? 'pt' : 'pts'}
                        </span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Score</span>
                        <span class="detail-value">
                          {#if result.score}
                            {result.score}/50
                          {:else}
                            -/50
                          {/if}
                        </span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Judges</span>
                        <span class="detail-value">{result.judge_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    {/if}
  {/if}
</Container>

