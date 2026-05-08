<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import {
    loadEvent,
    loadEventSignups,
    loadSignupCandidates,
    addMemberSignup,
    removeSignup
  } from '$lib/stores/eventManagementStore.js';
  import {
    Hero,
    Container,
    LoadingSpinner,
    EmptyState,
    Card,
    Button,
    Badge,
    FormInput,
    FormSelect
  } from '$lib/components/ui';
  import { ArrowLeft, Printer, Pencil, UserPlus, Trash2 } from 'lucide-svelte';
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';

  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  $: eventId = $page.params.id;

  let event = null;
  let signups = [];
  let candidates = [];
  let isLoading = true;
  let loadError = null;

  let selectedMemberId = '';
  let bringing = '';
  let notes = '';
  let isAdding = false;

  $: capacityReached =
    !!event?.max_attendees && signups.length >= event.max_attendees;
  $: candidateOptions = candidates.map((m) => ({
    value: m.id,
    label: m.email ? `${m.name} (${m.email})` : m.name
  }));

  onMount(async () => {
    await refresh();
  });

  async function refresh() {
    isLoading = true;
    loadError = null;
    try {
      event = await loadEvent(eventId);
      signups = await loadEventSignups(eventId);
      candidates = await loadSignupCandidates(eventId);
    } catch (err) {
      loadError = err.message || 'Failed to load event';
    } finally {
      isLoading = false;
    }
  }

  async function handleAddMember() {
    if (!selectedMemberId) {
      toast.error('Pick a member to add.');
      return;
    }

    if (capacityReached) {
      const confirmed = await showConfirm(
        `This event is at its capacity of ${event.max_attendees}. Add this member anyway?`,
        'Over capacity'
      );
      if (!confirmed) return;
    }

    isAdding = true;
    try {
      await addMemberSignup(eventId, selectedMemberId, { bringing, notes });
      toast.success('Member added.');
      selectedMemberId = '';
      bringing = '';
      notes = '';
      await refresh();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      isAdding = false;
    }
  }

  async function handleRemove(signup) {
    const confirmed = await showConfirm(
      `Remove ${signup.member_name} from this event?`,
      'Remove signup?'
    );
    if (!confirmed) return;

    try {
      await removeSignup(signup.id);
      toast.success('Signup removed.');
      await refresh();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>{event?.name ? `${event.name} — Signups` : 'Signups'} | JAX Members Portal</title>
</svelte:head>

<div class="screen-only">
  <Hero
    title="Event Signups"
    subtitle={event?.name || ''}
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    compact={true}
  />
</div>

<Container size="lg">
  <div class="toolbar screen-only">
    <Button variant="secondary" size="sm" on:click={() => goto('/officers/manage-events')}>
      <ArrowLeft size={14} />
      Back
    </Button>
    {#if event}
      <Button variant="secondary" size="sm" on:click={() => goto(`/officers/manage-events/edit/${eventId}`)}>
        <Pencil size={14} />
        Edit event
      </Button>
      <Button variant="primary" size="sm" on:click={handlePrint}>
        <Printer size={14} />
        Print signup sheet
      </Button>
    {/if}
  </div>

  {#if isLoading}
    <LoadingSpinner message="Loading signups..." />
  {:else if loadError || !event}
    <EmptyState
      icon="⚠️"
      title="Event not found"
      description={loadError || 'This event could not be loaded.'}
    >
      <Button variant="primary" on:click={() => goto('/officers/manage-events')}>
        Back to events
      </Button>
    </EmptyState>
  {:else}
    <div class="add-member screen-only">
      <Card accent accentColor="primary">
        <h2 class="add-member-title">Add a member</h2>
        <p class="add-member-help">
          Manually sign up a member who can't (or hasn't) RSVP'd online.
        </p>

        {#if candidates.length === 0}
          <p class="muted">All current members are already signed up.</p>
        {:else}
          <div class="add-form">
            <FormSelect
              id="add-member"
              label="Member"
              placeholder="Choose a member..."
              bind:value={selectedMemberId}
              options={candidateOptions}
            />
            <FormInput
              id="add-bringing"
              label="Bringing (optional)"
              bind:value={bringing}
              placeholder="e.g. keg of IPA"
            />
            <FormInput
              id="add-notes"
              label="Notes (optional)"
              bind:value={notes}
            />
            <div class="add-actions">
              <Button
                variant="primary"
                on:click={handleAddMember}
                disabled={isAdding || !selectedMemberId}
              >
                <UserPlus size={14} />
                {isAdding ? 'Adding...' : 'Add to event'}
              </Button>
              {#if capacityReached}
                <span class="capacity-warning">At capacity ({signups.length} / {event.max_attendees})</span>
              {/if}
            </div>
          </div>
        {/if}
      </Card>
    </div>

    <div class="print-sheet">
      <header class="sheet-header">
        <div class="sheet-title-row">
          <h1 class="sheet-title">{event.name}</h1>
          <div class="sheet-badges screen-only">
            {#if event.locked}
              <Badge variant="warning">Locked</Badge>
            {/if}
            {#if capacityReached}
              <Badge variant="warning">At capacity</Badge>
            {/if}
          </div>
        </div>
        <div class="sheet-meta">
          <div><strong>When:</strong> {formatDate(event.event_date)}</div>
          {#if event.location}
            <div><strong>Where:</strong> {event.location}</div>
          {/if}
          <div><strong>Signups:</strong> {signups.length}{event.max_attendees ? ` / ${event.max_attendees}` : ''}</div>
        </div>
      </header>

      {#if signups.length === 0}
        <div class="screen-only">
          <EmptyState
            icon="📋"
            title="No signups yet"
            description="Nobody has signed up for this event."
          />
        </div>
        <p class="print-only empty-print">No signups yet.</p>
      {:else}
        <Card noPadding>
          <div class="table-wrapper">
            <table class="signup-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th>Name</th>
                  <th>Bringing</th>
                  <th class="col-contact">Contact</th>
                  <th>Notes</th>
                  <th class="col-check">Checked&nbsp;in</th>
                  <th class="col-actions screen-only-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each signups as s, i (s.id)}
                  <tr>
                    <td class="col-num">{i + 1}</td>
                    <td><strong>{s.member_name}</strong></td>
                    <td>{s.bringing || '—'}</td>
                    <td class="col-contact">
                      {#if s.member_email}<div>{s.member_email}</div>{/if}
                      {#if s.member_phone}<div>{s.member_phone}</div>{/if}
                      {#if !s.member_email && !s.member_phone}—{/if}
                    </td>
                    <td>{s.notes || ''}</td>
                    <td class="col-check"></td>
                    <td class="col-actions screen-only-cell">
                      <Button variant="danger" size="sm" on:click={() => handleRemove(s)}>
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </Card>
      {/if}

      <footer class="sheet-footer print-only">
        Printed from JAX Members Portal
      </footer>
    </div>
  {/if}
</Container>

<style>
  .toolbar {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin: var(--space-6) 0 var(--space-4);
  }

  :global(.toolbar .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .add-member {
    margin: var(--space-4) 0 var(--space-6);
  }

  .add-member-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    color: var(--color-brand-primary);
    margin: 0 0 var(--space-2);
  }

  .add-member-help {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0 0 var(--space-4);
  }

  .add-form {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--space-4);
  }

  .add-actions {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  :global(.add-actions .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .capacity-warning {
    color: var(--color-warning);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .muted {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  @media (max-width: 720px) {
    .add-form {
      grid-template-columns: 1fr;
    }
  }

  .print-sheet {
    margin: var(--space-4) 0 var(--space-16);
  }

  .sheet-header {
    margin-bottom: var(--space-5);
  }

  .sheet-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  .sheet-badges {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .sheet-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-3xl);
    color: var(--color-brand-primary);
    margin: 0;
  }

  .col-actions {
    width: 8em;
    text-align: center;
  }

  :global(.col-actions .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .sheet-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .signup-table {
    width: 100%;
    border-collapse: collapse;
  }

  .signup-table th,
  .signup-table td {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--color-border-primary);
    vertical-align: top;
    font-size: var(--font-size-sm);
  }

  .signup-table th {
    background: var(--color-bg-secondary, var(--color-bg-tertiary));
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: var(--font-size-xs);
  }

  .col-num {
    width: 3em;
    color: var(--color-text-tertiary);
  }

  .col-check {
    width: 6em;
    text-align: center;
  }

  .col-contact {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .sheet-footer {
    margin-top: var(--space-6);
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }

  .print-only {
    display: none;
  }

  .empty-print {
    padding: var(--space-6);
    text-align: center;
    color: var(--color-text-secondary);
  }

  @media print {
    .screen-only {
      display: none !important;
    }

    .screen-only-cell {
      display: none !important;
    }

    .print-only {
      display: block;
    }

    :global(body) {
      background: white !important;
    }

    .print-sheet {
      margin: 0;
    }

    .sheet-title {
      color: black;
    }

    .signup-table th {
      background: #eee !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color: black;
    }

    .signup-table th,
    .signup-table td {
      border-bottom: 1px solid #999;
    }

    .col-check {
      border-left: 1px solid #999;
    }

    @page {
      margin: 0.5in;
    }
  }
</style>
