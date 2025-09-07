<!-- RankingGroupManager.svelte -->
<!-- Component for managing ranking groups for competitions -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { categoriesByNumber } from '$lib/stores/bjcpCategoryStore';
  
  export let rankingGroups = []; // Array of ranking group objects
  export let selectedCategories = []; // Array of available category IDs
  export let title = 'Ranking Groups';
  export let description = 'Group categories together for ranking. Categories in the same group will be ranked against each other.';
  
  const dispatch = createEventDispatcher();
  
  // Track editing state
  let editingGroup = null;
  let newGroupName = '';
  let newGroupDescription = '';
  let newGroupCategories = [];
  
  // Get category info by ID
  function getCategoryInfo(categoryId) {
    for (const category of Object.values($categoriesByNumber)) {
      const subcategory = category.subcategories.find(sub => sub.id === categoryId);
      if (subcategory) {
        return {
          number: category.number,
          letter: subcategory.letter,
          name: subcategory.name,
          fullName: `${category.number}${subcategory.letter} - ${subcategory.name}`
        };
      }
    }
    return { fullName: 'Unknown Category' };
  }
  
  // Get categories that aren't assigned to any group
  $: unassignedCategories = selectedCategories.filter(catId => {
    return !rankingGroups.some(group => group.categories.includes(catId));
  });
  
  // Start creating a new group
  function startNewGroup() {
    editingGroup = 'new';
    newGroupName = '';
    newGroupDescription = '';
    newGroupCategories = [];
  }
  
  // Cancel editing
  function cancelEdit() {
    editingGroup = null;
    newGroupName = '';
    newGroupDescription = '';
    newGroupCategories = [];
  }
  
  // Save new or edited group
  function saveGroup() {
    if (!newGroupName.trim()) return;
    if (newGroupCategories.length === 0) return;
    
    const groupData = {
      id: editingGroup === 'new' ? Date.now().toString() : editingGroup,
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      categories: [...newGroupCategories]
    };
    
    if (editingGroup === 'new') {
      rankingGroups = [...rankingGroups, groupData];
    } else {
      rankingGroups = rankingGroups.map(group => 
        group.id === editingGroup ? groupData : group
      );
    }
    
    dispatch('change', rankingGroups);
    cancelEdit();
  }
  
  // Start editing an existing group
  function editGroup(group) {
    editingGroup = group.id;
    newGroupName = group.name;
    newGroupDescription = group.description;
    newGroupCategories = [...group.categories];
  }
  
  // Delete a group
  function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this ranking group?')) {
      rankingGroups = rankingGroups.filter(group => group.id !== groupId);
      dispatch('change', rankingGroups);
    }
  }
  
  // Toggle category in new group
  function toggleCategoryInNewGroup(categoryId) {
    if (newGroupCategories.includes(categoryId)) {
      newGroupCategories = newGroupCategories.filter(id => id !== categoryId);
    } else {
      newGroupCategories = [...newGroupCategories, categoryId];
    }
  }
  
  // Create default groups (one per category)
  function createDefaultGroups() {
    if (confirm('This will create individual ranking groups for each category. Continue?')) {
      const defaultGroups = selectedCategories.map(catId => {
        const catInfo = getCategoryInfo(catId);
        return {
          id: Date.now().toString() + Math.random().toString(),
          name: `Category ${catInfo.number}${catInfo.letter}`,
          description: catInfo.name,
          categories: [catId]
        };
      });
      rankingGroups = defaultGroups;
      dispatch('change', rankingGroups);
    }
  }
  
  // Create single group with all categories
  function createSingleGroup() {
    const singleGroup = {
      id: Date.now().toString(),
      name: 'All Categories',
      description: 'All selected categories ranked together',
      categories: [...selectedCategories]
    };
    rankingGroups = [singleGroup];
    dispatch('change', rankingGroups);
  }
</script>

<div class="ranking-group-manager">
  <div class="header">
    <h3 class="title">{title}</h3>
    <p class="description">{description}</p>
    
    <div class="actions">
      <button type="button" class="btn-secondary" on:click={createDefaultGroups}>
        Create Individual Groups
      </button>
      <button type="button" class="btn-secondary" on:click={createSingleGroup}>
        Create Single Group
      </button>
      <button type="button" class="btn-primary" on:click={startNewGroup}>
        Add Custom Group
      </button>
    </div>
  </div>
  
  {#if editingGroup}
    <div class="group-editor">
      <h4>{editingGroup === 'new' ? 'New Ranking Group' : 'Edit Ranking Group'}</h4>
      
      <div class="form-group">
        <label for="group-name">Group Name</label>
        <input
          id="group-name"
          type="text"
          bind:value={newGroupName}
          placeholder="e.g., Scottish and Irish Beers"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="group-description">Description (optional)</label>
        <textarea
          id="group-description"
          bind:value={newGroupDescription}
          placeholder="Description of this ranking group"
          rows="2"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Categories in this group</label>
        <div class="category-selection">
          {#each (editingGroup === 'new' ? unassignedCategories : selectedCategories) as categoryId}
            <label class="category-item">
              <input
                type="checkbox"
                checked={newGroupCategories.includes(categoryId)}
                on:change={() => toggleCategoryInNewGroup(categoryId)}
              />
              <span>{getCategoryInfo(categoryId).fullName}</span>
            </label>
          {/each}
        </div>
      </div>
      
      <div class="editor-actions">
        <button type="button" class="btn-secondary" on:click={cancelEdit}>
          Cancel
        </button>
        <button 
          type="button" 
          class="btn-primary" 
          on:click={saveGroup}
          disabled={!newGroupName.trim() || newGroupCategories.length === 0}
        >
          {editingGroup === 'new' ? 'Create Group' : 'Save Changes'}
        </button>
      </div>
    </div>
  {/if}
  
  <div class="groups-list">
    {#if rankingGroups.length === 0}
      <div class="empty-state">
        <p>No ranking groups created yet.</p>
        <p>Categories will be ranked individually by default.</p>
      </div>
    {:else}
      {#each rankingGroups as group}
        <div class="group-card">
          <div class="group-header">
            <div>
              <h4 class="group-name">{group.name}</h4>
              {#if group.description}
                <p class="group-description">{group.description}</p>
              {/if}
            </div>
            <div class="group-actions">
              <button type="button" class="btn-link" on:click={() => editGroup(group)}>
                Edit
              </button>
              <button type="button" class="btn-link danger" on:click={() => deleteGroup(group.id)}>
                Delete
              </button>
            </div>
          </div>
          
          <div class="group-categories">
            <strong>Categories ({group.categories.length}):</strong>
            <div class="category-chips">
              {#each group.categories as categoryId}
                <span class="category-chip">
                  {getCategoryInfo(categoryId).fullName}
                </span>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    {/if}
    
    {#if unassignedCategories.length > 0}
      <div class="unassigned-warning">
        <strong>Unassigned Categories ({unassignedCategories.length}):</strong>
        <div class="category-chips">
          {#each unassignedCategories as categoryId}
            <span class="category-chip unassigned">
              {getCategoryInfo(categoryId).fullName}
            </span>
          {/each}
        </div>
        <p class="warning-text">These categories will be ranked individually.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .ranking-group-manager {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .title {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .description {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .btn-primary {
    background: #ff3e00;
    color: white;
    border: 1px solid #ff3e00;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #e63600;
    border-color: #e63600;
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-secondary:hover {
    background: #f9fafb;
  }
  
  .btn-link {
    background: none;
    border: none;
    color: #6366f1;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-link:hover {
    color: #4f46e5;
  }
  
  .btn-link.danger {
    color: #dc2626;
  }
  
  .btn-link.danger:hover {
    color: #b91c1c;
  }
  
  .group-editor {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .group-editor h4 {
    margin: 0 0 1rem 0;
    color: #374151;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .category-selection {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 0.5rem;
  }
  
  .category-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem;
    cursor: pointer;
  }
  
  .category-item:hover {
    background: #f1f5f9;
  }
  
  .editor-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }
  
  .group-card {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }
  
  .group-name {
    margin: 0 0 0.25rem 0;
    color: #374151;
    font-size: 1.1rem;
  }
  
  .group-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .group-actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .group-categories strong {
    color: #374151;
    font-size: 0.9rem;
  }
  
  .category-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .category-chip {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .category-chip.unassigned {
    background: #fef3c7;
    color: #d97706;
  }
  
  .unassigned-warning {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .warning-text {
    margin: 0.5rem 0 0 0;
    color: #d97706;
    font-size: 0.9rem;
    font-style: italic;
  }
  
  @media (max-width: 768px) {
    .actions {
      flex-direction: column;
    }
    
    .group-header {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .editor-actions {
      flex-direction: column;
    }
  }
</style>