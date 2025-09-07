<!-- CategorySelector.svelte -->
<!-- Component for selecting BJCP categories for competitions -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { categoriesByNumber } from '$lib/stores/bjcpCategoryStore';
  
  export let selectedCategories = []; // Array of selected category IDs
  export let title = 'Select Categories';
  export let description = 'Choose which BJCP categories are allowed in this competition';
  
  const dispatch = createEventDispatcher();
  
  // Track which categories are selected
  let categorySelections = {};
  
  // Initialize selections based on selectedCategories prop
  $: {
    categorySelections = {};
    selectedCategories.forEach(id => {
      categorySelections[id] = true;
    });
  }
  
  // Update selectedCategories when selections change
  function updateSelectedCategories() {
    const newSelection = Object.keys(categorySelections)
      .filter(id => categorySelections[id]);
    selectedCategories = newSelection;
    dispatch('change', selectedCategories);
  }
  
  // Handle category toggle
  function toggleCategory(categoryId) {
    categorySelections[categoryId] = !categorySelections[categoryId];
    updateSelectedCategories();
  }
  
  // Select all categories in a main category
  function selectAllInCategory(categoryNumber, subcategories) {
    const allSelected = subcategories.every(sub => categorySelections[sub.id]);
    subcategories.forEach(sub => {
      categorySelections[sub.id] = !allSelected;
    });
    updateSelectedCategories();
  }
  
  // Get count of selected categories
  $: selectedCount = Object.values(categorySelections).filter(Boolean).length;
  
  // Get total count of available categories
  $: totalCount = Object.values($categoriesByNumber).reduce((acc, cat) => acc + cat.subcategories.length, 0);
  
  // Select all categories
  function selectAll() {
    Object.values($categoriesByNumber).forEach(category => {
      category.subcategories.forEach(sub => {
        categorySelections[sub.id] = true;
      });
    });
    updateSelectedCategories();
  }
  
  // Clear all selections
  function selectNone() {
    categorySelections = {};
    updateSelectedCategories();
  }
</script>

<div class="category-selector">
  <div class="header">
    <h3 class="title">{title}</h3>
    <p class="description">{description}</p>
    <div class="selection-summary">
      <span class="count">{selectedCount} of {totalCount} categories selected</span>
      <div class="bulk-actions">
        <button type="button" class="btn-link" on:click={selectAll}>Select All</button>
        <button type="button" class="btn-link" on:click={selectNone}>Select None</button>
      </div>
    </div>
  </div>
  
  <div class="categories-grid">
    {#each Object.entries($categoriesByNumber) as [categoryNumber, category]}
      <div class="category-group">
        <div class="category-header">
          <h4 class="category-title">
            Category {category.number}: {category.name}
            <button 
              type="button" 
              class="toggle-all-btn"
              on:click={() => selectAllInCategory(categoryNumber, category.subcategories)}
            >
              {#if category.subcategories.every(sub => categorySelections[sub.id])}
                Deselect All
              {:else}
                Select All
              {/if}
            </button>
          </h4>
        </div>
        
        <div class="subcategories">
          {#each category.subcategories as subcategory}
            <label class="subcategory-item">
              <input
                type="checkbox"
                checked={categorySelections[subcategory.id] || false}
                on:change={() => toggleCategory(subcategory.id)}
              />
              <span class="subcategory-label">
                <strong>{category.number}{subcategory.letter}</strong>
                {subcategory.name}
              </span>
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .category-selector {
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
  
  .selection-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .count {
    font-weight: 500;
    color: #374151;
  }
  
  .bulk-actions {
    display: flex;
    gap: 1rem;
  }
  
  .btn-link {
    background: none;
    border: none;
    color: #ff3e00;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-link:hover {
    color: #e63600;
  }
  
  .categories-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
  
  .category-group {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .category-header {
    background: #f8fafc;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .category-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .toggle-all-btn {
    background: none;
    border: none;
    color: #6366f1;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: normal;
  }
  
  .toggle-all-btn:hover {
    color: #4f46e5;
  }
  
  .subcategories {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .subcategory-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }
  
  .subcategory-item:hover {
    background: #f1f5f9;
  }
  
  .subcategory-item input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }
  
  .subcategory-label {
    font-size: 0.9rem;
    color: #374151;
    cursor: pointer;
  }
  
  .subcategory-label strong {
    color: #111827;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .categories-grid {
      grid-template-columns: 1fr;
    }
    
    .selection-summary {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>