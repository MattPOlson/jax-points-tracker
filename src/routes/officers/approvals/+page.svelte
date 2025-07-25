<script>
  import { supabase } from "$lib/supabaseClient";
  import { onMount, onDestroy } from "svelte";
  import toast from "svelte-french-toast";
  import { user } from "$lib/stores/user";
  import { userProfile } from "$lib/stores/userProfile";
  import {
    approvals as storeApprovals,
    message as storeMessage,
    loadApprovals,
    loading,
  } from "$lib/stores/approvalsStore.js";
  import { page } from "$app/stores";
  import { formatDate, formatSubmissionTime } from "$lib/utils/dateUtils.js";

  let message = "";
  let showApprovalModal = false;
  let showRejectModal = false;
  let selectedSubmission = null;
  let rejectionReason = "";
  let isProcessing = false;
  let cleanupFunctions = [];

  $: submissions = $storeApprovals;
  $: message = $storeMessage;

  // Setup tab focus handler with F5 fix
  function setupEventHandlers() {
    let isFirstLoad = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isFirstLoad) {
        console.log("🔄 Tab became visible - doing F5 refresh");
        window.location.reload();
      }
      isFirstLoad = false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }

  // Check if user is authorized
  $: isAuthorized = $user && $userProfile?.is_officer;

  // Load data when authorized
  $: if (isAuthorized) {
    loadApprovals(true);
  }

  // Format date helper
  //function formatDate(dateString) {
  ///  try {
  //    return new Date(dateString).toLocaleDateString('en-US', {
  //      year: 'numeric',
  //      month: 'short',
  //      day: 'numeric'
  //    });
  //  } catch {
  //    return 'Invalid Date';
  //  }
  //}

  // Open approval modal
  function openApproval(submission) {
    selectedSubmission = submission;
    showApprovalModal = true;
  }

  // Confirm approval
  async function confirmApproval() {
    if (!selectedSubmission || isProcessing) return;

    isProcessing = true;
    try {
      const { error } = await supabase
        .from("point_submissions")
        .update({ approved: true, updated_at: new Date().toISOString() })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success(
        `✅ Approved ${selectedSubmission.member.name}'s submission for ${selectedSubmission.points} points!`,
      );

      // Remove from store
      storeApprovals.update((current) =>
        current.filter((s) => s.id !== selectedSubmission.id),
      );

      closeApprovalModal();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve submission. Please try again.");
    } finally {
      isProcessing = false;
    }
  }

  // Close approval modal
  function closeApprovalModal() {
    showApprovalModal = false;
    selectedSubmission = null;
  }

  // Open reject modal
  function openReject(submission) {
    selectedSubmission = submission;
    rejectionReason = "";
    showRejectModal = true;
  }

  // Confirm rejection
  async function confirmReject() {
    if (!rejectionReason.trim() || isProcessing) {
      toast.error("Please enter a reason for rejection.");
      return;
    }

    isProcessing = true;
    try {
      const { error } = await supabase
        .from("point_submissions")
        .update({
          rejection_reason: rejectionReason.trim(),
          approved: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success(
        `❌ Rejected ${selectedSubmission.member.name}'s submission`,
      );

      // Remove from store
      storeApprovals.update((current) =>
        current.filter((s) => s.id !== selectedSubmission.id),
      );

      closeRejectModal();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject submission. Please try again.");
    } finally {
      isProcessing = false;
    }
  }

  // Close reject modal
  function closeRejectModal() {
    showRejectModal = false;
    selectedSubmission = null;
    rejectionReason = "";
  }

  onMount(() => {
    // Setup tab focus handling
    const cleanup = setupEventHandlers();
    cleanupFunctions.push(cleanup);

    // Initial load if authorized
    if (isAuthorized) {
      loadApprovals(true);
    }
  });

  onDestroy(() => {
    // Cleanup all event listeners
    cleanupFunctions.forEach((cleanup) => cleanup());
  });

  // Reload when navigating to approvals page
  $: if ($page.url.pathname === "/officers/approvals" && isAuthorized) {
    loadApprovals(true);
  }
</script>

<main>
  <div class="hero-section">
    <h1>✅ Review Submissions</h1>
    <p class="subtitle">Approve or reject member point submissions</p>
  </div>

  {#if $loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading submissions...</p>
    </div>
  {:else if !$user}
    <div class="empty-state">
      <div class="empty-icon">🔒</div>
      <h3>Authentication Required</h3>
      <p>Please log in to access the approvals system.</p>
      <a href="/login" class="login-button">Sign In</a>
    </div>
  {:else if !$userProfile?.is_officer}
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Access Restricted</h3>
      <p>Officer privileges are required to review submissions.</p>
      <a href="/officers" class="back-button">Back to Officer Tools</a>
    </div>
  {:else if submissions.length > 0}
    <div class="submissions-container">
      <!-- Summary Stats -->
      <div class="summary-card">
        <div class="summary-icon">📋</div>
        <div class="summary-content">
          <div class="summary-number">{submissions.length}</div>
          <div class="summary-label">
            {submissions.length === 1 ? "Submission" : "Submissions"} Pending Review
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="table-wrapper">
        <table class="desktop-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Category</th>
              <th>Description</th>
              <th>Points</th>
              <th>Event Date</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each submissions as s (s.id)}
              <tr class="submission-row">
                <td class="member-cell">
                  <div class="member-info">
                    <div class="member-avatar">
                      {s.member.name[0].toUpperCase()}
                    </div>
                    <span class="member-name">{s.member.name}</span>
                  </div>
                </td>
                <td class="category-cell">
                  <span class="category-badge">{s.category}</span>
                </td>
                <td class="description-cell">{s.description}</td>
                <td class="points-cell">
                  <span class="points-value">{s.points}</span>
                </td>
                <td class="date-cell">{formatDate(s.event_date)}</td>
                <td class="submitted-cell">
                  {s.submitted_at
                    ? formatDate(s.submitted_at)
                    : "Not available"}
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button
                      on:click={() => openApproval(s)}
                      class="approve-btn"
                      disabled={isProcessing}
                    >
                      ✅ Approve
                    </button>
                    <button
                      on:click={() => openReject(s)}
                      class="reject-btn"
                      disabled={isProcessing}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="mobile-cards">
        {#each submissions as s (s.id)}
          <div class="mobile-card">
            <div class="card-header">
              <div class="member-info">
                <div class="member-avatar">
                  {s.member.name[0].toUpperCase()}
                </div>
                <div class="member-details">
                  <div class="member-name">{s.member.name}</div>
                  <div class="submission-date">
                    Submitted {formatDate(s.submitted_at)}
                  </div>
                </div>
              </div>
              <span class="category-badge">{s.category}</span>
            </div>

            <div class="card-body">
              <div class="card-row">
                <span class="label">Description:</span>
                <span class="value">{s.description}</span>
              </div>
              <div class="card-row">
                <span class="label">Points:</span>
                <span class="value points-value">{s.points}</span>
              </div>
              <div class="card-row">
                <span class="label">Event Date:</span>
                <span class="value">{formatDate(s.event_date)}</span>
              </div>
            </div>

            <div class="card-actions">
              <button
                on:click={() => openApproval(s)}
                class="approve-btn mobile"
                disabled={isProcessing}
              >
                ✅ Approve
              </button>
              <button
                on:click={() => openReject(s)}
                class="reject-btn mobile"
                disabled={isProcessing}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">🎉</div>
      <h3>All Caught Up!</h3>
      <p>No pending submissions to review at this time.</p>
      <button on:click={() => loadApprovals(true)} class="refresh-button">
        🔄 Refresh
      </button>
    </div>
  {/if}

  {#if message}
    <div class="message-banner error">
      {message}
    </div>
  {/if}

  <!-- Approval Modal -->
  {#if showApprovalModal && selectedSubmission}
    <div
      class="modal-overlay"
      on:click={closeApprovalModal}
      on:keydown={(e) => e.key === "Escape" && closeApprovalModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
    >
      <div class="modal approval-modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3 id="approval-modal-title">✅ Approve Submission</h3>
        </div>
        <div class="modal-body">
          <div class="submission-preview">
            <div class="preview-row">
              <span class="preview-label">Member:</span>
              <span class="preview-value">{selectedSubmission.member.name}</span
              >
            </div>
            <div class="preview-row">
              <span class="preview-label">Category:</span>
              <span class="preview-value">{selectedSubmission.category}</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">Description:</span>
              <span class="preview-value">{selectedSubmission.description}</span
              >
            </div>
            <div class="preview-row">
              <span class="preview-label">Points:</span>
              <span class="preview-value points-highlight"
                >{selectedSubmission.points}</span
              >
            </div>
            <div class="preview-row">
              <span class="preview-label">Event Date:</span>
              <span class="preview-value"
                >{formatDate(selectedSubmission.event_date)}</span
              >
            </div>
          </div>
          <p class="confirmation-text">
            Are you sure you want to approve this submission?
          </p>
        </div>
        <div class="modal-actions">
          <button
            on:click={confirmApproval}
            class="confirm-approve-btn"
            disabled={isProcessing}
            aria-describedby="approval-modal-title"
          >
            {#if isProcessing}
              <span class="button-spinner"></span>
              Approving...
            {:else}
              ✅ Yes, Approve
            {/if}
          </button>
          <button
            on:click={closeApprovalModal}
            class="cancel-btn"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Reject Modal -->
  {#if showRejectModal && selectedSubmission}
    <div
      class="modal-overlay"
      on:click={closeRejectModal}
      on:keydown={(e) => e.key === "Escape" && closeRejectModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div class="modal reject-modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3 id="reject-modal-title">❌ Reject Submission</h3>
        </div>
        <div class="modal-body">
          <div class="submission-preview">
            <div class="preview-row">
              <span class="preview-label">Member:</span>
              <span class="preview-value">{selectedSubmission.member.name}</span
              >
            </div>
            <div class="preview-row">
              <span class="preview-label">Category:</span>
              <span class="preview-value">{selectedSubmission.category}</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">Description:</span>
              <span class="preview-value">{selectedSubmission.description}</span
              >
            </div>
          </div>
          <div class="reason-section">
            <label for="rejection-reason">
              <span class="reason-label">Reason for rejection *</span>
              <textarea
                id="rejection-reason"
                bind:value={rejectionReason}
                placeholder="Please provide a clear reason for rejecting this submission..."
                rows="4"
                disabled={isProcessing}
                required
                aria-describedby="reject-modal-title"
              ></textarea>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button
            on:click={confirmReject}
            class="confirm-reject-btn"
            disabled={isProcessing || !rejectionReason.trim()}
            aria-describedby="reject-modal-title"
          >
            {#if isProcessing}
              <span class="button-spinner"></span>
              Rejecting...
            {:else}
              ❌ Reject Submission
            {/if}
          </button>
          <button
            on:click={closeRejectModal}
            class="cancel-btn"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  /* Base styles */
  main {
    margin: 0 auto;
    padding: 1rem;
    width: 90%;
    max-width: 1200px;
    text-align: center;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3.5rem;
    font-weight: 100;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 2rem;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 62, 0, 0.2);
    border-top: 4px solid #ff3e00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Summary Card */
  .summary-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2rem;
  }

  .summary-icon {
    font-size: 2.5rem;
  }

  .summary-number {
    font-size: 2rem;
    font-weight: 700;
    color: #ff3e00;
    line-height: 1;
  }

  .summary-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  /* Submissions Container */
  .submissions-container {
    text-align: left;
  }

  /* Table Styles */
  .table-wrapper {
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    overflow-x: auto;
  }

  .desktop-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }

  .desktop-table th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .desktop-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .submission-row {
    transition: background-color 0.2s;
  }

  .submission-row:hover {
    background-color: #f8fafc;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ff3e00;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .member-name {
    font-weight: 500;
    color: #333;
  }

  .category-badge {
    background: #f3f4f6;
    color: #374151;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .points-value {
    font-weight: 700;
    color: #ff3e00;
    font-size: 1.1rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .approve-btn {
    background-color: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .approve-btn:hover:not(:disabled) {
    background-color: #047857;
    transform: translateY(-1px);
  }

  .reject-btn {
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reject-btn:hover:not(:disabled) {
    background-color: #b91c1c;
    transform: translateY(-1px);
  }

  .approve-btn:disabled,
  .reject-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Mobile Cards */
  .mobile-cards {
    display: none;
  }

  .mobile-card {
    background: white;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff3e00;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .member-details {
    display: flex;
    flex-direction: column;
  }

  .submission-date {
    font-size: 0.8rem;
    color: #666;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-row .label {
    font-weight: 500;
    color: #666;
    min-width: 100px;
  }

  .card-row .value {
    font-weight: 600;
    color: #333;
    text-align: right;
  }

  .card-actions {
    display: flex;
    gap: 0.75rem;
  }

  .approve-btn.mobile,
  .reject-btn.mobile {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  /* Empty State */
  .empty-state {
    background: white;
    border-radius: 6px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-transform: none;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .login-button,
  .back-button,
  .refresh-button {
    background-color: #ff3e00;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-block;
    transition: all 0.2s ease;
  }

  .login-button:hover,
  .back-button:hover,
  .refresh-button:hover {
    background-color: #e63600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
  }

  /* Message Banner */
  .message-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
    text-align: center;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 6px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    color: #333;
    font-size: 1.25rem;
    margin: 0 0 1rem 0;
    text-transform: none;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .submission-preview {
    background: #f8fafc;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .preview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .preview-row:last-child {
    border-bottom: none;
  }

  .preview-label {
    font-weight: 500;
    color: #666;
  }

  .preview-value {
    font-weight: 600;
    color: #333;
  }

  .points-highlight {
    color: #ff3e00;
    font-size: 1.1rem;
  }

  .confirmation-text {
    color: #666;
    text-align: center;
    margin: 0;
  }

  .reason-section {
    margin-top: 1rem;
  }

  .reason-label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.5rem;
  }

  textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: #ff3e00;
    box-shadow: 0 0 0 1px #ff3e00;
  }

  textarea:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .modal-actions {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .confirm-approve-btn {
    background-color: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .confirm-approve-btn:hover:not(:disabled) {
    background-color: #047857;
  }

  .confirm-reject-btn {
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .confirm-reject-btn:hover:not(:disabled) {
    background-color: #b91c1c;
  }

  .cancel-btn {
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #4b5563;
  }

  .confirm-approve-btn:disabled,
  .confirm-reject-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    main {
      padding: 4.5rem 1rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .summary-card {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-icon {
      font-size: 2rem;
    }

    .summary-number {
      font-size: 1.5rem;
    }

    .table-wrapper {
      display: none;
    }

    .mobile-cards {
      display: block;
    }

    .card-header .member-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .card-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .card-row .value {
      text-align: left;
    }

    .card-actions {
      flex-direction: column;
    }

    .modal {
      margin: 1rem;
      max-width: none;
    }

    .modal-actions {
      flex-direction: column-reverse;
    }

    .empty-state {
      padding: 2rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .summary-card {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }

    .member-info {
      gap: 0.5rem;
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      font-size: 0.8rem;
    }

    .mobile-card {
      padding: 1rem;
    }

    .preview-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }

  @media (min-width: 769px) {
    .mobile-cards {
      display: none;
    }
  }
</style>
