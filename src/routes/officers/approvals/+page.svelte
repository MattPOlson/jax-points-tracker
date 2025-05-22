<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';


  let submissions = [];
  let message = '';

  let showModal = false;
  let selectedSubmission = null;

  let showRejectModal = false;
  let rejectionReason = '';


  onMount(loadSubmissions);

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from('point_submissions')
      .select(`
        id,
        category,
        description,
        points,
        event_date,
        member_id,
        members (
          name
        )
      `)
      .eq('approved', false)
      .order('event_date', { ascending: false });

    if (!error) {
      submissions = data;
    } else {
      message = 'Failed to load submissions.';
    }
  }

  function openApproval(submission) {
    selectedSubmission = submission;
    showModal = true;
  }

  async function confirmApproval() {
    const { error } = await supabase
      .from('point_submissions')
      .update({ approved: true })
      .eq('id', selectedSubmission.id);

    if (error) {
      message = 'Failed to approve submission.';
    } else {
      submissions = submissions.filter(s => s.id !== selectedSubmission.id);
    }
    toast.success(`✅ Approved submission for ${selectedSubmission.members.name}`);
    showModal = false;
    selectedSubmission = null;
    
  }

  function cancelApproval() {
    showModal = false;
    selectedSubmission = null;
  }

  function openReject(submission) {
  selectedSubmission = submission;
  rejectionReason = '';
  showRejectModal = true;
}

async function confirmReject() {
  if (!rejectionReason.trim()) {
    toast.error('Please enter a reason for rejection.');
    return;
  }

  const { error } = await supabase
    .from('point_submissions')
    .update({
      rejection_reason: rejectionReason,
      approved: false
    })
    .eq('id', selectedSubmission.id);

  if (error) {
    message = 'Failed to reject submission.';
  } else {
    toast.success(`❌ Rejected submission for ${selectedSubmission.members.name}`);
    submissions = submissions.filter(s => s.id !== selectedSubmission.id);
  }

  showRejectModal = false;
  selectedSubmission = null;
}

</script>


<h2>Brewer Points Approval</h2>

{#if submissions.length > 0}
  <table>
    <thead>
      <tr>
        <th>Member</th>
        <th>Category</th>
        <th>Description</th>
        <th>Points</th>
        <th>Event Date</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each submissions as s}
        <tr>
          <td>{s.members.name}</td>
          <td>{s.category}</td>
          <td>{s.description}</td>
          <td>{s.points}</td>
          <td>{new Date(s.event_date).toLocaleDateString()}</td>
          <button on:click={() => openApproval(s)}>Approve</button>
          <button on:click={() => openReject(s)}>Reject</button>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>No pending submissions to review.</p>
{/if}

{#if message}
  <p style="color: red;">{message}</p>
{/if}

{#if showModal}
  <div class="modal-overlay">
    <div class="modal">
      <h3>Confirm Approval</h3>
      <p>
        Approve <strong>{selectedSubmission.members.name}</strong>'s submission for 
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
        Reject <strong>{selectedSubmission.members.name}</strong>'s submission for
        <strong>{selectedSubmission.category}</strong> – 
        <em>{selectedSubmission.description}</em>?
      </p>
      <label style="margin-top: 1rem;">
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


<style>
  h2 {
    text-align: center;
    margin-top: 2rem;
  }

  table {
    margin: 2rem auto;
    border-collapse: collapse;
    width: 90%;
    max-width: 800px;
    font-size: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px #0001;
  }

  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
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
  max-width: 400px;
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
}

.modal-actions button {
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
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

</style>
