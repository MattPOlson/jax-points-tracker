<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

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
  let message = '';

  // Load categories on page load
  onMount(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (!error) categories = data;
  });

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

async function loadPlacementOptions(category) {
  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('order', { ascending: true });

  if (!error) placementOptions = data;
}

  async function loadMonthlyEvents() {
    const { data, error } = await supabase
      .from('monthly_challenge')
      .select('*')
      .eq('active', true)
      .order('order_index');

    if (!error) monthlyEvents = data;
  }

    async function loadFloridaCircuitEvents() {
    const { data, error } = await supabase
      .from('florida_circuit_events')
      .select('*')
      .eq('active', true)
      .order('year', { ascending: false });

    if (!error) floridaCircuitEvents = data;
  }

  $: points = placementOptions.find(o => o.value === selectedPlacement)?.points ?? null;

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return message = 'Please log in.';

    const description = selectedCategory === 'Monthly Challenge'
      ? selectedEvent
      : 'Other';

    const { error } = await supabase.from('point_submissions').insert([{
      member_id: user.id,
      category: selectedCategory,
      description,
      points,
      event_date: eventDate,
      approved: false
    }]);

    message = error ? 'Submission failed.' : 'Submitted for approval!';
  }
</script>

<h2>Submit Points</h2>

<form on:submit|preventDefault={handleSubmit}>
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
          <option value={`${event.name} ${event.year}`}>{event.name} {event.year}</option>
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

{#if message}
  <p style="text-align:center;">{message}</p>
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
</style>
