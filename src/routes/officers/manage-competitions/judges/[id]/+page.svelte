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
    JUDGE_ROLES
  } from '$lib/stores/competitionJudgingStore';
  import { supabase } from '$lib/supabaseClient';
  import Hero from "$lib/components/ui/Hero.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Button from "$lib/components/ui/Button.svelte";

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

  // Form data for adding judges
  let newJudgeForm = {
    judge_id: '',
    judge_role: JUDGE_ROLES.CLUB_JUDGE,
    assignment_notes: ''
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

      // Load existing judges
      await competitionJudgingStore.loadJudges(competitionId);

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
      alert('Failed to load competition data');
      goto('/officers/manage-competitions');
    } finally {
      isLoading = false;
    }
  }

  async function addJudge() {
    if (!newJudgeForm.judge_id) {
      alert('Please select a judge');
      return;
    }

    try {
      isSaving = true;

      await competitionJudgingStore.assignJudge(competitionId, {
        ...newJudgeForm,
        assigned_by: $userProfile.id
      });

      // Reset form and refresh available judges
      newJudgeForm = {
        judge_id: '',
        judge_role: JUDGE_ROLES.CLUB_JUDGE,
        assignment_notes: ''
      };
      showAddForm = false;

      // Refresh available judges list
      const assignedJudgeIds = new Set($judgeList.map(j => j.judge_id));
      availableJudges = availableJudges.filter(member => !assignedJudgeIds.has(member.id));

      showToast('Judge assigned successfully', 'success');

    } catch (err) {
      console.error('Error adding judge:', err);
      alert('Failed to assign judge');
    } finally {
      isSaving = false;
    }
  }

  async function removeJudge(assignmentId) {
    if (!confirm('Are you sure you want to remove this judge assignment?')) {
      return;
    }

    try {
      await competitionJudgingStore.removeJudge(assignmentId);

      // Refresh available judges
      await loadData();

      showToast('Judge removed successfully', 'success');

    } catch (err) {
      console.error('Error removing judge:', err);
      alert('Failed to remove judge');
    }
  }

  async function assignAllMembers() {
    if (!confirm(`Are you sure you want to assign all ${availableJudges.length} available members as club judges for this intraclub competition?`)) {
      return;
    }

    try {
      isSaving = true;

      // Assign all available judges
      for (const member of availableJudges) {
        await competitionJudgingStore.assignJudge(competitionId, {
          judge_id: member.id,
          judge_role: JUDGE_ROLES.CLUB_JUDGE,
          assignment_notes: 'Auto-assigned for intraclub competition',
          assigned_by: $userProfile.id
        });
      }

      // Refresh the data
      await loadData();

      showToast(`Successfully assigned ${availableJudges.length} judges`, 'success');

    } catch (err) {
      console.error('Error assigning all judges:', err);
      alert('Failed to assign all judges');
    } finally {
      isSaving = false;
    }
  }

  async function refreshJudges() {
    try {
      isRefreshing = true;

      // Reload available judges (all members)
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, phone')
        .order('name');

      if (membersError) throw membersError;

      // Filter out already assigned judges
      const assignedJudgeIds = new Set($judgeList.map(j => j.judge_id));
      availableJudges = membersData.filter(member => !assignedJudgeIds.has(member.id));

      showToast(`Refreshed judges list - ${availableJudges.length} available`, 'success');

    } catch (err) {
      console.error('Error refreshing judges:', err);
      alert('Failed to refresh judges list');
    } finally {
      isRefreshing = false;
    }
  }

  function getRoleDisplayName(role) {
    switch (role) {
      case JUDGE_ROLES.BJCP_JUDGE:
        return 'BJCP Certified Judge';
      case JUDGE_ROLES.CLUB_JUDGE:
        return 'Club Judge';
      case JUDGE_ROLES.GUEST_JUDGE:
        return 'Guest Judge';
      default:
        return role;
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

  // Simple toast notification
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
    border-left: 4px solid #ff3e00;
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
  .status-judging { background: #fef3c7; color: #92400e; }
  .status-open { background: #dbeafe; color: #1d4ed8; }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
    flex-wrap: wrap;
  }


  .judges-section {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .section-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .judges-list {
    padding: 1rem;
  }

  .judge-card {
    background: #f9f9f9;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .judge-info h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
  }

  .judge-info p {
    margin: 0;
    color: #666;
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

  .add-judge-form {
    background: #f9f9f9;
    padding: 1.5rem;
    border-top: 1px solid #eee;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }


  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .judge-card {
      flex-direction: column;
      align-items: start;
      gap: 1rem;
    }

    .form-actions {
      justify-content: stretch;
    }

    .btn {
      flex: 1;
    }
  }
</style>

<Container size="lg">
  <Hero
    title="Manage Judges"
    subtitle="Assign judges to competition"
    backgroundImage="linear-gradient(135deg, #1a2a44 0%, #2c456b 100%)"
    large={true}
  />

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
      <Button
        variant="success"
        on:click={() => showAddForm = !showAddForm}
        disabled={availableJudges.length === 0}
      >
        {showAddForm ? 'Cancel' : 'Add Judge'}
      </Button>
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
        variant="secondary"
        on:click={refreshJudges}
        disabled={isRefreshing}
        title="Refresh the list of available judges"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Judges'}
      </Button>
      <Button variant="secondary" on:click={() => goto('/officers/manage-competitions')}>
        Back to Competitions
      </Button>
    </div>

    <!-- Judges Section -->
    <div class="judges-section">
      <div class="section-header">
        <h3>Assigned Judges ({$judgeList.length})</h3>
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
              </div>
              <button 
                class="btn btn-secondary"
                style="padding: 0.5rem 1rem;"
                on:click={() => removeJudge(judgeAssignment.id)}
              >
                Remove
              </button>
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