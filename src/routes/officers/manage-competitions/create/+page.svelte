<!-- src/routes/officers/manage-competitions/create/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { competitionManagementStore } from '$lib/stores/competitionManagementStore';
  
  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Form fields
  let name = '';
  let description = '';
  let entryDeadline = '';
  let judgingDate = '';
  let entryFee = 5; // Default $5 fee
  let maxEntriesPerMember = 5; // Default max 5 entries
  let isActive = true;
  let hideJudgingDate = false; // Whether to keep judging date private
  
  let isSubmitting = false;
  let validationErrors = {};

  // Set default dates (deadline = 2 weeks from now, judging = 3 weeks from now)
  onMount(() => {
    const today = new Date();
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const threeWeeks = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
    
    entryDeadline = formatDateForInput(twoWeeks);
    judgingDate = formatDateForInput(threeWeeks);
    
    setupEventHandlers();
  });

  // Removed tab switching reload - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  onDestroy(() => {
    // Cleanup handled by setupEventHandlers return
  });

  // Format date for form input
  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Validate form
  function validateForm() {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Competition name is required';
    } else if (name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    }
    
    if (description && description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }
    
    if (!entryDeadline) {
      errors.entryDeadline = 'Entry deadline is required';
    } else {
      const deadline = new Date(entryDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline < today) {
        errors.entryDeadline = 'Entry deadline must be in the future';
      }
    }
    
    if (!judgingDate) {
      errors.judgingDate = 'Judging date is required';
    } else {
      const judging = new Date(judgingDate);
      const deadline = new Date(entryDeadline);
      
      if (judging <= deadline) {
        errors.judgingDate = 'Judging date must be after entry deadline';
      }
    }
    
    if (entryFee < 0 || entryFee > 100) {
      errors.entryFee = 'Entry fee must be between $0 and $100';
    }
    
    if (maxEntriesPerMember < 1 || maxEntriesPerMember > 20) {
      errors.maxEntriesPerMember = 'Max entries must be between 1 and 20';
    }
    
    validationErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting = true;
    
    const competitionData = {
      name: name.trim(),
      description: description.trim() || null,
      entry_deadline: entryDeadline,
      judging_date: judgingDate,
      entry_fee: entryFee,
      max_entries_per_member: maxEntriesPerMember,
      active: isActive,
      hide_judging_date: hideJudgingDate
    };
    
    try {
      const result = await competitionManagementStore.createCompetition(competitionData);
      
      // If we get here with data, it was successful
      if (result && result.id) {
        goto('/officers/manage-competitions');
      } else {
        throw new Error('Competition was not created properly');
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      alert(`Error creating competition: ${error.message || 'Unknown error occurred'}`);
      isSubmitting = false;
    }
  }

  // Cancel and go back
  function handleCancel() {
    goto('/officers/manage-competitions');
  }
</script>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .hero h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .hero h1 .emoji {
    font-size: 1em;
  }

  .hero .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
  }

  .form-card {
    background: white;
    padding: 2rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .required::after {
    content: ' *';
    color: #dc2626;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-control:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.1);
  }

  .form-control.error {
    border-color: #dc2626;
  }

  textarea.form-control {
    resize: vertical;
    min-height: 100px;
  }

  .error-message {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .checkbox-group input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .checkbox-group label {
    margin-bottom: 0;
    cursor: pointer;
    user-select: none;
  }

  .help-text {
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #ff3e00;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #e63600;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #ff3e00;
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .hero .subtitle {
      font-size: 1rem;
    }

    .form-card {
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .btn {
      width: 100%;
    }
  }

  /* Tablet styles */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 3rem;
    }

    .form-card {
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .btn {
      width: 100%;
    }
  }
</style>

<div class="container">
  <!-- Hero Section -->
  <div class="hero">
    <h1><span class="emoji">🏆</span> Create Competition</h1>
    <p class="subtitle">Set up a new brewing competition</p>
  </div>

  <!-- Form Card -->
  <div class="form-card">
    <form on:submit|preventDefault={handleSubmit}>
      <!-- Basic Information -->
      <div class="section-title">Basic Information</div>
      
      <div class="form-group">
        <label for="name" class="required">Competition Name</label>
        <input
          type="text"
          id="name"
          class="form-control {validationErrors.name ? 'error' : ''}"
          bind:value={name}
          placeholder="e.g., Spring 2025 Homebrew Competition"
          maxlength="100"
          disabled={isSubmitting}
        />
        {#if validationErrors.name}
          <div class="error-message">{validationErrors.name}</div>
        {/if}
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          class="form-control {validationErrors.description ? 'error' : ''}"
          bind:value={description}
          placeholder="Optional description or special instructions"
          maxlength="500"
          disabled={isSubmitting}
        />
        {#if validationErrors.description}
          <div class="error-message">{validationErrors.description}</div>
        {/if}
        <div class="help-text">Provide any additional details about the competition</div>
      </div>

      <!-- Dates -->
      <div class="section-title">Important Dates</div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="entryDeadline" class="required">Entry Deadline</label>
          <input
            type="date"
            id="entryDeadline"
            class="form-control {validationErrors.entryDeadline ? 'error' : ''}"
            bind:value={entryDeadline}
            disabled={isSubmitting}
          />
          {#if validationErrors.entryDeadline}
            <div class="error-message">{validationErrors.entryDeadline}</div>
          {/if}
          <div class="help-text">Last day to submit entries</div>
        </div>

        <div class="form-group">
          <label for="judgingDate" class="required">Judging Date</label>
          <input
            type="date"
            id="judgingDate"
            class="form-control {validationErrors.judgingDate ? 'error' : ''}"
            bind:value={judgingDate}
            disabled={isSubmitting}
          />
          {#if validationErrors.judgingDate}
            <div class="error-message">{validationErrors.judgingDate}</div>
          {/if}
          <div class="help-text">When judging will take place</div>
        </div>
      </div>

      <div class="checkbox-group">
        <input
          type="checkbox"
          id="hideJudgingDate"
          bind:checked={hideJudgingDate}
          disabled={isSubmitting}
        />
        <label for="hideJudgingDate">
          Keep judging date private until after entry deadline
        </label>
      </div>

      <!-- Entry Settings -->
      <div class="section-title">Entry Settings</div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="entryFee">Entry Fee ($)</label>
          <input
            type="number"
            id="entryFee"
            class="form-control {validationErrors.entryFee ? 'error' : ''}"
            bind:value={entryFee}
            min="0"
            max="100"
            step="1"
            disabled={isSubmitting}
          />
          {#if validationErrors.entryFee}
            <div class="error-message">{validationErrors.entryFee}</div>
          {/if}
          <div class="help-text">Fee per entry (0 for free)</div>
        </div>

        <div class="form-group">
          <label for="maxEntries">Max Entries Per Member</label>
          <input
            type="number"
            id="maxEntries"
            class="form-control {validationErrors.maxEntriesPerMember ? 'error' : ''}"
            bind:value={maxEntriesPerMember}
            min="1"
            max="20"
            disabled={isSubmitting}
          />
          {#if validationErrors.maxEntriesPerMember}
            <div class="error-message">{validationErrors.maxEntriesPerMember}</div>
          {/if}
          <div class="help-text">Maximum entries allowed per member</div>
        </div>
      </div>

      <!-- Status -->
      <div class="section-title">Status</div>
      
      <div class="checkbox-group">
        <input
          type="checkbox"
          id="isActive"
          bind:checked={isActive}
          disabled={isSubmitting}
        />
        <label for="isActive">
          Competition is active and accepting entries
        </label>
      </div>
      <div class="help-text">
        Uncheck to create as draft (can be activated later)
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          on:click={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Competition'}
        </button>
      </div>
    </form>
  </div>
</div>