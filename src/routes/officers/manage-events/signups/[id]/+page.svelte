<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import { loadEvent, loadEventSignups } from '$lib/stores/eventManagementStore.js';
  import {
    Hero,
    Container,
    LoadingSpinner,
    EmptyState,
    Card,
    Button,
    Badge
  } from '$lib/components/ui';
  import { ArrowLeft, Printer, Pencil } from 'lucide-svelte';

  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  $: eventId = $page.params.id;

  let event = null;
  let signups = [];
  let isLoading = true;
  let loadError = null;

  onMount(async () => {
    await refresh();
  });

  async function refresh() {
    isLoading = true;
    loadError = null;
    try {
      event = await loadEvent(eventId);
      signups = await loadEventSignups(eventId);
    } catch (err) {
      loadError = err.message || 'Failed to load event';
    } finally {
      isLoading = false;
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
    <div class="print-sheet">
      <header class="sheet-header">
        <h1 class="sheet-title">{event.name}</h1>
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

  .print-sheet {
    margin: var(--space-4) 0 var(--space-16);
  }

  .sheet-header {
    margin-bottom: var(--space-5);
  }

  .sheet-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-3xl);
    color: var(--color-brand-primary);
    margin: 0 0 var(--space-3);
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
