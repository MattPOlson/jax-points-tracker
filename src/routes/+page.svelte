<script>
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';

  // Reactive booleans derived from our stores:
  // - isLoggedIn is true whenever $user is not null.
  // - isOfficer is true whenever $userProfile exists and its is_officer flag is truthy.
  $: isLoggedIn = $user !== null;
  $: isOfficer = $userProfile?.is_officer === true;
</script>

<main>
  <h1>🍻 JAX Points Tracker</h1>
  <p>Welcome to the homebrew points tracking app!</p>
  <nav>
    <p><a href="/submit">Submit Points</a></p>
    <p><a href="/my-submissions">My Submissions</a></p>
    <p><a href="/leaderboard">Leaderboard (coming soon)</a></p>

    {#if isLoggedIn}
      <p><a href="/profile">My Profile</a></p>
      {#if isOfficer}
        <p><a href="/officers">Officer Tools</a></p>
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
