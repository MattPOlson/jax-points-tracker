<!-- Digital Judging Interface -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { 
    competitionJudgingStore, 
    activeSession,
    isJudging,
    currentEntry
  } from '$lib/stores/competitionJudgingStore';

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let currentEntryIndex = 0;
  let judgingData = {
    aroma_score: '',
    appearance_score: '',
    flavor_score: '',
    mouthfeel_score: '',
    overall_score: '',
    judge_notes: '',
    private_notes: ''
  };

  let isSaving = false;
  let showScoreBreakdown = false;
  let autoSaveTimeout = null;

  // Score maximums for validation
  const scoreMaximums = {
    aroma_score: 12,
    appearance_score: 3, 
    flavor_score: 20,
    mouthfeel_score: 5,
    overall_score: 10
  };

  onMount(async () => {
    if (!$userProfile) {
      goto('/auth');
      return;
    }

    try {
      // Start or resume judging session
      if (!$isJudging || $activeSession.activeCompetition?.id !== competitionId) {
        await competitionJudgingStore.startJudgingSession(competitionId, $userProfile.id);
      }
      
      // Load data for current entry
      loadCurrentEntryData();
    } catch (err) {
      console.error('Error starting judging session:', err);
      alert(`Failed to start judging: ${err.message}`);
      goto('/judge');
    }
  });

  onDestroy(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
  });

  // Reactive statements - reference individual fields to ensure reactivity
  $: totalScore = (parseInt(judgingData.aroma_score) || 0) + 
                 (parseInt(judgingData.appearance_score) || 0) + 
                 (parseInt(judgingData.flavor_score) || 0) + 
                 (parseInt(judgingData.mouthfeel_score) || 0) + 
                 (parseInt(judgingData.overall_score) || 0);
  $: progress = competitionJudgingStore.getJudgingProgress();
  
  // Load judging data for current entry
  function loadCurrentEntryData() {
    if (!$currentEntry) return;
    
    const existingJudging = $currentEntry.judging;
    if (existingJudging) {
      judgingData = {
        aroma_score: existingJudging.aroma_score || '',
        appearance_score: existingJudging.appearance_score || '',
        flavor_score: existingJudging.flavor_score || '',
        mouthfeel_score: existingJudging.mouthfeel_score || '',
        overall_score: existingJudging.overall_score || '',
        judge_notes: existingJudging.judge_notes || '',
        private_notes: existingJudging.private_notes || ''
      };
    } else {
      // Reset form for new entry
      judgingData = {
        aroma_score: '',
        appearance_score: '',
        flavor_score: '',
        mouthfeel_score: '',
        overall_score: '',
        judge_notes: '',
        private_notes: ''
      };
    }
  }

  function calculateTotalScore() {
    return ['aroma_score', 'appearance_score', 'flavor_score', 'mouthfeel_score', 'overall_score']
      .reduce((sum, field) => {
        const score = parseInt(judgingData[field]) || 0;
        return sum + score;
      }, 0);
  }

  function validateScore(field, value) {
    const numValue = parseInt(value);
    const max = scoreMaximums[field];
    
    if (isNaN(numValue) || numValue < 0 || numValue > max) {
      return false;
    }
    return true;
  }

  function handleScoreInput(field, event) {
    const value = event.target.value;
    
    if (value === '' || validateScore(field, value)) {
      judgingData[field] = value;
      scheduleAutoSave();
    } else {
      // Reset to previous valid value
      event.target.value = judgingData[field];
    }
  }

  function handleNotesInput() {
    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
      saveProgress();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }

  async function saveProgress() {
    if (!$currentEntry || isSaving) return;

    try {
      const dataToSave = {
        ...judgingData
        // total_score is auto-calculated by database
      };

      // Convert empty strings to null for database
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === '') {
          dataToSave[key] = null;
        } else if (key.includes('_score')) {
          dataToSave[key] = parseInt(dataToSave[key]) || null;
        }
      });

      await competitionJudgingStore.saveJudgingResults($currentEntry.id, dataToSave);
      showToast('Progress saved', 'success');
    } catch (err) {
      console.error('Error auto-saving:', err);
      showToast('Failed to save progress', 'error');
    }
  }

  async function saveAndNext() {
    if (!$currentEntry) return;

    isSaving = true;
    try {
      await saveProgress();
      navigateToNext();
    } finally {
      isSaving = false;
    }
  }

  async function saveAndPrevious() {
    if (!$currentEntry) return;

    isSaving = true;
    try {
      await saveProgress();
      navigateToPrevious();
    } finally {
      isSaving = false;
    }
  }

  function navigateToNext() {
    const entries = $activeSession.assignedEntries;
    const nextIndex = currentEntryIndex + 1;
    
    if (nextIndex < entries.length) {
      currentEntryIndex = nextIndex;
      competitionJudgingStore.setCurrentEntry(nextIndex);
      loadCurrentEntryData();
    }
  }

  function navigateToPrevious() {
    if (currentEntryIndex > 0) {
      currentEntryIndex = currentEntryIndex - 1;
      competitionJudgingStore.setCurrentEntry(currentEntryIndex);
      loadCurrentEntryData();
    }
  }

  function navigateToEntry(index) {
    currentEntryIndex = index;
    competitionJudgingStore.setCurrentEntry(index);
    loadCurrentEntryData();
  }

  function getScoreColor(score) {
    if (score >= 45) return '#059669'; // Excellent
    if (score >= 38) return '#0891b2'; // Very Good  
    if (score >= 30) return '#eab308'; // Good
    if (score >= 21) return '#f59e0b'; // Fair
    return '#dc2626'; // Poor
  }

  function getScoreDescription(score) {
    if (score >= 45) return 'Excellent';
    if (score >= 38) return 'Very Good';
    if (score >= 30) return 'Good';
    if (score >= 21) return 'Fair';
    if (score > 0) return 'Poor';
    return '';
  }

  async function finishJudging() {
    if (!confirm('Are you sure you want to finish judging? You can still make changes later if needed.')) {
      return;
    }

    // Save current progress
    await saveProgress();
    
    showToast('Judging session saved successfully!', 'success');
    setTimeout(() => {
      goto('/judge');
    }, 1500);
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

  // Watch for current entry changes
  $: if ($currentEntry) {
    loadCurrentEntryData();
  }
</script>

<style>
  .judging-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
    min-height: 100vh;
    background: #f8fafc;
  }

  /* Header */
  .header {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .competition-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem;
  }

  .progress-bar {
    background: #e5e7eb;
    border-radius: 8px;
    height: 8px;
    margin: 1rem 0;
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
    text-align: center;
  }

  /* Entry Navigation */
  .entry-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .entry-nav-item {
    min-width: 60px;
    height: 40px;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
  }

  .entry-nav-item.active {
    background: #ff3e00;
    color: white;
  }

  .entry-nav-item.judged {
    background: #059669;
    color: white;
  }

  .entry-nav-item.pending {
    background: #e5e7eb;
    color: #6b7280;
  }

  /* Main Content */
  .main-content {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  .entry-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .entry-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
  }

  .entry-number {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ff3e00;
    margin: 0 0 0.5rem;
  }

  .entry-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    font-size: 0.9rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
  }

  .detail-label {
    color: #666;
    margin-bottom: 0.25rem;
  }

  .detail-value {
    color: #333;
    font-weight: 500;
  }

  /* Scoring Section */
  .scoring-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
  }

  .score-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .score-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .score-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .score-max {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: normal;
  }

  .score-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
    margin: 0;
    background-color: white;
    display: block;
  }

  .score-input:focus {
    outline: none;
    border-color: #ff3e00;
  }

  .score-input:invalid {
    border-color: #dc2626;
  }

  /* Total Score Display */
  .total-score {
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 1rem;
  }

  .total-score-value {
    font-size: 2.5rem;
    font-weight: 100;
    margin: 0;
  }

  .total-score-label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0.5rem 0;
  }

  .score-description {
    font-size: 1.1rem;
    font-weight: 500;
    opacity: 0.95;
  }

  /* Notes Section */
  .notes-section {
    margin-bottom: 1.5rem;
  }

  .notes-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  .notes-item {
    display: flex;
    flex-direction: column;
  }

  .notes-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .notes-textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1rem;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  .notes-textarea:focus {
    outline: none;
    border-color: #ff3e00;
  }

  /* Navigation Buttons */
  .nav-buttons {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .nav-btn {
    flex: 1;
    min-width: 120px;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-btn-secondary {
    background: #6b7280;
    color: white;
  }

  .nav-btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .nav-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
  }

  .nav-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  }

  .nav-btn-finish {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
  }

  .nav-btn-finish:hover:not(:disabled) {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  }

  .nav-btn-link {
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .judging-container {
      padding: 0.5rem;
    }

    .entry-details {
      grid-template-columns: 1fr;
    }

    .score-grid {
      grid-template-columns: 1fr 1fr;
    }

    .nav-buttons {
      flex-direction: column;
      gap: 0.75rem;
      padding: 0 0.5rem;
    }

    .nav-btn,
    a.nav-btn {
      width: 100%;
      flex: none;
      margin: 0;
      box-sizing: border-box;
    }

    .total-score-value {
      font-size: 2rem;
    }

    .notes-textarea {
      padding: 0.6rem;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
    }

    .notes-grid {
      padding: 0;
    }

    .notes-item {
      width: 100%;
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .judging-container {
      padding: 0.25rem;
    }

    .score-grid {
      grid-template-columns: 1fr;
    }

    .header {
      padding: 1rem;
      margin-bottom: 0.5rem;
    }

    .entry-card {
      padding: 1rem;
      margin: 0;
    }

    .nav-buttons {
      gap: 0.5rem;
      padding: 0.25rem;
      margin-top: 1rem;
    }

    .nav-btn,
    a.nav-btn {
      padding: 0.875rem 1.25rem;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
    }

    .notes-textarea {
      padding: 0.75rem;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      min-height: 100px;
    }

    .notes-grid {
      gap: 1rem;
      padding: 0;
      margin: 0;
    }

    .notes-item {
      margin-bottom: 0.5rem;
      padding: 0;
      width: 100%;
    }

    .notes-label {
      margin-bottom: 0.5rem;
      padding: 0 0.25rem;
    }

    /* Ensure consistent spacing */
    .scoring-section,
    .notes-section {
      margin-bottom: 1rem;
    }

    .section-title {
      padding: 0 0.25rem;
      margin-bottom: 0.75rem;
    }
  }
</style>

<div class="judging-container">
  {#if !$isJudging}
    <div style="text-align: center; padding: 3rem;">
      <h2>Starting judging session...</h2>
    </div>
  {:else if !$currentEntry}
    <div style="text-align: center; padding: 3rem;">
      <h2>No entries to judge</h2>
      <button class="nav-btn nav-btn-secondary" on:click={() => goto('/judge')}>
        Back to Judge Portal
      </button>
    </div>
  {:else}
    <!-- Header -->
    <div class="header">
      <h1 class="competition-title">{$activeSession.activeCompetition?.name}</h1>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          style="width: {progress.percentage}%"
        ></div>
      </div>
      <div class="progress-text">
        {progress.completed} of {progress.total} entries judged ({progress.percentage}%)
      </div>
    </div>

    <!-- Entry Navigation -->
    <div class="entry-nav">
      {#each $activeSession.assignedEntries as entry, index}
        <button 
          class="entry-nav-item {index === currentEntryIndex ? 'active' : entry.hasBeenJudged ? 'judged' : 'pending'}"
          on:click={() => navigateToEntry(index)}
        >
          {entry.entry_number}
        </button>
      {/each}
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="entry-card">
        <!-- Entry Header -->
        <div class="entry-header">
          <h2 class="entry-number">Entry #{$currentEntry.entry_number}</h2>
          <div class="entry-details">
            <div class="detail-item">
              <span class="detail-label">Beer Name</span>
              <span class="detail-value">{$currentEntry.beer_name || 'No name provided'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Category</span>
              <span class="detail-value">
                {$currentEntry.category?.category_number || ''}{$currentEntry.category?.subcategory_letter || ''} - {$currentEntry.category?.category_name || 'Unknown'}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Subcategory</span>
              <span class="detail-value">{$currentEntry.category?.subcategory_name || 'N/A'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Entry Notes</span>
              <span class="detail-value">{$currentEntry.beer_notes || 'None'}</span>
            </div>
          </div>
        </div>

        <!-- Total Score Display -->
        <div class="total-score" style="background: {totalScore > 0 ? getScoreColor(totalScore) : '#6b7280'}">
          <h3 class="total-score-value">{totalScore}/50</h3>
          <p class="total-score-label">Total Score</p>
          {#if totalScore > 0}
            <p class="score-description">{getScoreDescription(totalScore)}</p>
          {/if}
        </div>

        <!-- Scoring Section -->
        <div class="scoring-section">
          <h3 class="section-title">BJCP Scoring (50 points total)</h3>
          
          <div class="score-grid">
            <div class="score-item">
              <label class="score-label" for="aroma">
                Aroma <span class="score-max">(0-12)</span>
              </label>
              <input 
                id="aroma"
                type="number" 
                class="score-input"
                min="0" 
                max="12"
                bind:value={judgingData.aroma_score}
                on:input={(e) => handleScoreInput('aroma_score', e)}
                placeholder="0"
              />
            </div>

            <div class="score-item">
              <label class="score-label" for="appearance">
                Appearance <span class="score-max">(0-3)</span>
              </label>
              <input 
                id="appearance"
                type="number" 
                class="score-input"
                min="0" 
                max="3"
                bind:value={judgingData.appearance_score}
                on:input={(e) => handleScoreInput('appearance_score', e)}
                placeholder="0"
              />
            </div>

            <div class="score-item">
              <label class="score-label" for="flavor">
                Flavor <span class="score-max">(0-20)</span>
              </label>
              <input 
                id="flavor"
                type="number" 
                class="score-input"
                min="0" 
                max="20"
                bind:value={judgingData.flavor_score}
                on:input={(e) => handleScoreInput('flavor_score', e)}
                placeholder="0"
              />
            </div>

            <div class="score-item">
              <label class="score-label" for="mouthfeel">
                Mouthfeel <span class="score-max">(0-5)</span>
              </label>
              <input 
                id="mouthfeel"
                type="number" 
                class="score-input"
                min="0" 
                max="5"
                bind:value={judgingData.mouthfeel_score}
                on:input={(e) => handleScoreInput('mouthfeel_score', e)}
                placeholder="0"
              />
            </div>

            <div class="score-item">
              <label class="score-label" for="overall">
                Overall <span class="score-max">(0-10)</span>
              </label>
              <input 
                id="overall"
                type="number" 
                class="score-input"
                min="0" 
                max="10"
                bind:value={judgingData.overall_score}
                on:input={(e) => handleScoreInput('overall_score', e)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section">
          <h3 class="section-title">Judging Notes</h3>
          
          <div class="notes-grid">
            <div class="notes-item">
              <label class="notes-label" for="public-notes">
                Judge Notes (visible to entrant)
              </label>
              <textarea 
                id="public-notes"
                class="notes-textarea"
                bind:value={judgingData.judge_notes}
                on:input={handleNotesInput}
                placeholder="Provide constructive feedback about aroma, appearance, flavor, mouthfeel, and overall impression..."
              ></textarea>
            </div>

            <div class="notes-item">
              <label class="notes-label" for="private-notes">
                Private Notes (only visible to judges and officers)
              </label>
              <textarea 
                id="private-notes"
                class="notes-textarea"
                bind:value={judgingData.private_notes}
                on:input={handleNotesInput}
                placeholder="Internal judging notes, comparisons, or other observations..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <button 
            class="nav-btn nav-btn-secondary"
            on:click={saveAndPrevious}
            disabled={currentEntryIndex === 0 || isSaving}
          >
            ⬅️ Previous Entry
          </button>

          <a 
            href="/judge/competition/{competitionId}/scoresheet"
            class="nav-btn nav-btn-secondary nav-btn-link"
          >
            📋 BJCP Scoresheet
          </a>

          <a 
            href="/judge/competition/{competitionId}/rankings"
            class="nav-btn nav-btn-secondary nav-btn-link"
          >
            🏆 Rankings
          </a>

          {#if currentEntryIndex < $activeSession.assignedEntries.length - 1}
            <button 
              class="nav-btn nav-btn-primary"
              on:click={saveAndNext}
              disabled={isSaving}
            >
              Next Entry ➡️
            </button>
          {:else}
            <button 
              class="nav-btn nav-btn-finish"
              on:click={finishJudging}
              disabled={isSaving}
            >
              🏁 Finish Judging
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>