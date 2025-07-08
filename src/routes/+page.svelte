<script>
  import { user as authUser } from '$lib/stores/user'; // Supabase auth user
  import { userProfile, loadUserProfile } from '$lib/stores/userProfile'; // `members` table row

  import { onTabFocus } from '$lib/utils/focusRefresher.js';
  import { loadApprovals } from '$lib/stores/approvalsStore';
  import { loadCategoryData } from '$lib/stores/categoryStore';
  import { loadLeaderboard } from '$lib/stores/leaderboardStore';
  import { loadMySubmissions } from '$lib/stores/mySubmissionsStore';
  import { page } from '$app/stores';

  $: isLoggedIn = $authUser !== null;
  $: isOfficer = $userProfile?.is_officer === true;

  // Initial load on login to homepage
  $: if ($page.url.pathname === '/' && $authUser?.id) {
    loadApprovals(true);
    loadCategoryData(true);
    loadLeaderboard(true);
    //loadMySubmissions(true);
    loadUserProfile(true);
  }

  // Auto-refresh on tab focus
  $: if ($authUser?.id) {
    onTabFocus(() => {
      loadApprovals(true);
      loadCategoryData(true);
      loadLeaderboard(true);
      loadMySubmissions(true);
      loadUserProfile(true);
    });
  }
</script>

<main>
  <h1>🍻 JAX Members Portal</h1>
  <p class="subtitle">Have Fun Brew Better Beer!</p>

  <div class="nav-links">
    <a href="/submit" class="nav-button">Submit Points</a>
    <a href="/my-submissions" class="nav-button">My Submissions</a>
    <a href="/leaderboard" class="nav-button">Leaderboard</a>

    {#if isLoggedIn}
      <a href="/profile" class="nav-button">My Profile</a>
      {#if isOfficer}
        <a href="/officers" class="nav-button">Officer Tools</a>
      {/if}
    {/if}
  </div>
</main>

<style>
  /* -----------------------------------------------------------------------------------
     BASE STYLES
  ----------------------------------------------------------------------------------- */
  main {
    margin: 0 auto;
    padding: 1rem;
    /* Allow the container to be up to 90% of the viewport width by default. */
    width: 90%;
    /* But never exceed 600px on small screens, and even larger on desktop (see below). */
    max-width: 600px;
    text-align: center; /* Center all text content by default */
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    margin: 0 0 0.25em; /* zero top/side margins, small bottom margin */
    line-height: 1.1;
    text-align: center; /* Ensure the heading is horizontally centered */
    word-wrap: keep-all;
    overflow-wrap: normal;
  }

  /* Reduce size if the screen is very narrow so the H1 never overflows */
  @media (max-width: 480px) {
    h1 {
      font-size: 2.5rem;
    }
  }

  .subtitle {
    margin-bottom: 2rem;
    font-size: 1rem;
    color: #333;
  }

  /* Each link becomes a “button” with padding, background, etc. */
  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .nav-button {
    display: block;
    text-decoration: none;
    background-color: #2563eb;
    color: white;
    font-weight: 500;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    transition: background-color 0.2s;
  }
  .nav-button:hover {
    background-color: #1d4ed8;
  }

  /* -----------------------------------------------------------------------------------
     SMALL‑SCREEN ADJUSTMENTS
  ----------------------------------------------------------------------------------- */
  @media (max-width: 480px) {
    main{
      padding-top: 4.5rem; /* Add more padding for better touch targets */
    }
    h1 {
      font-size: 1.5rem; /* scale down the headline on very narrow phones */
    }

    .subtitle {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .nav-links {
      gap: 0.75rem;
    }

    .nav-button {
      font-size: 0.95rem;
      padding: 0.65rem 1rem;
    }
  }

  /* -----------------------------------------------------------------------------------
     MEDIUM / DESKTOP‑SCREEN UPGRADES
  ----------------------------------------------------------------------------------- */
  @media (min-width: 640px) {
    main {
      /* On larger screens, allow “main” to expand further */
      width: 75%;
      max-width: 800px;
    }

    h1 {
      font-size: 4rem; /* restore original large size on desktop */
    }

    .subtitle {
      font-size: 1.125rem;
    }

    /* Lay out links horizontally on desktop */
    .nav-links {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .nav-button {
      /* Adjust padding/size so they look uniform side‑by‑side */
      padding: 0.6rem 1rem;
      font-size: 1rem;
      min-width: 160px;
      text-align: center;
    }
  }
</style>
