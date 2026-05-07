<script>
  import { Pin, Lock, MessageCircle } from 'lucide-svelte';

  export let topic;
  export let categorySlug;

  function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diff = Math.floor((Date.now() - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  $: lastActivity = topic.last_reply_at || topic.created_at;
  $: lastBy = topic.last_reply_author?.name || topic.author?.name || 'Unknown';
</script>

<a class="forum-topic-row" href={`/forum/${categorySlug}/${topic.slug}`}>
  <div class="forum-topic-row-main">
    <div class="forum-topic-row-title">
      {#if topic.pinned}<Pin size={14} strokeWidth={2} class="forum-topic-icon" />{/if}
      {#if topic.locked}<Lock size={14} strokeWidth={2} class="forum-topic-icon" />{/if}
      <span class="forum-topic-row-title-text">{topic.title}</span>
    </div>
    <div class="forum-topic-row-author">
      Started by <strong>{topic.author?.name || 'Unknown'}</strong>
    </div>
  </div>
  <div class="forum-topic-row-stat">
    <MessageCircle size={14} strokeWidth={2} />
    <span>{topic.reply_count ?? 0}</span>
  </div>
  <div class="forum-topic-row-activity">
    <div class="forum-topic-row-activity-by">{lastBy}</div>
    <div class="forum-topic-row-activity-when">{timeAgo(lastActivity)}</div>
  </div>
</a>

<style>
  .forum-topic-row {
    display: grid;
    grid-template-columns: 1fr 80px 160px;
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
    transition: background-color var(--transition-fast);
  }

  .forum-topic-row:hover {
    background: var(--color-bg-secondary);
  }

  .forum-topic-row-main {
    min-width: 0;
  }

  .forum-topic-row-title {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
  }

  .forum-topic-row-title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.forum-topic-icon) {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .forum-topic-row-author {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    margin-top: 2px;
  }

  .forum-topic-row-stat {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    justify-self: center;
  }

  .forum-topic-row-activity {
    text-align: right;
    font-size: var(--font-size-sm);
  }

  .forum-topic-row-activity-by {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .forum-topic-row-activity-when {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }

  @media (max-width: 640px) {
    .forum-topic-row {
      grid-template-columns: 1fr auto;
    }
    .forum-topic-row-stat {
      justify-self: end;
    }
    .forum-topic-row-activity {
      grid-column: 1 / -1;
      text-align: left;
      display: flex;
      gap: var(--space-2);
    }
  }
</style>
