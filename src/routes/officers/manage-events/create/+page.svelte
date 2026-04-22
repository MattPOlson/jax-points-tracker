<script>
  import { goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile.js';
  import { createEvent } from '$lib/stores/eventManagementStore.js';
  import { Hero, Container, Card } from '$lib/components/ui';
  import EventForm from '$lib/components/EventForm.svelte';
  import toast from 'svelte-french-toast';

  $: if ($userProfile && !$userProfile.is_officer) {
    goto('/');
  }

  let isSubmitting = false;

  async function handleSubmit(e) {
    isSubmitting = true;
    try {
      const created = await createEvent(e.detail);
      toast.success('Event created!');
      goto(`/officers/manage-events/edit/${created.id}`);
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
  <title>Create Event | JAX Members Portal</title>
</svelte:head>

<Hero
  title="Create Event"
  subtitle="Set up a new club event and start collecting signups"
  backgroundImage="/Jax-Banner.png"
  overlay={true}
  compact={true}
/>

<Container size="md">
  <div class="wrapper">
    <Card accent accentColor="primary">
      <EventForm
        submitLabel="Create Event"
        {isSubmitting}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
      />
    </Card>
  </div>
</Container>

<style>
  .wrapper {
    margin: var(--space-8) 0 var(--space-16);
  }
</style>
