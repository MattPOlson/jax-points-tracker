<script>
  import { renderMarkdown } from '$lib/utils/markdown';

  export let value = '';
  export let placeholder = 'Write your post in Markdown…';
  export let rows = 8;
  export let maxLength = 20000;
  export let disabled = false;
  export let id = 'forum-editor';
  export let label = '';

  let mode = 'write';

  $: charCount = (value || '').length;
  $: overLimit = charCount > maxLength;
</script>

<div class="forum-editor">
  {#if label}
    <label for={id} class="forum-editor-label">{label}</label>
  {/if}

  <div class="forum-editor-tabs" role="tablist">
    <button
      type="button"
      role="tab"
      aria-selected={mode === 'write'}
      class="forum-editor-tab"
      class:active={mode === 'write'}
      on:click={() => (mode = 'write')}
    >
      Write
    </button>
    <button
      type="button"
      role="tab"
      aria-selected={mode === 'preview'}
      class="forum-editor-tab"
      class:active={mode === 'preview'}
      on:click={() => (mode = 'preview')}
    >
      Preview
    </button>
    <span class="forum-editor-help">
      Markdown supported — **bold**, *italic*, `code`, [link](url), &gt; quote
    </span>
  </div>

  {#if mode === 'write'}
    <textarea
      {id}
      {placeholder}
      {rows}
      {disabled}
      bind:value
      class="forum-editor-textarea"
      class:over-limit={overLimit}
    ></textarea>
  {:else}
    <div class="forum-editor-preview">
      {#if value?.trim()}
        {@html renderMarkdown(value)}
      {:else}
        <p class="forum-editor-preview-empty">Nothing to preview.</p>
      {/if}
    </div>
  {/if}

  <div class="forum-editor-meta" class:over-limit={overLimit}>
    {charCount.toLocaleString()} / {maxLength.toLocaleString()}
  </div>
</div>

<style>
  .forum-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .forum-editor-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .forum-editor-tabs {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: 1px solid var(--color-border-secondary);
    padding-bottom: var(--space-1);
    flex-wrap: wrap;
  }

  .forum-editor-tab {
    background: none;
    border: none;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .forum-editor-tab:hover {
    color: var(--color-text-primary);
  }

  .forum-editor-tab.active {
    color: var(--color-brand-primary);
    border-bottom: 2px solid var(--color-brand-primary);
  }

  .forum-editor-help {
    margin-left: auto;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .forum-editor-textarea {
    padding: var(--space-3);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    resize: vertical;
    min-height: 160px;
    width: 100%;
  }

  .forum-editor-textarea:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px var(--color-brand-primary-light);
  }

  .forum-editor-textarea.over-limit {
    border-color: var(--color-danger);
  }

  .forum-editor-preview {
    min-height: 160px;
    padding: var(--space-4);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    line-height: 1.6;
  }

  .forum-editor-preview :global(p) { margin: 0 0 var(--space-3) 0; }
  .forum-editor-preview :global(p:last-child) { margin-bottom: 0; }
  .forum-editor-preview :global(h1),
  .forum-editor-preview :global(h2),
  .forum-editor-preview :global(h3) {
    color: var(--color-brand-primary);
    margin: var(--space-4) 0 var(--space-2) 0;
  }
  .forum-editor-preview :global(blockquote) {
    border-left: 3px solid var(--color-border-primary);
    margin: var(--space-3) 0;
    padding: var(--space-1) var(--space-3);
    color: var(--color-text-secondary);
  }
  .forum-editor-preview :global(code) {
    background: var(--color-bg-secondary);
    padding: 0.1em 0.3em;
    border-radius: 4px;
    font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: 0.92em;
  }
  .forum-editor-preview :global(pre) {
    background: var(--color-bg-secondary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    overflow-x: auto;
  }
  .forum-editor-preview :global(pre code) { background: none; padding: 0; }
  .forum-editor-preview :global(a) { color: var(--color-brand-primary); }
  .forum-editor-preview :global(img) { max-width: 100%; border-radius: var(--radius-md); }
  .forum-editor-preview :global(ul),
  .forum-editor-preview :global(ol) {
    padding-left: var(--space-5);
    margin: var(--space-2) 0;
  }

  .forum-editor-preview-empty {
    color: var(--color-text-tertiary);
    font-style: italic;
    margin: 0;
  }

  .forum-editor-meta {
    align-self: flex-end;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .forum-editor-meta.over-limit {
    color: var(--color-danger);
    font-weight: var(--font-weight-semibold);
  }
</style>
