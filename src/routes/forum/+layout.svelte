<script>
  import { user } from '$lib/stores/user';
  import { userProfile, isLoadingProfile, loadUserProfile } from '$lib/stores/userProfile';
  import { onMount } from 'svelte';
  import { Hero, Container, EmptyState, LoadingSpinner, Button } from '$lib/components/ui';

  onMount(() => {
    if ($user && !$userProfile) loadUserProfile(true);
  });
</script>

{#if !$user}
  <Hero
    title="Forum"
    subtitle="Sign in to access the forum"
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    compact={true}
  />
  <Container size="md">
    <EmptyState
      icon="🔒"
      title="Sign in required"
      description="You need to sign in to access the forum."
    >
      <Button variant="primary" href="/login">Sign in</Button>
    </EmptyState>
  </Container>
{:else if !$userProfile}
  <LoadingSpinner message="Loading…" />
{:else if !$userProfile.forum_beta}
  <Hero
    title="Forum"
    subtitle="Coming soon"
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    compact={true}
  />
  <Container size="md">
    <EmptyState
      icon="🚧"
      title="Not yet available"
      description="The forum is in beta. Ask an officer to enable it for your account."
    >
      <Button variant="primary" href="/">Back to dashboard</Button>
    </EmptyState>
  </Container>
{:else}
  <slot />
{/if}
