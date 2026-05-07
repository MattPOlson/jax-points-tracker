<script>
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui';
  import { Pin, PinOff, Lock, Unlock, Trash2 } from 'lucide-svelte';

  export let pinned = false;
  export let locked = false;
  export let busy = false;

  const dispatch = createEventDispatcher();

  function togglePin() {
    dispatch('togglePin', { pinned: !pinned });
  }
  function toggleLock() {
    dispatch('toggleLock', { locked: !locked });
  }
  function confirmDelete() {
    if (confirm('Delete this entire topic? This cannot be undone.')) {
      dispatch('deleteTopic');
    }
  }
</script>

<div class="forum-mod-menu">
  <span class="forum-mod-label">Moderation:</span>
  <Button variant="secondary" disabled={busy} on:click={togglePin}>
    {#if pinned}
      <PinOff size={14} strokeWidth={2} /> Unpin
    {:else}
      <Pin size={14} strokeWidth={2} /> Pin
    {/if}
  </Button>
  <Button variant="secondary" disabled={busy} on:click={toggleLock}>
    {#if locked}
      <Unlock size={14} strokeWidth={2} /> Unlock
    {:else}
      <Lock size={14} strokeWidth={2} /> Lock
    {/if}
  </Button>
  <Button variant="secondary" disabled={busy} on:click={confirmDelete}>
    <Trash2 size={14} strokeWidth={2} /> Delete topic
  </Button>
</div>

<style>
  .forum-mod-menu {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-bg-secondary);
    border: 1px dashed var(--color-border-primary);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }
  .forum-mod-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    margin-right: var(--space-1);
  }
</style>
