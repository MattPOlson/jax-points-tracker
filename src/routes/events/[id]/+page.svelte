<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import {
    loadEvent,
    loadEventSignups,
    loadMySignup,
    upsertMySignup,
    removeMySignup
  } from '$lib/stores/eventManagementStore.js';
  import {
    Hero,
    Container,
    LoadingSpinner,
    EmptyState,
    Card,
    Badge,
    Button,
    FormInput,
    FormTextarea
  } from '$lib/components/ui';
  import { Calendar, MapPin, Users, Clock, ArrowLeft, Pencil, Trash2 } from 'lucide-svelte';
  import toast from 'svelte-french-toast';
  import { showConfirm } from '$lib/stores/confirmDialog.js';

  $: eventId = $page.params.id;

  let event = null;
  let signups = [];
  let mySignup = null;
  let isLoading = true;
  let loadError = null;
  let isSaving = false;

  let bringing = '';
  let notes = '';
  let editing = false;

  $: isLoggedIn = !!$userProfile?.id;
  $: isFull = event?.max_attendees && signups.length >= event.max_attendees && !mySignup;
  $: isPast = event && new Date(event.event_date) < new Date();
  $: signupClosed = event?.signup_deadline && new Date(event.signup_deadline) < new Date();
  $: canSignUp = isLoggedIn && !isPast && !signupClosed && event?.active;

  onMount(async () => {
    await refresh();
  });

  async function refresh() {
    isLoading = true;
    loadError = null;
    try {
      event = await loadEvent(eventId);
      signups = await loadEventSignups(eventId);
      if ($userProfile?.id) {
        mySignup = await loadMySignup(eventId);
        if (mySignup) {
          bringing = mySignup.bringing || '';
          notes = mySignup.notes || '';
        }
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      loadError = err.message || 'Failed to load event';
    } finally {
      isLoading = false;
    }
  }

  async function handleSignUp() {
    if (!isLoggedIn) {
      goto('/login');
      return;
    }

    isSaving = true;
    try {
      await upsertMySignup(eventId, { bringing: bringing.trim(), notes: notes.trim() });
      toast.success(mySignup ? 'Signup updated!' : "You're signed up!");
      editing = false;
      await refresh();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      isSaving = false;
    }
  }

  async function handleCancel() {
    const confirmed = await showConfirm(
      'You will be removed from the list. You can sign up again later.',
      'Cancel your signup?'
    );
    if (!confirmed) return;

    isSaving = true;
    try {
      await removeMySignup(eventId);
      toast.success('Signup canceled.');
      mySignup = null;
      bringing = '';
      notes = '';
      editing = false;
      await refresh();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      isSaving = false;
    }
  }

  function formatEventDate(dateString) {
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
</script>

<svelte:head>
  <title>{event?.name || 'Event'} | JAX Members Portal</title>
</svelte:head>

<Hero
  title={event?.name || 'Event'}
  subtitle={event?.location || ''}
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="md">
  <div class="back-link">
    <Button variant="secondary" size="sm" on:click={() => goto('/events')}>
      <ArrowLeft size={16} />
      All Events
    </Button>
  </div>

  {#if isLoading}
    <LoadingSpinner message="Loading event..." />
  {:else if loadError || !event}
    <EmptyState
      icon="⚠️"
      title="Event not found"
      description={loadError || 'This event does not exist or is no longer available.'}
    >
      <Button variant="primary" on:click={() => goto('/events')}>Back to Events</Button>
    </EmptyState>
  {:else}
    <Card accent accentColor={isPast ? 'info' : 'primary'}>
      <div class="event-header">
        <h1 class="event-title">{event.name}</h1>
        {#if isPast}
          <Badge variant="secondary">Past Event</Badge>
        {:else if !event.active}
          <Badge variant="warning">Inactive</Badge>
        {:else if signupClosed}
          <Badge variant="warning">Signups Closed</Badge>
        {:else}
          <Badge variant="primary">Open</Badge>
        {/if}
      </div>

      <div class="event-meta">
        <div class="meta-row">
          <Calendar size={18} strokeWidth={1.75} />
          <span>{formatEventDate(event.event_date)}</span>
        </div>
        {#if event.end_date}
          <div class="meta-row">
            <Clock size={18} strokeWidth={1.75} />
            <span>Ends {formatEventDate(event.end_date)}</span>
          </div>
        {/if}
        {#if event.location}
          <div class="meta-row">
            <MapPin size={18} strokeWidth={1.75} />
            <span>{event.location}</span>
          </div>
        {/if}
        <div class="meta-row">
          <Users size={18} strokeWidth={1.75} />
          <span>
            {signups.length}
            {signups.length === 1 ? 'person going' : 'people going'}
            {#if event.max_attendees}
              &nbsp;/ {event.max_attendees} spots
            {/if}
          </span>
        </div>
        {#if event.signup_deadline}
          <div class="meta-row" class:meta-warning={signupClosed}>
            <Clock size={18} strokeWidth={1.75} />
            <span>Signups {signupClosed ? 'closed' : 'close'} {formatEventDate(event.signup_deadline)}</span>
          </div>
        {/if}
      </div>

      {#if event.description}
        <div class="event-description">
          <h2 class="subhead">Details</h2>
          <p>{event.description}</p>
        </div>
      {/if}
    </Card>

    <!-- Signup form -->
    <Card accent accentColor="success">
      <h2 class="subhead">Sign Up</h2>

      {#if !isLoggedIn}
        <p class="note">
          Please <a href="/login">sign in</a> to sign up for this event.
        </p>
      {:else if isPast}
        <p class="note">This event has already happened.</p>
      {:else if !event.active}
        <p class="note">This event is not currently accepting signups.</p>
      {:else if signupClosed && !mySignup}
        <p class="note">The signup deadline has passed.</p>
      {:else if isFull}
        <p class="note">This event is full.</p>
      {:else if mySignup && !editing}
        <div class="my-signup">
          <p class="note success">
            <strong>You're signed up!</strong>
          </p>
          {#if mySignup.bringing}
            <p><strong>Bringing:</strong> {mySignup.bringing}</p>
          {:else}
            <p class="muted">You haven't listed anything you're bringing.</p>
          {/if}
          {#if mySignup.notes}
            <p><strong>Notes:</strong> {mySignup.notes}</p>
          {/if}
          <div class="signup-actions">
            <Button variant="secondary" size="sm" on:click={() => (editing = true)}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button variant="danger" size="sm" on:click={handleCancel} disabled={isSaving}>
              <Trash2 size={14} />
              Cancel signup
            </Button>
          </div>
        </div>
      {:else}
        <form
          on:submit|preventDefault={handleSignUp}
          class="signup-form"
        >
          <FormInput
            id="bringing"
            label="What are you bringing?"
            placeholder="e.g. keg of IPA, pretzels, 2 growlers"
            bind:value={bringing}
            helper="Let the club know what you'll contribute (optional)."
          />

          <FormTextarea
            id="notes"
            label="Notes for the officers"
            placeholder="Any special notes, questions, or plans?"
            bind:value={notes}
            rows={3}
          />

          <div class="signup-actions">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {mySignup ? 'Update signup' : "I'm in — sign me up"}
            </Button>
            {#if editing}
              <Button
                type="button"
                variant="secondary"
                on:click={() => {
                  editing = false;
                  bringing = mySignup?.bringing || '';
                  notes = mySignup?.notes || '';
                }}
                disabled={isSaving}
              >
                Discard changes
              </Button>
            {/if}
          </div>
        </form>
      {/if}
    </Card>

    <!-- Who's going -->
    <Card>
      <h2 class="subhead">Who's Going ({signups.length})</h2>
      {#if signups.length === 0}
        <p class="muted">No one has signed up yet. Be the first!</p>
      {:else}
        <ul class="signups-list">
          {#each signups as s (s.id)}
            <li class="signup-row">
              <div class="signup-main">
                <span class="signup-name">{s.member_name}</span>
                {#if s.bringing}
                  <span class="signup-bringing">bringing <em>{s.bringing}</em></span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </Card>
  {/if}
</Container>

<style>
  .back-link {
    margin: var(--space-6) 0 var(--space-4);
  }

  :global(.back-link .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .event-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-3xl);
    color: var(--color-brand-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-border-primary);
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
  }

  .meta-row :global(svg) {
    color: var(--color-brand-gold);
    flex-shrink: 0;
  }

  .meta-warning {
    color: var(--color-warning);
  }

  .event-description {
    margin-top: var(--space-5);
  }

  .event-description p {
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    white-space: pre-wrap;
    margin: 0;
  }

  .subhead {
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    color: var(--color-brand-primary);
    margin: 0 0 var(--space-4) 0;
  }

  :global(.card + .card) {
    margin-top: var(--space-6);
  }

  .signup-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .signup-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }

  :global(.signup-actions .btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .my-signup p {
    margin: 0 0 var(--space-2);
    color: var(--color-text-secondary);
  }

  .note {
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2);
  }

  .note.success {
    color: var(--color-success);
  }

  .muted {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
  }

  .signups-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .signup-row {
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border-primary);
  }

  .signup-row:last-child {
    border-bottom: none;
  }

  .signup-main {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: baseline;
  }

  .signup-name {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .signup-bringing {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .signup-bringing em {
    color: var(--color-brand-primary);
    font-style: normal;
    font-weight: var(--font-weight-medium);
  }
</style>
