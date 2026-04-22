<script>
  import { createEventDispatcher } from 'svelte';
  import { FormInput, FormTextarea, Button } from '$lib/components/ui';

  export let initial = {};
  export let submitLabel = 'Save';
  export let isSubmitting = false;

  const dispatch = createEventDispatcher();

  let name = initial.name ?? '';
  let description = initial.description ?? '';
  let location = initial.location ?? '';
  let eventDate = toDateInput(initial.event_date);
  let eventTime = toTimeInput(initial.event_date, '18:00');
  let endDate = toDateInput(initial.end_date);
  let endTime = toTimeInput(initial.end_date, '');
  let signupDeadlineDate = toDateInput(initial.signup_deadline);
  let signupDeadlineTime = toTimeInput(initial.signup_deadline, '18:00');
  let maxAttendees = initial.max_attendees ?? '';
  let isActive = initial.active ?? true;

  let errors = {};

  function toDateInput(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function toTimeInput(value, fallback) {
    if (!value) return fallback;
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function combine(dateStr, timeStr) {
    if (!dateStr) return null;
    const time = timeStr || '00:00';
    const d = new Date(`${dateStr}T${time}`);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Event name is required';
    else if (name.length > 120) e.name = 'Name must be 120 characters or less';

    if (!eventDate) e.eventDate = 'Event date is required';

    const eventIso = combine(eventDate, eventTime);
    const endIso = combine(endDate, endTime);
    const deadlineIso = combine(signupDeadlineDate, signupDeadlineTime);

    if (endIso && eventIso && new Date(endIso) < new Date(eventIso)) {
      e.endDate = 'End time must be after the start time';
    }

    if (deadlineIso && eventIso && new Date(deadlineIso) > new Date(eventIso)) {
      e.signupDeadline = 'Signup deadline must be on or before the event starts';
    }

    if (maxAttendees !== '' && (isNaN(Number(maxAttendees)) || Number(maxAttendees) < 1)) {
      e.maxAttendees = 'Must be a positive whole number';
    }

    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event_date: combine(eventDate, eventTime),
      end_date: combine(endDate, endTime),
      signup_deadline: combine(signupDeadlineDate, signupDeadlineTime),
      max_attendees: maxAttendees === '' ? null : Number(maxAttendees),
      active: isActive
    };

    dispatch('submit', payload);
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="event-form">
  <FormInput
    id="event-name"
    label="Event name"
    required
    bind:value={name}
    error={errors.name}
    placeholder="e.g. Spring Beer Festival"
  />

  <FormTextarea
    id="event-description"
    label="Description"
    bind:value={description}
    placeholder="What's happening, what to expect, any details for members..."
    rows={4}
  />

  <FormInput
    id="event-location"
    label="Location"
    bind:value={location}
    placeholder="e.g. Metropolitan Park, Jacksonville"
  />

  <div class="row">
    <FormInput
      id="event-date"
      type="date"
      label="Event start date"
      required
      bind:value={eventDate}
      error={errors.eventDate}
    />
    <FormInput
      id="event-time"
      type="time"
      label="Start time"
      bind:value={eventTime}
    />
  </div>

  <div class="row">
    <FormInput
      id="end-date"
      type="date"
      label="End date (optional)"
      bind:value={endDate}
      error={errors.endDate}
    />
    <FormInput
      id="end-time"
      type="time"
      label="End time"
      bind:value={endTime}
    />
  </div>

  <div class="row">
    <FormInput
      id="signup-deadline"
      type="date"
      label="Signup deadline (optional)"
      bind:value={signupDeadlineDate}
      error={errors.signupDeadline}
      helper="Members can't sign up after this point."
    />
    <FormInput
      id="signup-deadline-time"
      type="time"
      label="Deadline time"
      bind:value={signupDeadlineTime}
    />
  </div>

  <FormInput
    id="max-attendees"
    type="number"
    label="Max attendees (optional)"
    bind:value={maxAttendees}
    error={errors.maxAttendees}
    placeholder="Leave blank for no limit"
  />

  <label class="checkbox-row">
    <input type="checkbox" bind:checked={isActive} />
    <span>Active (visible to members)</span>
  </label>

  <div class="form-actions">
    <Button type="submit" variant="primary" disabled={isSubmitting}>
      {submitLabel}
    </Button>
    <Button type="button" variant="secondary" on:click={handleCancel} disabled={isSubmitting}>
      Cancel
    </Button>
  </div>
</form>

<style>
  .event-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-4);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    cursor: pointer;
  }

  .checkbox-row input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-brand-primary);
  }

  .form-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin-top: var(--space-2);
  }

  @media (max-width: 640px) {
    .row {
      grid-template-columns: 1fr;
    }
  }
</style>
