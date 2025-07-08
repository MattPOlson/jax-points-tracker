<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import toast from 'svelte-french-toast';
  import {
    categories,
    placementOptions,
    monthlyEvents,
    floridaCircuitEvents,
    isLoaded,
    isLoading,
    loadCategoryData
  } from '$lib/stores/categoryStore.js';
  import { userProfile, loadUserProfile, isLoadingProfile } from '$lib/stores/userProfile';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';

  // Form state
  let selectedCategory = '';
  let selectedEvent = '';
  let selectedFloridaEvent = '';
  let selectedPlacement = '';
  let eventDate = '';
  let isSubmitting = false;

  // Cleanup functions
  let cleanupFunctions = [];

  // Derived values
  $: user = $userProfile;
  $: points = $placementOptions.find(p => p.value === selectedPlacement)?.points ?? null;
  
  // Filter data based on category selection
  $: filteredPlacements = selectedCategory && $isLoaded 
    ? $placementOptions.filter(p => p.category === selectedCategory)
    : [];
  
  $: filteredMonthlyEvents = selectedCategory === 'Monthly Challenge' && $isLoaded
    ? $monthlyEvents
    : [];
    
  $: filteredFloridaEvents = selectedCategory === 'Florida Circuit' && $isLoaded
    ? $floridaCircuitEvents
    : [];

  // Reset dependent fields when category changes
  $: if (selectedCategory) {
    selectedEvent = '';
    selectedFloridaEvent = '';
    selectedPlacement = '';
    eventDate = '';
  }

  // Reset placement when event changes
  $: if (selectedEvent || selectedFloridaEvent) {
    selectedPlacement = '';
    eventDate = '';
  }

  // Data loading function
  async function loadData(force = false) {
    console.log('🔄 Loading data, force:', force, 'isLoaded:', $isLoaded, 'isLoading:', $isLoading);
    
    try {
      await Promise.all([
        loadCategoryData(force),
        loadUserProfile(force)
      ]);
      
      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load data. Please try again.');
    }
  }

  // Setup tab focus handler - BRUTE FORCE VERSION
  function setupEventHandlers() {
    let isFirstLoad = true;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFirstLoad) {
        console.log('🔄 Tab became visible - doing F5 refresh');
        window.location.reload();
      }
      isFirstLoad = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  // Form validation
  function validateForm() {
    const errors = [];
    
    if (!selectedCategory) errors.push('Please select a category');
    if (!eventDate) errors.push('Please select an event date');
    if (!selectedPlacement) errors.push('Please select a placement');
    
    if (selectedCategory === 'Monthly Challenge' && !selectedEvent) {
      errors.push('Please select a monthly event');
    }
    
    if (selectedCategory === 'Florida Circuit' && !selectedFloridaEvent) {
      errors.push('Please select a Florida Circuit event');
    }
    
    if (!user?.id) {
      errors.push('User profile not loaded. Please wait a moment.');
    }

    return errors;
  }

  // Reset form
  function resetForm() {
    selectedCategory = '';
    selectedEvent = '';
    selectedFloridaEvent = '';
    selectedPlacement = '';
    eventDate = '';
  }

  // Submit handler
  async function handleSubmit() {
    if (isSubmitting) return;
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    isSubmitting = true;

    try {
      let description = '';
      if (selectedCategory === 'Monthly Challenge') {
        description = selectedEvent;
      } else if (selectedCategory === 'Florida Circuit') {
        description = selectedFloridaEvent;
      }

      const payload = {
        member_id: user.id,
        category: selectedCategory,
        description,
        points,
        event_date: eventDate,
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('point_submissions')
        .insert([payload]);

      if (error) {
        console.error('Submission error:', error);
        toast.error(`Submission failed: ${error.message}`);
      } else {
        toast.success('Points submitted successfully!');
        resetForm();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  // Check if form is valid for submission
  $: canSubmit = selectedCategory && 
    eventDate && 
    selectedPlacement && 
    user?.id &&
    !isSubmitting &&
    !$isLoading &&
    !$isLoadingProfile &&
    ((selectedCategory === 'Monthly Challenge' && selectedEvent) ||
     (selectedCategory === 'Florida Circuit' && selectedFloridaEvent) ||
     (selectedCategory !== 'Monthly Challenge' && selectedCategory !== 'Florida Circuit'));

  // Lifecycle hooks
  onMount(() => {
    // Initial data load
    loadData(true);
    
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);
  });

  onDestroy(() => {
    // Cleanup all event listeners
    cleanupFunctions.forEach(cleanup => cleanup());
  });
</script>

<main>
  <h2>Submit Points</h2>

  {#if $isLoading || $isLoadingProfile}
    <div class="loading">
      <p>Loading data...</p>
      <small>
        {#if $isLoading}Loading categories...{/if}
        {#if $isLoadingProfile}Loading user profile...{/if}
      </small>
      <button on:click={() => loadData(true)} class="retry-btn">
        Force Refresh
      </button>
    </div>
  {:else if $categories.length > 0}
    <form on:submit|preventDefault={handleSubmit}>
      <label>
        Category *
        <select bind:value={selectedCategory} required>
          <option value="">Select a category</option>
          {#each $categories as cat}
            <option value={cat.name}>{cat.name}</option>
          {/each}
        </select>
      </label>

      {#if selectedCategory === 'Monthly Challenge'}
        <label>
          Monthly Event *
          <select bind:value={selectedEvent} required>
            <option value="">Select event</option>
            {#each filteredMonthlyEvents as ev}
              <option value={ev.name}>{ev.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      {#if selectedCategory === 'Florida Circuit'}
        <label>
          Florida Circuit Event *
          <select bind:value={selectedFloridaEvent} required>
            <option value="">Select Florida Circuit event</option>
            {#each filteredFloridaEvents as ev}
              <option value={ev.name}>{ev.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      {#if filteredPlacements.length > 0 && (
        (selectedCategory === 'Monthly Challenge' && selectedEvent) ||
        (selectedCategory === 'Florida Circuit' && selectedFloridaEvent) ||
        (selectedCategory !== 'Monthly Challenge' && selectedCategory !== 'Florida Circuit')
      )}
        <label>
          Placement *
          <select bind:value={selectedPlacement} required>
            <option value="">Select placement</option>
            {#each filteredPlacements as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </label>
      {/if}

      {#if selectedPlacement}
        <div class="points-display">
          <p><strong>Points: {points ?? '—'}</strong></p>
        </div>
        
        <label>
          Event Date *
          <input type="date" bind:value={eventDate} required />
        </label>
      {/if}

      <button 
        type="submit" 
        disabled={!canSubmit}
        class:submitting={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Points'}
      </button>
    </form>
  {:else}
    <div class="error">
      <p>Failed to load categories. Please refresh the page.</p>
      <button on:click={() => loadData(true)}>Retry</button>
    </div>
  {/if}
</main>

<style>
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 600px;
    text-align: center;
  }

  h2 {
    text-transform: uppercase;
    color: #ff3e00;
    font-size: 2rem;
    font-weight: 100;
    margin: 2rem 0 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    color: #333;
    text-align: left;
  }

  select,
  input[type="date"] {
    padding: 0.5rem;
    margin-top: 0.25rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  select:focus,
  input[type="date"]:focus {
    outline: none;
    border-color: #2563eb;
  }

  .points-display {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .points-display p {
    margin: 0;
    color: #1e293b;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
  }

  button:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  button:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
  }

  button.submitting {
    background-color: #64748b;
  }

  .loading,
  .error {
    padding: 2rem;
    text-align: center;
  }

  .loading .retry-btn {
    background-color: #059669;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .loading .retry-btn:hover {
    background-color: #047857;
  }

  .error {
    color: #dc2626;
  }

  .error button {
    background-color: #dc2626;
    margin-top: 1rem;
  }

  .error button:hover {
    background-color: #b91c1c;
  }
</style>