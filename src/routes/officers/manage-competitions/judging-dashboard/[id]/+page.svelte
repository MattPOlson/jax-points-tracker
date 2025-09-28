<!-- Competition Director Judging Dashboard -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';

  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let competition = null;
  let judges = [];
  let entries = [];
  let judgingSessions = [];
  let rankings = [];
  let categories = [];
  let rankingGroups = [];
  let selectedView = 'overview'; // overview, entries, judges, rankings
  let selectedCategory = 'all';
  let isLoading = true;
  let isProcessing = false;

  let judgingStats = {
    totalEntries: 0,
    totalJudges: 0,
    completedSessions: 0,
    averageScore: 0,
    completionPercentage: 0
  };

  // Check if current user is Comp Director for displaying brewer names
  $: isCompDirector = $userProfile?.is_comp_director === true;

  // Helper function to get brewer name display
  function getBrewerNameDisplay(brewerName) {
    if (isCompDirector) {
      return brewerName || 'Unknown';
    }
    return 'Hidden'; // Hidden for non-Comp Directors
  }

  // Helper function to get CSS class for brewer name
  function getBrewerNameClass() {
    return isCompDirector ? '' : 'brewer-name-hidden';
  }

  onMount(() => {
    loadDashboardData();
  });

  async function loadDashboardData() {
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

      // Load judges
      const { data: judgesData, error: judgesError } = await supabase
        .from('competition_judges')
        .select(`
          *,
          judge:members!competition_judges_judge_id_fkey(id, name, email, phone)
        `)
        .eq('competition_id', competitionId)
        .eq('active', true);

      if (judgesError) throw judgesError;
      judges = judgesData || [];

      // Load entries with member and category details
      const { data: entriesData, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
          *,
          members!competition_entries_member_id_fkey(id, name, email),
          bjcp_categories(id, category_number, subcategory_letter, category_name, subcategory_name)
        `)
        .eq('competition_id', competitionId)
        .order('entry_number');

      if (entriesError) throw entriesError;
      entries = entriesData || [];

      // Load judging sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('competition_judging_sessions')
        .select(`
          *,
          entry:competition_entries!inner(id, entry_number, beer_name),
          judge:members!competition_judging_sessions_judge_id_fkey(id, name)
        `)
        .eq('competition_id', competitionId);

      if (sessionsError) {
        console.warn('No judging sessions found:', sessionsError);
        judgingSessions = [];
      } else {
        judgingSessions = sessionsData || [];
      }

      // Load rankings
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

      if (rankingsError) {
        console.warn('No rankings found:', rankingsError);
        rankings = [];
      } else {
        rankings = rankingsData || [];
      }

      // Load ranking groups for custom category system
      const { data: groupsData, error: groupsError } = await supabase
        .from('competition_ranking_groups')
        .select('*')
        .eq('competition_id', competitionId)
        .order('group_order');

      if (groupsError) {
        console.warn('No ranking groups found:', groupsError);
        rankingGroups = [];
      } else {
        rankingGroups = groupsData || [];
      }

      // Extract categories
      const categoryMap = new Map();
      entries.forEach(entry => {
        if (entry.bjcp_categories) {
          const cat = entry.bjcp_categories;
          categoryMap.set(cat.id, {
            id: cat.id,
            name: `${cat.category_number}${cat.subcategory_letter || ''} - ${cat.category_name}`,
            entryCount: (categoryMap.get(cat.id)?.entryCount || 0) + 1
          });
        }
      });
      categories = Array.from(categoryMap.values());

      // Calculate stats
      calculateStats();

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      alert('Failed to load judging dashboard');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  function calculateStats() {
    judgingStats.totalEntries = entries.length;
    judgingStats.totalJudges = judges.length;
    judgingStats.completedSessions = judgingSessions.filter(s => s.total_score > 0).length;
    
    const scoresWithValues = judgingSessions.filter(s => s.total_score > 0);
    judgingStats.averageScore = scoresWithValues.length > 0 
      ? Math.round(scoresWithValues.reduce((sum, s) => sum + s.total_score, 0) / scoresWithValues.length * 10) / 10
      : 0;
    
    const expectedSessions = entries.length * judges.length;
    judgingStats.completionPercentage = expectedSessions > 0 
      ? Math.round((judgingStats.completedSessions / expectedSessions) * 100)
      : 0;
  }

  function getJudgeProgress(judgeId) {
    const judgesSessions = judgingSessions.filter(s => s.judge_id === judgeId);
    const completedSessions = judgesSessions.filter(s => s.total_score > 0);
    return {
      total: entries.length,
      completed: completedSessions.length,
      percentage: entries.length > 0 ? Math.round((completedSessions.length / entries.length) * 100) : 0
    };
  }

  function getEntryScores(entryId) {
    const entryScores = judgingSessions.filter(s => s.entry_id === entryId && s.total_score > 0);
    if (entryScores.length === 0) return { count: 0, average: 0, scores: [] };

    const scores = entryScores.map(s => s.total_score);
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10;

    return {
      count: entryScores.length,
      average,
      scores,
      sessions: entryScores
    };
  }

  function getCategoryRankings(categoryId) {
    return rankings.filter(r => r.bjcp_category_id === categoryId);
  }

  function getGroupRankings(groupId) {
    return rankings.filter(r => r.ranking_group_id === groupId);
  }

  function getGroupEntryCount(group) {
    if (!group.bjcp_category_ids) return 0;
    let categoryIds;
    try {
      categoryIds = Array.isArray(group.bjcp_category_ids) 
        ? group.bjcp_category_ids 
        : JSON.parse(group.bjcp_category_ids);
    } catch (e) {
      console.warn('Failed to parse bjcp_category_ids:', group.bjcp_category_ids);
      return 0;
    }
    return entries.filter(entry => categoryIds.includes(entry.bjcp_category_id)).length;
  }

  function hasMultipleJudges(rankings) {
    const judgeIds = new Set(rankings.map(r => r.judge_id));
    return judgeIds.size > 1;
  }

  function getEntryPointsSummary(entryId, categoryId, groupId = null) {
    return compileMultiJudgeRankings(entryId, categoryId, groupId);
  }

  function getUniqueEntriesFromRankings(rankings) {
    const entryMap = new Map();
    rankings.forEach(ranking => {
      if (ranking.entry_id && !entryMap.has(ranking.entry_id)) {
        entryMap.set(ranking.entry_id, ranking.entry);
      }
    });
    return Array.from(entryMap.values());
  }

  async function finalizeResults() {
    if (!confirm('Are you sure you want to finalize all results? This will aggregate scores and create final standings.')) {
      return;
    }

    isProcessing = true;
    try {
      await processAndFinalizeResults();
      showToast('Results finalized successfully!', 'success');
      await loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error finalizing results:', err);
      showToast('Failed to finalize results', 'error');
    } finally {
      isProcessing = false;
    }
  }

  function getPointsForRanking(rankPosition) {
    // Point system: 1st=3pts, 2nd=2pts, 3rd=1pt, others=0pts
    switch (rankPosition) {
      case 1: return 3;
      case 2: return 2;
      case 3: return 1;
      default: return 0;
    }
  }

  function compileMultiJudgeRankings(entryId, categoryId, groupId = null) {
    // Get all rankings for this entry from all judges
    let entryRankings = [];
    
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

  async function processAndFinalizeResults() {
    // This function aggregates all judging data and creates final results using multi-judge point compilation
    
    const finalResults = [];

    // Group entries by category or ranking group for proper compilation
    const entriesByGroup = new Map();
    
    for (const entry of entries) {
      const entryScores = getEntryScores(entry.id);
      
      if (entryScores.count > 0) {
        // Determine the grouping key (category or custom group)
        let groupKey = entry.bjcp_category_id;
        let isCustomGroup = false;
        
        // Check if entry belongs to a custom ranking group
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
          
          if (categoryIds.includes(entry.bjcp_category_id)) {
            groupKey = `group_${group.id}`;
            isCustomGroup = true;
            break;
          }
        }

        if (!entriesByGroup.has(groupKey)) {
          entriesByGroup.set(groupKey, []);
        }
        
        entriesByGroup.get(groupKey).push({
          ...entry,
          entryScores,
          isCustomGroup,
          groupId: isCustomGroup ? groupKey.split('_')[1] : null
        });
      }
    }

    // Process each group separately to determine rankings
    for (const [groupKey, groupEntries] of entriesByGroup) {
      // Calculate points for each entry in this group
      const entriesWithPoints = groupEntries.map(entry => {
        const compilation = compileMultiJudgeRankings(
          entry.id, 
          entry.bjcp_category_id, 
          entry.groupId
        );
        
        return {
          ...entry,
          compilation
        };
      });

      // Sort by total points (highest first), then by average score as tiebreaker
      entriesWithPoints.sort((a, b) => {
        if (b.compilation.totalPoints !== a.compilation.totalPoints) {
          return b.compilation.totalPoints - a.compilation.totalPoints;
        }
        // Tiebreaker: use average score
        return b.entryScores.average - a.entryScores.average;
      });

      // Assign placements based on final ranking
      entriesWithPoints.forEach((entry, index) => {
        // Calculate final score (average of all judges)
        const finalScore = entry.entryScores.average;
        
        // Get any judge notes
        const allNotes = entry.entryScores.sessions
          .filter(s => s.judge_notes)
          .map(s => s.judge_notes)
          .join('\n\n---\n\n');

        // Determine placement based on compiled ranking position
        let placement = null;
        if (entry.compilation.totalPoints > 0) {
          const rankPosition = index + 1;
          if (rankPosition === 1) placement = '1';
          else if (rankPosition === 2) placement = '2';
          else if (rankPosition === 3) placement = '3';
          else if (rankPosition <= 5) placement = 'HM'; // Honorable mention for top 5
        }

        finalResults.push({
          competition_id: competitionId,
          entry_id: entry.id,
          score: Math.round(finalScore),
          placement: placement,
          judge_notes: allNotes || null,
          updated_at: new Date().toISOString()
        });
      });
    }

    // Upsert results into competition_results table
    for (const result of finalResults) {
      // Check if result exists
      const { data: existing } = await supabase
        .from('competition_results')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('entry_id', result.entry_id)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('competition_results')
          .update(result)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('competition_results')
          .insert([result]);
        if (error) throw error;
      }
    }
  }

  async function publishResults() {
    if (!confirm('Are you sure you want to publish results? This will make them visible to all members.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('competitions')
        .update({ 
          results_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      if (error) throw error;

      competition.results_published = true;
      showToast('Results published successfully!', 'success');

    } catch (err) {
      console.error('Error publishing results:', err);
      showToast('Failed to publish results', 'error');
    }
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

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getScoreColor(score) {
    if (score >= 45) return '#059669'; // Excellent
    if (score >= 38) return '#0891b2'; // Very Good  
    if (score >= 30) return '#eab308'; // Good
    if (score >= 21) return '#f59e0b'; // Fair
    return '#dc2626'; // Poor
  }
</script>

<style>
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Header */
  .header {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .header h1 {
    color: #ff3e00;
    font-size: 2rem;
    font-weight: 100;
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
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

  /* Stats Cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 100;
    margin: 0;
    color: #ff3e00;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
    margin: 0.5rem 0 0;
  }

  .stat-description {
    font-size: 0.75rem;
    color: #999;
    margin: 0.25rem 0 0;
  }

  /* Controls */
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .view-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: #e5e7eb;
    color: #374151;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .tab-btn.active {
    background: #ff3e00;
    color: white;
  }

  .tab-btn:hover:not(.active) {
    background: #d1d5db;
  }

  .action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-success {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  }

  .btn-primary {
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #e63600 0%, #cc2900 100%);
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  /* Content Sections */
  .content-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .section-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .section-content {
    padding: 1.5rem;
  }

  /* Tables */
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th {
    background: #f9fafb;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
  }

  .data-table td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: top;
  }

  .data-table tr:hover {
    background: #f9fafb;
  }

  /* Progress bars */
  .progress-bar {
    background: #e5e7eb;
    border-radius: 8px;
    height: 8px;
    overflow: hidden;
  }

  .progress-fill {
    background: linear-gradient(90deg, #ff3e00, #059669);
    height: 100%;
    border-radius: 8px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }

  /* Score badges */
  .score-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
  }

  .loading, .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .mobile-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .mobile-card-subtitle {
    font-size: 0.875rem;
    color: #666;
    margin: 0.25rem 0 0;
  }

  .mobile-card-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .mobile-card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 6px;
  }

  .mobile-detail-item {
    display: flex;
    flex-direction: column;
  }

  .mobile-detail-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .mobile-detail-value {
    font-size: 1rem;
    color: #333;
    font-weight: 600;
  }

  .mobile-progress {
    margin-top: 1rem;
  }

  .mobile-progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
  }

  .mobile-progress-bar {
    background: #e5e7eb;
    border-radius: 8px;
    height: 8px;
    overflow: hidden;
  }

  .mobile-progress-fill {
    background: linear-gradient(90deg, #ff3e00, #059669);
    height: 100%;
    border-radius: 8px;
    transition: width 0.3s ease;
  }

  .mobile-ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .mobile-ranking-position {
    font-size: 1.5rem;
    font-weight: 600;
    min-width: 2rem;
    text-align: center;
  }

  .mobile-ranking-entry {
    flex: 1;
    min-width: 0;
  }

  .mobile-ranking-entry-number {
    font-weight: 600;
    color: #ff3e00;
    font-size: 1.1rem;
  }

  .mobile-ranking-beer-name {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }

  .mobile-ranking-points {
    font-size: 1.25rem;
    font-weight: 700;
    color: #059669;
    text-align: right;
    min-width: fit-content;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 0.5rem;
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .header-info {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .view-tabs {
      width: 100%;
      justify-content: space-between;
    }

    .tab-btn {
      flex: 1;
      text-align: center;
    }

    .data-table {
      display: none;
    }

    .mobile-cards {
      display: block;
    }

    .mobile-card-details {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .mobile-card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Ensure tables are hidden on mobile */
  @media (min-width: 769px) {
    .mobile-cards {
      display: none;
    }
    
    .data-table {
      display: table;
    }
  }

  /* Hidden brewer name styling for non-Comp Directors */
  .brewer-name-hidden {
    color: #9ca3af;
    font-style: italic;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.875rem;
  }
</style>

<div class="dashboard-container">
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading judging dashboard...</p>
    </div>
  {:else if competition}
    <!-- Header -->
    <div class="header">
      <h1>Judging Dashboard</h1>
      <p>{competition.name}</p>
      
      <div class="header-info">
        <div class="info-item">
          <span class="info-label">Status</span>
          <span class="info-value">
            {competition.results_published ? 'Results Published' : 'Judging In Progress'}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Judging Date</span>
          <span class="info-value">{formatDate(competition.judging_date)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Last Updated</span>
          <span class="info-value">{formatDate(competition.updated_at)}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3 class="stat-value">{judgingStats.totalEntries}</h3>
        <p class="stat-label">Total Entries</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-value">{judgingStats.totalJudges}</h3>
        <p class="stat-label">Assigned Judges</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-value">{judgingStats.completedSessions}</h3>
        <p class="stat-label">Completed Sessions</p>
        <p class="stat-description">Out of {judgingStats.totalEntries * judgingStats.totalJudges} possible</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-value">{judgingStats.averageScore}</h3>
        <p class="stat-label">Average Score</p>
        <p class="stat-description">Across all judged entries</p>
      </div>
      <div class="stat-card">
        <h3 class="stat-value">{judgingStats.completionPercentage}%</h3>
        <p class="stat-label">Completion Rate</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="view-tabs">
        <button class="tab-btn {selectedView === 'overview' ? 'active' : ''}" on:click={() => selectedView = 'overview'}>
          📊 Overview
        </button>
        <button class="tab-btn {selectedView === 'judges' ? 'active' : ''}" on:click={() => selectedView = 'judges'}>
          👩‍⚖️ Judges
        </button>
        <button class="tab-btn {selectedView === 'entries' ? 'active' : ''}" on:click={() => selectedView = 'entries'}>
          🍺 Entries
        </button>
        <button class="tab-btn {selectedView === 'rankings' ? 'active' : ''}" on:click={() => selectedView = 'rankings'}>
          🏆 Rankings
        </button>
      </div>

      <button 
        class="action-btn btn-success"
        on:click={finalizeResults}
        disabled={isProcessing || judgingStats.completedSessions === 0}
      >
        {isProcessing ? '⏳ Processing...' : '📊 Finalize Results'}
      </button>

      <button 
        class="action-btn btn-primary"
        on:click={publishResults}
        disabled={competition.results_published}
      >
        {competition.results_published ? '✅ Published' : '📢 Publish Results'}
      </button>

      <button class="action-btn btn-secondary" on:click={() => goto('/officers/manage-competitions')}>
        ⬅️ Back
      </button>
    </div>

    <!-- Content -->
    <div class="content-section">
      {#if selectedView === 'overview'}
        <div class="section-header">
          <h2 class="section-title">Judging Overview</h2>
        </div>
        <div class="section-content">
          <div style="margin-bottom: 2rem;">
            <h3>Overall Progress</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {judgingStats.completionPercentage}%"></div>
            </div>
            <p class="progress-text">
              {judgingStats.completedSessions} of {judgingStats.totalEntries * judgingStats.totalJudges} judging sessions completed
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            <div>
              {#if competition?.category_system === 'custom' && rankingGroups.length > 0}
                <h4>Custom Ranking Groups ({rankingGroups.length})</h4>
                {#each rankingGroups as group}
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>{group.group_name}</span>
                    <span>{getGroupEntryCount(group)} entries</span>
                  </div>
                {/each}
              {:else}
                <h4>Categories ({categories.length})</h4>
                {#each categories as category}
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>{category.name}</span>
                    <span>{category.entryCount} entries</span>
                  </div>
                {/each}
              {/if}
            </div>

            <div>
              <h4>Score Distribution</h4>
              <!-- Add score distribution chart here if needed -->
              <p>Average score: {judgingStats.averageScore}/50</p>
              <p>Completed judging sessions: {judgingStats.completedSessions}</p>
            </div>
          </div>
        </div>

      {:else if selectedView === 'judges'}
        <div class="section-header">
          <h2 class="section-title">Judge Progress ({judges.length})</h2>
        </div>
        <div class="section-content">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judge</th>
                <th>Role</th>
                <th>Progress</th>
                <th>Completion</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {#each judges as judge}
                {@const progress = getJudgeProgress(judge.judge_id)}
                <tr>
                  <td>
                    <div>
                      <div style="font-weight: 600;">{judge.judge?.name}</div>
                      <div style="font-size: 0.875rem; color: #666;">{judge.judge?.email}</div>
                    </div>
                  </td>
                  <td>
                    <span style="text-transform: capitalize;">
                      {judge.judge_role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div class="progress-bar" style="width: 120px;">
                      <div class="progress-fill" style="width: {progress.percentage}%"></div>
                    </div>
                    <div class="progress-text">{progress.percentage}%</div>
                  </td>
                  <td>{progress.completed} / {progress.total}</td>
                  <td>{formatDate(judge.assigned_at)}</td>
                </tr>
              {/each}
            </tbody>
          </table>

          <!-- Mobile Cards for Judges -->
          <div class="mobile-cards">
            {#each judges as judge}
              {@const progress = getJudgeProgress(judge.judge_id)}
              <div class="mobile-card">
                <div class="mobile-card-header">
                  <div>
                    <h3 class="mobile-card-title">{judge.judge?.name}</h3>
                    <div class="mobile-card-subtitle">{judge.judge?.email}</div>
                  </div>
                  <div class="mobile-card-badge" style="background: #e5e7eb; color: #374151;">
                    {judge.judge_role.replace('_', ' ')}
                  </div>
                </div>
                
                <div class="mobile-card-details">
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Assigned</span>
                    <span class="mobile-detail-value">{formatDate(judge.assigned_at)}</span>
                  </div>
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Completed</span>
                    <span class="mobile-detail-value">{progress.completed} / {progress.total}</span>
                  </div>
                </div>

                <div class="mobile-progress">
                  <div class="mobile-progress-label">
                    <span>Progress</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div class="mobile-progress-bar">
                    <div class="mobile-progress-fill" style="width: {progress.percentage}%"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

      {:else if selectedView === 'entries'}
        <div class="section-header">
          <h2 class="section-title">Entry Scores ({entries.length})</h2>
        </div>
        <div class="section-content">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Brewer</th>
                <th>Category</th>
                <th>Judges</th>
                <th>Average Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each entries as entry}
                {@const scores = getEntryScores(entry.id)}
                <tr>
                  <td>
                    <div>
                      <div style="font-weight: 600; color: #ff3e00;">#{entry.entry_number}</div>
                      <div style="font-size: 0.875rem;">{entry.beer_name || 'No name'}</div>
                    </div>
                  </td>
                  <td><span class="{getBrewerNameClass()}">{getBrewerNameDisplay(entry.members?.name)}</span></td>
                  <td>
                    {#if entry.bjcp_categories}
                      {entry.bjcp_categories.category_number}{entry.bjcp_categories.subcategory_letter || ''} - {entry.bjcp_categories.category_name}
                    {:else}
                      Unknown
                    {/if}
                  </td>
                  <td>{scores.count} / {judges.length}</td>
                  <td>
                    {#if scores.count > 0}
                      <span class="score-badge" style="background: {getScoreColor(scores.average)}">
                        {scores.average}/50
                      </span>
                    {:else}
                      <span style="color: #666;">Not scored</span>
                    {/if}
                  </td>
                  <td>
                    {#if scores.count === judges.length}
                      <span style="color: #059669;">✅ Complete</span>
                    {:else if scores.count > 0}
                      <span style="color: #f59e0b;">⏳ Partial</span>
                    {:else}
                      <span style="color: #dc2626;">❌ Pending</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <!-- Mobile Cards for Entries -->
          <div class="mobile-cards">
            {#each entries as entry}
              {@const scores = getEntryScores(entry.id)}
              <div class="mobile-card">
                <div class="mobile-card-header">
                  <div>
                    <h3 class="mobile-card-title">#{entry.entry_number}</h3>
                    <div class="mobile-card-subtitle">{entry.beer_name || 'No name'}</div>
                  </div>
                  <div class="mobile-card-badge" style="background: {scores.count === judges.length ? '#dcfce7' : scores.count > 0 ? '#fef3c7' : '#fee2e2'}; color: {scores.count === judges.length ? '#059669' : scores.count > 0 ? '#f59e0b' : '#dc2626'};">
                    {scores.count === judges.length ? 'Complete' : scores.count > 0 ? 'Partial' : 'Pending'}
                  </div>
                </div>
                
                <div class="mobile-card-details">
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Brewer</span>
                    <span class="mobile-detail-value {getBrewerNameClass()}">{getBrewerNameDisplay(entry.members?.name)}</span>
                  </div>
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Category</span>
                    <span class="mobile-detail-value">
                      {#if entry.bjcp_categories}
                        {entry.bjcp_categories.category_number}{entry.bjcp_categories.subcategory_letter || ''}
                      {:else}
                        Unknown
                      {/if}
                    </span>
                  </div>
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Judges</span>
                    <span class="mobile-detail-value">{scores.count} / {judges.length}</span>
                  </div>
                  <div class="mobile-detail-item">
                    <span class="mobile-detail-label">Score</span>
                    <span class="mobile-detail-value">
                      {#if scores.count > 0}
                        <span style="background: {getScoreColor(scores.average)}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">
                          {scores.average}/50
                        </span>
                      {:else}
                        <span style="color: #666;">Not scored</span>
                      {/if}
                    </span>
                  </div>
                </div>

                {#if entry.bjcp_categories?.category_name}
                  <div style="margin-top: 0.5rem; padding: 0.5rem; background: #f3f4f6; border-radius: 4px;">
                    <div style="font-size: 0.875rem; color: #666;">
                      {entry.bjcp_categories.category_name}
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

      {:else if selectedView === 'rankings'}
        <div class="section-header">
          <h2 class="section-title">
            {#if rankingGroups.length > 0}
              Rankings
            {:else}
              Category Rankings
            {/if}
          </h2>
        </div>
        <div class="section-content">
          <!-- Show individual categories OR custom groups, not both -->
          {#if competition?.category_system === 'custom' && rankingGroups.length > 0}
            <!-- Custom Ranking Group Rankings -->
            {#each rankingGroups as group}
              {@const groupRankings = getGroupRankings(group.id)}
              <div style="margin-bottom: 2rem;">
                <h4>{group.group_name}</h4>
                {#if group.group_description}
                  <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">{group.group_description}</p>
                {/if}
                {#if groupRankings.length === 0}
                  <p style="color: #666; font-style: italic;">No rankings submitted yet</p>
                {:else}
                  {#if groupRankings.length > 1 && hasMultipleJudges(groupRankings)}
                    <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #166534;">
                        ✅ Multi-Judge Point Compilation
                      </div>
                      <p style="color: #166534; margin: 0.5rem 0 0; font-size: 0.875rem;">
                        Rankings from {new Set(groupRankings.map(r => r.judge_id)).size} judges will be compiled using point system: 1st=3pts, 2nd=2pts, 3rd=1pt. Final placement determined by highest total points.
                      </p>
                    </div>
                  {/if}
                  {#if hasMultipleJudges(groupRankings)}
                    <!-- Show compiled results for multiple judges -->
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Entry</th>
                          <th>Total Points</th>
                          <th>Judges</th>
                          <th>Placement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each getUniqueEntriesFromRankings(groupRankings)
                          .map(entry => ({ ...entry, summary: getEntryPointsSummary(entry.id, entry.bjcp_category_id, group.id) }))
                          .sort((a, b) => b.summary.totalPoints - a.summary.totalPoints) as entry, index}
                          {@const placement = index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : index + 1 === 3 ? '3rd' : index + 1 <= 5 ? 'HM' : '-'}
                          <tr>
                            <td>
                              <span style="font-size: 1.2rem; font-weight: 600;">
                                {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}.`}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div style="font-weight: 600; color: #ff3e00;">#{entry.entry_number}</div>
                                <div style="font-size: 0.875rem;">{entry.beer_name || 'No name'}</div>
                              </div>
                            </td>
                            <td>
                              <span style="font-weight: 700; font-size: 1.1rem; color: #059669;">
                                {entry.summary.totalPoints} {entry.summary.totalPoints === 1 ? 'pt' : 'pts'}
                              </span>
                            </td>
                            <td>
                              <span style="color: #666;">
                                {entry.summary.judgeCount} judge{entry.summary.judgeCount === 1 ? '' : 's'}
                              </span>
                            </td>
                            <td>
                              <span style="font-weight: 600; color: {placement === '1st' ? '#d4af37' : placement === '2nd' ? '#c0c0c0' : placement === '3rd' ? '#cd7f32' : placement === 'HM' ? '#059669' : '#666'};">
                                {placement}
                              </span>
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {:else}
                    <!-- Show individual rankings for single judge -->
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Entry</th>
                          <th>Points</th>
                          <th>Judge</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each groupRankings as ranking}
                          {@const entryPoints = getPointsForRanking(ranking.rank_position)}
                          <tr>
                            <td>
                              <span style="font-size: 1.2rem; font-weight: 600;">
                                {ranking.rank_position === 1 ? '🥇' : ranking.rank_position === 2 ? '🥈' : ranking.rank_position === 3 ? '🥉' : `${ranking.rank_position}.`}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div style="font-weight: 600; color: #ff3e00;">#{ranking.entry?.entry_number}</div>
                                <div style="font-size: 0.875rem;">{ranking.entry?.beer_name || 'No name'}</div>
                              </div>
                            </td>
                            <td>
                              <span style="font-weight: 600; color: {entryPoints > 0 ? '#059669' : '#666'};">
                                {entryPoints} {entryPoints === 1 ? 'pt' : 'pts'}
                              </span>
                            </td>
                            <td>{ranking.judge?.name}</td>
                            <td>{ranking.ranking_notes || '-'}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {/if}
                {/if}
              </div>
            {/each}
          {:else}
            <!-- Individual Category Rankings (default system) -->
            {#each categories as category}
              {@const categoryRankings = getCategoryRankings(category.id)}
              <div style="margin-bottom: 2rem;">
                <h4>{category.name}</h4>
                {#if categoryRankings.length === 0}
                  <p style="color: #666; font-style: italic;">No rankings submitted yet</p>
                {:else}
                  {#if categoryRankings.length > 1 && hasMultipleJudges(categoryRankings)}
                    <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #166534;">
                        ✅ Multi-Judge Point Compilation
                      </div>
                      <p style="color: #166534; margin: 0.5rem 0 0; font-size: 0.875rem;">
                        Rankings from {new Set(categoryRankings.map(r => r.judge_id)).size} judges will be compiled using point system: 1st=3pts, 2nd=2pts, 3rd=1pt. Final placement determined by highest total points.
                      </p>
                    </div>
                  {/if}
                  {#if hasMultipleJudges(categoryRankings)}
                    <!-- Show compiled results for multiple judges -->
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Entry</th>
                          <th>Total Points</th>
                          <th>Judges</th>
                          <th>Placement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each getUniqueEntriesFromRankings(categoryRankings)
                          .map(entry => ({ ...entry, summary: getEntryPointsSummary(entry.id, category.id, null) }))
                          .sort((a, b) => b.summary.totalPoints - a.summary.totalPoints) as entry, index}
                          {@const placement = index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : index + 1 === 3 ? '3rd' : index + 1 <= 5 ? 'HM' : '-'}
                          <tr>
                            <td>
                              <span style="font-size: 1.2rem; font-weight: 600;">
                                {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}.`}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div style="font-weight: 600; color: #ff3e00;">#{entry.entry_number}</div>
                                <div style="font-size: 0.875rem;">{entry.beer_name || 'No name'}</div>
                              </div>
                            </td>
                            <td>
                              <span style="font-weight: 700; font-size: 1.1rem; color: #059669;">
                                {entry.summary.totalPoints} {entry.summary.totalPoints === 1 ? 'pt' : 'pts'}
                              </span>
                            </td>
                            <td>
                              <span style="color: #666;">
                                {entry.summary.judgeCount} judge{entry.summary.judgeCount === 1 ? '' : 's'}
                              </span>
                            </td>
                            <td>
                              <span style="font-weight: 600; color: {placement === '1st' ? '#d4af37' : placement === '2nd' ? '#c0c0c0' : placement === '3rd' ? '#cd7f32' : placement === 'HM' ? '#059669' : '#666'};">
                                {placement}
                              </span>
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {:else}
                    <!-- Show individual rankings for single judge -->
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Entry</th>
                          <th>Points</th>
                          <th>Judge</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each categoryRankings as ranking}
                          {@const entryPoints = getPointsForRanking(ranking.rank_position)}
                          <tr>
                            <td>
                              <span style="font-size: 1.2rem; font-weight: 600;">
                                {ranking.rank_position === 1 ? '🥇' : ranking.rank_position === 2 ? '🥈' : ranking.rank_position === 3 ? '🥉' : `${ranking.rank_position}.`}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div style="font-weight: 600; color: #ff3e00;">#{ranking.entry?.entry_number}</div>
                                <div style="font-size: 0.875rem;">{ranking.entry?.beer_name || 'No name'}</div>
                              </div>
                            </td>
                            <td>
                              <span style="font-weight: 600; color: {entryPoints > 0 ? '#059669' : '#666'};">
                                {entryPoints} {entryPoints === 1 ? 'pt' : 'pts'}
                              </span>
                            </td>
                            <td>{ranking.judge?.name}</td>
                            <td>{ranking.ranking_notes || '-'}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {/if}
                {/if}
              </div>
            {/each}
          {/if}

          <!-- Mobile Rankings -->
          <div class="mobile-cards">
            {#if competition?.category_system === 'custom' && rankingGroups.length > 0}
              <!-- Custom Ranking Groups Mobile -->
              {#each rankingGroups as group}
                {@const groupRankings = getGroupRankings(group.id)}
                <div class="mobile-card">
                  <div class="mobile-card-header">
                    <div>
                      <h3 class="mobile-card-title">{group.group_name}</h3>
                      {#if group.group_description}
                        <div class="mobile-card-subtitle">{group.group_description}</div>
                      {/if}
                    </div>
                    <div class="mobile-card-badge" style="background: #e5e7eb; color: #374151;">
                      {getGroupEntryCount(group)} entries
                    </div>
                  </div>

                  {#if groupRankings.length === 0}
                    <div style="padding: 1rem; text-align: center; color: #666; font-style: italic;">
                      No rankings submitted yet
                    </div>
                  {:else}
                    {#if groupRankings.length > 1 && hasMultipleJudges(groupRankings)}
                      <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #166534;">
                        ✅ Multi-Judge Point Compilation - {new Set(groupRankings.map(r => r.judge_id)).size} judges
                      </div>
                    {/if}

                    <div style="margin-top: 1rem;">
                      {#if hasMultipleJudges(groupRankings)}
                        {#each getUniqueEntriesFromRankings(groupRankings)
                          .map(entry => ({ ...entry, summary: getEntryPointsSummary(entry.id, entry.bjcp_category_id, group.id) }))
                          .sort((a, b) => b.summary.totalPoints - a.summary.totalPoints) as entry, index}
                          {@const placement = index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : index + 1 === 3 ? '3rd' : index + 1 <= 5 ? 'HM' : '-'}
                          <div class="mobile-ranking-item">
                            <div class="mobile-ranking-position">
                              {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}.`}
                            </div>
                            <div class="mobile-ranking-entry">
                              <div class="mobile-ranking-entry-number">#{entry.entry_number}</div>
                              <div class="mobile-ranking-beer-name">{entry.beer_name || 'No name'}</div>
                              <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                                {entry.summary.judgeCount} judge{entry.summary.judgeCount === 1 ? '' : 's'} • {placement}
                              </div>
                            </div>
                            <div class="mobile-ranking-points">
                              {entry.summary.totalPoints} {entry.summary.totalPoints === 1 ? 'pt' : 'pts'}
                            </div>
                          </div>
                        {/each}
                      {:else}
                        {#each groupRankings as ranking}
                          {@const entryPoints = getPointsForRanking(ranking.rank_position)}
                          <div class="mobile-ranking-item">
                            <div class="mobile-ranking-position">
                              {ranking.rank_position === 1 ? '🥇' : ranking.rank_position === 2 ? '🥈' : ranking.rank_position === 3 ? '🥉' : `${ranking.rank_position}.`}
                            </div>
                            <div class="mobile-ranking-entry">
                              <div class="mobile-ranking-entry-number">#{ranking.entry?.entry_number}</div>
                              <div class="mobile-ranking-beer-name">{ranking.entry?.beer_name || 'No name'}</div>
                              <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                                {ranking.judge?.name}{#if ranking.ranking_notes} • {ranking.ranking_notes}{/if}
                              </div>
                            </div>
                            <div class="mobile-ranking-points">
                              {entryPoints} {entryPoints === 1 ? 'pt' : 'pts'}
                            </div>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            {:else}
              <!-- Individual Categories Mobile -->
              {#each categories as category}
                {@const categoryRankings = getCategoryRankings(category.id)}
                <div class="mobile-card">
                  <div class="mobile-card-header">
                    <div>
                      <h3 class="mobile-card-title">{category.name}</h3>
                    </div>
                    <div class="mobile-card-badge" style="background: #e5e7eb; color: #374151;">
                      {category.entryCount} entries
                    </div>
                  </div>

                  {#if categoryRankings.length === 0}
                    <div style="padding: 1rem; text-align: center; color: #666; font-style: italic;">
                      No rankings submitted yet
                    </div>
                  {:else}
                    {#if categoryRankings.length > 1 && hasMultipleJudges(categoryRankings)}
                      <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; font-size: 0.875rem; color: #166534;">
                        ✅ Multi-Judge Point Compilation - {new Set(categoryRankings.map(r => r.judge_id)).size} judges
                      </div>
                    {/if}

                    <div style="margin-top: 1rem;">
                      {#if hasMultipleJudges(categoryRankings)}
                        {#each getUniqueEntriesFromRankings(categoryRankings)
                          .map(entry => ({ ...entry, summary: getEntryPointsSummary(entry.id, category.id, null) }))
                          .sort((a, b) => b.summary.totalPoints - a.summary.totalPoints) as entry, index}
                          {@const placement = index + 1 === 1 ? '1st' : index + 1 === 2 ? '2nd' : index + 1 === 3 ? '3rd' : index + 1 <= 5 ? 'HM' : '-'}
                          <div class="mobile-ranking-item">
                            <div class="mobile-ranking-position">
                              {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}.`}
                            </div>
                            <div class="mobile-ranking-entry">
                              <div class="mobile-ranking-entry-number">#{entry.entry_number}</div>
                              <div class="mobile-ranking-beer-name">{entry.beer_name || 'No name'}</div>
                              <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                                {entry.summary.judgeCount} judge{entry.summary.judgeCount === 1 ? '' : 's'} • {placement}
                              </div>
                            </div>
                            <div class="mobile-ranking-points">
                              {entry.summary.totalPoints} {entry.summary.totalPoints === 1 ? 'pt' : 'pts'}
                            </div>
                          </div>
                        {/each}
                      {:else}
                        {#each categoryRankings as ranking}
                          {@const entryPoints = getPointsForRanking(ranking.rank_position)}
                          <div class="mobile-ranking-item">
                            <div class="mobile-ranking-position">
                              {ranking.rank_position === 1 ? '🥇' : ranking.rank_position === 2 ? '🥈' : ranking.rank_position === 3 ? '🥉' : `${ranking.rank_position}.`}
                            </div>
                            <div class="mobile-ranking-entry">
                              <div class="mobile-ranking-entry-number">#{ranking.entry?.entry_number}</div>
                              <div class="mobile-ranking-beer-name">{ranking.entry?.beer_name || 'No name'}</div>
                              <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                                {ranking.judge?.name}{#if ranking.ranking_notes} • {ranking.ranking_notes}{/if}
                              </div>
                            </div>
                            <div class="mobile-ranking-points">
                              {entryPoints} {entryPoints === 1 ? 'pt' : 'pts'}
                            </div>
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>