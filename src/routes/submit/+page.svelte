<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount, onDestroy } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import toast from 'svelte-french-toast';

  // -------------------------------
  // Local component state
  // -------------------------------
  let categories = [];
  let selectedCategory = '';
  let placementOptions = [];
  let selectedPlacement = '';
  let monthlyEvents = [];
  let selectedEvent = '';
  let floridaCircuitEvents = [];
  let selectedFloridaEvent = '';
  let points = null;
  let eventDate = '';
  let selectedPayload = null;
  let showSubmitModal = false;

  // -------------------------------
  // 1. Fetch helpers
  // -------------------------------
  async function loadCategories() {
    console.log('[submit] loadCategories()');
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      categories = data;
    } catch (err) {
      console.error('[submit]  → Failed to load categories:', err);
      toast.error('Failed to load categories.');
      categories = [];
    }
  }

  async function loadPlacementOptions(category) {
    console.log(`[submit] loadPlacementOptions("${category}")`);
    try {
      const { data, error } = await supabase
        .from('point_categories')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) throw error;
      placementOptions = data;
    } catch (err) {
      console.error('[submit]  → Failed to load placement options:', err);
      toast.error('Failed to load placement options.');
      placementOptions = [];
    }
  }

  async function loadMonthlyEvents() {
    console.log('[submit] loadMonthlyEvents()');
    try {
      const { data, error } = await supabase
        .from('monthly_challenge')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      monthlyEvents = data;
    } catch (err) {
      console.error('[submit]  → Failed to load monthly events:', err);
      toast.error('Failed to load monthly events.');
      monthlyEvents = [];
    }
  }

  async function loadFloridaCircuitEvents() {
    console.log('[submit] loadFloridaCircuitEvents()');
    try {
      const { data, error } = await supabase
        .from('florida_circuit_events')
        .select('*')
        .eq('active', true)
        .order('year', { ascending: false });

      if (error) throw error;
      floridaCircuitEvents = data;
    } catch (err) {
      console.error('[submit]  → Failed to load Florida Circuit events:', err);
      toast.error('Failed to load Florida Circuit events.');
      floridaCircuitEvents = [];
    }
  }

  // -------------------------------
  // 2. Reactive: sub‐lists when selectedCategory changes
  // -------------------------------
  $: if (selectedCategory === 'Monthly Challenge') {
    loadPlacementOptions('Monthly Challenge');
    loadMonthlyEvents();
  } else if (selectedCategory === 'Florida Circuit') {
    loadPlacementOptions('Florida Circuit');
    loadFloridaCircuitEvents();
  } else {
    placementOptions = [];
    monthlyEvents = [];
    floridaCircuitEvents = [];
    selectedPlacement = '';
    selectedEvent = '';
    selectedFloridaEvent = '';
    points = null;
  }

  // Recompute points whenever selectedPlacement changes
  $: points =
    placementOptions.find((o) => o.value === selectedPlacement)?.points ?? null;

  // -------------------------------
  // 3. Rehydration on tab‐focus/visibility
  // -------------------------------
  function setupRehydration() {
    console.log('[submit] setupRehydration() called—installing listeners');
    const handler = async () => {
      console.log('[submit] handler: tab visible or window focused → rehydrating lists');
      // 3.1) Always reload categories:
      await loadCategories();

      // 3.2) Manually re‐load sub‐lists based on whatever category is still selected
      if (selectedCategory === 'Monthly Challenge') {
        await loadPlacementOptions('Monthly Challenge');
        await loadMonthlyEvents();
      } else if (selectedCategory === 'Florida Circuit') {
        await loadPlacementOptions('Florida Circuit');
        await loadFloridaCircuitEvents();
      }
    };

    // visibilitychange
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        handler();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // window.focus
    window.addEventListener('focus', handler);

    return () => {
      console.log('[submit] cleanupRehydration() called—removing listeners');
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', handler);
    };
  }

  // -------------------------------
  // 4. afterNavigate at top level
  // -------------------------------
  const cleanupNavigation = afterNavigate(async () => {
    console.log('[submit] afterNavigate → reloading all lists');
    await loadCategories();

    if (selectedCategory === 'Monthly Challenge') {
      await loadPlacementOptions('Monthly Challenge');
      await loadMonthlyEvents();
    } else if (selectedCategory === 'Florida Circuit') {
      await loadPlacementOptions('Florida Circuit');
      await loadFloridaCircuitEvents();
    }
  });

  // -------------------------------
  // 5. onMount: initial fetch + set up rehydration
  // -------------------------------
  let cleanupRehydration;
  onMount(() => {
    console.log('[submit] onMount → initial load & setupRehydration()');
    // 5.1) Initial load
    loadCategories();
    loadMonthlyEvents();
    loadFloridaCircuitEvents();
    loadPlacementOptions


    // 5.2) Install tab‐focus/visibility listener
    cleanupRehydration = setupRehydration();

    return () => {
      if (cleanupRehydration) cleanupRehydration();
      if (cleanupNavigation) cleanupNavigation();
    };
  });

  // -------------------------------
  // 6. Form & modal logic
  // -------------------------------
  function openSubmissionModal() {
    const description =
      selectedCategory === 'Monthly Challenge' ? selectedEvent : selectedFloridaEvent;

    selectedPayload = {
      category: selectedCategory,
      description,
      points,
      event_date: eventDate
    };
    showSubmitModal = true;
  }

  async function confirmSubmission() {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('❌ Please log in before submitting.');
      return;
    }

    const { error } = await supabase.from('point_submissions').insert([
      {
        member_id: user.id,
        category: selectedPayload.category,
        description: selectedPayload.description,
        points: selectedPayload.points,
        event_date: selectedPayload.event_date,
        approved: false
      }
    ]);

    if (error) {
      console.error('Submission error:', error);
      toast.error('❌ Submission failed.');
    } else {
      toast.success('✅ Submitted for approval!');
      resetForm();
    }

    showSubmitModal = false;
    selectedPayload = null;
  }

  function cancelSubmission() {
    showSubmitModal = false;
    selectedPayload = null;
  }

  function resetForm() {
    selectedCategory = '';
    selectedPlacement = '';
    selectedEvent = '';
    selectedFloridaEvent = '';
    eventDate = '';
    points = null;
  }
</script>


<h2>Submit Points</h2>

<form on:submit|preventDefault={openSubmissionModal}>
  <label>
    Category
    <select bind:value={selectedCategory} required>
      <option value="" disabled selected>Select a category</option>
      {#each categories as c}
        <option value={c.name}>{c.name}</option>
      {/each}
    </select>
  </label>

  {#if selectedCategory === 'Monthly Challenge'}
    <label>
      Event Name
      <select bind:value={selectedEvent} required>
        <option value="" disabled selected>Select an event</option>
        {#each monthlyEvents as event}
          <option value={event.name}>{event.name}</option>
        {/each}
      </select>
    </label>

    <label>
      Placement
      <select bind:value={selectedPlacement} required>
        <option value="" disabled selected>Select a placement</option>
        {#each placementOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if selectedCategory === 'Florida Circuit'}
    <label>
      Event Name
      <select bind:value={selectedFloridaEvent} required>
        <option value="" disabled selected>Select an event</option>
        {#each floridaCircuitEvents as event}
          <option value={`${event.name} ${event.year}`}>
            {event.name} {event.year}
          </option>
        {/each}
      </select>
    </label>

    <label>
      Placement
      <select bind:value={selectedPlacement} required>
        <option value="" disabled selected>Select a placement</option>
        {#each placementOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>
  {/if}

  <label>
    Event Date
    <input type="date" bind:value={eventDate} required />
  </label>

  {#if points !== null}
    <label>
      Points
      <input type="number" value={points} readonly />
    </label>
  {/if}

  <button type="submit">Submit</button>
</form>

{#if showSubmitModal}
  <div class="modal-overlay">
    <div class="modal">
      <h3>Confirm Submission</h3>
      <p>
        Submit <strong>{selectedPayload?.points}</strong> point(s) for
        <strong>{selectedPayload?.category}</strong> — 
        <em>{selectedPayload?.description}</em>?
      </p>
      <div class="modal-actions">
        <button on:click={confirmSubmission}>Yes, Submit</button>
        <button class="cancel" on:click={cancelSubmission}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 0.5rem;
    background-color: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: bold;
  }

  input,
  select {
    padding: 0.5rem;
    font-size: 1rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.75rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #1d4ed8;
  }

  h2 {
    text-align: center;
  }

  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    text-align: center;
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-around;
  }

  .modal-actions .cancel {
    background: #ccc;
    border: none;
  }
</style>
