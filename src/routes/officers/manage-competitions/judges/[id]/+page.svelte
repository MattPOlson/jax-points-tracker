<!-- Competition Judge Assignment Page -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';
  import {
    competitionJudgingStore,
    judgeList,
    isLoadingJudges,
    judgeError,
    JUDGE_ROLES,
    judgeTableList,
    isLoadingTables
  } from '$lib/stores/competitionJudgingStore';
  import { supabase } from '$lib/supabaseClient';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';

  // Check officer status
  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  // Get competition ID from URL
  $: competitionId = $page.params.id;

  let competition = null;
  let availableJudges = [];
  let isLoading = true;
  let isSaving = false;
  let isRefreshing = false;
  let showAddForm = false;

  // Table management state
  let tables = [];
  let showAddTableForm = false;
  let newTableForm = { table_number: 1, table_name: '' };
  let editingTableId = null;
  let editingTableName = '';
  let isSavingTable = false;

  // Keep local tables in sync with store
  $: tables = $judgeTableList;

  // Auto-compute next available table number
  $: if (showAddTableForm) {
    const usedNumbers = new Set(tables.map(t => t.table_number));
    let next = 1;
    while (usedNumbers.has(next)) next++;
    newTableForm.table_number = next;
  }

  // Form data for adding judges
  let newJudgeForm = {
    judge_id: '',
    judge_role: JUDGE_ROLES.CLUB_JUDGE,
    assignment_notes: '',
    table_id: ''
  };

  onMount(() => {
    loadData();
  });

  async function loadData() {
    isLoading = true;

    try {
      // Load competition details
      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError) throw compError;
      competition = compData;

      // Load tables and judges in parallel
      await Promise.all([
        competitionJudgingStore.loadTables(competitionId),
        competitionJudgingStore.loadJudges(competitionId)
      ]);

      // Load available judges (all members)
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, phone')
        .order('name');

      if (membersError) throw membersError;

      // Filter out already assigned judges
      const assignedJudgeIds = new Set($judgeList.map(j => j.judge_id));
      availableJudges = membersData.filter(member => !assignedJudgeIds.has(member.id));

    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load competition data');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  // --- Table management ---

  function openAddTableForm() {
    showAddTableForm = true;
    newTableForm.table_name = '';
  }

  function cancelAddTable() {
    showAddTableForm = false;
    newTableForm = { table_number: 1, table_name: '' };
  }

  async function saveNewTable() {
    if (!newTableForm.table_name.trim()) {
      toast.error('Please enter a table name');
      return;
    }
    try {
      isSavingTable = true;
      await competitionJudgingStore.createTable(
        competitionId,
        newTableForm.table_number,
        newTableForm.table_name.trim()
      );
      cancelAddTable();
      showToast('Table created successfully', 'success');
    } catch (err) {
      console.error('Error creating table:', err);
      toast.error('Failed to create table: ' + err.message);
    } finally {
      isSavingTable = false;
    }
  }

  function startEditTable(table) {
    editingTableId = table.id;
    editingTableName = table.table_name;
  }

  function cancelEditTable() {
    editingTableId = null;
    editingTableName = '';
  }

  async function saveEditTable(tableId) {
    if (!editingTableName.trim()) {
      toast.error('Table name cannot be empty');
      return;
    }
    try {
      isSavingTable = true;
      await competitionJudgingStore.updateTable(tableId, editingTableName.trim());
      cancelEditTable();
      showToast('Table updated successfully', 'success');
    } catch (err) {
      console.error('Error updating table:', err);
      toast.error('Failed to update table: ' + err.message);
    } finally {
      isSavingTable = false;
    }
  }

  async function deleteTable(tableId, tableLabel) {
    if (!await showConfirm(`Delete "${tableLabel}"? Judges and entries assigned to this table will become unassigned.`)) {
      return;
    }
    try {
      await competitionJudgingStore.deleteTable(tableId);
      showToast('Table deleted', 'success');
    } catch (err) {
      console.error('Error deleting table:', err);
      toast.error('Failed to delete table: ' + err.message);
    }
  }

  function getJudgeCountForTable(tableId) {
    return $judgeList.filter(j => j.table_id === tableId).length;
  }

  // --- Judge management ---

  async function addJudge() {
    if (!newJudgeForm.judge_id) {
      toast.error('Please select a judge');
      return;
    }

    try {
      isSaving = true;

      await competitionJudgingStore.assignJudge(competitionId, {
        ...newJudgeForm,
        table_id: newJudgeForm.table_id || null,
        assigned_by: $userProfile.id
      });

      // Reset form and refresh available judges
      newJudgeForm = {
        judge_id: '',
        judge_role: JUDGE_ROLES.CLUB_JUDGE,
        assignment_notes: '',
        table_id: ''
      };
      showAddForm = false;

      // Refresh available judges list
      const assignedJudgeIds = new Set($judgeList.map(j => j.judge_id));
      availableJudges = availableJudges.filter(member => !assignedJudgeIds.has(member.id));

      showToast('Judge assigned successfully', 'success');

    } catch (err) {
      console.error('Error adding judge:', err);
      toast.error('Failed to assign judge');
    } finally {
      isSaving = false;
    }
  }

  async function removeJudge(assignmentId) {
    if (!await showConfirm('Are you sure you want to remove this judge assignment?')) {
      return;
    }

    try {
      await competitionJudgingStore.removeJudge(assignmentId);

      // Refresh available judges
      await loadData();

      showToast('Judge removed successfully', 'success');

    } catch (err) {
      console.error('Error removing judge:', err);
      toast.error('Failed to remove judge');
    }
  }

  async function handleJudgeTableChange(judgeAssignmentId, newTableId) {
    try {
      await competitionJudgingStore.updateJudgeTable(judgeAssignmentId, newTableId || null);
      showToast('Table assignment updated', 'success');
    } catch (err) {
      console.error('Error updating judge table:', err);
      toast.error('Failed to update table assignment');
      // Reload to reset UI state
      await loadData();
    }
  }

  async function assignAllMembers() {
    if (!await showConfirm(`Are you sure you want to assign all ${availableJudges.length} available members as club judges for this intraclub competition?`)) {
      return;
    }

    try {
      isSaving = true;

      for (const member of availableJudges) {
        await competitionJudgingStore.assignJudge(competitionId, {
          judge_id: member.id,
          judge_role: JUDGE_ROLES.CLUB_JUDGE,
          assignment_notes: 'Auto-assigned for intraclub competition',
          assigned_by: $userProfile.id
        });
      }

      await loadData();

      showToast(`Successfully assigned ${availableJudges.length} judges`, 'success');

    } catch (err) {
      console.error('Error assigning all judges:', err);
      toast.error('Failed to assign all judges');
    } finally {
      isSaving = false;
    }
  }

  async function refreshJudges() {
    try {
      isRefreshing = true;

      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, phone')
        .order('name');

      if (membersError) throw membersError;

      const assignedJudgeIds = new Set($judgeList.map(j => j.judge_id));
      availableJudges = membersData.filter(member => !assignedJudgeIds.has(member.id));

      showToast(`Refreshed judges list — ${availableJudges.length} available`, 'success');

    } catch (err) {
      console.error('Error refreshing judges:', err);
      toast.error('Failed to refresh judges list');
    } finally {
      isRefreshing = false;
    }
  }

  function getTableLabel(tableId) {
    if (!tableId) return 'Unassigned';
    const t = tables.find(t => t.id === tableId);
    return t ? `Table ${t.table_number}: ${t.table_name}` : 'Unknown Table';
  }

  function getRoleDisplayName(role) {
    switch (role) {
      case JUDGE_ROLES.BJCP_JUDGE: return 'BJCP Certified Judge';
      case JUDGE_ROLES.CLUB_JUDGE: return 'Club Judge';
      case JUDGE_ROLES.GUEST_JUDGE: return 'Guest Judge';
      default: return role;
    }
  }

  function getStatusBadgeClass(competition) {
    const now = new Date();
    const deadline = new Date(competition.entry_deadline);
    const judgingDate = new Date(competition.judging_date);

    if (competition.results_published) {
      return 'status-completed';
    } else if (now > deadline && now <= judgingDate) {
      return 'status-judging';
    } else if (now <= deadline) {
      return 'status-open';
    } else {
      return 'status-judging';
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#6b7280'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }
</script>

<style>
  .competition-info {
    background: white;
    padding: 1.5rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--color-brand-primary, #1e293b);
    margin-bottom: 2rem;
  }

  .competition-info h2 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.5rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-completed { background: #dcfce7; color: #166534; }
  .status-judging   { background: #fef3c7; color: #92400e; }
  .status-open      { background: #dbeafe; color: #1d4ed8; }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
    flex-wrap: wrap;
  }

  /* ---- Tables section ---- */
  .section-card {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .section-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  }

  .section-header h3 {
    margin: 0;
    color: var(--color-brand-primary, #1e293b);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .tables-list {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .table-card {
    background: #f9fafb;
    border-radius: 6px;
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e5e7eb;
  }

  .table-card-info h4 {
    margin: 0 0 0.2rem 0;
    color: var(--color-brand-primary, #1e293b);
    font-size: 1rem;
  }

  .table-card-info .judge-count {
    font-size: 0.85rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .table-card-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .inline-edit-form {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex: 1;
  }

  .inline-edit-form input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  .add-table-form {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    background: #f8fafc;
  }

  .add-table-form h4 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .form-group {
    margin-bottom: 1rem;
    flex: 1;
    min-width: 160px;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .form-control-sm {
    padding: 0.5rem 0.65rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  /* ---- Judges section ---- */
  .judges-list {
    padding: 1rem 1.5rem;
  }

  .judge-card {
    background: #f9fafb;
    border-radius: 6px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    border: 1px solid #e5e7eb;
  }

  .judge-info h4 {
    margin: 0 0 0.25rem 0;
    color: var(--color-brand-primary, #1e293b);
  }

  .judge-info p {
    margin: 0;
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.9rem;
  }

  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  .judge-table-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.6rem;
    flex-wrap: wrap;
  }

  .judge-table-selector label {
    font-size: 0.85rem;
    color: var(--color-text-secondary, #6b7280);
    font-weight: 500;
    white-space: nowrap;
  }

  .judge-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .add-judge-form {
    background: #f8fafc;
    padding: 1.5rem;
    border-top: 1px solid #eee;
  }

  .add-judge-form h4 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .icon-btn {
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: #374151;
    transition: background 0.15s;
  }

  .icon-btn:hover {
    background: #e5e7eb;
  }

  .icon-btn.danger {
    color: #dc2626;
    border-color: #fca5a5;
  }

  .icon-btn.danger:hover {
    background: #fee2e2;
  }

  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .judge-card {
      flex-direction: column;
      align-items: stretch;
    }

    .judge-right {
      justify-content: flex-end;
    }

    .table-card {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .table-card-actions {
      justify-content: flex-end;
    }

    .form-row {
      flex-direction: column;
    }
  }
</style>

<Hero
  title="Manage Judges"
  subtitle="Assign judges and judging tables"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  {#if isLoading}
    <LoadingSpinner message="Loading competition data..." />
  {:else if competition}

    <!-- Competition Info -->
    <div class="competition-info">
      <h2>{competition.name}</h2>
      <p>
        <span class="status-badge {getStatusBadgeClass(competition)}">
          {competition.results_published ? 'Results Published' :
           new Date() > new Date(competition.entry_deadline) ? 'Judging Phase' : 'Entry Phase'}
        </span>
      </p>
    </div>

    <!-- Controls -->
    <div class="controls">
      <Button variant="secondary" on:click={() => goto('/officers/manage-competitions')}>
        ← Back to Competitions
      </Button>
      <Button
        variant="secondary"
        on:click={refreshJudges}
        disabled={isRefreshing}
        title="Refresh the list of available judges"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Judges'}
      </Button>
    </div>

    <!-- ===== Section 1: Judging Tables ===== -->
    <div class="section-card">
      <div class="section-header">
        <h3>Judging Tables ({tables.length})</h3>
        <Button
          variant="success"
          on:click={openAddTableForm}
          disabled={showAddTableForm}
        >
          + Add Table
        </Button>
      </div>

      {#if $isLoadingTables}
        <LoadingSpinner message="Loading tables..." />
      {:else if tables.length === 0 && !showAddTableForm}
        <div style="padding: 1.5rem 1.5rem; color: var(--color-text-secondary, #6b7280); font-size: 0.95rem;">
          No judging tables yet. Add tables to assign judges and entries to specific tables.
        </div>
      {:else}
        <div class="tables-list">
          {#each tables as table (table.id)}
            <div class="table-card">
              {#if editingTableId === table.id}
                <div class="inline-edit-form">
                  <span style="font-weight:600; color: #374151; white-space: nowrap;">Table {table.table_number}:</span>
                  <input
                    class="form-control"
                    style="padding: 0.4rem 0.6rem;"
                    bind:value={editingTableName}
                    on:keydown={(e) => { if (e.key === 'Enter') saveEditTable(table.id); if (e.key === 'Escape') cancelEditTable(); }}
                  />
                  <button class="icon-btn" on:click={() => saveEditTable(table.id)} disabled={isSavingTable}>Save</button>
                  <button class="icon-btn" on:click={cancelEditTable}>Cancel</button>
                </div>
              {:else}
                <div class="table-card-info">
                  <h4>Table {table.table_number}: {table.table_name}</h4>
                  <span class="judge-count">
                    {getJudgeCountForTable(table.id)} judge{getJudgeCountForTable(table.id) !== 1 ? 's' : ''} assigned
                  </span>
                </div>
                <div class="table-card-actions">
                  <button class="icon-btn" on:click={() => startEditTable(table)} title="Rename table">
                    Edit
                  </button>
                  <button class="icon-btn danger" on:click={() => deleteTable(table.id, `Table ${table.table_number}: ${table.table_name}`)}>
                    Delete
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      {#if showAddTableForm}
        <div class="add-table-form">
          <h4>New Judging Table</h4>
          <div class="form-row">
            <div class="form-group" style="max-width: 120px;">
              <label for="table-number">Table #</label>
              <input
                id="table-number"
                type="number"
                min="1"
                class="form-control"
                bind:value={newTableForm.table_number}
              />
            </div>
            <div class="form-group">
              <label for="table-name">Table Name</label>
              <input
                id="table-name"
                type="text"
                class="form-control"
                placeholder="e.g. Ales, Lagers, Table A..."
                bind:value={newTableForm.table_name}
                on:keydown={(e) => { if (e.key === 'Enter') saveNewTable(); if (e.key === 'Escape') cancelAddTable(); }}
              />
            </div>
          </div>
          <div class="form-actions">
            <Button variant="success" on:click={saveNewTable} disabled={isSavingTable || !newTableForm.table_name.trim()}>
              {isSavingTable ? 'Saving...' : 'Save Table'}
            </Button>
            <Button variant="secondary" on:click={cancelAddTable} disabled={isSavingTable}>
              Cancel
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <!-- ===== Section 2: Assigned Judges ===== -->
    <div class="section-card">
      <div class="section-header">
        <h3>Assigned Judges ({$judgeList.length})</h3>
        <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
          {#if competition.competition_type === 'intraclub' && availableJudges.length > 0}
            <Button
              variant="primary"
              on:click={assignAllMembers}
              disabled={isSaving}
            >
              {isSaving ? 'Assigning...' : `Assign All Members (${availableJudges.length})`}
            </Button>
          {/if}
          <Button
            variant="success"
            on:click={() => showAddForm = !showAddForm}
            disabled={availableJudges.length === 0}
          >
            {showAddForm ? 'Cancel' : 'Add Judge'}
          </Button>
        </div>
      </div>

      {#if $isLoadingJudges}
        <LoadingSpinner message="Loading judges..." />
      {:else if $judgeList.length === 0}
        <EmptyState
          icon="👩‍⚖️"
          title="No judges assigned yet"
          message="Add judges to start the judging process"
        />
      {:else}
        <div class="judges-list">
          {#each $judgeList as judgeAssignment}
            <div class="judge-card">
              <div class="judge-info">
                <h4>{judgeAssignment.judge?.name || 'Unknown Judge'}</h4>
                <p>{judgeAssignment.judge?.email}</p>
                <span class="role-badge">{getRoleDisplayName(judgeAssignment.judge_role)}</span>
                {#if judgeAssignment.assignment_notes}
                  <p style="margin-top: 0.5rem; font-style: italic;">{judgeAssignment.assignment_notes}</p>
                {/if}
                <!-- Table selector -->
                <div class="judge-table-selector">
                  <label for="judge-table-{judgeAssignment.id}">Table:</label>
                  {#if tables.length === 0}
                    <span style="font-size:0.85rem; color: var(--color-text-secondary, #6b7280);">No tables created yet</span>
                  {:else}
                    <select
                      id="judge-table-{judgeAssignment.id}"
                      class="form-control-sm"
                      value={judgeAssignment.table_id || ''}
                      on:change={(e) => handleJudgeTableChange(judgeAssignment.id, e.target.value || null)}
                    >
                      <option value="">Unassigned</option>
                      {#each tables as table}
                        <option value={table.id}>Table {table.table_number}: {table.table_name}</option>
                      {/each}
                    </select>
                  {/if}
                </div>
              </div>
              <div class="judge-right">
                <button
                  class="icon-btn danger"
                  on:click={() => removeJudge(judgeAssignment.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Add Judge Form -->
      {#if showAddForm}
        <div class="add-judge-form">
          <h4>Add New Judge</h4>

          {#if availableJudges.length === 0}
            <p>All members are already assigned as judges for this competition.</p>
          {:else}
            <div class="form-group">
              <label for="judge-select">Select Judge</label>
              <select
                id="judge-select"
                class="form-control"
                bind:value={newJudgeForm.judge_id}
              >
                <option value="">Choose a judge...</option>
                {#each availableJudges as judge}
                  <option value={judge.id}>{judge.name} ({judge.email})</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="judge-role">Judge Role</label>
              <select
                id="judge-role"
                class="form-control"
                bind:value={newJudgeForm.judge_role}
              >
                <option value={JUDGE_ROLES.CLUB_JUDGE}>Club Judge</option>
                <option value={JUDGE_ROLES.BJCP_JUDGE}>BJCP Certified Judge</option>
                <option value={JUDGE_ROLES.GUEST_JUDGE}>Guest Judge</option>
              </select>
            </div>

            {#if tables.length > 0}
              <div class="form-group">
                <label for="judge-table-new">Assign to Table (optional)</label>
                <select
                  id="judge-table-new"
                  class="form-control"
                  bind:value={newJudgeForm.table_id}
                >
                  <option value="">Unassigned</option>
                  {#each tables as table}
                    <option value={table.id}>Table {table.table_number}: {table.table_name}</option>
                  {/each}
                </select>
              </div>
            {/if}

            <div class="form-group">
              <label for="assignment-notes">Assignment Notes (Optional)</label>
              <textarea
                id="assignment-notes"
                class="form-control"
                rows="2"
                placeholder="Any special instructions or notes for this judge assignment..."
                bind:value={newJudgeForm.assignment_notes}
              ></textarea>
            </div>

            <div class="form-actions">
              <Button
                variant="success"
                on:click={addJudge}
                disabled={isSaving || !newJudgeForm.judge_id}
              >
                {isSaving ? 'Adding...' : 'Add Judge'}
              </Button>
              <Button
                variant="secondary"
                on:click={() => showAddForm = false}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if $judgeError}
      <div style="background: #fecaca; color: #dc2626; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        Error: {$judgeError}
      </div>
    {/if}

  {/if}
</Container>
