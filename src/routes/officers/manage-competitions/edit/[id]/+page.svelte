<!-- src/routes/officers/manage-competitions/edit/[id]/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import { competitionManagementStore, updateCompetition } from '$lib/stores/competitionManagementStore';
  import { bjcpCategories, categoriesByNumber, loadBjcpCategories } from '$lib/stores/bjcpCategoryStore';
  import CategorySelector from '$lib/components/CategorySelector.svelte';
  import RankingGroupManager from '$lib/components/RankingGroupManager.svelte';
  import { supabase } from '$lib/supabaseClient';
  
  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  // Form fields
  let name = '';
  let description = '';
  let entryDeadline = '';
  let entryDeadlineTime = '00:00';
  let judgingDate = '';
  let judgingDateTime = '00:00';
  let entryFee = 5;
  let maxEntriesPerMember = 5;
  let isActive = true;
  let hideJudgingDate = false;
  
  // Category system settings
  let categorySystem = 'default'; // 'default' or 'custom'
  let selectedCategories = []; // Array of selected category IDs for custom system
  let rankingGroups = []; // Array of ranking groups for custom system
  
  let isLoading = true;
  let isSubmitting = false;
  let validationErrors = {};
  let competition = null;

  onMount(async () => {
    // Load BJCP categories for category selection
    await loadBjcpCategories();
    
    loadCompetition();
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

  // Load competition data
  async function loadCompetition() {
    isLoading = true;
    
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          competition_categories (
            category_id,
            category_name
          ),
          competition_ranking_groups (
            id,
            name,
            category_ids
          )
        `)
        .eq('id', competitionId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        competition = data;
        name = data.name || '';
        description = data.description || '';
        
        const entryDeadlineDate = new Date(data.entry_deadline);
        entryDeadline = formatDateForInput(entryDeadlineDate);
        entryDeadlineTime = formatTimeForInput(entryDeadlineDate);
        
        const judgingDateDate = new Date(data.judging_date);
        judgingDate = formatDateForInput(judgingDateDate);
        judgingDateTime = formatTimeForInput(judgingDateDate);
        
        entryFee = data.entry_fee || 0;
        maxEntriesPerMember = data.max_entries_per_member || 5;
        isActive = data.active ?? true;
        hideJudgingDate = data.hide_judging_date ?? false;
        
        // Load category system settings
        if (data.competition_categories && data.competition_categories.length > 0) {
          categorySystem = 'custom';
          selectedCategories = data.competition_categories.map(cc => cc.category_id);
          
          if (data.competition_ranking_groups && data.competition_ranking_groups.length > 0) {
            rankingGroups = data.competition_ranking_groups.map(rg => ({
              id: rg.id,
              name: rg.name,
              categoryIds: rg.category_ids
            }));
          }
        } else {
          categorySystem = 'default';
          selectedCategories = [];
          rankingGroups = [];
        }
      }
    } catch (err) {
      console.error('Error loading competition:', err);
      alert('Failed to load competition');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  // Format date for form input
  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format time for form input
  function formatTimeForInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
    
    try {
      // Update basic competition data
      const basicUpdates = {
        name: name.trim(),
        description: description.trim() || null,
        entry_deadline: `${entryDeadline}T${entryDeadlineTime}:00`,
        judging_date: `${judgingDate}T${judgingDateTime}:00`,
        entry_fee: entryFee,
        max_entries_per_member: maxEntriesPerMember,
        active: isActive,
        hide_judging_date: hideJudgingDate,
        category_system: categorySystem
      };
      
      await updateCompetition(competitionId, basicUpdates);
      
      // Handle category system updates if not disabled due to existing entries
      if (!hasEntries) {
        // Remove existing category assignments and ranking groups
        await supabase
          .from('competition_categories')
          .delete()
          .eq('competition_id', competitionId);
          
        await supabase
          .from('competition_ranking_groups')
          .delete()
          .eq('competition_id', competitionId);
        
        // Add new category assignments for custom system
        if (categorySystem === 'custom' && selectedCategories.length > 0) {
          const categoryData = selectedCategories.map(categoryId => ({
            competition_id: competitionId,
            category_id: categoryId,
            category_name: $bjcpCategories.find(c => c.id === categoryId)?.category_name || 'Unknown'
          }));
          
          const { error: categoryError } = await supabase
            .from('competition_categories')
            .insert(categoryData);
            
          if (categoryError) throw categoryError;
          
          // Add ranking groups if any
          if (rankingGroups.length > 0) {
            const groupData = rankingGroups.map((group, index) => ({
              competition_id: competitionId,
              name: group.name,
              category_ids: group.categoryIds,
              group_order: index + 1
            }));
            
            const { error: groupError } = await supabase
              .from('competition_ranking_groups')
              .insert(groupData);
              
            if (groupError) throw groupError;
          }
        }
      }
      
      goto('/officers/manage-competitions');
    } catch (error) {
      console.error('Error updating competition:', error);
      alert(`Error updating competition: ${error.message}`);
      isSubmitting = false;
    }
  }

  // Cancel and go back
  function handleCancel() {
    goto('/officers/manage-competitions');
  }

  // Check if competition has entries (affects what can be edited)
  $: hasEntries = competition?.entry_count > 0;
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

  .loading {
    text-align: center;
    padding: 3rem;
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .form-card {
    background: white;
    padding: 2rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .warning-banner {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: #92400e;
  }

  .warning-banner strong {
    display: block;
    margin-bottom: 0.25rem;
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

  .form-control:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
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

  .entry-stats {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff3e00;
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

    .entry-stats {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
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

    .entry-stats {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
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
  
  .radio-option:has(input:checked) {
    border-color: #ff3e00;
    background: #fff5f5;
  }
  
  .radio-label {
    flex: 1;
  }
  
  .radio-description {
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .custom-category-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
</style>

<div class="container">
  <!-- Hero Section -->
  <div class="hero">
    <h1><span class="emoji">✏️</span> Edit Competition</h1>
    <p class="subtitle">Update competition details</p>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading competition...</p>
    </div>
  {:else if competition}
    <!-- Form Card -->
    <div class="form-card">
      {#if hasEntries}
        <div class="warning-banner">
          <strong>⚠️ This competition has entries</strong>
          Some fields cannot be modified after entries have been submitted.
        </div>
        
        <div class="entry-stats">
          <div class="stat">
            <span class="stat-label">Total Entries</span>
            <span class="stat-value">{competition.entry_count || 0}</span>
          </div>
        </div>
      {/if}

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
            <div class="datetime-inputs">
              <input
                type="date"
                id="entryDeadline"
                class="form-control {validationErrors.entryDeadline ? 'error' : ''}"
                bind:value={entryDeadline}
                disabled={isSubmitting || hasEntries}
              />
              <input
                type="time"
                id="entryDeadlineTime"
                class="form-control time-input"
                bind:value={entryDeadlineTime}
                disabled={isSubmitting || hasEntries}
              />
            </div>
            {#if validationErrors.entryDeadline}
              <div class="error-message">{validationErrors.entryDeadline}</div>
            {/if}
            <div class="help-text">
              {hasEntries ? 'Cannot change after entries submitted' : 'Date and time when entries close'}
            </div>
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
              disabled={isSubmitting || hasEntries}
            />
            {#if validationErrors.entryFee}
              <div class="error-message">{validationErrors.entryFee}</div>
            {/if}
            <div class="help-text">
              {hasEntries ? 'Cannot change after entries submitted' : 'Fee per entry (0 for free)'}
            </div>
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
              disabled={isSubmitting || hasEntries}
            />
            {#if validationErrors.maxEntriesPerMember}
              <div class="error-message">{validationErrors.maxEntriesPerMember}</div>
            {/if}
            <div class="help-text">
              {hasEntries ? 'Cannot change after entries submitted' : 'Maximum entries allowed per member'}
            </div>
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
                disabled={isSubmitting || hasEntries}
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
                disabled={isSubmitting || hasEntries}
              />
              <span class="radio-label">
                <strong>Custom Category System</strong>
                <div class="radio-description">
                  Select specific categories and create custom ranking groups
                </div>
              </span>
            </label>
          </div>
          {#if hasEntries}
            <div class="help-text">Cannot change after entries submitted</div>
          {/if}
        </div>
        
        {#if categorySystem === 'custom'}
          <div class="custom-category-section">
            <CategorySelector
              bind:selectedCategories
              disabled={hasEntries}
              on:change={() => {
                // Reset ranking groups when categories change
                if (!hasEntries) {
                  rankingGroups = [];
                }
              }}
            />
            
            {#if selectedCategories.length > 0}
              <div style="margin-top: 1.5rem;">
                <RankingGroupManager
                  bind:rankingGroups
                  {selectedCategories}
                  disabled={hasEntries}
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
          Uncheck to close competition to new entries
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>