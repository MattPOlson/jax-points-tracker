<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import toast from 'svelte-french-toast';

  let profile = {};
  let editedName = '';
  let editedPhone = '';
  let loading = true;

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Failed to load profile');
    } else {
      profile = data;
      editedName = data.name ?? '';
      editedPhone = data.phone ?? '';
    }

    loading = false;
  });

  async function updateProfile() {
    const updates = {
      name: editedName,
      phone: editedPhone
    };

    const { error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile.');
    } else {
      toast.success('✅ Profile updated.');
    }
  }

  $: isDirty = editedName !== profile.name || editedPhone !== profile.phone;
</script>

<h2>My Profile</h2>

{#if loading}
  <p>Loading profile...</p>
{:else}
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
      <input type="text" value={new Date(profile.join_date).toLocaleDateString()} disabled />
    </label>

    <label>
      Officer
      <input type="text" value={profile.is_officer ? 'Yes' : 'No'} disabled />
    </label>

    <label>
      Last Login
      <input type="text" value={new Date(profile.last_login_at).toLocaleString()} disabled />
    </label>

    {#if isDirty}
      <button on:click={updateProfile}>Save Changes</button>
    {/if}
  </div>
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
