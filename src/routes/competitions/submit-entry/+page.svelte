<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import { 
    bjcpCategories, 
    competitions, 
    activeCompetitions,
    mainCategories,
    categoriesByNumber,
    loadCompetitionData,
    getCategoryById,
    areEntriesOpen,
    formatDeadline,
    isLoaded,
    isLoading,
    error
  } from '$lib/stores/bjcpCategoryStore.js';
  import { supabase } from '$lib/supabaseClient';

  // =============================================
  // Tab Switching Fix (CRITICAL)
  // =============================================
  let cleanup;

 // function setupEventHandlers() {
 //   let isFirstLoad = true;
    
 //   const handleVisibilityChange = () => {
 //     if (document.visibilityState === 'visible' && !isFirstLoad) {
 //       console.log('🔄 Tab became visible - doing F5 refresh');
 //       window.location.reload();
 //     }
 //     isFirstLoad = false;
 //   };

 //   document.addEventListener('visibilitychange', handleVisibilityChange);
 //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
 // }

  // =============================================
  // Form State
  // =============================================
  let selectedCompetition = '';
  let selectedMainCategory = '';
  let selectedSubcategory = '';
  let beerName = '';
  let beerNotes = '';
  let submitting = false;
  let submitError = null;
  let submitSuccess = false;

  // =============================================
  // Reactive Variables
  // =============================================
  
  // Get available subcategories based on selected main category
  $: availableSubcategories = selectedMainCategory 
    ? ($categoriesByNumber[selectedMainCategory]?.subcategories || [])
    : [];

  // Get selected competition object
  $: selectedCompetitionObj = selectedCompetition 
    ? $activeCompetitions.find(comp => comp.id === selectedCompetition)
    : null;

  // Get selected category object
  $: selectedCategoryObj = selectedSubcategory 
    ? getCategoryById(selectedSubcategory)
    : null;

  // Form validation
  $: canSubmit = selectedCompetition && 
                 selectedSubcategory && 
                 beerName.trim() && 
                 !submitting &&
                 $userProfile?.id &&
                 areEntriesOpen(selectedCompetitionObj);

  // Reset dependent fields when main category changes
  $: if (selectedMainCategory) {
    selectedSubcategory = '';
  }

  // =============================================
  // Lifecycle
  // =============================================
  onMount(async () => {
    console.log('🚀 Page mounted, loading data...');
    
    // Check if user is logged in
    //if (!$userProfile?.id) {
    //  console.log('❌ User not logged in, redirecting...');
    //  goto('/login');
    //  return;
   // }

    // Load competition data
    try {
      console.log('📋 Loading competition data...');
      await loadCompetitionData();
      console.log('✅ Competition data loaded');
    } catch (err) {
      console.error('❌ Failed to load competition data:', err);
    }
  });


  // =============================================
  // Form Handlers
  // =============================================
  
  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    submitError = null;
    submitSuccess = false;

    try {
      console.log('🍺 Submitting competition entry...');

      // Generate random entry number
      const entryNumber = Math.floor(Math.random() * 99999 + 1).toString().padStart(5, '0');

      const entryData = {
        competition_id: selectedCompetition,
        member_id: $userProfile.id,
        bjcp_category_id: selectedSubcategory,
        beer_name: beerName.trim(),
        beer_notes: beerNotes.trim() || null,
        entry_number: entryNumber,
        entry_fee_paid: false
      };

      const { data, error: insertError } = await supabase
        .from('competition_entries')
        .insert([entryData])
        .select(`
          *,
          competition:competitions(name),
          bjcp_category:bjcp_categories(category_number, subcategory_letter, subcategory_name)
        `)
        .single();

      if (insertError) {
        console.error('❌ Error submitting entry:', insertError);
        throw insertError;
      }

      console.log('✅ Entry submitted successfully:', data);
      
      submitSuccess = true;
      
      // Reset form
      selectedCompetition = '';
      selectedMainCategory = '';
      selectedSubcategory = '';
      beerName = '';
      beerNotes = '';

      // Redirect to entries page after 2 seconds
      setTimeout(() => {
        goto('/competitions/my-entries');
      }, 2000);

    } catch (err) {
      console.error('💥 Failed to submit entry:', err);
      submitError = err.message || 'Failed to submit entry';
    } finally {
      submitting = false;
    }
  }

  function resetForm() {
    selectedCompetition = '';
    selectedMainCategory = '';
    selectedSubcategory = '';
    beerName = '';
    beerNotes = '';
    submitError = null;
    submitSuccess = false;
  }

  // =============================================
  // Helper Functions
  // =============================================
  
  function formatCategoryOption(subcategory) {
    return `${subcategory.letter} - ${subcategory.name}`;
  }
  // Debug: Log store values
  $: console.log('📊 Store Debug:', {
    bjcpCategories: $bjcpCategories.length,
    competitions: $competitions.length,
    activeCompetitions: $activeCompetitions.length,
    mainCategories: $mainCategories.length,
    isLoaded: $isLoaded,
    isLoading: $isLoading,
    error: $error
  });
</script>

<svelte:head>
  <title>Submit Competition Entry | JAX Members Portal</title>
</svelte:head>

<div class="container">
  <!-- Hero Section -->
  <section class="hero">
    <h1>🏆 SUBMIT COMPETITION ENTRY</h1>
    <p>Enter your beer into a JAX club competition</p>
  </section>

  <!-- Loading State -->
  {#if $isLoading && !$isLoaded}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading competition data...</p>
    </div>
  
  <!-- Error State -->
  {:else if $error}
    <div class="error-container">
      <h2>❌ Error Loading Data</h2>
      <p>{$error}</p>
      <button on:click={() => loadCompetitionData(true)} class="retry-button">
        🔄 Retry
      </button>
    </div>

  <!-- No Active Competitions -->
  {:else if $isLoaded && $activeCompetitions.length === 0}
    <div class="empty-state">
      <h2>📅 No Active Competitions</h2>
      <p>There are currently no competitions accepting entries.</p>
      <p>Check back later or contact an officer for more information.</p>
      <button on:click={() => goto('/competitions')} class="nav-button">
        📋 View All Competitions
      </button>
    </div>

  <!-- Main Form -->
  {:else if $isLoaded}
    <div class="form-container">
      
      <!-- Success Message -->
      {#if submitSuccess}
        <div class="success-message">
          <h2>🎉 Entry Submitted Successfully!</h2>
          <p>Your competition entry has been received. Redirecting to your entries...</p>
        </div>
      {/if}

      <!-- Entry Form -->
      <form on:submit|preventDefault={handleSubmit} class="entry-form">
        
        <!-- Competition Selection -->
        <div class="form-group">
          <label for="competition">Competition *</label>
          <select 
            id="competition" 
            bind:value={selectedCompetition}
            disabled={submitting || submitSuccess}
            required
          >
            <option value="">Select a competition...</option>
            {#each $activeCompetitions as competition}
              <option value={competition.id}>
                {competition.name}
                {#if competition.days_until_deadline !== undefined}
                  ({competition.days_until_deadline} days left)
                {/if}
              </option>
            {/each}
          </select>
          
          {#if selectedCompetitionObj}
            <div class="competition-info">
              <p><strong>Entry Deadline:</strong> {formatDeadline(selectedCompetitionObj)}</p>
              {#if selectedCompetitionObj.description}
                <p><strong>Description:</strong> {selectedCompetitionObj.description}</p>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Main Category Selection -->
        <div class="form-group">
          <label for="main-category">BJCP Category *</label>
          <select 
            id="main-category" 
            bind:value={selectedMainCategory}
            disabled={!selectedCompetition || submitting || submitSuccess}
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

        <!-- Subcategory Selection -->
        {#if selectedMainCategory && availableSubcategories.length > 0}
          <div class="form-group">
            <label for="subcategory">BJCP Subcategory *</label>
            <select 
              id="subcategory" 
              bind:value={selectedSubcategory}
              disabled={submitting || submitSuccess}
              required
            >
              <option value="">Select subcategory...</option>
              {#each availableSubcategories as subcategory}
                <option value={subcategory.id}>
                  {formatCategoryOption(subcategory)}
                </option>
              {/each}
            </select>
            
            {#if selectedCategoryObj}
              <div class="category-description">
                <p>{selectedCategoryObj.description}</p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Beer Name -->
        <div class="form-group">
          <label for="beer-name">Beer Name *</label>
          <input 
            type="text" 
            id="beer-name"
            bind:value={beerName}
            placeholder="Enter your beer name..."
            disabled={submitting || submitSuccess}
            maxlength="100"
            required
          />
        </div>

        <!-- Beer Notes -->
        <div class="form-group">
          <label for="beer-notes">Beer Notes (Optional)</label>
          <textarea 
            id="beer-notes"
            bind:value={beerNotes}
            placeholder="Special ingredients, techniques, or notes for judges..."
            disabled={submitting || submitSuccess}
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="character-count">
            {beerNotes.length}/500 characters
          </div>
        </div>

        <!-- Brewer Info (Read-only) -->
        <div class="form-group">
          <label>Brewer</label>
          <div class="brewer-info">
            <span class="brewer-name">{$userProfile?.full_name || $userProfile?.email}</span>
            <span class="auto-filled">(automatically filled)</span>
          </div>
        </div>

        <!-- Error Message -->
        {#if submitError}
          <div class="error-message">
            <p>❌ {submitError}</p>
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            on:click={resetForm}
            class="reset-button"
            disabled={submitting || submitSuccess}
          >
            🔄 Reset Form
          </button>
          
          <button 
            type="submit" 
            class="submit-button"
            disabled={!canSubmit || submitSuccess}
          >
            {#if submitting}
              🔄 Submitting...
            {:else if submitSuccess}
              ✅ Submitted
            {:else}
              🍺 Submit Entry
            {/if}
          </button>
        </div>

        <!-- Form Help -->
        <div class="form-help">
          <h3>📝 Entry Guidelines</h3>
          <ul>
            <li>Entries must be submitted before the deadline</li>
            <li>One entry per category per brewer per competition</li>
            <li>Entry fees may apply (check with officers)</li>
            <li>You'll receive a random entry number for anonymity</li>
            <li>You can edit entries until the deadline</li>
          </ul>
        </div>
      </form>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .hero {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 1rem;
  }

  .hero h1 {
    color: #ff3e00;
    font-size: 2.5rem;
    font-weight: 100;
    text-transform: uppercase;
    margin: 0 0 0.5rem 0;
    letter-spacing: 2px;
  }

  .hero p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }

  .loading-container, .error-container, .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-button, .nav-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background 0.2s;
  }

  .retry-button:hover, .nav-button:hover {
    background: #e63600;
  }

  .form-container {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-left: 4px solid #ff3e00;
    padding: 2rem;
  }

  .success-message {
    background: #f0f9ff;
    border: 1px solid #059669;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .success-message h2 {
    color: #059669;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .entry-form {
    max-width: 100%;
  }

  .form-group {
    margin-bottom: 1.5rem;
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
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #ff3e00;
  }

  .form-group input:disabled,
  .form-group select:disabled,
  .form-group textarea:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .competition-info {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 0.5rem;
  }

  .competition-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  .category-description {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    font-style: italic;
  }

  .character-count {
    text-align: right;
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .brewer-info {
    background: #f8f9fa;
    border: 2px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brewer-name {
    font-weight: 600;
  }

  .auto-filled {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
  }

  .error-message {
    background: #fee;
    border: 1px solid #dc2626;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .error-message p {
    margin: 0;
    color: #dc2626;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .reset-button {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
  }

  .reset-button:hover:not(:disabled) {
    background: #4b5563;
  }

  .submit-button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background: #e63600;
  }

  .submit-button:disabled,
  .reset-button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .form-help {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #dee2e6;
  }

  .form-help h3 {
    color: #ff3e00;
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
  }

  .form-help ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .form-help li {
    margin-bottom: 0.5rem;
    color: #555;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .form-container {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions button {
      width: 100%;
    }

    .brewer-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .hero h1 {
      font-size: 1.75rem;
    }

    .form-container {
      padding: 1rem;
    }

    .loading-container, .error-container, .empty-state {
      padding: 2rem 1rem;
    }
  }
</style>