<script>
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
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
  import { userProfile } from '$lib/stores/userProfile';
  import { get } from 'svelte/store';
  import { setupFocusReload } from '$lib/utils/focusReload.js';

  let cleanupFocus;
  let cleanupNavigation;

  const user = get(userProfile);

  let selectedCategory = '';
  let selectedEvent = '';
  let selectedFloridaEvent = '';
  let selectedPlacement = '';
  let eventDate = '';

  $: points = get(placementOptions).find(p => p.value === selectedPlacement)?.points ?? null;

  let filteredMonthlyEvents = [];
  let filteredFloridaEvents = [];
  let filteredPlacements = [];

  $: if (selectedCategory && get(isLoaded)) {
    filteredPlacements = get(placementOptions).filter(p => p.category === selectedCategory);
    filteredMonthlyEvents = get(monthlyEvents);
    filteredFloridaEvents = get(floridaCircuitEvents);
  }


  onMount(() => {
    loadCategoryData(); // runs only if cache expired
    cleanupNavigation = afterNavigate(() => loadCategoryData(true));
    cleanupFocus = setupFocusReload(() => loadCategoryData(true));
    return () => {
      if (cleanupFocus) cleanupFocus();
      if (cleanupNavigation) cleanupNavigation();
    };
  });

  async function handleSubmit() {
    if (!selectedCategory || !eventDate || !selectedPlacement) {
      toast.error('Please complete all required fields.');
      return;
    }

    let description = '';
    if (selectedCategory === 'Monthly Challenge') {
      description = selectedEvent;
    } else if (selectedCategory === 'Florida Circuit') {
      description = selectedFloridaEvent;
    }

    const payload = {
      member_id: user?.id,
      category: selectedCategory,
      description,
      //placement: selectedPlacement,
      points,
      event_date: eventDate,
      submitted_at: new Date().toISOString()
    };

    const { error } = await supabase.from('point_submissions').insert([payload]);

    if (error) {
      toast.error('Submission failed.');
      console.error(error);
    } else {
      toast.success('Points submitted!');
      selectedCategory = '';
      selectedEvent = '';
      selectedFloridaEvent = '';
      selectedPlacement = '';
      eventDate = '';
    }
  }
</script>

<main>
  <h2>Submit Points</h2>

  {#if $categories.length > 0}
    <label>
      Category
      <select bind:value={selectedCategory}>
        <option value="">Select a category</option>
        {#each $categories as cat}
          <option value={cat.name}>{cat.name}</option>
        {/each}
      </select>
    </label>

    {#if selectedCategory === 'Monthly Challenge'}
      <label>
        Monthly Event
        <select bind:value={selectedEvent}>
          <option value="">Select event</option>
          {#each filteredMonthlyEvents as ev}
            <option value={ev.name}>{ev.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if selectedCategory === 'Florida Circuit'}
      <label>
        Florida Circuit Event
        <select bind:value={selectedFloridaEvent}>
          <option value="">Select Florida Circuit event</option>
          {#each filteredFloridaEvents as ev}
            <option value={ev.name}>{ev.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if
      (selectedCategory === 'Monthly Challenge' && selectedEvent) ||
      (selectedCategory === 'Florida Circuit' && selectedFloridaEvent)
    }
      <label>
        Placement
        <select bind:value={selectedPlacement}>
          <option value="">Select placement</option>
          {#each filteredPlacements as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>
    {/if}

    {#if selectedPlacement}
      <p>Points: {points ?? '—'}</p>
      <label>
        Event Date
        <input type="date" bind:value={eventDate} />
      </label>
    {/if}

    {#if eventDate}
      <button on:click={handleSubmit}>Submit</button>
    {/if}
  {:else}
    <p>Loading data…</p>
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

  label {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    font-weight: 500;
    color: #333;
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
  }

  button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1rem;
  }

  button:hover:enabled {
    background-color: #1d4ed8;
  }

  button:disabled {
    background-color: #aaccee;
    cursor: not-allowed;
  }
</style>
