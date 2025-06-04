<script>
  import { onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { userProfile } from '$lib/stores/userProfile';
  import toast from 'svelte-french-toast';

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
      // If userProfile goes back to null (e.g. on logout), show loading or “Not logged in”
      profile = null;
      editedName = '';
      editedPhone = '';
      loading = true;
    }
  });
  onDestroy(unsubscribe);

  // Computed: check if anything has changed locally vs. the base profile
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

<main>
  <h2>My Profile</h2>

  {#if loading}
    <p>Loading profile…</p>
  {:else if profile}
    <div class="profile-form">
      <label>
        Name
        <input type="text" bind:value={editedName} placeholder="Your name…" />
      </label>

      <label>
        Phone
        <input type="text" bind:value={editedPhone} placeholder="Your phone…" />
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
    <p class="not-logged-in">Not logged in.</p>
  {/if}
</main>

<style>
  /* -----------------------------------------------------------------------------------
     MAIN CONTAINER
  ----------------------------------------------------------------------------------- */
  main {
    margin: 0 auto;
    padding: 1rem;
    /* On mobile, let it be up to 90% of viewport width */
    width: 90%;
    /* Clamp at 600px on larger screens */
    max-width: 600px;
    text-align: center;
  }

  /* -----------------------------------------------------------------------------------
     PAGE HEADING (matches other pages)
  ----------------------------------------------------------------------------------- */
  h2 {
    text-transform: uppercase;
    color: #ff3e00;
    font-size: 2rem;
    font-weight: 100;
    text-align: center;
    margin: 2rem 0 1rem; /* top/bottom: 2rem and 1rem respectively */
    line-height: 1.2;
  }

  /* Shrink the heading on very narrow screens so it doesn’t overflow */
  @media (max-width: 480px) {
    h2 {
      font-size: 1.5rem;
    }
  }

  /* -----------------------------------------------------------------------------------
     “Not Logged In” MESSAGE
  ----------------------------------------------------------------------------------- */
  .not-logged-in {
    margin-top: 2rem;
    color: #c00;
    font-style: italic;
  }

  /* -----------------------------------------------------------------------------------
     PROFILE FORM CONTAINER
  ----------------------------------------------------------------------------------- */
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* On mobile, let it fill nearly 100% of <main> */
    width: 100%;
    /* On desktop, clamp to 400px so it’s not too wide */
    max-width: 400px;
    margin: 1rem auto;
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* On small phones, reduce padding slightly */
  @media (max-width: 480px) {
    .profile-form {
      margin: 1rem auto;
      padding: 1rem;
    }
  }

  /* -----------------------------------------------------------------------------------
     LABEL + INPUT STYLES
  ----------------------------------------------------------------------------------- */
  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
  }

  label > input[type='text'] {
    padding: 0.5rem;
    margin-top: 0.25rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  label > input[disabled] {
    background: #eaeaea;
    color: #555;
    cursor: not-allowed;
  }

  /* -----------------------------------------------------------------------------------
     SAVE BUTTON
  ----------------------------------------------------------------------------------- */
  button {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
  }
  button:hover {
    background: #1d4ed8;
  }

  /* -----------------------------------------------------------------------------------
     RESPONSIVE TWEAKS
  ----------------------------------------------------------------------------------- */
  @media (min-width: 640px) {
    .profile-form {
      /* On larger screens, move it down a little and keep the same width */
      margin: 2rem auto;
    }
  }
</style>
