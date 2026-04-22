<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { events, isLoading, error, loadEvents } from '$lib/stores/eventManagementStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Card, Badge, Button } from '$lib/components/ui';
  import { Calendar, MapPin, Users, Clock } from 'lucide-svelte';

  onMount(() => {
    loadEvents(true);
  });

  $: upcomingEvents = ($events || []).filter((e) => e.active && e.status !== 'past');
  $: pastEvents = ($events || []).filter((e) => e.status === 'past');

  function formatEventDate(dateString) {
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

  function goToEvent(id) {
    goto(`/events/${id}`);
  }
</script>

<svelte:head>
  <title>Events | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Club Events"
  subtitle="Sign up for beer festivals, pours, and club gatherings"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
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
  {:else if upcomingEvents.length === 0 && pastEvents.length === 0}
    <EmptyState
      icon="📅"
      title="No events yet"
      description="Check back soon — club events will appear here."
    />
  {:else}
    {#if upcomingEvents.length > 0}
      <section class="events-section">
        <h2 class="section-title">Upcoming Events</h2>
        <div class="events-grid">
          {#each upcomingEvents as event (event.id)}
            <button
              type="button"
              class="event-card-button"
              on:click={() => goToEvent(event.id)}
            >
              <Card>
                <div class="event-header">
                  <h3 class="event-name">{event.name}</h3>
                  <Badge variant="primary">Upcoming</Badge>
                </div>

                <div class="event-meta">
                  <div class="meta-row">
                    <Calendar size={16} strokeWidth={1.75} />
                    <span>{formatEventDate(event.event_date)}</span>
                  </div>
                  {#if event.location}
                    <div class="meta-row">
                      <MapPin size={16} strokeWidth={1.75} />
                      <span>{event.location}</span>
                    </div>
                  {/if}
                  <div class="meta-row">
                    <Users size={16} strokeWidth={1.75} />
                    <span>
                      {event.signup_count}
                      {event.signup_count === 1 ? 'person signed up' : 'people signed up'}
                      {#if event.max_attendees}
                        &nbsp;/ {event.max_attendees} spots
                      {/if}
                    </span>
                  </div>
                  {#if event.signup_deadline}
                    <div class="meta-row meta-deadline">
                      <Clock size={16} strokeWidth={1.75} />
                      <span>Signups close {formatEventDate(event.signup_deadline)}</span>
                    </div>
                  {/if}
                </div>

                {#if event.description}
                  <p class="event-description">{event.description}</p>
                {/if}

                <div class="event-cta">
                  <span class="cta-text">View details & sign up →</span>
                </div>
              </Card>
            </button>
          {/each}
        </div>
      </section>
    {/if}

    {#if pastEvents.length > 0}
      <section class="events-section">
        <h2 class="section-title muted">Past Events</h2>
        <div class="events-grid">
          {#each pastEvents as event (event.id)}
            <button
              type="button"
              class="event-card-button"
              on:click={() => goToEvent(event.id)}
            >
              <Card>
                <div class="event-header">
                  <h3 class="event-name">{event.name}</h3>
                  <Badge variant="secondary">Past</Badge>
                </div>
                <div class="event-meta">
                  <div class="meta-row">
                    <Calendar size={16} strokeWidth={1.75} />
                    <span>{formatEventDate(event.event_date)}</span>
                  </div>
                  {#if event.location}
                    <div class="meta-row">
                      <MapPin size={16} strokeWidth={1.75} />
                      <span>{event.location}</span>
                    </div>
                  {/if}
                </div>
              </Card>
            </button>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</Container>

<style>
  .events-section {
    margin: var(--space-8) 0 var(--space-16);
  }

  .section-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    margin-bottom: var(--space-6);
    font-weight: var(--font-weight-bold);
    text-align: center;
  }

  .section-title.muted {
    color: var(--color-text-secondary);
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-6);
  }

  .event-card-button {
    all: unset;
    cursor: pointer;
    display: block;
    width: 100%;
    border-radius: var(--radius-lg);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .event-card-button:hover {
    transform: translateY(-2px);
  }

  .event-card-button:focus-visible {
    outline: 2px solid var(--color-brand-gold);
    outline-offset: 2px;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .event-name {
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    color: var(--color-brand-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
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

  .meta-deadline {
    color: var(--color-warning);
  }

  .event-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    margin: 0 0 var(--space-4);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .event-cta {
    border-top: 1px solid var(--color-border-primary);
    padding-top: var(--space-3);
    text-align: right;
  }

  .cta-text {
    font-size: var(--font-size-sm);
    color: var(--color-brand-gold);
    font-weight: var(--font-weight-semibold);
  }

  @media (max-width: 640px) {
    .events-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
