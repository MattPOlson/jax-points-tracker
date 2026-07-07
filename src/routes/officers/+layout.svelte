<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/user';
  import { userProfile, loadUserProfile } from '$lib/stores/userProfile';
  import { Container, LoadingSpinner, EmptyState, Button } from '$lib/components/ui';

  /**
   * Single access-control point for every /officers/* route (issues #59, #63).
   *
   * `authState` keeps "loading" distinct from "denied" so protected content is
   * never rendered before the profile resolves — the slot below is only mounted
   * once the user is confirmed to be an officer, which closes the flash-of-
   * officer-UI race from #63.
   *
   * A profile fetch that *fails* (network blip, transient Supabase error) is a
   * distinct "error" state, not "denied": a real officer must never be shown a
   * hard access-denied over a transient failure. Every non-authorized state
   * still withholds the slot, so the fail-closed guarantee is preserved.
   */
  let authState = 'loading'; // 'loading' | 'error' | 'denied' | 'authorized'

  async function checkAccess() {
    authState = 'loading';
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
      // the shared store loader fetches it (#76). It returns null only for a
      // definitive "no member row"; transient failures throw into the catch
      // below — so a real officer is never denied over a network blip.
      let profile = get(userProfile);
      if (!profile || profile.id !== authUser.id) {
        profile = await loadUserProfile(true);
      }

      authState = profile?.is_officer ? 'authorized' : 'denied';
    } catch (err) {
      console.error('Officer access check failed:', err);
      authState = 'error';
    }
  }

  onMount(checkAccess);

  // Re-gate if the session drops after a settled check (e.g. sign-out). The
  // "error" state is left alone so a transient failure can't force a redirect.
  $: if ((authState === 'authorized' || authState === 'denied') && !$user) {
    goto('/login');
  }
</script>

{#if authState === 'error'}
  <Container size="lg">
    <EmptyState
      icon="⚠️"
      title="Couldn't verify access"
      description="We couldn't confirm your permissions just now. Please try again."
    >
      <Button variant="primary" on:click={checkAccess}>Retry</Button>
    </EmptyState>
  </Container>
{:else if authState === 'loading' || !$user}
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
