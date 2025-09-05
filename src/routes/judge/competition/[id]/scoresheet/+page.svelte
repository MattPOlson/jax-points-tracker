<!-- Interactive BJCP Score Sheet -->
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
  let autoSaveTimeout = null;
  let currentEntryId = null; // Track current entry to prevent unnecessary reloading

  // BJCP Score Sheet Data Structure
  let scoresheetData = {
    // Scoring fields
    aroma_score: '',
    appearance_score: '',
    flavor_score: '',
    mouthfeel_score: '',
    overall_score: '',
    
    // Detailed comments for each section
    aroma_comments: '',
    appearance_comments: '',
    flavor_comments: '',
    mouthfeel_comments: '',
    overall_comments: '',
    
    // Bottle inspection
    bottle_inspection_appropriate: true,
    bottle_inspection_comments: '',
    
    // Descriptor checkboxes (off-flavors and aromas)
    descriptors: {
      acetaldehyde: false,
      alcoholic: false,
      astringent: false,
      diacetyl: false,
      dms: false,
      estery: false,
      grassy: false,
      light_struck: false,
      metallic: false,
      musty: false,
      oxidized: false,
      phenolic: false,
      solvent: false,
      sour_acidic: false,
      sulfur: false,
      vegetal: false,
      yeasty: false
    },
    
    // Overall assessment sliders
    stylistic_accuracy: 50, // 0-100 scale (Classic Example to Not to Style)
    technical_merit: 50,    // 0-100 scale (Flawless to Significant Flaws)
    intangibles: 50,        // 0-100 scale (Wonderful to Lifeless)
    
    // Judge notes (private)
    private_notes: ''
  };

  let isSaving = false;

  // Score maximums for validation
  const scoreMaximums = {
    aroma_score: 12,
    appearance_score: 3, 
    flavor_score: 20,
    mouthfeel_score: 5,
    overall_score: 10
  };

  // Descriptor definitions for tooltips
  const descriptorDefinitions = {
    acetaldehyde: "Green apple-like aroma and flavor.",
    alcoholic: "The aroma, flavor, and warming effect of ethanol and higher alcohols. Sometimes described as 'hot.'",
    astringent: "Puckering, lingering harshness and/or dryness in the finish/aftertaste; harsh graininess; huskiness.",
    diacetyl: "Artificial butter, butterscotch, or toffee aroma and flavor. Sometimes perceived as a slickness on the tongue.",
    dms: "At low levels a sweet, cooked or canned corn-like aroma and flavor.",
    estery: "Aroma and/or flavor of any ester (fruits, fruit flavorings, or roses).",
    grassy: "Aroma/flavor of fresh-cut grass or green leaves.",
    light_struck: "Similar to the aroma of a skunk.",
    metallic: "Tinny, coiny, copper, iron, or blood-like flavor.",
    musty: "Stale, musty, or moldy aromas/flavors.",
    oxidized: "Any one or combination of winy/vinous, cardboard, papery, or sherry-like aromas and flavors.",
    phenolic: "Spicy (clove, pepper), smoky, plastic, plastic adhesive strip, and/or medicinal (chlorophenolic).",
    solvent: "Aromas and flavors of higher alcohols (fusel alcohols). Similar to acetone or lacquer thinner aromas.",
    sour_acidic: "Tartness in aroma and flavor. Can be sharp and clean (lactic acid), or vinegar-like (acetic acid).",
    sulfur: "The aroma of rotten eggs or burning matches.",
    vegetal: "Cooked, canned, or rotten vegetable aroma and flavor (cabbage, onion, celery, asparagus, etc.)",
    yeasty: "A bready, sulfury or yeast-like aroma or flavor."
  };

  onMount(async () => {
    if (!$userProfile) {
      goto('/auth');
      return;
    }

    try {
      if (!$isJudging || $activeSession.activeCompetition?.id !== competitionId) {
        await competitionJudgingStore.startJudgingSession(competitionId, $userProfile.id);
      }
      
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
  $: totalScore = (parseInt(scoresheetData.aroma_score) || 0) + 
                 (parseInt(scoresheetData.appearance_score) || 0) + 
                 (parseInt(scoresheetData.flavor_score) || 0) + 
                 (parseInt(scoresheetData.mouthfeel_score) || 0) + 
                 (parseInt(scoresheetData.overall_score) || 0);
  $: progress = competitionJudgingStore.getJudgingProgress();
  $: if ($currentEntry && currentEntryId !== $currentEntry.id) loadCurrentEntryData();
  
  function loadCurrentEntryData() {
    if (!$currentEntry) return;
    
    currentEntryId = $currentEntry.id;
    
    console.log('Loading data for entry:', $currentEntry.id);
    
    // Reset scoresheet data to defaults
    scoresheetData = {
      aroma_score: '',
      appearance_score: '',
      flavor_score: '',
      mouthfeel_score: '',
      overall_score: '',
      aroma_comments: '',
      appearance_comments: '',
      flavor_comments: '',
      mouthfeel_comments: '',
      overall_comments: '',
      bottle_inspection_appropriate: true,
      bottle_inspection_comments: '',
      descriptors: {
        acetaldehyde: false,
        alcoholic: false,
        astringent: false,
        diacetyl: false,
        dms: false,
        estery: false,
        grassy: false,
        light_struck: false,
        metallic: false,
        musty: false,
        oxidized: false,
        phenolic: false,
        solvent: false,
        sour_acidic: false,
        sulfur: false,
        vegetal: false,
        yeasty: false
      },
      stylistic_accuracy: 50,
      technical_merit: 50,
      intangibles: 50,
      private_notes: ''
    };
    
    // Load existing judging data if available
    const existingJudging = $currentEntry.judging;
    if (existingJudging) {
      // Load basic scores
      if (existingJudging.aroma_score) scoresheetData.aroma_score = existingJudging.aroma_score;
      if (existingJudging.appearance_score) scoresheetData.appearance_score = existingJudging.appearance_score;
      if (existingJudging.flavor_score) scoresheetData.flavor_score = existingJudging.flavor_score;
      if (existingJudging.mouthfeel_score) scoresheetData.mouthfeel_score = existingJudging.mouthfeel_score;
      if (existingJudging.overall_score) scoresheetData.overall_score = existingJudging.overall_score;
      
      // Load detailed scoresheet data if available
      if (existingJudging.scoresheet_data) {
        try {
          const savedData = JSON.parse(existingJudging.scoresheet_data);
          scoresheetData = { ...scoresheetData, ...savedData };
        } catch (e) {
          console.warn('Could not parse existing scoresheet data:', e);
        }
      }
    }
  }

  function calculateTotalScore() {
    return ['aroma_score', 'appearance_score', 'flavor_score', 'mouthfeel_score', 'overall_score']
      .reduce((sum, field) => {
        const score = parseInt(scoresheetData[field]) || 0;
        return sum + score;
      }, 0);
  }

  function getScoreDescription(score) {
    if (score >= 45) return 'Outstanding - World-class example of style';
    if (score >= 38) return 'Excellent - Exemplifies style well, requires minor fine-tuning';
    if (score >= 30) return 'Very Good - Generally within style parameters, some minor flaws';
    if (score >= 21) return 'Good - Misses the mark on style and/or minor flaws';
    if (score >= 14) return 'Fair - Off flavors, aromas or major style deficiencies';
    return 'Problematic - Major off flavors and aromas dominate';
  }

  function getScoreColor(score) {
    if (score >= 45) return '#059669'; // Outstanding
    if (score >= 38) return '#0891b2'; // Excellent  
    if (score >= 30) return '#eab308'; // Very Good
    if (score >= 21) return '#f59e0b'; // Good
    if (score >= 14) return '#f97316'; // Fair
    return '#dc2626'; // Problematic
  }

  function handleScoreInput(field, value) {
    const numValue = parseInt(value);
    const max = scoreMaximums[field];
    
    if (value === '' || (numValue >= 0 && numValue <= max)) {
      scoresheetData[field] = value;
      scheduleAutoSave();
    }
  }

  function handleInputChange() {
    scheduleAutoSave();
  }

  function handleDescriptorChange(descriptor) {
    scoresheetData.descriptors[descriptor] = !scoresheetData.descriptors[descriptor];
    scheduleAutoSave();
  }

  function scheduleAutoSave() {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
      saveProgress();
    }, 2000);
  }

  async function saveProgress() {
    if (!$currentEntry || isSaving || !$activeSession.sessionActive) return;

    // Don't save if no actual data has been entered
    const hasData = scoresheetData.aroma_score || scoresheetData.appearance_score || 
                   scoresheetData.flavor_score || scoresheetData.mouthfeel_score || 
                   scoresheetData.overall_score || scoresheetData.aroma_comments ||
                   scoresheetData.appearance_comments || scoresheetData.flavor_comments ||
                   scoresheetData.mouthfeel_comments || scoresheetData.overall_comments;
    
    if (!hasData) return;

    isSaving = true;
    console.log('Saving progress for entry:', $currentEntry.id);

    try {
      const dataToSave = {
        aroma_score: scoresheetData.aroma_score ? parseInt(scoresheetData.aroma_score) : null,
        appearance_score: scoresheetData.appearance_score ? parseInt(scoresheetData.appearance_score) : null,
        flavor_score: scoresheetData.flavor_score ? parseInt(scoresheetData.flavor_score) : null,
        mouthfeel_score: scoresheetData.mouthfeel_score ? parseInt(scoresheetData.mouthfeel_score) : null,
        overall_score: scoresheetData.overall_score ? parseInt(scoresheetData.overall_score) : null,
        // total_score is auto-calculated by database
        
        // Combine all comments into judge_notes for compatibility
        judge_notes: [
          scoresheetData.aroma_comments && `AROMA: ${scoresheetData.aroma_comments}`,
          scoresheetData.appearance_comments && `APPEARANCE: ${scoresheetData.appearance_comments}`,
          scoresheetData.flavor_comments && `FLAVOR: ${scoresheetData.flavor_comments}`,
          scoresheetData.mouthfeel_comments && `MOUTHFEEL: ${scoresheetData.mouthfeel_comments}`,
          scoresheetData.overall_comments && `OVERALL: ${scoresheetData.overall_comments}`
        ].filter(Boolean).join('\n\n') || null,
        
        private_notes: scoresheetData.private_notes || null,
        
        // Store complete scoresheet data as JSON for future loading
        scoresheet_data: JSON.stringify(scoresheetData)
      };

      await competitionJudgingStore.saveJudgingResults($currentEntry.id, dataToSave);
      console.log('Save successful');
      showToast('Progress saved', 'success');
    } catch (err) {
      console.error('Error auto-saving:', err);
      showToast(`Failed to save: ${err.message}`, 'error');
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
      // loadCurrentEntryData will be called by reactive statement
    }
  }

  function navigateToPrevious() {
    if (currentEntryIndex > 0) {
      currentEntryIndex = currentEntryIndex - 1;
      competitionJudgingStore.setCurrentEntry(currentEntryIndex);
      // loadCurrentEntryData will be called by reactive statement
    }
  }

  async function finishJudging() {
    await saveProgress();
    goto('/judge');
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
  .scoresheet-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
    background: #f8fafc;
    min-height: 100vh;
  }

  .scoresheet {
    background: white;
    border: 2px solid #000;
    padding: 1.5rem;
    font-family: 'Times New Roman', serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .scoresheet-header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .scoresheet-title {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }

  .scoresheet-subtitle {
    font-size: 1rem;
    margin: 0.5rem 0;
  }

  .entry-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #000;
  }

  .info-group {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    font-weight: bold;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  .info-value {
    font-size: 1rem;
    padding: 0.25rem;
    border-bottom: 1px solid #333;
  }

  .section {
    border: 1px solid #000;
    margin-bottom: 1rem;
  }

  .section-header {
    background: #f0f0f0;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #000;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-content {
    padding: 1rem;
  }

  .score-input {
    width: 60px;
    padding: 0.25rem;
    border: 1px solid #000;
    text-align: center;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .score-display {
    font-size: 1.2rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .comments-textarea {
    width: 100%;
    min-height: 80px;
    padding: 0.5rem;
    border: 1px solid #000;
    font-family: inherit;
    resize: vertical;
    font-size: 0.9rem;
  }

  .descriptors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .descriptor-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.25rem;
    font-size: 0.85rem;
  }

  .descriptor-checkbox {
    margin-top: 0.1rem;
  }

  .descriptor-label {
    cursor: pointer;
    line-height: 1.3;
  }

  .descriptor-definition {
    font-style: italic;
    color: #666;
    margin-top: 0.25rem;
  }

  .assessment-sliders {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #ddd;
    outline: none;
    -webkit-appearance: none;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ff3e00;
    cursor: pointer;
  }

  .total-score {
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    color: white;
    padding: 1.5rem;
    text-align: center;
    margin: 1.5rem 0;
    border-radius: 8px;
  }

  .total-score-value {
    font-size: 3rem;
    font-weight: bold;
    margin: 0;
  }

  .total-score-description {
    font-size: 1.1rem;
    margin: 0.5rem 0 0;
    opacity: 0.95;
  }

  .navigation {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: 2rem;
  }

  .nav-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .nav-btn-secondary {
    background: #6b7280;
    color: white;
  }

  .nav-btn-primary {
    background: #059669;
    color: white;
  }

  .nav-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .progress-indicator {
    background: white;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .progress-bar {
    background: #e5e7eb;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin: 1rem 0;
  }

  .progress-fill {
    background: linear-gradient(90deg, #ff3e00, #059669);
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .scoresheet-container {
      padding: 0.5rem;
    }

    .scoresheet {
      padding: 1rem;
    }

    .entry-info {
      grid-template-columns: 1fr;
    }

    .descriptors-grid {
      grid-template-columns: 1fr;
    }

    .navigation {
      flex-direction: column;
    }

    .nav-btn {
      width: 100%;
    }
  }
</style>

<div class="scoresheet-container">
  {#if !$isJudging || !$currentEntry}
    <div style="text-align: center; padding: 3rem;">
      <h2>Loading scoresheet...</h2>
    </div>
  {:else}
    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <h3>Competition: {$activeSession.activeCompetition?.name}</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress.percentage}%"></div>
      </div>
      <p>Entry {currentEntryIndex + 1} of {$activeSession.assignedEntries.length} • {progress.completed} completed ({progress.percentage}%)</p>
    </div>

    <div class="scoresheet">
      <!-- Header -->
      <div class="scoresheet-header">
        <h1 class="scoresheet-title">BEER SCORESHEET</h1>
        <p class="scoresheet-subtitle">AHA/BJCP Sanctioned Competition Program</p>
      </div>

      <!-- Entry Information -->
      <div class="entry-info">
        <div class="info-group">
          <span class="info-label">Entry #</span>
          <span class="info-value">{$currentEntry.entry_number}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Category</span>
          <span class="info-value">
            {$currentEntry.category?.category_number || ''}{$currentEntry.category?.subcategory_letter || ''} - {$currentEntry.category?.category_name || 'Unknown'}
          </span>
        </div>
        <div class="info-group">
          <span class="info-label">Beer Name</span>
          <span class="info-value">{$currentEntry.beer_name || 'No name provided'}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Subcategory</span>
          <span class="info-value">{$currentEntry.category?.subcategory_name || 'N/A'}</span>
        </div>
      </div>

      <!-- Total Score Display -->
      <div class="total-score" style="background: linear-gradient(135deg, {getScoreColor(totalScore)}, {getScoreColor(totalScore)}dd)">
        <h2 class="total-score-value">{totalScore}/50</h2>
        <p class="total-score-description">{getScoreDescription(totalScore)}</p>
      </div>

      <!-- Aroma Section -->
      <div class="section">
        <div class="section-header">
          <span>Aroma (as appropriate for style)</span>
          <div class="score-display">
            <input
              type="number"
              class="score-input"
              min="0"
              max="12"
              bind:value={scoresheetData.aroma_score}
              on:input={(e) => handleScoreInput('aroma_score', e.target.value)}
            /> / 12
          </div>
        </div>
        <div class="section-content">
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic;">
            Comment on malt, hops, esters, and other aromatics
          </p>
          <textarea
            class="comments-textarea"
            bind:value={scoresheetData.aroma_comments}
            on:input={handleInputChange}
            placeholder="Describe the aroma characteristics..."
          ></textarea>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="section">
        <div class="section-header">
          <span>Appearance (as appropriate for style)</span>
          <div class="score-display">
            <input
              type="number"
              class="score-input"
              min="0"
              max="3"
              bind:value={scoresheetData.appearance_score}
              on:input={(e) => handleScoreInput('appearance_score', e.target.value)}
            /> / 3
          </div>
        </div>
        <div class="section-content">
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic;">
            Comment on color, clarity, and head (retention, color, and texture)
          </p>
          <textarea
            class="comments-textarea"
            bind:value={scoresheetData.appearance_comments}
            on:input={handleInputChange}
            placeholder="Describe the visual characteristics..."
          ></textarea>
        </div>
      </div>

      <!-- Flavor Section -->
      <div class="section">
        <div class="section-header">
          <span>Flavor (as appropriate for style)</span>
          <div class="score-display">
            <input
              type="number"
              class="score-input"
              min="0"
              max="20"
              bind:value={scoresheetData.flavor_score}
              on:input={(e) => handleScoreInput('flavor_score', e.target.value)}
            /> / 20
          </div>
        </div>
        <div class="section-content">
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic;">
            Comment on malt, hops, fermentation characteristics, balance, finish/aftertaste, and other flavor characteristics
          </p>
          <textarea
            class="comments-textarea"
            style="min-height: 100px;"
            bind:value={scoresheetData.flavor_comments}
            on:input={handleInputChange}
            placeholder="Describe the flavor profile, balance, and finish..."
          ></textarea>
        </div>
      </div>

      <!-- Mouthfeel Section -->
      <div class="section">
        <div class="section-header">
          <span>Mouthfeel (as appropriate for style)</span>
          <div class="score-display">
            <input
              type="number"
              class="score-input"
              min="0"
              max="5"
              bind:value={scoresheetData.mouthfeel_score}
              on:input={(e) => handleScoreInput('mouthfeel_score', e.target.value)}
            /> / 5
          </div>
        </div>
        <div class="section-content">
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic;">
            Comment on body, carbonation, warmth, creaminess, astringency, and other palate sensations
          </p>
          <textarea
            class="comments-textarea"
            bind:value={scoresheetData.mouthfeel_comments}
            on:input={handleInputChange}
            placeholder="Describe the body, carbonation, and texture..."
          ></textarea>
        </div>
      </div>

      <!-- Overall Impression Section -->
      <div class="section">
        <div class="section-header">
          <span>Overall Impression</span>
          <div class="score-display">
            <input
              type="number"
              class="score-input"
              min="0"
              max="10"
              bind:value={scoresheetData.overall_score}
              on:input={(e) => handleScoreInput('overall_score', e.target.value)}
            /> / 10
          </div>
        </div>
        <div class="section-content">
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic;">
            Comment on overall drinking pleasure associated with entry, give suggestions for improvement
          </p>
          <textarea
            class="comments-textarea"
            style="min-height: 120px;"
            bind:value={scoresheetData.overall_comments}
            on:input={handleInputChange}
            placeholder="Overall assessment and suggestions for improvement..."
          ></textarea>
        </div>
      </div>

      <!-- Descriptor Definitions -->
      <div class="section">
        <div class="section-header">
          <span>Descriptor Definitions (Mark all that apply)</span>
        </div>
        <div class="section-content">
          <div class="descriptors-grid">
            {#each Object.entries(descriptorDefinitions) as [key, definition]}
              <div class="descriptor-item">
                <input
                  type="checkbox"
                  class="descriptor-checkbox"
                  bind:checked={scoresheetData.descriptors[key]}
                  on:change={() => handleDescriptorChange(key)}
                />
                <div class="descriptor-label">
                  <strong>{key.replace('_', '/').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                  <div class="descriptor-definition">{definition}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Overall Assessment Sliders -->
      <div class="section">
        <div class="section-header">
          <span>Overall Assessment</span>
        </div>
        <div class="section-content">
          <div class="assessment-sliders">
            <div class="slider-group">
              <div class="slider-labels">
                <span>Classic Example</span>
                <span><strong>Stylistic Accuracy</strong></span>
                <span>Not to Style</span>
              </div>
              <input
                type="range"
                class="slider"
                min="0"
                max="100"
                bind:value={scoresheetData.stylistic_accuracy}
                on:input={handleInputChange}
              />
            </div>

            <div class="slider-group">
              <div class="slider-labels">
                <span>Flawless</span>
                <span><strong>Technical Merit</strong></span>
                <span>Significant Flaws</span>
              </div>
              <input
                type="range"
                class="slider"
                min="0"
                max="100"
                bind:value={scoresheetData.technical_merit}
                on:input={handleInputChange}
              />
            </div>

            <div class="slider-group">
              <div class="slider-labels">
                <span>Wonderful</span>
                <span><strong>Intangibles</strong></span>
                <span>Lifeless</span>
              </div>
              <input
                type="range"
                class="slider"
                min="0"
                max="100"
                bind:value={scoresheetData.intangibles}
                on:input={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Private Notes -->
      <div class="section">
        <div class="section-header">
          <span>Judge Private Notes</span>
        </div>
        <div class="section-content">
          <textarea
            class="comments-textarea"
            bind:value={scoresheetData.private_notes}
            on:input={handleInputChange}
            placeholder="Private notes for your reference (not visible to entrant)..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation">
      <button 
        class="nav-btn nav-btn-secondary"
        on:click={navigateToPrevious}
        disabled={currentEntryIndex === 0}
      >
        ⬅️ Previous Entry
      </button>

      <button 
        class="nav-btn nav-btn-secondary"
        on:click={() => goto(`/judge/competition/${competitionId}`)}
      >
        📝 Simple View
      </button>

      {#if currentEntryIndex < $activeSession.assignedEntries.length - 1}
        <button 
          class="nav-btn nav-btn-primary"
          on:click={navigateToNext}
        >
          Next Entry ➡️
        </button>
      {:else}
        <button 
          class="nav-btn nav-btn-primary"
          on:click={finishJudging}
        >
          🏁 Finish Judging
        </button>
      {/if}
    </div>
  {/if}
</div>