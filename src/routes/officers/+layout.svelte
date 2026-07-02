<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import { Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';

  /**
   * Single access-control point for every /officers/* route (issues #59, #63).
   *
   * `authState` keeps "loading" distinct from "denied" so protected content is
   * never rendered before the profile resolves — the slot below is only mounted
   * once the user is confirmed to be an officer, which closes the flash-of-
   * officer-UI race from #63.
   */
  let authState = 'loading'; // 'loading' | 'denied' | 'authorized'

  onMount(async () => {
    try {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();
      user.set(authUser);

      if (!authUser) {
        goto('/login');
        return;
      }

      // Reuse a profile the root layout already loaded for this user; otherwise
      // fetch it directly so the gate never keys on a still-loading null.
      let profile = get(userProfile);
      if (!profile || profile.id !== authUser.id) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', authUser.id)
          .single();
        profile = error ? null : data;
        userProfile.set(profile);
      }

      authState = profile?.is_officer ? 'authorized' : 'denied';
    } catch (err) {
      console.error('Officer access check failed:', err);
      authState = 'denied';
    }
  });

  // Re-gate if the session drops after the initial check (e.g. sign-out).
  $: if (authState !== 'loading' && !$user) {
    goto('/login');
  }
</script>

{#if authState === 'loading' || !$user}
  <Container size="lg">
    <LoadingSpinner message="Verifying permissions..." />
  </Container>
{:else if authState === 'denied'}
  <Container size="lg">
    <EmptyState
      icon="🔒"
      title="Access Restricted"
      description="You are not authorized to view this page. Officer privileges are required."
    >
      <Button variant="primary" on:click={() => goto('/')}>Return Home</Button>
    </EmptyState>
  </Container>
{:else}
  <slot />
{/if}
