<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { userProfile } from '$lib/stores/userProfile';
  import toast from 'svelte-french-toast';
  import { Hero, Container, LoadingSpinner, EmptyState, Button, FormInput } from '$lib/components/ui';

  // Local copies of profile fields for editing
  let profile = null;
  let editedName = '';
  let editedPhone = '';
  let loading = true;
  let isUpdating = false;
  let cleanupFunctions = [];

  // Removed tab focus handler - causes issues with Supabase tab switching
  function setupEventHandlers() {
    // Tab visibility handling removed for better Supabase compatibility
    return () => {
      // No cleanup needed now
    };
  }

  // Subscribe to userProfile store
  const unsubscribe = userProfile.subscribe((val) => {
    if (val) {
      profile = val;
      editedName = val.name ?? '';
      editedPhone = val.phone ?? '';
      loading = false;
    } else {
      profile = null;
      editedName = '';
      editedPhone = '';
      loading = false;
    }
  });

  // Check if anything has changed
  $: isDirty = profile && 
    (editedName !== (profile.name ?? '') || 
     editedPhone !== (profile.phone ?? ''));

  // Format date helper
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
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
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  // Format datetime helper
  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
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
        console.warn('Invalid datetime after parsing:', dateString, '->', isoString);
        return 'Invalid Date';
      }

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  // Update profile function
  async function updateProfile() {
    if (!profile || isUpdating) return;

    // Validate inputs
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    isUpdating = true;

    try {
      const updates = {
        name: editedName.trim(),
        phone: editedPhone.trim() || null
      };

      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('✅ Profile updated successfully!');
      userProfile.set(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      isUpdating = false;
    }
  }

  // Reset changes
  function resetChanges() {
    if (profile) {
      editedName = profile.name ?? '';
      editedPhone = profile.phone ?? '';
      toast.success('Changes reset');
    }
  }

  onMount(() => {
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);
  });

  onDestroy(() => {
    // Cleanup subscriptions and event listeners
    unsubscribe();
    cleanupFunctions.forEach(cleanup => cleanup());
  });
</script>

<Container size="md">
  <Hero title="My Profile" subtitle="Manage your account information" icon="👤" center={true} />

  {#if loading}
    <LoadingSpinner message="Loading your profile..." />
  {:else if profile}
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar">
          <span class="avatar-text">{(profile.name || 'U')[0].toUpperCase()}</span>
        </div>
        <div class="header-info">
          <h2>{profile.name || 'Member'}</h2>
          <p class="member-since">Member since {formatDate(profile.join_date)}</p>
          {#if profile.is_officer}
            <span class="officer-badge">🏅 Officer</span>
          {/if}
        </div>
      </div>

      <!-- Editable Fields -->
      <div class="form-section">
        <h3>✏️ Edit Information</h3>
        <div class="form-grid">
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            bind:value={editedName}
            placeholder="Enter your full name"
            disabled={isUpdating}
            required
          />

          <FormInput
            id="phone"
            label="Phone Number"
            type="tel"
            bind:value={editedPhone}
            placeholder="(555) 123-4567"
            disabled={isUpdating}
          />
        </div>

        {#if isDirty}
          <div class="form-actions">
            <Button
              on:click={updateProfile}
              variant="primary"
              disabled={isUpdating}
            >
              {#if isUpdating}
                <span class="button-spinner"></span>
                Saving...
              {:else}
                💾 Save Changes
              {/if}
            </Button>
            <Button
              on:click={resetChanges}
              variant="secondary"
              disabled={isUpdating}
            >
              ↶ Reset
            </Button>
          </div>
        {/if}
      </div>

      <!-- Read-Only Information -->
      <div class="info-section">
        <h3>📋 Account Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Email Address</span>
            <span class="info-value">{profile.email}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Member ID</span>
            <span class="info-value">{profile.id.slice(0, 8)}...</span>
          </div>

          <div class="info-item">
            <span class="info-label">Join Date</span>
            <span class="info-value">{formatDate(profile.join_date)}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Last Login</span>
            <span class="info-value">{formatDateTime(profile.last_login_at)}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Account Status</span>
            <span class="info-value status-active">
              {profile.active ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>

          {#if profile.points !== undefined}
            <div class="info-item points-item">
              <span class="info-label">Total Points</span>
              <span class="info-value points-value">{profile.points?.toLocaleString() || 0}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <EmptyState
      icon="🔒"
      title="Not Logged In"
      message="Please log in to view your profile information."
      actionLabel="Sign In"
      actionHref="/login"
    />
  {/if}
</Container>

<style>

  .profile-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: left;
  }

  /* Profile Header */
  .profile-header {
    background: white;
    border-radius: 6px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff3e00 0%, #e63600 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .header-info h2 {
    color: #333;
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    text-transform: none;
  }

  .member-since {
    color: #666;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .officer-badge {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #d97706;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
  }

  /* Form Section */
  .form-section {
    background: white;
    border-radius: 6px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-section h3 {
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    text-transform: none;
  }

  .form-grid {
    display: grid;
    gap: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .form-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-start;
  }

  .button-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Info Section */
  .info-section {
    background: white;
    border-radius: 6px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .info-section h3 {
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    text-transform: none;
  }

  .info-grid {
    display: grid;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .info-label {
    font-weight: 500;
    color: #666;
  }

  .info-value {
    font-weight: 600;
    color: #333;
  }

  .points-item {
    background: linear-gradient(135deg, #fff 0%, #fef7f0 100%);
    border: 1px solid #ff3e00;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 0.5rem;
  }

  .points-value {
    color: #ff3e00;
    font-size: 1.2rem;
  }

  .status-active {
    color: #059669;
  }


  /* Mobile Responsive */
  @media (max-width: 768px) {

    .profile-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .avatar {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }

    .header-info h2 {
      font-size: 1.5rem;
    }

    .form-section,
    .info-section {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }

  @media (min-width: 640px) {
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>