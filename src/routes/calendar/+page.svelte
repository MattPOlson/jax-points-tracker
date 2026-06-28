<script>
  import { onMount } from 'svelte';
  import { events, eventsByMonth, isLoading, error, loadCalendar } from '$lib/stores/calendarStore.js';
  import { Hero, Container, LoadingSpinner, EmptyState, Card, Badge, Button } from '$lib/components/ui';
  import {
    Clock,
    MapPin,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    List,
    LayoutGrid
  } from 'lucide-svelte';

  // Public view of the club Google Calendar (source of truth).
  const GOOGLE_CALENDAR_URL =
    'https://calendar.google.com/calendar/u/0?cid=amF4YWxlZXhjaGFuZ2VAZ21haWwuY29t';

  onMount(() => {
    loadCalendar(true);
  });

  // View mode: agenda (default, list by month) or calendar (month grid).
  let viewMode = 'agenda';

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // The month currently shown in the grid (first of the month). Initialized
  // to the month of the earliest event once events load.
  let cursor = null;
  $: if (!cursor && $events && $events.length > 0) {
    const first = $events.find((e) => e.start);
    const base = first ? new Date(first.start) : new Date();
    cursor = new Date(base.getFullYear(), base.getMonth(), 1);
  }

  function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function isSameDay(a, b) {
    return dayKey(a) === dayKey(b);
  }

  // Map each day to its events for quick grid lookup.
  $: eventsByDay = (() => {
    const map = new Map();
    for (const ev of $events || []) {
      if (!ev.start) continue;
      const d = new Date(ev.start);
      if (isNaN(d.getTime())) continue;
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  })();

  // Build the calendar grid cells (with leading/trailing blanks) for `cursor`.
  $: grid = (() => {
    if (!cursor) return [];
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({
        day,
        events: eventsByDay.get(dayKey(d)) || [],
        isToday: isSameDay(d, today)
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  $: monthLabel = cursor
    ? cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  function prevMonth() {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
  }

  function nextMonth() {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  function formatChipTime(event) {
    if (event.allDay) return '';
    const d = new Date(event.start);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

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
      <div class="toolbar-actions">
        <a class="google-link" href={GOOGLE_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
          <span>Open in Google Calendar</span>
          <ExternalLink size={16} strokeWidth={1.75} />
        </a>
        <button
          type="button"
          class="view-toggle"
          on:click={() => (viewMode = viewMode === 'agenda' ? 'calendar' : 'agenda')}
        >
          {#if viewMode === 'agenda'}
            <LayoutGrid size={16} strokeWidth={1.75} />
            <span>Calendar view</span>
          {:else}
            <List size={16} strokeWidth={1.75} />
            <span>List view</span>
          {/if}
        </button>
      </div>
    </div>

    {#if viewMode === 'calendar'}
      <section class="calendar-grid-section">
        <div class="grid-header">
          <button type="button" class="nav-btn" on:click={prevMonth} aria-label="Previous month">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h2 class="grid-month-title">{monthLabel}</h2>
          <button type="button" class="nav-btn" on:click={nextMonth} aria-label="Next month">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        <div class="grid-scroll">
          <div class="grid-inner">
            <div class="weekday-row">
              {#each WEEKDAYS as wd}
                <div class="weekday-cell">{wd}</div>
              {/each}
            </div>
            <div class="days-grid">
              {#each grid as cell}
                {#if cell === null}
                  <div class="day-cell day-cell-empty"></div>
                {:else}
                  <div class="day-cell" class:day-cell-today={cell.isToday}>
                    <span class="day-number">{cell.day}</span>
                    <div class="day-events">
                      {#each cell.events as event (event.id)}
                        <a
                          class="day-event-chip"
                          class:chip-all-day={event.allDay}
                          href={event.htmlLink || GOOGLE_CALENDAR_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={event.title}
                        >
                          {#if !event.allDay}
                            <span class="chip-time">{formatChipTime(event)}</span>
                          {/if}
                          <span class="chip-title">{event.title}</span>
                        </a>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </section>
    {:else}
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

  .toolbar-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .view-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-family-base);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-brand-primary);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color var(--transition-fast), border-color var(--transition-fast);
  }

  .view-toggle:hover {
    background-color: var(--color-brand-gold-light);
    border-color: var(--color-brand-gold);
  }

  .view-toggle:focus-visible {
    outline: 2px solid var(--color-brand-gold);
    outline-offset: 2px;
  }

  /* ===== Month grid (calendar view) ===== */
  .calendar-grid-section {
    margin-bottom: var(--space-12);
  }

  .grid-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }

  .grid-month-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-2xl);
    color: var(--color-brand-primary);
    font-weight: var(--font-weight-bold);
    margin: 0;
    min-width: 12rem;
    text-align: center;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    color: var(--color-brand-primary);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background-color var(--transition-fast), border-color var(--transition-fast);
  }

  .nav-btn:hover {
    background-color: var(--color-brand-gold-light);
    border-color: var(--color-brand-gold);
  }

  .nav-btn:focus-visible {
    outline: 2px solid var(--color-brand-gold);
    outline-offset: 2px;
  }

  .grid-scroll {
    overflow-x: auto;
  }

  .grid-inner {
    min-width: 640px;
  }

  .weekday-row,
  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-1);
  }

  .weekday-row {
    margin-bottom: var(--space-1);
  }

  .weekday-cell {
    text-align: center;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-secondary);
    padding: var(--space-1) 0;
  }

  .day-cell {
    min-height: 6rem;
    padding: var(--space-1);
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .day-cell-empty {
    background-color: transparent;
    border-color: transparent;
  }

  .day-cell-today {
    border-color: var(--color-brand-gold);
    box-shadow: inset 0 0 0 1px var(--color-brand-gold);
  }

  .day-number {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .day-cell-today .day-number {
    color: var(--color-brand-gold-hover);
  }

  .day-events {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-1) / 2);
  }

  .day-event-chip {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
    padding: calc(var(--space-1) / 2) var(--space-1);
    border-radius: var(--radius-sm);
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
    font-size: var(--font-size-xs);
    text-decoration: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: background-color var(--transition-fast);
  }

  .day-event-chip:hover {
    background-color: var(--color-brand-primary-hover);
  }

  .day-event-chip.chip-all-day {
    background-color: var(--color-brand-gold);
    color: var(--color-brand-primary);
  }

  .day-event-chip.chip-all-day:hover {
    background-color: var(--color-brand-gold-hover);
  }

  .chip-time {
    font-weight: var(--font-weight-bold);
    flex-shrink: 0;
  }

  .chip-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .day-event-chip:focus-visible {
    outline: 2px solid var(--color-brand-gold);
    outline-offset: 1px;
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
