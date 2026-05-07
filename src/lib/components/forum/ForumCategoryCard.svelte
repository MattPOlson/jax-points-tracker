<script>
  import { Badge } from '$lib/components/ui';
  import { Lock, MessageSquare } from 'lucide-svelte';

  export let category;

  function timeAgo(iso) {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;
    const diff = Math.floor((Date.now() - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  $: ago = timeAgo(category.lastActivityAt);
</script>

<a class="forum-category-card" href={`/forum/${category.slug}`}>
  <div class="forum-category-card-main">
    <div class="forum-category-card-title">
      <h3>{category.name}</h3>
      {#if category.officer_only}
        <Badge variant="warning">
          <Lock size={12} strokeWidth={2} />
          Officers
        </Badge>
      {:else if !category.members_can_post}
        <Badge variant="info">Read only</Badge>
      {/if}
    </div>
    {#if category.description}
      <p class="forum-category-card-desc">{category.description}</p>
    {/if}
  </div>
  <div class="forum-category-card-meta">
    <div class="forum-category-card-stat">
      <MessageSquare size={14} strokeWidth={2} />
      <span>{category.topicCount ?? 0} {category.topicCount === 1 ? 'topic' : 'topics'}</span>
    </div>
    {#if category.lastTopicTitle}
      <div class="forum-category-card-last">
        <span class="forum-category-card-last-title">{category.lastTopicTitle}</span>
        {#if ago}<span class="forum-category-card-ago">{ago}</span>{/if}
      </div>
    {:else}
      <div class="forum-category-card-empty">No topics yet</div>
    {/if}
  </div>
</a>

<style>
  .forum-category-card {
    display: flex;
    flex-direction: row;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border-secondary);
    border-left: 4px solid var(--color-brand-primary);
    border-radius: var(--radius-card);
    text-decoration: none;
    color: inherit;
    transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .forum-category-card:hover {
    box-shadow: 0 4px 16px rgba(26, 42, 68, 0.12);
    transform: translateY(-1px);
  }

  .forum-category-card-main {
    flex: 1 1 auto;
    min-width: 0;
  }

  .forum-category-card-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-bottom: var(--space-1);
  }

  .forum-category-card-title h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-brand-primary);
  }

  .forum-category-card-desc {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.4;
  }

  .forum-category-card-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
    flex: 0 0 200px;
    text-align: right;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .forum-category-card-stat {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-tertiary);
  }

  .forum-category-card-last {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    max-width: 100%;
  }

  .forum-category-card-last-title {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .forum-category-card-ago {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
  }

  .forum-category-card-empty {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .forum-category-card {
      flex-direction: column;
    }
    .forum-category-card-meta {
      flex-basis: auto;
      align-items: flex-start;
      text-align: left;
    }
    .forum-category-card-last {
      align-items: flex-start;
    }
  }
</style>
