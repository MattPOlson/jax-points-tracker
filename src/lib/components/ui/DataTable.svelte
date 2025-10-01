<script>
  /**
   * DataTable Component
   *
   * A responsive data table that shows desktop table on large screens
   * and card layout on mobile devices.
   *
   * @prop {Array} columns - Array of column definitions: [{key, label, width}]
   * @prop {Array} data - Array of data objects
   * @prop {boolean} striped - Alternate row colors
   * @prop {boolean} hover - Highlight rows on hover
   */

  export let columns = [];
  export let data = [];
  export let striped = false;
  export let hover = true;
</script>

<div class="data-table-wrapper">
  <!-- Desktop table -->
  <div class="desktop-table">
    <table class="data-table" class:table-striped={striped} class:table-hover={hover}>
      <thead>
        <tr>
          {#each columns as column}
            <th style={column.width ? `width: ${column.width}` : ''}>
              {column.label}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data as row, index}
          <tr>
            {#each columns as column}
              <td>
                <slot name="cell" {row} {column} {index}>
                  {row[column.key] || '-'}
                </slot>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Mobile cards -->
  <div class="mobile-cards">
    {#each data as row, index}
      <div class="mobile-card">
        {#each columns as column}
          <div class="mobile-card-row">
            <div class="mobile-card-label">{column.label}:</div>
            <div class="mobile-card-value">
              <slot name="cell" {row} {column} {index}>
                {row[column.key] || '-'}
              </slot>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .data-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  /* Desktop table */
  .desktop-table {
    display: block;
  }

  .mobile-cards {
    display: none;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .data-table thead {
    background-color: var(--color-gray-100);
  }

  .data-table th {
    padding: var(--space-4);
    text-align: left;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-border-primary);
  }

  .data-table td {
    padding: var(--space-4);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-primary);
  }

  .data-table tbody tr:last-child td {
    border-bottom: none;
  }

  .table-striped tbody tr:nth-child(even) {
    background-color: var(--color-gray-50);
  }

  .table-hover tbody tr:hover {
    background-color: var(--color-gray-100);
    cursor: pointer;
  }

  /* Mobile cards */
  @media (max-width: 768px) {
    .desktop-table {
      display: none;
    }

    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .mobile-card {
      background-color: var(--color-bg-primary);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: var(--space-4);
    }

    .mobile-card-row {
      display: flex;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-border-primary);
    }

    .mobile-card-row:last-child {
      border-bottom: none;
    }

    .mobile-card-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .mobile-card-value {
      font-size: var(--font-size-base);
      color: var(--color-text-primary);
      text-align: right;
    }
  }
</style>
