<script>
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

  let isOfficer = false;
  let isLoggedIn = false;

  onMount(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isLoggedIn = true;

      const { data } = await supabase
        .from("members")
        .select("is_officer")
        .eq("id", user.id)
        .single();

      if (data?.is_officer) {
        isOfficer = true;
      }
    }
  });
</script>

<main>
  <h1>🍻 JAX Points Tracker</h1>
  <p>Welcome to the homebrew points tracking app!</p>
  <nav>
    <p><a href="/submit">Submit Points</a></p>
    <a href="/my-submissions">My Submissions</a>
    <p><a href="/leaderboard">Leaderboard (coming soon)</a></p>

    {#if isLoggedIn}
      <p><a href="/profile">My Profile</a></p>
      {#if isOfficer}
        <p><a href="/officers">Officer Tools</a></p>
      {/if}
    {/if}
  </nav>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>