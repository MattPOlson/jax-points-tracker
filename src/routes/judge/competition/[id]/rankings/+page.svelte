<!-- Category Ranking Interface -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import {
    competitionJudgingStore,
    activeSession,
    isJudging
  } from '$lib/stores/competitionJudgingStore';
  import { supabase } from '$lib/supabaseClient';
  import Container from '$lib/components/ui/Container.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let categories = [];
  let selectedCategory = null;
  let categoryEntries = [];
  let rankings = [];
  let isLoading = true;
  let isSaving = false;
  let error = null;
  let competitionType = null;
  let validationErrors = [];

  // Check if current user is Comp Director for displaying beer names
  $: isCompDirector = $userProfile?.role === 'competition_director';

  // Helper function to get beer name display
  function getBeerNameDisplay(beerName) {
    if (isCompDirector) {
      return beerName || 'No name provided';
    }
    return 'Hidden'; // Hidden for non-Comp Directors
  }

  onMount(async () => {
    if (!$userProfile) {
      goto('/auth');
      return;
    }

    if (!$isJudging || $activeSession.activeCompetition?.id !== competitionId) {
      try {
        await competitionJudgingStore.startJudgingSession(competitionId, $userProfile.id);
      } catch (err) {
        console.error('Error starting judging session:', err);
        error = 'Failed to start judging session';
        isLoading = false;
        return;
      }
    }

    await loadCategories();
  });

  async function loadCategories() {
    isLoading = true;
    error = null;

    try {
      // First load competition data including type
      const { data: competitionData, error: compError } = await supabase
        .from('competitions')
        .select('category_system, competition_type')
        .eq('id', competitionId)
        .single();

      if (compError) throw compError;

      // Store competition type for validation
      competitionType = competitionData.competition_type;

      if (competitionData.category_system === 'custom') {
        // Load custom ranking groups
        const { data: rankingGroups, error: groupsError } = await supabase
          .from('competition_ranking_groups')
          .select(`
            id, group_name, group_description, bjcp_category_ids, group_order
          `)
          .eq('competition_id', competitionId)
          .order('group_order');

        if (groupsError) throw groupsError;

        // For each ranking group, count entries
        const groupsWithCounts = [];
        for (const group of rankingGroups || []) {
          const categoryIds = group.bjcp_category_ids;
          
          const { data: entriesData, error: entriesError } = await supabase
            .from('competition_entries')
            .select('id, bjcp_category_id')
            .eq('competition_id', competitionId)
            .in('bjcp_category_id', categoryIds);

          if (entriesError) throw entriesError;

          if (entriesData && entriesData.length > 0) {
            groupsWithCounts.push({
              ...group,
              isCustomGroup: true,
              entryCount: entriesData.length,
              displayName: group.group_name
            });
          }
        }

        categories = groupsWithCounts;
      } else {
        // Load individual categories (default system)
        const { data: entriesData, error: entriesError } = await supabase
          .from('competition_entries')
          .select(`
            bjcp_category_id,
            bjcp_categories(
              id, category_number, subcategory_letter, 
              subcategory_name, category_name
            )
          `)
          .eq('competition_id', competitionId);

        if (entriesError) throw entriesError;

        // Group by category and count entries
        const categoryMap = new Map();
        entriesData.forEach(entry => {
          const category = entry.bjcp_categories;
          if (category) {
            const key = category.id;
            if (categoryMap.has(key)) {
              categoryMap.get(key).entryCount++;
            } else {
              categoryMap.set(key, {
                ...category,
                isCustomGroup: false,
                entryCount: 1,
                displayName: `${category.category_number}${category.subcategory_letter || ''} - ${category.category_name}${category.subcategory_name ? ` (${category.subcategory_name})` : ''}`
              });
            }
          }
        });

        categories = Array.from(categoryMap.values())
          .sort((a, b) => a.category_number.localeCompare(b.category_number));
      }

      // Auto-select first category if available
      if (categories.length > 0) {
        selectedCategory = categories[0];
        await loadCategoryEntries();
      }

    } catch (err) {
      console.error('Error loading categories:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function loadCategoryEntries() {
    if (!selectedCategory) return;

    try {
      let entriesData;
      
      if (selectedCategory.isCustomGroup) {
        // Load entries for all categories in this ranking group
        const { data: groupEntriesData, error: entriesError } = await supabase
          .from('competition_entries')
          .select(`
            id, entry_number, beer_name, beer_notes, bjcp_category_id, member_id,
            members!competition_entries_member_id_fkey(name),
            bjcp_categories!competition_entries_bjcp_category_id_fkey(
              category_number, subcategory_letter, subcategory_name, category_name
            )
          `)
          .eq('competition_id', competitionId)
          .in('bjcp_category_id', selectedCategory.bjcp_category_ids)
          .order('entry_number');

        if (entriesError) throw entriesError;
        entriesData = groupEntriesData;
      } else {
        // Load entries for this single category
        const { data: singleCategoryData, error: entriesError } = await supabase
          .from('competition_entries')
          .select(`
            id, entry_number, beer_name, beer_notes, bjcp_category_id, member_id,
            members!competition_entries_member_id_fkey(name),
            bjcp_categories!competition_entries_bjcp_category_id_fkey(
              category_number, subcategory_letter, subcategory_name, category_name
            )
          `)
          .eq('competition_id', competitionId)
          .eq('bjcp_category_id', selectedCategory.id)
          .order('entry_number');

        if (entriesError) throw entriesError;
        entriesData = singleCategoryData;
      }

      if (!entriesData) throw new Error('No entries data loaded');

      // Load existing judging scores for this judge
      const entryIds = entriesData.map(e => e.id);
      const { data: judgingData, error: judgingError } = await supabase
        .from('competition_judging_sessions')
        .select('entry_id, total_score, judge_notes, private_notes')
        .eq('competition_id', competitionId)
        .eq('judge_id', $userProfile.id)
        .in('entry_id', entryIds);

      if (judgingError) {
        console.warn('No judging data found:', judgingError);
      }

      // Load existing rankings for this judge and category/group
      let rankingsData = [];
      if (selectedCategory.isCustomGroup) {
        // Load rankings for all categories in this group
        const { data: groupRankingsData, error: rankingsError } = await supabase
          .from('competition_rankings')
          .select('*')
          .eq('competition_id', competitionId)
          .eq('judge_id', $userProfile.id)
          .eq('ranking_group_id', selectedCategory.id)
          .order('rank_position');

        if (rankingsError) {
          console.warn('No existing group rankings found:', rankingsError);
        } else {
          rankingsData = groupRankingsData;
        }
      } else {
        // Load rankings for single category
        const { data: categoryRankingsData, error: rankingsError } = await supabase
          .from('competition_rankings')
          .select('*')
          .eq('competition_id', competitionId)
          .eq('judge_id', $userProfile.id)
          .eq('bjcp_category_id', selectedCategory.id)
          .order('rank_position');

        if (rankingsError) {
          console.warn('No existing category rankings found:', rankingsError);
        } else {
          rankingsData = categoryRankingsData;
        }
      }

      // Combine entry data with judging scores
      categoryEntries = entriesData.map(entry => {
        const judging = judgingData?.find(j => j.entry_id === entry.id);
        const categoryInfo = entry.bjcp_categories;
        return {
          ...entry,
          member_name: entry.members?.name || 'Unknown',
          total_score: judging?.total_score || 0,
          judge_notes: judging?.judge_notes || '',
          private_notes: judging?.private_notes || '',
          hasScore: !!(judging?.total_score),
          category_display: categoryInfo ? `${categoryInfo.category_number}${categoryInfo.subcategory_letter || ''} - ${categoryInfo.subcategory_name || categoryInfo.category_name}` : 'Unknown Category'
        };
      });

      // Initialize rankings based on existing data or scores
      if (rankingsData && rankingsData.length > 0) {
        // Use existing rankings
        rankings = rankingsData.map(ranking => {
          const entry = categoryEntries.find(e => e.id === ranking.entry_id);
          return {
            ...ranking,
            entry: entry
          };
        });
      } else {
        // Auto-rank by scores (highest to lowest)
        const scoredEntries = categoryEntries
          .filter(entry => entry.hasScore)
          .sort((a, b) => b.total_score - a.total_score);

        rankings = scoredEntries.map((entry, index) => ({
          id: null, // Not saved yet
          competition_id: competitionId,
          judge_id: $userProfile.id,
          bjcp_category_id: selectedCategory.isCustomGroup ? null : selectedCategory.id,
          ranking_group_id: selectedCategory.isCustomGroup ? selectedCategory.id : null,
          entry_id: entry.id,
          rank_position: index + 1,
          ranking_notes: '',
          entry: entry
        }));
      }

    } catch (err) {
      console.error('Error loading category entries:', err);
      error = err.message;
    }
  }

  async function selectCategory(category) {
    selectedCategory = category;
    await loadCategoryEntries();
  }

  function moveRanking(fromIndex, toIndex) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= rankings.length) return;

    const newRankings = [...rankings];
    const [movedItem] = newRankings.splice(fromIndex, 1);
    newRankings.splice(toIndex, 0, movedItem);

    // Update rank positions
    newRankings.forEach((ranking, index) => {
      ranking.rank_position = index + 1;
    });

    rankings = newRankings;
  }

  function moveUp(index) {
    moveRanking(index, index - 1);
  }

  function moveDown(index) {
    moveRanking(index, index + 1);
  }

  function validateIntraclubSelfRanking() {
    validationErrors = [];

    // Only validate for intraclub competitions
    if (competitionType !== 'intraclub') {
      return true;
    }

    // Check if user is ranking their own entries in top 3 positions
    const top3Rankings = rankings.filter(r => r.rank_position <= 3);
    const ownEntryViolations = top3Rankings.filter(r =>
      r.entry && r.entry.member_id === $userProfile.id
    );

    if (ownEntryViolations.length > 0) {
      ownEntryViolations.forEach(violation => {
        validationErrors.push({
          type: 'self_ranking',
          message: `You cannot rank your own entry (#${violation.entry.entry_number}) in position ${violation.rank_position} during intraclub competitions.`,
          entryId: violation.entry_id,
          position: violation.rank_position
        });
      });
      return false;
    }

    return true;
  }

  async function saveRankings() {
    if (!selectedCategory || rankings.length === 0) return;

    // Validate rankings before saving
    if (!validateIntraclubSelfRanking()) {
      showToast('Cannot save: You cannot rank your own entries in positions 1-3 during intraclub competitions', 'error');
      return;
    }

    isSaving = true;
    try {
      // First, delete existing rankings for this category/group and judge
      if (selectedCategory.isCustomGroup) {
        const { error: deleteError } = await supabase
          .from('competition_rankings')
          .delete()
          .eq('competition_id', competitionId)
          .eq('judge_id', $userProfile.id)
          .eq('ranking_group_id', selectedCategory.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('competition_rankings')
          .delete()
          .eq('competition_id', competitionId)
          .eq('judge_id', $userProfile.id)
          .eq('bjcp_category_id', selectedCategory.id);

        if (deleteError) throw deleteError;
      }

      // Insert new rankings
      const rankingsToInsert = rankings.map(ranking => ({
        competition_id: competitionId,
        judge_id: $userProfile.id,
        bjcp_category_id: selectedCategory.isCustomGroup ? null : selectedCategory.id,
        ranking_group_id: selectedCategory.isCustomGroup ? selectedCategory.id : null,
        entry_id: ranking.entry_id,
        rank_position: ranking.rank_position,
        ranking_notes: ranking.ranking_notes || null
      }));

      const { error: insertError } = await supabase
        .from('competition_rankings')
        .insert(rankingsToInsert);

      if (insertError) throw insertError;

      showToast('Rankings saved successfully!', 'success');

    } catch (err) {
      console.error('Error saving rankings:', err);
      showToast('Failed to save rankings', 'error');
    } finally {
      isSaving = false;
    }
  }

  function getRankIcon(position) {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}.`;
    }
  }

  function getScoreColor(score) {
    if (score >= 45) return '#059669'; // Excellent
    if (score >= 38) return '#0891b2'; // Very Good  
    if (score >= 30) return '#eab308'; // Good
    if (score >= 21) return '#f59e0b'; // Fair
    return '#dc2626'; // Poor
  }

  function isOwnEntry(entry) {
    return entry && entry.member_id === $userProfile?.id;
  }

  function getEntryValidationClass(ranking) {
    if (competitionType === 'intraclub' && isOwnEntry(ranking.entry) && ranking.rank_position <= 3) {
      return 'invalid-own-entry';
    }
    return '';
  }

  // Reactive validation check
  $: if (rankings.length > 0) {
    validateIntraclubSelfRanking();
  }

  function showToast(message, type = 'info') {
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
    setTimeout(() => document.body.removeChild(toast), 3000);
  }
</script>

<style>

  /* Header */
  .header {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem;
  }

  .header p {
    color: #666;
    margin: 0;
  }

  /* Navigation */
  .nav-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: #6b7280;
    color: white;
    cursor: pointer;
    transition: background 0.2s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-btn:hover {
    background: #4b5563;
  }

  .nav-btn-primary {
    background: #ff3e00;
  }

  .nav-btn-primary:hover {
    background: #e63600;
  }

  /* Categories */
  .categories-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .category-card {
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-card:hover {
    border-color: #ff3e00;
    background: #fef7f0;
  }

  .category-card.selected {
    border-color: #ff3e00;
    background: #fff2ed;
  }

  .category-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .category-stats {
    font-size: 0.875rem;
    color: #666;
  }

  /* Rankings */
  .rankings-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .rankings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .rankings-header h2 {
    margin: 0;
    color: #333;
  }

  .save-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .save-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .rankings-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }

  .ranking-item.own-entry {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  .ranking-item.invalid-own-entry {
    background: #fef2f2;
    border-color: #ef4444;
    animation: pulse-error 2s ease-in-out;
  }

  @keyframes pulse-error {
    0%, 100% { border-color: #ef4444; }
    50% { border-color: #dc2626; }
  }

  .rank-position {
    font-size: 1.5rem;
    font-weight: 600;
    min-width: 60px;
    text-align: center;
  }

  .entry-info {
    flex: 1;
    min-width: 0;
  }

  .entry-number {
    font-weight: 600;
    color: #ff3e00;
    margin-bottom: 0.25rem;
  }

  .entry-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .detail-text {
    font-size: 0.875rem;
    color: #666;
  }

  .score-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .score-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  .ranking-controls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rank-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 6px;
    background: #e5e7eb;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .rank-btn:hover:not(:disabled) {
    background: #d1d5db;
  }

  .rank-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .validation-warning {
    background: #fef3cd;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .validation-warning h4 {
    margin: 0 0 0.5rem;
    color: #92400e;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .validation-error {
    font-size: 0.875rem;
    color: #92400e;
    margin: 0.25rem 0;
  }

  .own-entry-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #3b82f6;
    background: #dbeafe;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .error-state, .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {

    .nav-buttons {
      flex-wrap: wrap;
    }

    .categories-grid {
      grid-template-columns: 1fr;
    }

    .entry-details {
      gap: 0.125rem;
    }

    .ranking-item {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .rankings-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
  }
</style>

<Container size="xl">
  <!-- Header -->
  <div class="header">
    <h1>🏆 Category Rankings</h1>
    <p>Rank entries within each category based on your judging scores</p>
  </div>

  <!-- Navigation -->
  <div class="nav-buttons">
    <Button variant="secondary" on:click={() => goto(`/judge/competition/${competitionId}`)}>
      ⬅️ Back to Judging
    </Button>
    <Button variant="secondary" on:click={() => goto('/judge')}>
      🏠 Judge Portal
    </Button>
  </div>

  {#if isLoading}
    <LoadingSpinner message="Loading categories and rankings..." />
  {:else if error}
    <div class="error-state">
      <h3>Error Loading Data</h3>
      <p>{error}</p>
      <button class="nav-btn nav-btn-primary" on:click={() => window.location.reload()}>
        🔄 Retry
      </button>
    </div>
  {:else if categories.length === 0}
    <div class="empty-state">
      <h3>No Categories Found</h3>
      <p>No entries have been submitted for this competition yet.</p>
    </div>
  {:else}
    <!-- Categories Selection -->
    <div class="categories-section">
      <h2>Select Category to Rank ({categories.length} categories)</h2>
      <div class="categories-grid">
        {#each categories as category}
          <div 
            class="category-card {selectedCategory?.id === category.id ? 'selected' : ''}"
            on:click={() => selectCategory(category)}
            role="button"
            tabindex="0"
          >
            <div class="category-name">{category.displayName}</div>
            <div class="category-stats">{category.entryCount} entries</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Rankings Section -->
    {#if selectedCategory}
      <div class="rankings-section">
        <div class="rankings-header">
          <h2>Rankings for {selectedCategory.displayName}</h2>
          <button 
            class="save-btn"
            on:click={saveRankings}
            disabled={isSaving || rankings.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Rankings'}
          </button>
        </div>

        {#if validationErrors.length > 0}
          <div class="validation-warning">
            <h4>⚠️ Ranking Restrictions</h4>
            {#each validationErrors as error}
              <div class="validation-error">{error.message}</div>
            {/each}
          </div>
        {/if}

        {#if competitionType === 'intraclub'}
          <div class="validation-warning" style="background: #f0f9ff; border-color: #3b82f6;">
            <h4>ℹ️ Intraclub Competition Rules</h4>
            <div style="color: #1e40af; font-size: 0.875rem;">
              You cannot rank your own entries in positions 1-3. Your entries are marked with a blue indicator.
            </div>
          </div>
        {/if}

        {#if rankings.length === 0}
          <div class="empty-state">
            <h3>No Scored Entries</h3>
            <p>You need to score entries in this category before you can rank them.</p>
            <a href="/judge/competition/{competitionId}" class="nav-btn nav-btn-primary">
              🏆 Start Judging
            </a>
          </div>
        {:else}
          <div class="rankings-list">
            {#each rankings as ranking, index}
              <div class="ranking-item {isOwnEntry(ranking.entry) ? 'own-entry' : ''} {getEntryValidationClass(ranking)}">
                <div class="rank-position">
                  {getRankIcon(ranking.rank_position)}
                </div>

                <div class="entry-info">
                  <div class="entry-number">
                    Entry #{ranking.entry.entry_number}
                    {#if isOwnEntry(ranking.entry)}
                      <span class="own-entry-indicator">👤 Your Entry</span>
                    {/if}
                  </div>
                  <div class="entry-details">
                    <div class="detail-text">
                      <strong>{getBeerNameDisplay(ranking.entry.beer_name)}</strong>
                    </div>
                    {#if selectedCategory?.isCustomGroup}
                      <div class="detail-text">
                        Category: {ranking.entry.category_display}
                      </div>
                    {/if}
                  </div>
                  
                  <div class="score-display">
                    <span
                      class="score-badge"
                      style="background: {getScoreColor(ranking.entry.total_score)}"
                    >
                      {ranking.entry.total_score}/50
                    </span>
                    {#if ranking.entry.judge_notes}
                      <span class="detail-text">📝 Has notes</span>
                    {/if}
                  </div>

                  {#if ranking.entry.private_notes}
                    <div class="detail-text" style="margin-top: 0.5rem; color: #6366f1; font-style: italic;">
                      💭 {ranking.entry.private_notes}
                    </div>
                  {/if}
                </div>

                <div class="ranking-controls">
                  <button 
                    class="rank-btn"
                    on:click={() => moveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button 
                    class="rank-btn"
                    on:click={() => moveDown(index)}
                    disabled={index === rankings.length - 1}
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</Container>