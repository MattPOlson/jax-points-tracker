<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { userProfile } from '$lib/stores/userProfile';
  import toast from 'svelte-french-toast';

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
      return new Date(dateString).toLocaleDateString('en-US', {
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
      return new Date(dateString).toLocaleString('en-US', {
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

<main>
  <div class="hero-section">
    <h1>👤 My Profile</h1>
    <p class="subtitle">Manage your account information</p>
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your profile...</p>
    </div>
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
          <div class="input-group">
            <label for="name">
              <span class="label-text">Full Name *</span>
              <input 
                id="name"
                type="text" 
                bind:value={editedName} 
                placeholder="Enter your full name"
                disabled={isUpdating}
              />
            </label>
          </div>

          <div class="input-group">
            <label for="phone">
              <span class="label-text">Phone Number</span>
              <input 
                id="phone"
                type="tel" 
                bind:value={editedPhone} 
                placeholder="(555) 123-4567"
                disabled={isUpdating}
              />
            </label>
          </div>
        </div>

        {#if isDirty}
          <div class="form-actions">
            <button 
              on:click={updateProfile} 
              class="save-button"
              disabled={isUpdating}
            >
              {#if isUpdating}
                <span class="button-spinner"></span>
                Saving...
              {:else}
                💾 Save Changes
              {/if}
            </button>
            <button 
              on:click={resetChanges} 
              class="reset-button"
              disabled={isUpdating}
            >
              ↶ Reset
            </button>
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
    <div class="empty-state">
      <div class="empty-icon">🔒</div>
      <h3>Not Logged In</h3>
      <p>Please log in to view your profile information.</p>
      <a href="/login" class="login-button">Sign In</a>
    </div>
  {/if}
</main>

<style>
  /* Base styles */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 800px;
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
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  .label-text {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
    display: block;
  }

  input[type="text"],
  input[type="tel"] {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
  }

  input[type="text"]:focus,
  input[type="tel"]:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  input:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-start;
  }

  .save-button {
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .save-button:hover:not(:disabled) {
    background-color: #e63600;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  .save-button:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }

  .reset-button {
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-button:hover:not(:disabled) {
    background-color: #4b5563;
  }

  .reset-button:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
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

  .login-button {
    background-color: #ff3e00;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    display: inline-block;
    transition: all 0.2s ease;
  }

  .login-button:hover {
    background-color: #e63600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
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

    .empty-state {
      padding: 2rem 1rem;
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