<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import { loadEvent, updateEvent } from '$lib/stores/eventManagementStore.js';
  import {
    Hero,
    Container,
    Card,
    LoadingSpinner,
    EmptyState,
    Button
  } from '$lib/components/ui';
  import EventForm from '$lib/components/EventForm.svelte';
  import toast from 'svelte-french-toast';
  import { ArrowLeft, Printer } from 'lucide-svelte';

  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  $: eventId = $page.params.id;

  let event = null;
  let isLoading = true;
  let loadError = null;
  let isSubmitting = false;

  onMount(async () => {
    try {
      event = await loadEvent(eventId);
    } catch (err) {
      loadError = err.message || 'Failed to load event';
    } finally {
      isLoading = false;
    }
  });

  async function handleSubmit(e) {
    isSubmitting = true;
    try {
      await updateEvent(eventId, e.detail);
      toast.success('Event updated.');
      goto('/officers/manage-events');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      isSubmitting = false;
    }
  }

  function handleCancel() {
    goto('/officers/manage-events');
  }
</script>

<svelte:head>
  <title>Edit Event | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Edit Event"
  subtitle={event?.name || ''}
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="md">
  <div class="toolbar">
    <Button variant="secondary" size="sm" on:click={() => goto('/officers/manage-events')}>
      <ArrowLeft size={14} />
      Back
    </Button>
    {#if event}
      <Button variant="secondary" size="sm" on:click={() => goto(`/officers/manage-events/signups/${eventId}`)}>
        <Printer size={14} />
        View / Print Signups
      </Button>
    {/if}
  </div>

  {#if isLoading}
    <LoadingSpinner message="Loading event..." />
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
    <div class="wrapper">
      <Card accent accentColor="primary">
        <EventForm
          initial={event}
          submitLabel="Save Changes"
          {isSubmitting}
          on:submit={handleSubmit}
          on:cancel={handleCancel}
        />
      </Card>
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

  .wrapper {
    margin: var(--space-4) 0 var(--space-16);
  }
</style>
