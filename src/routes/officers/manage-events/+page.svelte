<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import {
    events,
    isLoading,
    error,
    loadEvents,
    deleteEvent,
    updateEvent
  } from '$lib/stores/eventManagementStore.js';
  import {
    Hero,
    Container,
    LoadingSpinner,
    EmptyState,
    Card,
    Button,
    Badge
  } from '$lib/components/ui';
  import {
    Calendar,
    MapPin,
    Users,
    Plus,
    Pencil,
    Trash2,
    Printer,
    Play,
    Pause,
    RefreshCw
  } from 'lucide-svelte';
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';

  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  let filterStatus = 'all';
  let searchQuery = '';

  onMount(() => {
    loadEvents(true);
  });

  $: filteredEvents = (() => {
    let items = $events || [];
    const now = new Date();

    switch (filterStatus) {
      case 'upcoming':
        items = items.filter((e) => e.active && new Date(e.event_date) >= now);
        break;
      case 'past':
        items = items.filter((e) => new Date(e.event_date) < now);
        break;
      case 'inactive':
        items = items.filter((e) => !e.active);
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      );
    }

    return items;
  })();

  function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  async function toggleActive(event) {
    try {
      await updateEvent(event.id, { active: !event.active });
      toast.success(`Event ${event.active ? 'deactivated' : 'activated'}.`);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  }

  async function handleDelete(event) {
    const confirmed = await showConfirm(
      `Are you sure you want to delete "${event.name}"? All signups will also be removed. This cannot be undone.`,
      'Delete event?'
    );
    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      toast.success('Event deleted.');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  }
</script>

<svelte:head>
  <title>Manage Events | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Manage Events"
  subtitle="Create, edit, and view signups for club events"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  <div class="toolbar">
    <div class="toolbar-left">
      <Button variant="primary" on:click={() => goto('/officers/manage-events/create')}>
        <Plus size={16} />
        New Event
      </Button>
      <Button variant="secondary" size="sm" on:click={() => loadEvents(true)}>
        <RefreshCw size={14} />
        Refresh
      </Button>
    </div>

    <div class="toolbar-filters">
      <input
        type="search"
        class="search-input"
        placeholder="Search events..."
        bind:value={searchQuery}
      />
      <select bind:value={filterStatus} class="filter-select">
        <option value="all">All events</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </div>

  {#if $isLoading && (!$events || $events.length === 0)}
    <LoadingSpinner message="Loading events..." />
  {:else if $error}
    <EmptyState
      icon="⚠️"
      title="Could not load events"
      description={$error}
    >
      <Button variant="primary" on:click={() => loadEvents(true)}>Try Again</Button>
    </EmptyState>
  {:else if filteredEvents.length === 0}
    <EmptyState
      icon="📅"
      title={searchQuery || filterStatus !== 'all' ? 'No matching events' : 'No events yet'}
      description={searchQuery || filterStatus !== 'all'
        ? 'Try a different search or filter.'
        : 'Create your first event to get started.'}
    >
      {#if !searchQuery && filterStatus === 'all'}
        <Button variant="primary" on:click={() => goto('/officers/manage-events/create')}>
          <Plus size={16} />
          Create Event
        </Button>
      {/if}
    </EmptyState>
  {:else}
    <div class="events-list">
      {#each filteredEvents as event (event.id)}
        <Card accent accentColor={event.active ? 'primary' : 'warning'}>
          <div class="event-row">
            <div class="event-info">
              <div class="event-header">
                <h3 class="event-name">{event.name}</h3>
                {#if !event.active}
                  <Badge variant="warning">Inactive</Badge>
                {:else if new Date(event.event_date) < new Date()}
                  <Badge variant="secondary">Past</Badge>
                {:else}
                  <Badge variant="primary">Active</Badge>
                {/if}
              </div>

              <div class="event-meta">
                <div class="meta-row">
                  <Calendar size={14} strokeWidth={1.75} />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                {#if event.location}
                  <div class="meta-row">
                    <MapPin size={14} strokeWidth={1.75} />
                    <span>{event.location}</span>
                  </div>
                {/if}
                <div class="meta-row">
                  <Users size={14} strokeWidth={1.75} />
                  <span>
                    {event.signup_count}
                    {event.signup_count === 1 ? 'signup' : 'signups'}
                    {#if event.max_attendees}
                      &nbsp;/ {event.max_attendees}
                    {/if}
                  </span>
                </div>
              </div>
            </div>

            <div class="event-actions">
              <Button
                variant="secondary"
                size="sm"
                on:click={() => goto(`/officers/manage-events/signups/${event.id}`)}
              >
                <Printer size={14} />
                Signups
              </Button>
              <Button
                variant="secondary"
                size="sm"
                on:click={() => goto(`/officers/manage-events/edit/${event.id}`)}
              >
                <Pencil size={14} />
                Edit
              </Button>
              <Button variant="secondary" size="sm" on:click={() => toggleActive(event)}>
                {#if event.active}
                  <Pause size={14} />
                  Deactivate
                {:else}
                  <Play size={14} />
                  Activate
                {/if}
              </Button>
              <Button variant="danger" size="sm" on:click={() => handleDelete(event)}>
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</Container>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    justify-content: space-between;
    align-items: center;
    margin: var(--space-8) 0 var(--space-6);
  }

  .toolbar-left {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .toolbar-filters {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .search-input,
  .filter-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    min-width: 220px;
  }

  .filter-select {
    min-width: 140px;
  }

  :global(.toolbar-left .btn),
  :global(.event-actions .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-16);
  }

  .event-row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-6);
    flex-wrap: wrap;
  }

  .event-info {
    flex: 1;
    min-width: 240px;
  }

  .event-header {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: var(--space-3);
  }

  .event-name {
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    color: var(--color-brand-primary);
    margin: 0;
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .meta-row :global(svg) {
    color: var(--color-brand-gold);
    flex-shrink: 0;
  }

  .event-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: flex-start;
  }

  @media (max-width: 640px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input,
    .filter-select {
      min-width: 0;
      width: 100%;
    }

    .event-row {
      flex-direction: column;
    }
  }
</style>
