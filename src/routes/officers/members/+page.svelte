<!-- src/routes/officer-tools/manage-members/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import memberManagementStore, {
    members,
    filteredMembers,
    memberStats,
    isLoading,
    error,
    searchTerm,
    roleFilter,
    activityFilter,
    canManageOfficers
  } from '$lib/stores/memberManagementStore';

  // Removed tab switching reload - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  // Component state
  let selectedMember = null;
  let showMemberModal = false;
  let showRoleChangeModal = false;
  let showEditModal = false;
  let memberToPromote = null;
  let memberToEdit = null;
  let newRole = '';
  let editedName = '';
  let editedPhone = '';
  let editedEmail = '';
  let memberDetails = null;
  let loadingDetails = false;
  let isUpdatingMember = false;
  let unsubscribeVisibility = null;

  // Role options for promotion/demotion
  const roleOptions = [
    { value: 'member', label: 'Member', description: 'Standard member privileges' },
    { value: 'officer', label: 'Officer', description: 'Can approve submissions and access officer tools' },
    { value: 'vice_president', label: 'Vice President', description: 'Can manage officers and access all tools' },
    { value: 'president', label: 'President', description: 'Full administrative access' }
  ];

  // Reactive variables for UI state
  $: isOfficer = $userProfile?.is_officer || false;
  $: hasManagePermissions = $canManageOfficers;

  // Filter role options based on current user permissions
  $: availableRoleOptions = roleOptions.filter(option => {
    if ($userProfile?.role === 'president') {
      return true;
    } else if ($userProfile?.role === 'vice_president') {
      return option.value !== 'president';
    }
    return false;
  });

  // Format date helper
  function formatDate(dateString) {
    if (!dateString) return 'Never';
    try {
      // Handle space-separated datetime format (e.g., "2025-08-29 03:43:21.894974")
      let isoString = dateString;
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // Replace space with 'T' and add timezone if missing
        isoString = dateString.replace(' ', 'T');
        if (!isoString.includes('+') && !isoString.includes('Z')) {
          // Assume local timezone if no timezone specified
          isoString += 'Z';
        }
      }

      const date = new Date(isoString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString, '->', isoString);
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }

  // Get activity status
  function getActivityStatus(member) {
    if (!member.last_submission_date) return 'inactive';
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const lastActivity = new Date(member.last_submission_date);
    
    return lastActivity >= ninetyDaysAgo ? 'active' : 'inactive';
  }

  // Open member details modal
  async function openMemberDetails(member) {
    selectedMember = member;
    showMemberModal = true;
    loadingDetails = true;
    memberDetails = null;

    try {
      memberDetails = await memberManagementStore.getMemberDetails(member.id);
    } catch (err) {
      console.error('Failed to load member details:', err);
    } finally {
      loadingDetails = false;
    }
  }

  // Open role change modal
  function openRoleChangeModal(member) {
    if (!hasManagePermissions) return;
    
    memberToPromote = member;
    newRole = member.role;
    showRoleChangeModal = true;
  }

  // Open edit member modal
  function openEditModal(member) {
    if (!hasManagePermissions) return;
    memberToEdit = member;
    editedName = member.name || '';
    editedPhone = member.phone || '';
    editedEmail = member.email || '';
    showEditModal = true;
  }
  // Handle role change
  async function handleRoleChange() {
    if (!memberToPromote || !newRole) return;

    try {
      await memberManagementStore.updateMemberRole(memberToPromote.id, newRole);
      showRoleChangeModal = false;
      memberToPromote = null;
      newRole = '';
      
      console.log('✅ Role updated successfully');
    } catch (err) {
      console.error('❌ Failed to update role:', err);
    }
  }
  // Handle member edit
  async function handleMemberEdit() {
    if (!memberToEdit || isUpdatingMember) return;
    // Validate inputs
    if (!editedName.trim()) {
      alert('Name cannot be empty');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedEmail && !emailRegex.test(editedEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    isUpdatingMember = true;
    try {
      const updates = {
        name: editedName.trim(),
        phone: editedPhone.trim() || null,
        email: editedEmail.trim() || null
      };
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', memberToEdit.id)
        .select();
      if (error) throw error;
      console.log('✅ Member updated successfully');
      // Close modal and reset
      showEditModal = false;
      memberToEdit = null;
      editedName = '';
      editedPhone = '';
      editedEmail = '';
      // Refresh the members list
      await memberManagementStore.loadMembers(true);
    } catch (err) {
      console.error('❌ Failed to update member:', err);
      alert('Failed to update member. Please try again.');
    } finally {
      isUpdatingMember = false;
    }
  }

  // Export members data
  // Handle Competition Director toggle
  async function handleCompDirectorToggle(member) {
    if (!isOfficer) return;

    const isCurrentlyCompDirector = member.is_comp_director || false;
    const newStatus = !isCurrentlyCompDirector;

    try {
      await memberManagementStore.toggleCompDirector(member.id, newStatus);
      // Success message will be shown by the store's success handling
    } catch (err) {
      alert(`Failed to ${newStatus ? 'add' : 'remove'} Competition Director role: ${err.message}`);
    }
  }

  async function exportData() {
    try {
      const data = await memberManagementStore.exportMembersData();
      const csv = [
        ['Name', 'Email', 'Role', 'Total Points', 'Monthly Points', 'Join Date', 'Last Activity', 'Total Submissions'],
        ...data.map(member => [
          member.name,
          member.email,
          member.role,
          member.totalPoints,
          member.monthlyPoints,
          member.joinDate,
          member.lastActivity,
          member.totalSubmissions
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jax-members-roster-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  }

  // Lifecycle
  onMount(async () => {
    unsubscribeVisibility = setupEventHandlers();
    
    if (!isOfficer) {
      goto('/');
      return;
    }

    await memberManagementStore.loadMembers();
  });

  onDestroy(() => {
    if (unsubscribeVisibility) {
      unsubscribeVisibility();
    }
  });
  // Import supabase for direct database operations
  import { supabase } from '../../../lib/supabaseClient';
</script>

<main>
  {#if !isOfficer}
    <div class="empty-state">
      <div class="empty-icon">🔒</div>
      <h3>Access Denied</h3>
      <p>You need officer privileges to access this page.</p>
    </div>
  {:else}
    <div class="hero-section">
      <h1>👥 MANAGE MEMBERS</h1>
      <p class="subtitle">View and manage club members, their roles, activity, and point standings</p>
    </div>

    {#if $isLoading && $members.length === 0}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading members...</p>
      </div>
    {:else if $error}
      <div class="error-state">
        <div class="error-icon">❌</div>
        <h3>Error loading members</h3>
        <p>{$error}</p>
        <button on:click={() => memberManagementStore.refresh()} class="retry-button">
          🔄 Try Again
        </button>
      </div>
    {:else}
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card orange">
          <div class="stat-value">{$memberStats.totalMembers}</div>
          <div class="stat-label">Total Members</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-value">{$memberStats.totalOfficers}</div>
          <div class="stat-label">Officers</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{$memberStats.activeMembers}</div>
          <div class="stat-label">Active (90 days)</div>
        </div>
        <div class="stat-card red">
          <div class="stat-value">{$memberStats.avgPointsPerMember}</div>
          <div class="stat-label">Avg Points</div>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <div class="controls-container">
          <div class="filters-group">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search members..." 
              bind:value={$searchTerm}
            />
            <span class="search-icon">🔍</span>
          </div>

            <div class="filters-row">
          <select bind:value={$roleFilter} class="filter-select">
            <option value="all">All Roles</option>
            <option value="president">Presidents</option>
            <option value="vice_president">Vice Presidents</option>
            <option value="officer">Officers</option>
            <option value="member">Members</option>
          </select>

          <select bind:value={$activityFilter} class="filter-select">
            <option value="all">All Activity</option>
            <option value="active">Active (90 days)</option>
            <option value="inactive">Inactive (90+ days)</option>
          </select>
        </div>
          </div>

        <div class="action-buttons">
          <button on:click={() => memberManagementStore.resetFilters()} class="reset-button">
            🔄 Reset
          </button>
          <button on:click={exportData} class="export-button">
            📊 Export
          </button>
          </div>
        </div>
      </div>

      {#if $filteredMembers.length === 0 && $members.length > 0}
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No members found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button on:click={() => memberManagementStore.resetFilters()} class="clear-filters-button">
            Clear Filters
          </button>
        </div>
      {:else if $members.length === 0}
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No members yet</h3>
          <p>Members will appear here once they join the club</p>
        </div>
      {:else}
        <!-- Members List -->
        <div class="members-container">
          <!-- Desktop Table -->
          <div class="desktop-table">
            <table class="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Comp Director</th>
                  <th>Points</th>
                  <th>Activity</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each $filteredMembers as member}
                  <tr>
                    <td>
                      <div class="member-info">
                        <div class="member-avatar">
                          {member.name?.charAt(0) || '?'}
                        </div>
                        <div class="member-details">
                          <div class="member-name">{member.name}</div>
                          <div class="member-email">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-badge {member.role}">
                        {member.role_display}
                      </span>
                    </td>
                    <td>
                      {#if isOfficer}
                        <label class="comp-director-toggle">
                          <input
                            type="checkbox"
                            checked={member.is_comp_director || false}
                            on:change={() => handleCompDirectorToggle(member)}
                            disabled={$isLoading}
                          />
                          <span class="toggle-slider"></span>
                        </label>
                      {:else}
                        <span class="comp-director-status">
                          {member.is_comp_director ? 'Yes' : 'No'}
                        </span>
                      {/if}
                    </td>
                    <td>
                      <div class="points-info">
                        <div class="total-points">{member.total_points} total</div>
                        <div class="monthly-points">{member.monthly_points} this month</div>
                      </div>
                    </td>
                    <td>
                      <div class="activity-info">
                        <span class="activity-badge {getActivityStatus(member)}">
                          {getActivityStatus(member) === 'active' ? '✅ Active' : '💤 Inactive'}
                        </span>
                        <div class="last-activity">Last: {formatDate(member.last_submission_date)}</div>
                      </div>
                    </td>
                    <td class="join-date">
                      {formatDate(member.join_date)}
                    </td>
                    <td>
                      <div class="action-buttons-cell">
                        <button on:click={() => openMemberDetails(member)} class="view-button">
                          👁️ View
                        </button>
                        {#if hasManagePermissions && member.id !== $userProfile?.id}
                          <button on:click={() => openEditModal(member)} class="edit-button">
                            ✏️ Edit
                          </button>
                          <button on:click={() => openRoleChangeModal(member)} class="manage-button">
                            ⚡ Manage Role
                          </button>
                        {/if}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards">
            {#each $filteredMembers as member}
              <div class="member-card">
                <div class="card-header">
                  <div class="member-info">
                    <div class="member-avatar">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div class="member-details">
                      <div class="member-name">{member.name}</div>
                      <div class="member-email">{member.email}</div>
                    </div>
                  </div>
                  <span class="role-badge {member.role}">
                    {member.role_display}
                  </span>
                </div>
                
                <div class="card-stats">
                  <div class="stat-item">
                    <span class="stat-label">Total Points</span>
                    <span class="stat-value">{member.total_points}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Monthly Points</span>
                    <span class="stat-value">{member.monthly_points}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Activity</span>
                    <span class="activity-badge {getActivityStatus(member)}">
                      {getActivityStatus(member) === 'active' ? '✅ Active' : '💤 Inactive'}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Joined</span>
                    <span class="stat-value">{formatDate(member.join_date)}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button on:click={() => openMemberDetails(member)} class="view-button-mobile">
                    👁️ View Details
                  </button>
                  {#if hasManagePermissions && member.id !== $userProfile?.id}
                    <button on:click={() => openEditModal(member)} class="edit-button-mobile">
                      ✏️ Edit
                    </button>
                    <button on:click={() => openRoleChangeModal(member)} class="manage-button-mobile">
                      ⚡ Manage Role
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  {/if}
</main>

<!-- Member Details Modal -->
{#if showMemberModal && selectedMember}
  <div class="modal-backdrop" on:click={() => { showMemberModal = false; selectedMember = null; memberDetails = null; }}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Member Details</h2>
        <button class="close-button" on:click={() => { showMemberModal = false; selectedMember = null; memberDetails = null; }}>
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="member-profile">
          <div class="profile-avatar">
            {selectedMember.name?.charAt(0) || '?'}
          </div>
          <div class="profile-info">
            <h3>{selectedMember.name}</h3>
            <p>{selectedMember.email}</p>
            <span class="role-badge {selectedMember.role}">
              {selectedMember.role_display}
            </span>
          </div>
        </div>

        <div class="member-stats">
          <div class="stat-item">
            <div class="stat-value orange">{selectedMember.total_points}</div>
            <div class="stat-label">Total Points</div>
          </div>
          <div class="stat-item">
            <div class="stat-value blue">{selectedMember.monthly_points}</div>
            <div class="stat-label">Monthly Points</div>
          </div>
          <div class="stat-item">
            <div class="stat-value green">{selectedMember.total_approved_submissions}</div>
            <div class="stat-label">Submissions</div>
          </div>
          <div class="stat-item">
            <div class="stat-value red">
              {formatDate(selectedMember.last_submission_date).split(',')[0]}
            </div>
            <div class="stat-label">Last Activity</div>
          </div>
        </div>

        {#if loadingDetails}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading details...</p>
          </div>
        {:else if memberDetails?.recentSubmissions}
          <div class="submissions-section">
            <h4>Recent Submissions</h4>
            {#if memberDetails.recentSubmissions.length === 0}
              <p class="no-submissions">No submissions yet</p>
            {:else}
              <div class="submissions-list">
                {#each memberDetails.recentSubmissions as submission}
                  <div class="submission-item">
                    <div class="submission-info">
                      <div class="submission-category">{submission.category}</div>
                      <div class="submission-description">{submission.description || 'No description'}</div>
                      <div class="submission-date">{formatDate(submission.submitted_at)}</div>
                    </div>
                    <div class="submission-status">
                      <div class="submission-points">{submission.points} pts</div>
                      <span class="status-badge {submission.approved ? 'approved' : submission.approved === false ? 'rejected' : 'pending'}">
                        {submission.approved ? '✅ Approved' : submission.approved === false ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Edit Member Modal -->
{#if showEditModal && memberToEdit}
  <div class="modal-backdrop" on:click={() => { showEditModal = false; memberToEdit = null; editedName = ''; editedPhone = ''; editedEmail = ''; }}>
    <div class="modal-content small" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Edit Member Information</h2>
        <button class="close-button" on:click={() => { showEditModal = false; memberToEdit = null; editedName = ''; editedPhone = ''; editedEmail = ''; }}>
          ✕
        </button>
      </div>
      <div class="modal-body">
        <div class="edit-member-header">
          <div class="member-avatar small">
            {memberToEdit.name?.charAt(0) || '?'}
          </div>
          <div class="member-info">
            <div class="member-name">{memberToEdit.name}</div>
            <div class="current-role">Currently: {memberToEdit.role_display}</div>
          </div>
        </div>
        <div class="edit-form">
          <div class="form-group">
            <label for="editName">Full Name *</label>
            <input 
              id="editName"
              type="text" 
              bind:value={editedName} 
              placeholder="Enter full name"
              disabled={isUpdatingMember}
            />
          </div>
          <div class="form-group">
            <label for="editEmail">Email Address *</label>
            <input 
              id="editEmail"
              type="email" 
              bind:value={editedEmail} 
              placeholder="Enter email address"
              disabled={isUpdatingMember}
            />
          </div>
          <div class="form-group">
            <label for="editPhone">Phone Number</label>
            <input 
              id="editPhone"
              type="tel" 
              bind:value={editedPhone} 
              placeholder="(555) 123-4567"
              disabled={isUpdatingMember}
            />
          </div>
        </div>
        <div class="modal-actions">
          <button 
            class="cancel-button" 
            on:click={() => { showEditModal = false; memberToEdit = null; editedName = ''; editedPhone = ''; editedEmail = ''; }}
            disabled={isUpdatingMember}
          >
            Cancel
          </button>
          <button 
            class="save-button"
            on:click={handleMemberEdit}
            disabled={isUpdatingMember || !editedName.trim() || !editedEmail.trim()}
          >
            {isUpdatingMember ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
<!-- Role Change Modal -->
{#if showRoleChangeModal && memberToPromote}
  <div class="modal-backdrop" on:click={() => { showRoleChangeModal = false; memberToPromote = null; newRole = ''; }}>
    <div class="modal-content small" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Change Member Role</h2>
        <button class="close-button" on:click={() => { showRoleChangeModal = false; memberToPromote = null; newRole = ''; }}>
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="role-change-member">
          <div class="member-avatar small">
            {memberToPromote.name?.charAt(0) || '?'}
          </div>
          <div class="member-info">
            <div class="member-name">{memberToPromote.name}</div>
            <div class="current-role">Current: {memberToPromote.role_display}</div>
          </div>
        </div>

        <div class="role-selection">
          <label for="newRole">New Role</label>
          <select id="newRole" bind:value={newRole}>
            {#each availableRoleOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          
          {#if newRole}
            <p class="role-description">
              {availableRoleOptions.find(o => o.value === newRole)?.description}
            </p>
          {/if}
        </div>

        {#if newRole === memberToPromote.role}
          <div class="warning-message">
            <p>⚠️ This member already has this role</p>
          </div>
        {/if}

        {#if newRole === 'president' && $userProfile?.role !== 'president'}
          <div class="error-message">
            <p>❌ Only presidents can promote members to president</p>
          </div>
        {/if}

        <div class="modal-actions">
          <button class="cancel-button" on:click={() => { showRoleChangeModal = false; memberToPromote = null; newRole = ''; }}>
            Cancel
          </button>
          <button 
            class="save-button"
            on:click={handleRoleChange}
            disabled={newRole === memberToPromote.role || (newRole === 'president' && $userProfile?.role !== 'president') || $isLoading}
          >
            {$isLoading ? '⏳ Updating...' : '✅ Update Role'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Base styles matching the profile page */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 1200px;
    text-align: center;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3.5rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  /* Loading and Error States */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 62, 0, 0.2);
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-state {
    background: white;
    border-radius: 6px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-state h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .error-state p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .retry-button {
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background-color: #e63600;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  /* Statistics Cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .stat-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
  }

  .stat-card.orange { border-left-color: #ff3e00; }
  .stat-card.blue { border-left-color: #2563eb; }
  .stat-card.green { border-left-color: #059669; }
  .stat-card.red { border-left-color: #dc2626; }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-card.orange .stat-value { color: #ff3e00; }
  .stat-card.blue .stat-value { color: #2563eb; }
  .stat-card.green .stat-value { color: #059669; }
  .stat-card.red .stat-value { color: #dc2626; }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  /* Controls Section */
  .controls-section {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    text-align: left;
  }

  .controls-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .filters-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 300px;
  }
  .filters-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-box {
    position: relative;
    width: 100%;
    max-width: 350px;
  }

  .search-box input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .search-box input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }

  .filter-select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    min-width: 140px;
    box-sizing: border-box;
  }

  .filter-select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .reset-button, .export-button {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-button {
    background: white;
    color: #6b7280;
  }

  .reset-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .export-button {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .export-button:hover {
    background: #1d4ed8;
  }

  /* Empty State */
  .empty-state {
    background: white;
    border-radius: 6px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .clear-filters-button {
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filters-button:hover {
    background-color: #e63600;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  /* Members Container */
  .members-container {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* Desktop Table */
  .desktop-table {
    display: block;
  }

  .members-table {
    width: 100%;
    border-collapse: collapse;
  }

  .members-table th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e5e7eb;
  }

  .members-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .members-table tr:hover {
    background: #f8fafc;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .member-details {
    min-width: 0;
  }

  .member-name {
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  .member-email {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid;
  }

  .role-badge.president {
    background: #faf5ff;
    color: #7c3aed;
    border-color: #c4b5fd;
  }

  .role-badge.vice_president {
    background: #eff6ff;
    color: #2563eb;
    border-color: #93c5fd;
  }

  .role-badge.officer {
    background: #fff7ed;
    color: #ea580c;
    border-color: #fed7aa;
  }

  .role-badge.member {
    background: #f9fafb;
    color: #374151;
    border-color: #d1d5db;
  }

  .points-info {
    min-width: 0;
  }

  .total-points {
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  .monthly-points {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .activity-info {
    min-width: 0;
  }

  .activity-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid;
    margin-bottom: 0.25rem;
  }

  .activity-badge.active {
    background: #f0fdf4;
    color: #059669;
    border-color: #bbf7d0;
  }

  .activity-badge.inactive {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }

  .last-activity {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .join-date {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .action-buttons-cell {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .view-button, .manage-button, .edit-button {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .view-button {
    background: #2563eb;
    color: white;
  }

  .view-button:hover {
    background: #1d4ed8;
  }
  .edit-button {
    background: #059669;
    color: white;
  }
  .edit-button:hover {
    background: #047857;
  }

  .manage-button {
    background: #ff3e00;
    color: white;
  }

  .manage-button:hover {
    background: #e63600;
  }

  /* Mobile Cards */
  .mobile-cards {
    display: none;
    gap: 1rem;
    padding: 1rem;
  }

  .member-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-left: 4px solid #ff3e00;
    border-radius: 6px;
    padding: 1rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-item .stat-label {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .stat-item .stat-value {
    font-weight: 600;
    color: #111827;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
  }

  .view-button-mobile, .manage-button-mobile, .edit-button-mobile {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-button-mobile {
    background: #2563eb;
    color: white;
  }

  .view-button-mobile:hover {
    background: #1d4ed8;
  }
  .edit-button-mobile {
    background: #059669;
    color: white;
  }
  .edit-button-mobile:hover {
    background: #047857;
  }

  .manage-button-mobile {
    background: #ff3e00;
    color: white;
  }

  .manage-button-mobile:hover {
    background: #e63600;
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
  }

  .modal-content {
    background: white;
    border-radius: 6px;
    max-width: 42rem;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-content.small {
    max-width: 28rem;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    color: #111827;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    text-transform: none;
  }

  .close-button {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-button:hover {
    color: #6b7280;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .member-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .profile-info h3 {
    color: #111827;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    text-transform: none;
  }

  .profile-info p {
    color: #6b7280;
    margin: 0 0 0.5rem 0;
  }

  .member-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .member-stats .stat-item {
    align-items: center;
  }

  .member-stats .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .member-stats .stat-value.orange { color: #ff3e00; }
  .member-stats .stat-value.blue { color: #2563eb; }
  .member-stats .stat-value.green { color: #059669; }
  .member-stats .stat-value.red { color: #dc2626; }

  .submissions-section h4 {
    color: #111827;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    text-transform: none;
  }

  .no-submissions {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }

  .submissions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 15rem;
    overflow-y: auto;
  }

  .submission-item {
    background: #f8fafc;
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .submission-category {
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  .submission-description {
    color: #6b7280;
    font-size: 0.75rem;
    margin: 0.25rem 0;
  }

  .submission-date {
    color: #9ca3af;
    font-size: 0.75rem;
  }

  .submission-status {
    text-align: right;
    flex-shrink: 0;
  }

  .submission-points {
    font-weight: bold;
    color: #ff3e00;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid;
  }

  .status-badge.approved {
    background: #f0fdf4;
    color: #059669;
    border-color: #bbf7d0;
  }

  .status-badge.rejected {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }

  .status-badge.pending {
    background: #fffbeb;
    color: #d97706;
    border-color: #fed7aa;
  }

  /* Edit Member Modal */
  .edit-member-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
  }
  .form-group label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  .form-group input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-group input:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }
  .form-group input:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }
  /* Role Change Modal */
  .role-change-member {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .member-avatar.small {
    width: 48px;
    height: 48px;
    font-size: 1.125rem;
  }

  .current-role {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .role-selection {
    margin-bottom: 1.5rem;
  }

  .role-selection label {
    display: block;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .role-selection select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
  }

  .role-selection select:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  .role-description {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .warning-message {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .warning-message p {
    color: #92400e;
    font-size: 0.875rem;
    margin: 0;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .error-message p {
    color: #991b1b;
    font-size: 0.875rem;
    margin: 0;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .cancel-button {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .save-button {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    background: #ff3e00;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .save-button:hover:not(:disabled) {
    background: #e63600;
  }

  .save-button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    main {
      padding: 4.5rem 1rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .desktop-table {
      display: none;
    }

    .mobile-cards {
      display: flex;
      flex-direction: column;
    }

    .filters-row {
      flex-direction: column;
      align-items: stretch;
    }

    .filters-group {
      min-width: 100%;
    }
    .controls-container {
      flex-direction: column;
      gap: 1rem;
    }
    .action-buttons {
      justify-content: stretch;
      width: 100%;
    }

    .action-buttons button {
      flex: 1;
    }
    .filter-select {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .member-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .modal-content {
      margin: 1rem;
      max-height: calc(100vh - 2rem);
    }

    .modal-actions {
      flex-direction: column;
    }

    .card-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
    .card-actions button {
      width: 100%;
    }
  }

  @media (min-width: 640px) {
    .card-stats {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Competition Director Toggle Styles */
  .comp-director-toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }

  .comp-director-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 12px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }

  .comp-director-toggle input:checked + .toggle-slider {
    background-color: #ff3e00;
  }

  .comp-director-toggle input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .comp-director-toggle input:checked + .toggle-slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  .comp-director-status {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #666;
  }
</style>
