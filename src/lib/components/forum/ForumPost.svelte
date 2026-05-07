<script>
  import { createEventDispatcher } from 'svelte';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { Badge, Button } from '$lib/components/ui';
  import { Edit, Trash2, X, Save, User as UserIcon } from 'lucide-svelte';
  import ForumEditor from './ForumEditor.svelte';

  export let post;
  export let canEdit = false;
  export let canDelete = false;
  export let editing = false;
  export let saving = false;

  let editedBody = post.body;

  $: if (post && !editing) editedBody = post.body;

  const dispatch = createEventDispatcher();

  function startEdit() {
    editedBody = post.body;
    dispatch('startEdit', { id: post.id });
  }
  function cancelEdit() {
    editedBody = post.body;
    dispatch('cancelEdit');
  }
  function saveEdit() {
    dispatch('saveEdit', { id: post.id, body: editedBody });
  }
  function confirmDelete() {
    if (confirm('Delete this post? It will be marked as removed.')) {
      dispatch('delete', { id: post.id });
    }
  }

  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function roleLabel(role) {
    if (!role) return null;
    if (role === 'president') return 'President';
    if (role === 'vice_president') return 'Vice President';
    if (role === 'competition_director') return 'Comp Director';
    if (role === 'officer') return 'Officer';
    return null;
  }

  $: deleted = !!post.deleted_at;
  $: roleBadge = roleLabel(post.author?.role);
</script>

<article class="forum-post" class:deleted class:first={post.is_first_post}>
  <header class="forum-post-header">
    <div class="forum-post-author">
      <div class="forum-post-avatar">
        <UserIcon size={20} strokeWidth={2} color="white" />
      </div>
      <div class="forum-post-author-meta">
        <div class="forum-post-author-name">
          {post.author?.name || 'Unknown'}
          {#if roleBadge}
            <Badge variant={post.author?.role === 'president' ? 'warning' : 'info'}>
              {roleBadge}
            </Badge>
          {/if}
        </div>
        <div class="forum-post-timestamp">
          {fmtDateTime(post.created_at)}
          {#if post.edited_at && !deleted}
            <span class="forum-post-edited">· edited {fmtDateTime(post.edited_at)}</span>
          {/if}
        </div>
      </div>
    </div>

    {#if !deleted && (canEdit || canDelete) && !editing}
      <div class="forum-post-actions">
        {#if canEdit}
          <button type="button" class="forum-post-icon-btn" on:click={startEdit} title="Edit post">
            <Edit size={16} strokeWidth={2} />
          </button>
        {/if}
        {#if canDelete}
          <button type="button" class="forum-post-icon-btn danger" on:click={confirmDelete} title="Delete post">
            <Trash2 size={16} strokeWidth={2} />
          </button>
        {/if}
      </div>
    {/if}
  </header>

  <div class="forum-post-body">
    {#if deleted}
      <p class="forum-post-deleted-notice">[deleted by moderator]</p>
    {:else if editing}
      <ForumEditor
        id={`edit-${post.id}`}
        bind:value={editedBody}
        rows={8}
        disabled={saving}
      />
      <div class="forum-post-edit-actions">
        <Button variant="primary" disabled={saving} on:click={saveEdit}>
          <Save size={14} strokeWidth={2} />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="secondary" disabled={saving} on:click={cancelEdit}>
          <X size={14} strokeWidth={2} />
          Cancel
        </Button>
      </div>
    {:else}
      <div class="forum-post-rendered">
        {@html renderMarkdown(post.body)}
      </div>
    {/if}
  </div>
</article>

<style>
  .forum-post {
    background: var(--color-bg-card, #fff);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--radius-card);
    padding: var(--space-5);
  }
  .forum-post.first {
    border-top: 4px solid var(--color-brand-primary);
  }
  .forum-post.deleted {
    opacity: 0.7;
    background: var(--color-bg-secondary);
  }

  .forum-post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .forum-post-author {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }

  .forum-post-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-primary-hover) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .forum-post-author-name {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .forum-post-timestamp {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-xs);
    margin-top: 2px;
  }

  .forum-post-edited {
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .forum-post-actions {
    display: flex;
    gap: var(--space-1);
  }

  .forum-post-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }
  .forum-post-icon-btn:hover {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }
  .forum-post-icon-btn.danger:hover {
    background: var(--color-danger-light, #fee);
    color: var(--color-danger);
  }

  .forum-post-rendered {
    line-height: 1.6;
    color: var(--color-text-primary);
  }
  .forum-post-rendered :global(p) { margin: 0 0 var(--space-3) 0; }
  .forum-post-rendered :global(p:last-child) { margin-bottom: 0; }
  .forum-post-rendered :global(h1),
  .forum-post-rendered :global(h2),
  .forum-post-rendered :global(h3) {
    color: var(--color-brand-primary);
    margin: var(--space-4) 0 var(--space-2) 0;
  }
  .forum-post-rendered :global(blockquote) {
    border-left: 3px solid var(--color-border-primary);
    margin: var(--space-3) 0;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-secondary);
  }
  .forum-post-rendered :global(code) {
    background: var(--color-bg-secondary);
    padding: 0.1em 0.3em;
    border-radius: 4px;
    font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.92em;
  }
  .forum-post-rendered :global(pre) {
    background: var(--color-bg-secondary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    overflow-x: auto;
  }
  .forum-post-rendered :global(pre code) { background: none; padding: 0; }
  .forum-post-rendered :global(a) { color: var(--color-brand-primary); }
  .forum-post-rendered :global(img) { max-width: 100%; border-radius: var(--radius-md); }
  .forum-post-rendered :global(ul),
  .forum-post-rendered :global(ol) {
    padding-left: var(--space-5);
    margin: var(--space-2) 0;
  }

  .forum-post-deleted-notice {
    margin: 0;
    color: var(--color-text-tertiary);
    font-style: italic;
  }

  .forum-post-edit-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }
</style>
