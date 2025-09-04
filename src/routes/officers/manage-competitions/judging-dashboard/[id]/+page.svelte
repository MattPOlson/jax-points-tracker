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
          category:bjcp_categories(category_name, category_number, subcategory_letter)
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

  async function processAndFinalizeResults() {
    // This function would aggregate all judging data and create final results
    // For now, we'll update the existing competition_results table
    
    const finalResults = [];

    for (const entry of entries) {
      const entryScores = getEntryScores(entry.id);
      
      if (entryScores.count > 0) {
        // Calculate final score (average of all judges)
        const finalScore = entryScores.average;
        
        // Get any judge notes
        const allNotes = entryScores.sessions
          .filter(s => s.judge_notes)
          .map(s => s.judge_notes)
          .join('\n\n---\n\n');

        // Determine placement based on rankings and scores
        // This is a simplified approach - real competitions might use more complex algorithms
        const categoryRankings = getCategoryRankings(entry.bjcp_category_id);
        let placement = null;
        
        // Find if this entry appears in rankings
        const ranking = categoryRankings.find(r => r.entry_id === entry.id);
        if (ranking) {
          if (ranking.rank_position === 1) placement = '1';
          else if (ranking.rank_position === 2) placement = '2';
          else if (ranking.rank_position === 3) placement = '3';
          else if (ranking.rank_position <= 5) placement = 'HM'; // Honorable mention for top 5
        }

        finalResults.push({
          competition_id: competitionId,
          entry_id: entry.id,
          score: Math.round(finalScore),
          placement: placement,
          judge_notes: allNotes || null,
          updated_at: new Date().toISOString()
        });
      }
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
              <h4>Categories ({categories.length})</h4>
              {#each categories as category}
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                  <span>{category.name}</span>
                  <span>{category.entryCount} entries</span>
                </div>
              {/each}
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
                  <td>{entry.members?.name}</td>
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
        </div>

      {:else if selectedView === 'rankings'}
        <div class="section-header">
          <h2 class="section-title">Category Rankings</h2>
        </div>
        <div class="section-content">
          {#each categories as category}
            {@const categoryRankings = getCategoryRankings(category.id)}
            <div style="margin-bottom: 2rem;">
              <h4>{category.name}</h4>
              {#if categoryRankings.length === 0}
                <p style="color: #666; font-style: italic;">No rankings submitted yet</p>
              {:else}
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Entry</th>
                      <th>Judge</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each categoryRankings as ranking}
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
                        <td>{ranking.judge?.name}</td>
                        <td>{ranking.ranking_notes || '-'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>