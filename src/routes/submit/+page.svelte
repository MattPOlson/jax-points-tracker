<script>
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import toast from "svelte-french-toast";
  import {
    categories,
    placementOptions,
    monthlyEvents,
    floridaCircuitEvents,
    isLoaded,
    isLoading,
    loadCategoryData,
    clubEventTypes,
  } from "$lib/stores/categoryStore.js";
  import {
    userProfile,
    loadUserProfile,
    isLoadingProfile,
  } from "$lib/stores/userProfile";
  import { get } from "svelte/store";
  import { page } from "$app/stores";
  import { Hero, Container, LoadingSpinner, EmptyState, Button, FormSelect, FormTextarea } from '$lib/components/ui';

  // Form state
  let selectedCategory = "";
  let selectedEvent = "";
  let selectedFloridaEvent = "";
  let selectedPlacement = "";
  let eventDate = "";
  let isSubmitting = false;
  let customDescription = "";
  let selectedClubEvent = "";
  
  // NEW: Florida Circuit enhancement variables
  let didPlaceInEvent = null; // "Yes" | "No" | null
  let pointsBreakdown = "";
  let points = null; // Add missing points variable

  // Cleanup functions
  let cleanupFunctions = [];

  // Derived values
  $: user = $userProfile;
  
  // Enhanced points calculation with Florida Circuit logic
  $: if (selectedCategory === "Florida Circuit" && selectedFloridaEvent) {
    if (didPlaceInEvent === "No") {
      points = 1; // Participation only
      pointsBreakdown = "1 point (Participation)";
    } else if (didPlaceInEvent === "Yes" && selectedPlacement) {
      const placementPoints = $placementOptions.find(p => p.value === selectedPlacement)?.points ?? 0;
      points = 1 + placementPoints;
      pointsBreakdown = `1 (Participation) + ${placementPoints} (${selectedPlacement}) = ${points} points`;
    } else {
      points = null;
      pointsBreakdown = "";
    }
  } else {
    // Existing logic for other categories
    points = selectedPlacement
      ? ($placementOptions.find((p) => p.value === selectedPlacement)?.points ?? null)
      : selectedCategory && $isLoaded
        ? ($placementOptions.find(
            (p) => p.category === selectedCategory && (p.value === "EMPTY" || p.value === ""),
          )?.points ?? null)
        : null;
    
    pointsBreakdown = points ? `${points} points` : "";
  }

  // Filter data based on category selection
  $: filteredPlacements =
    selectedCategory && $isLoaded
      ? $placementOptions.filter((p) => p.category === selectedCategory)
      : [];

  $: filteredMonthlyEvents =
    selectedCategory === "Monthly Challenge" && $isLoaded ? $monthlyEvents : [];

  $: filteredFloridaEvents =
    selectedCategory === "Florida Circuit" && $isLoaded
      ? $floridaCircuitEvents
      : [];

  $: filteredClubEvents =
    selectedCategory === "Jax Club Event" && $isLoaded ? $clubEventTypes : [];

  // Check if category needs placement selection
  $: needsPlacement =
    selectedCategory && $isLoaded
      ? $categories.find((c) => c.name === selectedCategory)?.placement === true
      : false;

  // Check if category needs custom description
  $: needsDescription =
    selectedCategory && $isLoaded
      ? $categories.find((c) => c.name === selectedCategory)?.placement ===
          false && selectedCategory !== "Jax Club Event" && selectedCategory !== "Volunteer"
      : false;

  // NEW: Show placement dropdown for Florida Circuit only when user placed
  $: showPlacementDropdown = selectedCategory === "Florida Circuit" && 
                            selectedFloridaEvent && 
                            didPlaceInEvent === "Yes";

  // Reset dependent fields when category changes
  $: if (selectedCategory) {
    selectedEvent = "";
    selectedFloridaEvent = "";
    selectedClubEvent = "";
    selectedPlacement = "";
    eventDate = "";
    didPlaceInEvent = null; // Reset participation choice
  }

  // Reset placement when event changes
  $: if (selectedEvent || selectedFloridaEvent) {
    selectedPlacement = "";
    eventDate = "";
    if (selectedFloridaEvent && selectedCategory === "Florida Circuit") {
      didPlaceInEvent = null; // Reset participation choice when changing Florida Circuit events
    }
  }

  // Reset placement when switching to participation only
  $: if (didPlaceInEvent === "No") {
    selectedPlacement = null;
  }

  // Data loading function
  async function loadData(force = false) {
    console.log(
      "🔄 Loading data, force:",
      force,
      "isLoaded:",
      $isLoaded,
      "isLoading:",
      $isLoading,
    );

    try {
      await Promise.all([loadCategoryData(force), loadUserProfile(force)]);

      console.log("✅ All data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    }
  }

  // Removed tab focus handler - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  // Enhanced form validation with Florida Circuit logic
  function validateForm() {
    const errors = [];

    if (!selectedCategory) errors.push("Please select a category");
    if (!eventDate) errors.push("Please select an event date");
    
    // Florida Circuit specific validation
    if (selectedCategory === "Florida Circuit") {
      if (!selectedFloridaEvent) errors.push("Please select a Florida Circuit event");
      if (didPlaceInEvent === null) errors.push("Please indicate if you placed in this event");
      if (didPlaceInEvent === "Yes" && !selectedPlacement) errors.push("Please select your placement");
    } else {
      // Existing validation for other categories
      if (needsPlacement && !selectedPlacement) {
        errors.push("Please select a placement");
      }
    }

    if (selectedCategory === "Monthly Challenge" && !selectedEvent) {
      errors.push("Please select a monthly event");
    }

    if (selectedCategory === "Volunteer" && !selectedFloridaEvent) {
      errors.push("Please select a Florida Circuit event to volunteer at");
    }

    if (!user?.id) {
      errors.push("User profile not loaded. Please wait a moment.");
    }

    if (needsDescription && !customDescription.trim()) {
      errors.push(`Please provide a description for ${selectedCategory}`);
    }

    if (selectedCategory === "Jax Club Event" && !selectedClubEvent) {
      errors.push("Please select a club event");
    }

    return errors;
  }

  // Reset form
  function resetForm() {
    selectedCategory = "";
    selectedEvent = "";
    selectedFloridaEvent = "";
    selectedPlacement = "";
    eventDate = "";
    customDescription = "";
    selectedClubEvent = "";
    didPlaceInEvent = null; // Reset participation choice
  }

  // Enhanced description building
  function getSubmissionDescription() {
    if (selectedCategory === "Florida Circuit") {
      const baseDescription = selectedFloridaEvent;
      const placementText = didPlaceInEvent === "Yes" && selectedPlacement 
        ? ` - ${selectedPlacement}` 
        : didPlaceInEvent === "No" 
          ? " - Participation Only"
          : "";
      return baseDescription + placementText;
    } else if (selectedCategory === "Monthly Challenge") {
      return selectedEvent;
    } else if (selectedCategory === "Volunteer") {
      return `Volunteered at ${selectedFloridaEvent}`;
    } else if (selectedCategory === "Jax Club Event") {
      return selectedClubEvent;
    } else if (
      selectedCategory === "Brew Pick of Destiny" ||
      selectedCategory === "Officer Position" ||
      selectedCategory === "JAX Presentation" ||
      selectedCategory === "Host Group Brew"
    ) {
      return customDescription.trim();
    }
    return "";
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
      const description = getSubmissionDescription();

      const payload = {
        member_id: user.id,
        category: selectedCategory,
        description,
        points,
        event_date: eventDate,
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("point_submissions")
        .insert([payload]);

      if (error) {
        console.error("Submission error:", error);
        toast.error(`Submission failed: ${error.message}`);
      } else {
        toast.success("Points submitted successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      isSubmitting = false;
    }
  }

  // Enhanced form validation for submission
  $: canSubmit =
    selectedCategory &&
    eventDate &&
    user?.id &&
    !isSubmitting &&
    !$isLoading &&
    !$isLoadingProfile &&
    // Florida Circuit specific validation
    (selectedCategory !== "Florida Circuit" || 
     (selectedFloridaEvent && didPlaceInEvent && 
      (didPlaceInEvent === "No" || selectedPlacement))) &&
    // Existing validations for other categories
    ((selectedCategory === "Monthly Challenge" &&
      selectedEvent &&
      selectedPlacement) ||
      (selectedCategory === "Florida Circuit") || // Handled above
      (selectedCategory === "Jax Club Event" && selectedClubEvent) ||
      (selectedCategory === "Volunteer" && selectedFloridaEvent) ||
      ((selectedCategory === "Brew Pick of Destiny" ||
        selectedCategory === "Officer Position" ||
        selectedCategory === "JAX Presentation" ||
        selectedCategory === "Host Group Brew") &&
        customDescription.trim()) ||
      (selectedCategory !== "Monthly Challenge" &&
        selectedCategory !== "Florida Circuit" &&
        selectedCategory !== "Jax Club Event" &&
        selectedCategory !== "Volunteer" &&
        selectedCategory !== "Brew Pick of Destiny" &&
        selectedCategory !== "Officer Position" &&
        selectedCategory !== "JAX Presentation" &&
        selectedCategory !== "Host Group Brew" &&
        selectedPlacement));

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
    cleanupFunctions.forEach((cleanup) => cleanup());
  });
</script>

<Hero
  title="Submit Points"
  subtitle="Track your brewing achievements"
  backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
  large={true}
/>

<Container size="sm">

  {#if $isLoading || $isLoadingProfile}
    <LoadingSpinner message="Loading data..." />
    <div style="text-align: center; margin-top: var(--space-4);">
      <Button variant="success" on:click={() => loadData(true)}>
        Force Refresh
      </Button>
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

      {#if selectedCategory === "Brew Pick of Destiny" || selectedCategory === "Officer Position" || selectedCategory === "JAX Presentation" || selectedCategory === "Host Group Brew"}
        <label>
          Description *
          <textarea
            bind:value={customDescription}
            placeholder="Describe your {selectedCategory} achievement"
            rows="3"
            required
          ></textarea>
        </label>
      {/if}

      {#if selectedCategory === "Florida Circuit"}
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

      <!-- NEW: Florida Circuit Placement Question -->
      {#if selectedCategory === "Florida Circuit" && selectedFloridaEvent}
        <div class="placement-question">
          <label class="question-label">Did you place in this event? *</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                bind:group={didPlaceInEvent}
                value="No"
                class="radio-input"
              />
              <span class="radio-text">No - Participation Only</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                bind:group={didPlaceInEvent}
                value="Yes"
                class="radio-input"
              />
              <span class="radio-text">Yes - I placed in this event</span>
            </label>
          </div>
        </div>
      {/if}

      {#if selectedCategory === "Monthly Challenge"}
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

      {#if selectedCategory === "Jax Club Event"}
        <label>
          Club Event Type *
          <select bind:value={selectedClubEvent} required>
            <option value="">Select club event type</option>
            {#each filteredClubEvents as ev}
              <option value={ev.event_type}>{ev.event_type}</option>
            {/each}
          </select>
        </label>
      {/if}

      {#if selectedCategory === "Volunteer"}
        <label>
          Florida Circuit Event (Volunteer) *
          <select bind:value={selectedFloridaEvent} required>
            <option value="">Select event Volunteered at </option>
            {#each $floridaCircuitEvents as ev}
              <option value={ev.name}>{ev.name}</option>
            {/each}
          </select>
        </label>
        
        <!-- Read-only description display for Volunteer -->
        {#if selectedFloridaEvent}
          <div class="description-display">
            <label class="form-label">Description</label>
            <div class="read-only-field">Volunteered at {selectedFloridaEvent}</div>
          </div>
        {/if}
      {/if}

      <!-- Enhanced placement selection logic -->
      {#if (filteredPlacements.length > 0 && needsPlacement && (selectedCategory !== "Monthly Challenge" || selectedEvent) && (selectedCategory !== "Florida Circuit" || showPlacementDropdown) && (selectedCategory !== "Jax Club Event" || selectedClubEvent)) || showPlacementDropdown}
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

      <!-- Enhanced points and date display -->
      {#if selectedPlacement || (selectedCategory === "Florida Circuit" && didPlaceInEvent === "No") || (selectedCategory === "Volunteer" && selectedFloridaEvent) || (selectedCategory === "Jax Club Event" && selectedClubEvent) || ((selectedCategory === "Brew Pick of Destiny" || selectedCategory === "Officer Position" || selectedCategory === "JAX Presentation" || selectedCategory === "Host Group Brew") && customDescription.trim())}
        <div class="points-display">
          <p><strong>Points: {pointsBreakdown || (points ? `${points} points` : "—")}</strong></p>
        </div>

        <label>
          Event Date *
          <input type="date" bind:value={eventDate} required />
        </label>
      {/if}

      <Button
        type="submit"
        variant="primary"
        disabled={!canSubmit}
        fullWidth
      >
        {isSubmitting ? "Submitting..." : "Submit Points"}
      </Button>
    </form>
  {:else}
    <EmptyState
      title="Failed to Load"
      message="Failed to load categories. Please refresh the page."
      actionLabel="Retry"
      on:action={() => loadData(true)}
    />
  {/if}
</Container>

<style>

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    text-align: left;
  }

  select,
  input[type="date"] {
    padding: var(--space-3);
    margin-top: var(--space-1);
    font-size: var(--font-size-base);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    width: 100%;
    box-sizing: border-box;
    transition: border-color var(--transition-base);
  }

  select:focus,
  input[type="date"]:focus {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  .points-display {
    background-color: var(--color-bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-card);
    border: 1px solid var(--color-border-primary);
  }

  .points-display p {
    margin: 0;
    color: var(--color-text-primary);
  }


  textarea {
    padding: var(--space-3);
    margin-top: var(--space-1);
    font-size: var(--font-size-base);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    width: 100%;
    box-sizing: border-box;
    transition: border-color var(--transition-base);
    resize: vertical;
    min-height: 80px;
  }

  textarea:focus {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  /* NEW: Florida Circuit Radio Button Styling */
  .placement-question {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .question-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-border-primary);
    border-radius: var(--radius-button);
    cursor: pointer;
    transition: all var(--transition-base);
    background: var(--color-bg-primary);
  }

  .radio-option:hover {
    border-color: var(--color-brand-primary);
    background-color: var(--color-brand-primary-light);
  }

  .radio-option:has(.radio-input:checked) {
    border-color: var(--color-brand-primary);
    background-color: var(--color-brand-primary-light);
  }

  .radio-input {
    width: 20px;
    height: 20px;
    accent-color: var(--color-brand-primary);
    cursor: pointer;
  }

  .radio-text {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    cursor: pointer;
    flex-grow: 1;
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .radio-option {
      min-height: 44px; /* Touch target requirement */
      padding: 1rem 0.75rem;
    }
    
    .radio-input {
      min-width: 44px;
      min-height: 44px;
    }
  }

  /* NEW: Read-only description field styling for Volunteer category */
  .description-display {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .read-only-field {
    padding: var(--space-3);
    margin-top: var(--space-1);
    font-size: var(--font-size-base);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-button);
    width: 100%;
    box-sizing: border-box;
    background-color: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    font-style: italic;
    cursor: not-allowed;
  }
</style>