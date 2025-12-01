<!-- src/routes/officers/manage-competitions/create/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { competitionManagementStore } from '$lib/stores/competitionManagementStore';
  import { bjcpCategories, categoriesByNumber, loadBjcpCategories } from '$lib/stores/bjcpCategoryStore';
  import CategorySelector from '$lib/components/CategorySelector.svelte';
  import RankingGroupManager from '$lib/components/RankingGroupManager.svelte';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  
  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Form fields
  let name = '';
  let description = '';
  let entryDeadline = '';
  let entryDeadlineTime = '00:00'; // Default 12:00 AM (midnight)
  let judgingDate = '';
  let judgingDateTime = '00:00'; // Default 12:00 AM (midnight)
  let entryFee = 5; // Default $5 fee
  let maxEntriesPerMember = 5; // Default max 5 entries
  let isActive = true;
  let hideJudgingDate = false; // Whether to keep judging date private
  let competitionType = 'regular'; // 'regular', 'intraclub', or 'sanctioned'
  
  // Category system settings
  let categorySystem = 'default'; // 'default' or 'custom'
  let selectedCategories = []; // Array of selected category IDs for custom system
  let rankingGroups = []; // Array of ranking groups for custom system
  
  let isSubmitting = false;
  let validationErrors = {};

  // Set default dates (deadline = 2 weeks from now, judging = 3 weeks from now)
  onMount(async () => {
    const today = new Date();
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const threeWeeks = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
    
    entryDeadline = formatDateForInput(twoWeeks);
    judgingDate = formatDateForInput(threeWeeks);
    
    // Load BJCP categories for category selection
    await loadBjcpCategories();
    
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
      const judging = new Date(`${judgingDate}T${judgingDateTime}:00`);
      const deadline = new Date(`${entryDeadline}T${entryDeadlineTime}:00`);
      
      if (judging <= deadline) {
        errors.judgingDate = 'Judging date and time must be after entry deadline';
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
      entry_deadline: `${entryDeadline}T${entryDeadlineTime}:00`,
      judging_date: `${judgingDate}T${judgingDateTime}:00`,
      entry_fee: entryFee,
      max_entries_per_member: maxEntriesPerMember,
      active: isActive,
      hide_judging_date: hideJudgingDate,
      competition_type: competitionType,
      category_system: categorySystem,
      category_restrictions: categorySystem === 'custom' ? selectedCategories : null,
      ranking_groups: categorySystem === 'custom' ? rankingGroups : []
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

  .datetime-inputs {
    display: flex;
    gap: 0.5rem;
  }

  .datetime-inputs .form-control {
    width: 100%;
  }

  .time-input {
    flex: 0 0 120px;
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
    .form-card {
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .datetime-inputs {
      flex-direction: column;
    }

    .time-input {
      flex: 1;
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
    
    .custom-category-section {
      padding: 1rem;
    }
  }
  
  /* Radio Group Styles */
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .radio-option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .radio-option:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  
  .radio-option input[type="radio"] {
    margin: 0;
    margin-top: 0.125rem;
  }
  
  .radio-label {
    flex: 1;
  }
  
  .radio-label strong {
    display: block;
    color: #374151;
    margin-bottom: 0.25rem;
  }
  
  .radio-description {
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .radio-option:has(input:checked) {
    border-color: #ff3e00;
    background: #fff5f5;
  }
  
  .custom-category-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
</style>

<Container size="md">
  <Hero
    title="Create Competition"
    subtitle="Set up a new brewing competition"
    backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
    large={true}
  />

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

      <div class="form-group">
        <label>Competition Type</label>
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              bind:group={competitionType}
              value="regular"
              disabled={isSubmitting}
            />
            <span class="radio-label">
              <strong>Regular Competition</strong>
              <div class="radio-description">
                Open to all members and guests, standard judging process
              </div>
            </span>
          </label>

          <label class="radio-option">
            <input
              type="radio"
              bind:group={competitionType}
              value="intraclub"
              disabled={isSubmitting}
            />
            <span class="radio-label">
              <strong>Intraclub Competition</strong>
              <div class="radio-description">
                Club members only, simplified judging for meetings
              </div>
            </span>
          </label>

          <label class="radio-option">
            <input
              type="radio"
              bind:group={competitionType}
              value="sanctioned"
              disabled={isSubmitting}
            />
            <span class="radio-label">
              <strong>Sanctioned Competition</strong>
              <div class="radio-description">
                Official BJCP sanctioned competition with certified judges
              </div>
            </span>
          </label>
        </div>
      </div>

      <!-- Dates -->
      <div class="section-title">Important Dates</div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="entryDeadline" class="required">Entry Deadline</label>
          <div class="datetime-inputs">
            <input
              type="date"
              id="entryDeadline"
              class="form-control {validationErrors.entryDeadline ? 'error' : ''}"
              bind:value={entryDeadline}
              disabled={isSubmitting}
            />
            <input
              type="time"
              id="entryDeadlineTime"
              class="form-control time-input"
              bind:value={entryDeadlineTime}
              disabled={isSubmitting}
            />
          </div>
          {#if validationErrors.entryDeadline}
            <div class="error-message">{validationErrors.entryDeadline}</div>
          {/if}
          <div class="help-text">Date and time when entries close</div>
        </div>

        <div class="form-group">
          <label for="judgingDate" class="required">Judging Date</label>
          <div class="datetime-inputs">
            <input
              type="date"
              id="judgingDate"
              class="form-control {validationErrors.judgingDate ? 'error' : ''}"
              bind:value={judgingDate}
              disabled={isSubmitting}
            />
            <input
              type="time"
              id="judgingDateTime"
              class="form-control time-input"
              bind:value={judgingDateTime}
              disabled={isSubmitting}
            />
          </div>
          {#if validationErrors.judgingDate}
            <div class="error-message">{validationErrors.judgingDate}</div>
          {/if}
          <div class="help-text">Date and time when judging will take place</div>
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

      <!-- Category System -->
      <div class="section-title">Category System</div>
      
      <div class="form-group">
        <label>Ranking System</label>
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              bind:group={categorySystem}
              value="default"
              disabled={isSubmitting}
            />
            <span class="radio-label">
              <strong>Default BJCP System</strong>
              <div class="radio-description">
                Allow all BJCP categories, rank each category individually
              </div>
            </span>
          </label>
          
          <label class="radio-option">
            <input
              type="radio"
              bind:group={categorySystem}
              value="custom"
              disabled={isSubmitting}
            />
            <span class="radio-label">
              <strong>Custom Category Selection</strong>
              <div class="radio-description">
                Select specific categories and create custom ranking groups
              </div>
            </span>
          </label>
        </div>
      </div>
      
      {#if categorySystem === 'custom'}
        <div class="custom-category-section">
          <CategorySelector
            bind:selectedCategories
            on:change={() => {
              // Reset ranking groups when categories change
              rankingGroups = [];
            }}
          />
          
          {#if selectedCategories.length > 0}
            <div style="margin-top: 1.5rem;">
              <RankingGroupManager
                bind:rankingGroups
                {selectedCategories}
                on:change={() => {}}
              />
            </div>
          {/if}
        </div>
      {/if}

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
        <Button
          variant="secondary"
          on:click={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Competition'}
        </Button>
      </div>
    </form>
  </div>
</Container>