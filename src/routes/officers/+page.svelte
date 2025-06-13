<script>
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import { goto } from '$app/navigation';

  // Redirect non‐officers away (optional)
  $: if ($user && $userProfile && $userProfile.is_officer === false) {
    // If you prefer to silently redirect:
    // goto('/');
    // Or show a “Not authorized” message:
    // no redirect code here, and display an error in the markup below
  }
</script>

<main>
  <h2>🍺 Officer Tools 🍺</h2>

  {#if !$user}
    <p class="error">Please log in to access officer tools.</p>
  {:else if $userProfile && !$userProfile.is_officer}
    <p class="error">You are not authorized to view this page.</p>
  {:else}
    <nav class="nav-links">
      <a href="/officers/approvals" class="nav-button">
        Review Point Submissions
      </a>
      <a href="/officers/view-all" class="nav-button">
        View All Points
      </a>
      <!-- Add more “Officer Tools” links here as needed: -->
      <!-- <a href="/officers/another-tool" class="nav-button">Another Tool</a> -->
    </nav>
  {/if}
</main>

<style>
  /* -----------------------------------------------------------------------------------
     BASE STYLES 
  ----------------------------------------------------------------------------------- */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 600px;
    text-align: center;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .error {
    color: #c62828;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .nav-button {
    display: block;
    background-color: #2563eb;
    color: white;
    font-weight: 500;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  .nav-button:hover {
    background-color: #1d4ed8;
  }

  /* -----------------------------------------------------------------------------------
     SMALL‐SCREEN ADJUSTMENTS 
  ----------------------------------------------------------------------------------- */
  @media (max-width: 480px) {
    h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .nav-button {
      font-size: 0.95rem;
      padding: 0.65rem 1rem;
    }
  }

  /* -----------------------------------------------------------------------------------
     MEDIUM / DESKTOP‐SCREEN UPGRADES 
  ----------------------------------------------------------------------------------- */
  @media (min-width: 640px) {
    main {
      width: 75%;
      max-width: 800px;
    }

    h2 {
      font-size: 2.5rem;
    }

    .nav-links {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .nav-button {
      padding: 0.6rem 1rem;
      font-size: 1rem;
      min-width: 200px;
      text-align: center;
    }
  }
</style>
