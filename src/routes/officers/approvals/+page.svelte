<script>
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import toast from "svelte-french-toast";

  let submissions = [];
  let message = "";
  let showModal = false;
  let selectedSubmission = null;
  let showRejectModal = false;
  let rejectionReason = "";
  let isMobile = false;
  let cleanupRehydration;
  let cleanupNavigation;

  function setupRehydration() {
    const handler = () => loadSubmissions();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') handler();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', handler);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', handler);
    };
  }

  cleanupNavigation = afterNavigate(loadSubmissions);

  onMount(() => {
    loadSubmissions();
    cleanupRehydration = setupRehydration();
    isMobile = window.innerWidth < 768;
    const resize = () => (isMobile = window.innerWidth < 768);
    window.addEventListener('resize', resize);

    return () => {
      if (cleanupRehydration) cleanupRehydration();
      if (cleanupNavigation) cleanupNavigation();
      window.removeEventListener('resize', resize);
    };
  });

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from("point_submissions")
      .select(`
        id,
        category,
        description,
        points,
        event_date,
        member_id,
        member:member_id ( name )
      `)
      .eq("approved", false)
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      message = `Failed to load submissions: ${error.message}`;
    } else {
      submissions = data;
      message = data.length === 0 ? "No pending submissions found to review." : "";
    }
  }

  function openApproval(submission) {
    selectedSubmission = submission;
    showModal = true;
  }

  async function confirmApproval() {
    const { error } = await supabase
      .from("point_submissions")
      .update({ approved: true })
      .eq("id", selectedSubmission.id);

    if (error) {
      message = "Failed to approve submission.";
    } else {
      toast.success(`✅ Approved submission for ${selectedSubmission.member.name}`);
      submissions = submissions.filter((s) => s.id !== selectedSubmission.id);
    }
    showModal = false;
    selectedSubmission = null;
  }

  function cancelApproval() {
    showModal = false;
    selectedSubmission = null;
  }

  function openReject(submission) {
    selectedSubmission = submission;
    rejectionReason = "";
    showRejectModal = true;
  }

  async function confirmReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }

    const { error } = await supabase
      .from("point_submissions")
      .update({
        rejection_reason: rejectionReason,
        approved: false,
      })
      .eq("id", selectedSubmission.id);

    if (error) {
      message = "Failed to reject submission.";
    } else {
      toast.success(`❌ Rejected submission for ${selectedSubmission.member.name}`);
      submissions = submissions.filter((s) => s.id !== selectedSubmission.id);
    }

    showRejectModal = false;
    selectedSubmission = null;
  }
</script>

<main>
  <h2>Brewer Points Approval</h2>

  {#if submissions.length > 0}
    {#if isMobile}
      <div class="mobile-list">
        {#each submissions as s (s.id)}
          <div class="mobile-card">
            <div><strong>Member:</strong> {s.member.name}</div>
            <div><strong>Category:</strong> {s.category}</div>
            <div><strong>Description:</strong> {s.description}</div>
            <div><strong>Points:</strong> {s.points}</div>
            <div><strong>Event Date:</strong> {new Date(s.event_date).toLocaleDateString()}</div>
            <div class="action-buttons">
              <button on:click={() => openApproval(s)}>Approve</button>
              <button on:click={() => openReject(s)}>Reject</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Category</th>
              <th>Description</th>
              <th>Points</th>
              <th>Event Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each submissions as s (s.id)}
              <tr>
                <td>{s.member.name}</td>
                <td>{s.category}</td>
                <td>{s.description}</td>
                <td>{s.points}</td>
                <td>{new Date(s.event_date).toLocaleDateString()}</td>
                <td class="action-buttons">
                  <button on:click={() => openApproval(s)}>Approve</button>
                  <button on:click={() => openReject(s)}>Reject</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:else}
    <p class="no-data">No pending submissions to review.</p>
  {/if}

  {#if message}
    <p class="error">{message}</p>
  {/if}

  {#if showModal}
    <div class="modal-overlay">
      <div class="modal">
        <h3>Confirm Approval</h3>
        <p>
          Approve <strong>{selectedSubmission.member.name}</strong>'s submission for
          <strong>{selectedSubmission.category}</strong> –
          <em>{selectedSubmission.description}</em> worth
          <strong>{selectedSubmission.points}</strong> points?
        </p>
        <div class="modal-actions">
          <button on:click={confirmApproval}>Yes, Approve</button>
          <button on:click={cancelApproval} class="cancel">Cancel</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showRejectModal}
    <div class="modal-overlay">
      <div class="modal">
        <h3>Reject Submission</h3>
        <p>
          Reject <strong>{selectedSubmission.member.name}</strong>'s submission for
          <strong>{selectedSubmission.category}</strong> –
          <em>{selectedSubmission.description}</em>?
        </p>
        <label>
          Reason:
          <textarea bind:value={rejectionReason} rows="4" required></textarea>
        </label>
        <div class="modal-actions">
          <button on:click={confirmReject} style="background:#d32f2f;color:white">Reject</button>
          <button on:click={() => { showRejectModal = false; selectedSubmission = null }} class="cancel">Cancel</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  h2 {
    text-align: center;
    margin-top: 2rem;
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
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  th {
    background-color: #f9f9f9;
    font-weight: 600;
  }
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    text-align: center;
  }
  .modal h3 {
    margin-bottom: 1rem;
  }
  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .modal-actions .cancel {
    background: #ccc;
    border: none;
  }
  .modal-actions .cancel:hover {
    background: #bbb;
  }
  textarea {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }
  .error {
    color: red;
    text-align: center;
    margin-top: 1rem;
  }
  .no-data {
    text-align: center;
    color: #666;
    margin-top: 1rem;
  }
  .mobile-list .mobile-card {
    background: white;
    margin-bottom: 1rem;
    padding: 1rem;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
    border-radius: 8px;
    font-size: 0.9rem;
  }
  @media (min-width: 768px) {
    .mobile-list {
      display: none;
    }
    .desktop-table {
      display: block;
    }
  }
</style>
