<script>
  import { supabase } from "$lib/supabaseClient";
  import { onMount, onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";

  // -------------------------------
  // 0. Component state
  // -------------------------------
  let allSubmissions = []; // always holds the full array from Supabase
  let submissions = []; // derived: either allSubmissions or only pending
  let message = "";
  let showAll = false;
  let sortColumn = "event_date";
  let sortDirection = "desc";

  let lastLoaded = 0;
  const CACHE_MS = 10000;

  // -------------------------------
  // 1. Reactive derivation of "submissions" from "allSubmissions" + "showAll"
  // -------------------------------
  // Whenever allSubmissions or showAll changes, this recalculates.
  $: {
    if (!allSubmissions) {
      submissions = [];
      message = "No submissions found.";
    } else if (showAll) {
      submissions = allSubmissions;
      message = allSubmissions.length > 0 ? "" : "No submissions found.";
    } else {
      const pending = allSubmissions.filter(
        (sub) => sub.approved === false && sub.rejection_reason === null,
      );
      submissions = pending;
      message = pending.length > 0 ? "" : "No pending submissions found.";
    }
  }

  // -------------------------------
  // 2. loadAllSubmissions(): fetches full array from Supabase
  // -------------------------------
  async function loadAllSubmissions(force = false) {
    if (!force && Date.now() - lastLoaded < CACHE_MS) {
      console.log("[submissions] loadAllSubmissions() skipped (cached)");
      return;
    }
    lastLoaded = Date.now();
    console.log("[submissions] loadAllSubmissions(): showAll =", showAll);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      message = "Please log in to view your submissions.";
      allSubmissions = [];
      return;
    }

    const { data, error } = await supabase
      .from("point_submissions")
      .select(
        `
        id,
        category,
        description,
        points,
        event_date,
        approved,
        rejection_reason
      `,
      )
      .eq("member_id", user.id)
      .order(sortColumn, { ascending: sortDirection === "asc" });

    if (error) {
      console.error("[submissions]  → Error loading submissions:", error);
      message = "Error loading your submissions.";
      allSubmissions = [];
      return;
    }

    allSubmissions = data;
    console.log("[submissions]  → fetched allSubmissions count =", data.length);
  }

  // -------------------------------
  // 3. Toggle “Show All” / “Show Pending Only”
  // -------------------------------
  function toggleView() {
    showAll = !showAll;
    console.log("[submissions] toggleView clicked → showAll =", showAll);
  
  }


  function sortTable(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }
    console.log(
      `[submissions] sortTable: sortColumn = ${sortColumn}, sortDirection = ${sortDirection}`,
    );
    loadAllSubmissions(true);
  }

  function formatStatus(sub) {
    if (sub.approved === true) return "✅ Approved";
    if (sub.rejection_reason) return "❌ Rejected";
    return "⏳ Pending";
  }


  function setupRehydration() {
    console.log("[submissions] setupRehydration() installing listeners");
    const handler = () => {
      console.log(
        "[submissions] handler: tab visible or window focused → reload",
      );
      loadAllSubmissions();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        handler();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", handler);

    return () => {
      console.log("[submissions] cleanupRehydration() removing listeners");
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", handler);
    };
  }


  const cleanupNavigation = afterNavigate(() => {
    console.log("[submissions] afterNavigate → reload allSubmissions");
    loadAllSubmissions(true);
  });


  let cleanupRehydration;
  let isMobile = false;
  onMount(() => {
    console.log(
      "[submissions] onMount → initial loadAllSubmissions + setupRehydration",
    );
    loadAllSubmissions(true);
    cleanupRehydration = setupRehydration();

    // Mobile check setup
    const checkScreenSize = () => {
      isMobile = window.innerWidth < 640;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      if (cleanupRehydration) cleanupRehydration();
      if (cleanupNavigation) cleanupNavigation();
      window.removeEventListener("resize", checkScreenSize);
    };
  });
</script>

<main>
  <h2>My Submissions</h2>

  <div style="text-align:center; margin-top: 1rem;">
    <button on:click={toggleView}>
      {showAll ? "Show Pending Only" : "Show All"}
    </button>
  </div>

  {#if submissions.length > 0}
    <div class="table-wrapper">
      {#if !isMobile}
        <table class="desktop-table">
          <thead>
            <tr>
              <th
                on:click={() => sortTable("category")}
                class:sort-asc={sortColumn === "category" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "category" &&
                  sortDirection === "desc"}>Category</th
              >
              <th
                on:click={() => sortTable("description")}
                class:sort-asc={sortColumn === "description" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "description" &&
                  sortDirection === "desc"}>Description</th
              >
              <th
                on:click={() => sortTable("points")}
                class:sort-asc={sortColumn === "points" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "points" &&
                  sortDirection === "desc"}>Points</th
              >
              <th
                on:click={() => sortTable("event_date")}
                class:sort-asc={sortColumn === "event_date" &&
                  sortDirection === "asc"}
                class:sort-desc={sortColumn === "event_date" &&
                  sortDirection === "desc"}>Event Date</th
              >
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {#each submissions as s}
              <tr>
                <td data-label="Category">{s.category}</td>
                <td data-label="Description">{s.description}</td>
                <td data-label="Points">{s.points}</td>
                <td data-label="Event Date"
                  >{new Date(s.event_date).toLocaleDateString()}</td
                >
                <td data-label="Status">{formatStatus(s)}</td>
                <td data-label="Reason">{s.rejection_reason ?? ""}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        {#each submissions as s}
          <div class="mobile-card">
            <div><strong>Category:</strong> <span>{s.category}</span></div>
            <div>
              <strong>Description:</strong> <span>{s.description}</span>
            </div>
            <div><strong>Points:</strong> <span>{s.points}</span></div>
            <div>
              <strong>Event Date:</strong>
              <span>{new Date(s.event_date).toLocaleDateString()}</span>
            </div>
            <div><strong>Status:</strong> <span>{formatStatus(s)}</span></div>
            <div>
              <strong>Reason:</strong> <span>{s.rejection_reason ?? ""}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <p class="message">{message}</p>
  {/if}
</main>

<style>
  main {
    padding: 2rem 1rem;
    max-width: 900px;
    margin: auto;
  }
  h2 {
    text-align: center;
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    color: #ff3e00;
  }

  .table-wrapper {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
    font-size: 0.95rem;
    min-width: 600px;
  }

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f9f9f9;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  th.sort-asc::after {
    content: " \25B2";
    font-size: 0.75rem;
  }

  th.sort-desc::after {
    content: " \25BC";
    font-size: 0.75rem;
  }

  button {
    padding: 0.4rem 0.75rem;
    border: 1px solid #222;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  button:hover {
    background: #f0f0f0;
  }

  .message {
    text-align: center;
    color: #555;
    margin-top: 1rem;
  }

  .mobile-card {
    display: none;
  }

  @media (max-width: 600px) {
    table {
      display: none;
    }

    .mobile-card {
      background: white;
      box-shadow: 0 0 6px #0001;
      border-radius: 8px;
      margin: 1rem auto;
      padding: 1rem;
      width: 90%;
      font-size: 0.95rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem 0.75rem;
    }

    .mobile-card div {
      display: contents;
    }

    .mobile-card strong {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
    }

    .mobile-card span {
      overflow-wrap: break-word;
      text-align: left;
    }

    h2 {
      font-size: 1.4rem;
    }
  }
</style>
