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
  import { Hero, Container, LoadingSpinner, EmptyState, Button, Card } from '$lib/components/ui';
  import { Trophy, RotateCcw, Send, CheckCircle, Calendar, Info } from 'lucide-svelte';

  // =============================================
  // Tab Switching Fix (CRITICAL)
  // =============================================
  let cleanup;

 // Removed problematic tab visibility handler - already commented out

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
  
  // Get allowed categories for selected competition
  $: allowedCategoryIds = selectedCompetitionObj?.category_system === 'custom' 
    ? (selectedCompetitionObj.category_restrictions || [])
    : null;

  // Get available main categories (filtered if custom system)
  $: availableMainCategories = allowedCategoryIds
    ? $mainCategories.filter(category => {
        // Check if any subcategory in this main category is allowed
        const categorySubcategories = $categoriesByNumber[category.number]?.subcategories || [];
        return categorySubcategories.some(sub => allowedCategoryIds.includes(sub.id));
      })
    : $mainCategories;

  // Get available subcategories based on selected main category (filtered if custom system)
  $: availableSubcategories = selectedMainCategory 
    ? ($categoriesByNumber[selectedMainCategory]?.subcategories || []).filter(sub => 
        allowedCategoryIds ? allowedCategoryIds.includes(sub.id) : true
      )
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

<Hero
  title="Submit Competition Entry"
  subtitle="Enter your beer into a JAX club competition"
  backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
  large={true}
/>

<Container size="md">

  <!-- Loading State -->
  {#if $isLoading && !$isLoaded}
    <LoadingSpinner message="Loading competition data..." />

  <!-- Error State -->
  {:else if $error}
    <Card class="error-container">
      <h2>Error Loading Data</h2>
      <p>{$error}</p>
      <Button on:click={() => loadCompetitionData(true)} variant="primary">
        <RotateCcw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        Retry
      </Button>
    </Card>

  <!-- No Active Competitions -->
  {:else if $isLoaded && $activeCompetitions.length === 0}
    <EmptyState
      title="No Active Competitions"
      message="There are currently no competitions accepting entries. Check back later or contact an officer for more information."
    >
      <Button on:click={() => goto('/competitions')} variant="primary">
        <Calendar size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
        View All Competitions
      </Button>
    </EmptyState>

  <!-- Main Form -->
  {:else if $isLoaded}
    <div class="form-container">
      
      <!-- Success Message -->
      {#if submitSuccess}
        <div class="success-message">
          <CheckCircle size={48} strokeWidth={1.5} color="var(--color-success)" />
          <h2>Entry Submitted Successfully!</h2>
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
              {#if selectedCompetitionObj.category_system === 'custom'}
                <div class="custom-categories-notice">
                  <Info size={20} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
                  <p><strong>Custom Categories:</strong> This competition only accepts specific BJCP categories. Only allowed categories will be shown in the selection below.</p>
                </div>
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
            {#each availableMainCategories as category}
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
            <span class="brewer-name">{$userProfile?.name || $userProfile?.email}</span>
            <span class="auto-filled">(automatically filled)</span>
          </div>
        </div>

        <!-- Error Message -->
        {#if submitError}
          <div class="error-message">
            <p>{submitError}</p>
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="form-actions">
          <Button
            type="button"
            on:click={resetForm}
            variant="secondary"
            disabled={submitting || submitSuccess}
          >
            <RotateCcw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
            Reset Form
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit || submitSuccess}
          >
            {#if submitting}
              <RotateCcw size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem; animation: spin 1s linear infinite;" />
              Submitting...
            {:else if submitSuccess}
              <CheckCircle size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
              Submitted
            {:else}
              <Send size={18} strokeWidth={2} style="display: inline-block; vertical-align: text-bottom; margin-right: 0.25rem;" />
              Submit Entry
            {/if}
          </Button>
        </div>

        <!-- Form Help -->
        <div class="form-help">
          <h3>Entry Guidelines</h3>
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
</Container>

<style>
  :global(.error-container) {
    text-align: center;
    padding: var(--space-12) var(--space-8);
    border-left: 4px solid var(--color-danger);
  }

  .form-container {
    background: var(--color-bg-primary);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    border-left: 4px solid var(--color-brand-primary);
    padding: var(--space-8);
  }

  .success-message {
    background: var(--color-success-light);
    border: 1px solid var(--color-success);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin-bottom: var(--space-8);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .success-message h2 {
    color: var(--color-success);
    margin: 0;
    font-size: var(--font-size-2xl);
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
    border-color: var(--color-brand-primary);
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

  .custom-categories-notice {
    background: #e0f7fa;
    border: 1px solid #4dd0e1;
    border-radius: 6px;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .custom-categories-notice p {
    margin: 0;
    color: #006064;
    font-weight: 500;
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

  .form-help {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #dee2e6;
  }

  .form-help h3 {
    color: var(--color-brand-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-4) 0;
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
    .form-container {
      padding: 1rem;
    }

    .error-container {
      padding: 2rem 1rem;
    }
  }
</style>