<script>
  import { onMount } from 'svelte';
  import { events, eventsByMonth, isLoading, error, loadCalendar } from '$lib/stores/calendarStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Card, Badge, Button } from '$lib/components/ui';
  import { CalendarDays, Clock, MapPin, ExternalLink } from 'lucide-svelte';

  // Public view of the club Google Calendar (source of truth).
  const GOOGLE_CALENDAR_URL =
    'https://calendar.google.com/calendar/u/0?cid=amF4YWxlZXhjaGFuZ2VAZ21haWwuY29t';

  onMount(() => {
    loadCalendar(true);
  });

  function formatDayLabel(dateString) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { weekday: '', day: '' };
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.toLocaleDateString('en-US', { day: 'numeric' })
    };
  }

  function formatTimeRange(event) {
    if (event.allDay) return 'All day';
    const start = new Date(event.start);
    if (isNaN(start.getTime())) return '';
    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (!event.end) return startStr;
    const end = new Date(event.end);
    if (isNaN(end.getTime())) return startStr;
    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${startStr} – ${endStr}`;
  }
</script>

<svelte:head>
  <title>Calendar | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Club Calendar"
  subtitle="Upcoming club events, meetings & festivals"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="lg">
  {#if $isLoading && (!$events || $events.length === 0)}
    <LoadingSpinner message="Loading calendar..." />
  {:else if $error}
    <EmptyState icon="⚠️" title="Could not load calendar" description={$error}>
      <Button variant="primary" on:click={() => loadCalendar(true)}>Try Again</Button>
    </EmptyState>
  {:else if !$events || $events.length === 0}
    <EmptyState
      icon="📅"
      title="No upcoming events"
      description="There’s nothing on the club calendar right now. Check back soon."
    >
      <Button variant="secondary" on:click={() => window.open(GOOGLE_CALENDAR_URL, '_blank')}>
        View full Google Calendar
      </Button>
    </EmptyState>
  {:else}
    <div class="calendar-toolbar">
      <p class="calendar-note">Synced from the club Google Calendar — read only.</p>
      <a class="google-link" href={GOOGLE_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
        <span>Open in Google Calendar</span>
        <ExternalLink size={16} strokeWidth={1.75} />
      </a>
    </div>

    {#each $eventsByMonth as month (month.key)}
      <section class="month-section">
        <h2 class="month-title">{month.label}</h2>
        <div class="agenda-list">
          {#each month.events as event (event.id)}
            <a
              class="event-link"
              href={event.htmlLink || GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card hover>
                <div class="event-row">
                  <div class="date-chip" aria-hidden="true">
                    <span class="date-weekday">{formatDayLabel(event.start).weekday}</span>
                    <span class="date-day">{formatDayLabel(event.start).day}</span>
                  </div>

                  <div class="event-body">
                    <h3 class="event-title">{event.title}</h3>
                    <div class="event-meta">
                      <span class="meta-row">
                        <Clock size={15} strokeWidth={1.75} />
                        {formatTimeRange(event)}
                      </span>
                      {#if event.location}
                        <span class="meta-row">
                          <MapPin size={15} strokeWidth={1.75} />
                          {event.location}
                        </span>
                      {/if}
                    </div>
                    {#if event.description}
                      <p class="event-description">{event.description}</p>
                    {/if}
                  </div>

                  {#if event.allDay}
                    <Badge variant="secondary">All day</Badge>
                  {/if}
                </div>
              </Card>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</Container>

<style>
  .calendar-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin: var(--space-8) 0 var(--space-6);
  }

  .calendar-note {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .google-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-brand-primary);
    text-decoration: none;
  }

  .google-link:hover {
    color: var(--color-brand-primary-hover);
    text-decoration: underline;
  }

  .month-section {
    margin-bottom: var(--space-12);
  }

  .month-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    color: var(--color-brand-primary);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 2px solid var(--color-brand-gold-light);
  }

  .agenda-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .event-link {
    text-decoration: none;
    color: inherit;
    display: block;
    border-radius: var(--radius-card);
  }

  .event-link:focus-visible {
    outline: 2px solid var(--color-brand-gold);
    outline-offset: 2px;
  }

  .event-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .date-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 3.25rem;
    padding: var(--space-2) 0;
    border-radius: var(--radius-md);
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
    line-height: 1;
  }

  .date-weekday {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.85;
  }

  .date-day {
    font-family: var(--font-family-display);
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    margin-top: var(--space-1);
  }

  .event-body {
    flex: 1;
    min-width: 0;
  }

  .event-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-lg);
    color: var(--color-brand-primary);
    margin: 0 0 var(--space-2);
    line-height: var(--line-height-tight);
  }

  .event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin-bottom: var(--space-2);
  }

  .meta-row {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .meta-row :global(svg) {
    color: var(--color-brand-gold);
    flex-shrink: 0;
  }

  .event-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .calendar-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
