<script>
  import { onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { userProfile } from '$lib/stores/userProfile';
  import toast from 'svelte-french-toast';
  import { get } from 'svelte/store';

  // Local copies of profile fields for editing:
  let profile = null;
  let editedName = '';
  let editedPhone = '';
  let loading = true;

  // Subscribe to userProfile store so we re-render whenever it changes:
  const unsubscribe = userProfile.subscribe((val) => {
    if (val) {
      profile = val;
      editedName = val.name ?? '';
      editedPhone = val.phone ?? '';
      loading = false;
    } else {
      // If userProfile goes back to null (e.g. on logout), show loading or redirect
      profile = null;
      editedName = '';
      editedPhone = '';
      loading = true;
    }
  });
  onDestroy(unsubscribe);

  // Computed: check if anything has changed locally versus the base profile
  $: isDirty =
    profile &&
    (editedName !== (profile.name ?? '') ||
     editedPhone !== (profile.phone ?? ''));

  async function updateProfile() {
    if (!profile) return;

    const updates = {
      name: editedName,
      phone: editedPhone
    };

    // Update the database row
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', profile.id)
      .single();

    if (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile.');
    } else {
      toast.success('✅ Profile updated.');
      // Also update the store so the rest of the UI stays in sync:
      userProfile.set(data);
      // Now isDirty will become false automatically
    }
  }
</script>

<h2>My Profile</h2>

{#if loading}
  <p>Loading profile…</p>
{:else if profile}
  <div class="profile-form">
    <label>
      Name
      <input type="text" bind:value={editedName} />
    </label>

    <label>
      Phone
      <input type="text" bind:value={editedPhone} />
    </label>

    <label>
      Email
      <input type="text" value={profile.email} disabled />
    </label>

    <label>
      Join Date
      <input
        type="text"
        value={new Date(profile.join_date).toLocaleDateString()}
        disabled
      />
    </label>

    <label>
      Officer
      <input
        type="text"
        value={profile.is_officer ? 'Yes' : 'No'}
        disabled
      />
    </label>

    <label>
      Last Login
      <input
        type="text"
        value={new Date(profile.last_login_at).toLocaleString()}
        disabled
      />
    </label>

    {#if isDirty}
      <button on:click={updateProfile}>Save Changes</button>
    {/if}
  </div>
{:else}
  <!-- If userProfile is explicitly null (e.g. logged out), you might want
       to redirect or show a “Not authorized” message. For now: -->
  <p>Not logged in.</p>
{/if}

<style>
  h2 {
    text-align: center;
    margin-top: 2rem;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 2rem auto;
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: bold;
  }

  input {
    padding: 0.5rem;
    margin-top: 0.25rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background: #1d4ed8;
  }
</style>
