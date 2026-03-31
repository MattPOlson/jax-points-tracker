<script>
  import { user } from '$lib/stores/user';
  import { userProfile } from '$lib/stores/userProfile';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import toast from 'svelte-french-toast';
  import { Hero, Container, Card, Button, LoadingSpinner, EmptyState } from '$lib/components/ui';
  import { Bell } from 'lucide-svelte';

  let title = '';
  let message = '';
  let isSending = false;
  let subscriberCount = null;
  let lastResult = null;

  $: if ($user !== undefined && $userProfile !== undefined) {
    if (!$user) goto('/login');
    else if ($userProfile && !$userProfile.is_officer) goto('/');
    else if ($userProfile?.is_officer) loadSubscriberCount();
  }

  async function loadSubscriberCount() {
    try {
      const { count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });
      subscriberCount = count ?? 0;
    } catch (err) {
      console.error('Failed to load subscriber count:', err);
      subscriberCount = 0;
    }
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    if (subscriberCount === 0) {
      toast.error('No subscribers to send to.');
      return;
    }

    isSending = true;
    lastResult = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), url: '/' })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Send failed');
      }

      lastResult = result;
      toast.success(`Notification sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}!`);

      title = '';
      message = '';

      // Refresh count (some may have been removed as expired)
      await loadSubscriberCount();
    } catch (err) {
      console.error('Send error:', err);
      toast.error(err.message || 'Failed to send notification.');
    } finally {
      isSending = false;
    }
  }
</script>

<svelte:head>
  <title>Send Notification | JAX Members Portal</title>
</svelte:head>

{#if $user === undefined || $userProfile === undefined}
  <Container size="lg">
    <LoadingSpinner message="Verifying permissions..." />
  </Container>
{:else if !$userProfile?.is_officer}
  <Container size="lg">
    <EmptyState
      title="Access Restricted"
      message="Officer privileges required."
      actionLabel="Return Home"
      actionHref="/"
    />
  </Container>
{:else}
  <Hero
    title="Send Notification"
    subtitle="Push a message to all subscribed members"
    backgroundImage="/Jax-Banner.png"
    overlay={true}
    compact={true}
  />

  <Container size="sm">
    <Card>
      <div class="page-header">
        <Bell size={32} strokeWidth={1.5} color="var(--color-brand-primary)" />
        <div>
          <h2 class="section-title">Broadcast Message</h2>
          <p class="subscriber-info">
            {#if subscriberCount === null}
              Loading subscriber count...
            {:else}
              <strong>{subscriberCount}</strong> member{subscriberCount !== 1 ? 's' : ''} subscribed to notifications
            {/if}
          </p>
        </div>
      </div>

      {#if subscriberCount === 0}
        <div class="empty-notice">
          No members have enabled push notifications yet. Members can enable them using the bell
          icon in the header.
        </div>
      {/if}

      <form on:submit|preventDefault={handleSend} class="notification-form">
        <div class="form-group">
          <label for="notif-title" class="form-label">Title <span class="required">*</span></label>
          <input
            id="notif-title"
            type="text"
            class="form-control"
            bind:value={title}
            placeholder="e.g., Club Meeting Tonight"
            maxlength="100"
            disabled={isSending}
            required
          />
          <div class="char-count">{title.length}/100</div>
        </div>

        <div class="form-group">
          <label for="notif-message" class="form-label">Message <span class="required">*</span></label>
          <textarea
            id="notif-message"
            class="form-control"
            bind:value={message}
            placeholder="e.g., Don't forget — club meeting tonight at 7pm at the usual spot!"
            maxlength="200"
            rows="4"
            disabled={isSending}
            required
          />
          <div class="char-count">{message.length}/200</div>
        </div>

        {#if lastResult}
          <div class="result-banner">
            Sent to <strong>{lastResult.sent}</strong> subscriber{lastResult.sent !== 1 ? 's' : ''}
            {#if lastResult.failed > 0}
              (<strong>{lastResult.failed}</strong> expired subscription{lastResult.failed !== 1 ? 's' : ''} removed)
            {/if}
          </div>
        {/if}

        <div class="form-actions">
          <Button variant="secondary" on:click={() => goto('/officers')} disabled={isSending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSending || !title.trim() || !message.trim() || subscriberCount === 0}
          >
            <Bell size={16} />
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </form>
    </Card>
  </Container>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border-primary);
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-1) 0;
  }

  .subscriber-info {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .empty-notice {
    background: var(--color-gray-50);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-6);
  }

  .notification-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .required {
    color: var(--color-danger);
  }

  .form-control {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-family: inherit;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-control:focus {
    outline: none;
    border-color: var(--color-brand-primary);
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  .form-control:disabled {
    background: var(--color-gray-50);
    cursor: not-allowed;
  }

  textarea.form-control {
    resize: vertical;
  }

  .char-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    text-align: right;
  }

  .result-banner {
    background: var(--color-success-bg, #f0fdf4);
    border: 1px solid var(--color-success);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-sm);
    color: var(--color-success);
  }

  .form-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: flex-end;
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-primary);
  }

  @media (max-width: 480px) {
    .page-header {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column-reverse;
    }
  }
</style>
