<script>
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';
  import { Hero, Container, Card, Button } from '$lib/components/ui';
  import { Bell, Users, User, X } from 'lucide-svelte';
  import { fetchSubscriptionCounts } from '$lib/push/subscriptions';

  let title = '';
  let message = '';
  let linkUrl = '';
  let isSending = false;
  let lastResult = null;

  // ---- Audience targeting (#134) ---------------------------------------
  // Reach data (member_id → subscribed device count) drives the per-audience
  // preview; the actual filter is re-enforced server-side. `roster` is the
  // full member list for the officer/specific pickers.
  let audienceType = 'all'; // 'all' | 'officers' | 'members'
  let roster = [];
  let subscriptionCounts = new Map();
  let selectedMemberIds = [];

  // Specific-members combobox (mirrors the link picker below)
  let memberQuery = '';
  let memberDropdownOpen = false;
  let memberHighlightedIndex = -1;

  const audienceOptions = [
    { value: 'all', label: 'All members', icon: Users },
    { value: 'officers', label: 'Officers only', icon: Bell },
    { value: 'members', label: 'Specific members', icon: User }
  ];

  // Member ids in the selected audience (before subscription filtering).
  $: audienceMemberIds =
    audienceType === 'all'
      ? roster.map((m) => m.id)
      : audienceType === 'officers'
        ? roster.filter((m) => m.is_officer).map((m) => m.id)
        : selectedMemberIds;

  // Distinct members in the audience who have ≥1 subscribed device.
  $: reachCount = audienceMemberIds.filter((id) => subscriptionCounts.has(id)).length;
  $: audienceSize = audienceMemberIds.length;

  $: selectedMembers = selectedMemberIds
    .map((id) => roster.find((m) => m.id === id))
    .filter(Boolean);

  $: filteredRoster = filterRoster(memberQuery, roster, selectedMemberIds);

  function filterRoster(query, all, selected) {
    const q = query.trim().toLowerCase();
    const selectedSet = new Set(selected);
    return all.filter((m) => {
      if (selectedSet.has(m.id)) return false;
      if (!q) return true;
      return m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    });
  }

  function toggleMember(member) {
    if (selectedMemberIds.includes(member.id)) {
      selectedMemberIds = selectedMemberIds.filter((id) => id !== member.id);
    } else {
      selectedMemberIds = [...selectedMemberIds, member.id];
    }
    memberQuery = '';
    memberHighlightedIndex = -1;
  }

  function removeMember(id) {
    selectedMemberIds = selectedMemberIds.filter((m) => m !== id);
  }

  function handleMemberKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      memberDropdownOpen = true;
      memberHighlightedIndex = Math.min(memberHighlightedIndex + 1, filteredRoster.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      memberHighlightedIndex = Math.max(memberHighlightedIndex - 1, 0);
    } else if (e.key === 'Enter' && memberDropdownOpen && memberHighlightedIndex >= 0) {
      e.preventDefault();
      toggleMember(filteredRoster[memberHighlightedIndex]);
    } else if (e.key === 'Escape') {
      memberDropdownOpen = false;
      memberHighlightedIndex = -1;
    }
  }

  // ---- Link destination picker (#130 follow-up) ------------------------
  // Free-text links let officers send members to 404s. The link is now
  // restricted to a curated list of member-facing pages plus real upcoming
  // events (/events/<id> pages exist per event), with autocomplete.
  const STATIC_DESTINATIONS = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/competitions', label: 'Competitions' },
    { path: '/competitions/results', label: 'Competition Results' },
    { path: '/competitions/submit-entry', label: 'Enter a Competition' },
    { path: '/competitions/my-entries', label: 'My Competition Entries' },
    { path: '/my-submissions', label: 'My Submissions' },
    { path: '/submit', label: 'Submit Points' },
    { path: '/profile', label: 'My Profile' }
  ];

  let destinations = [...STATIC_DESTINATIONS];
  let linkDropdownOpen = false;
  let highlightedIndex = -1;

  $: filteredDestinations = filterDestinations(linkUrl, destinations);

  function filterDestinations(query, all) {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (d) => d.path.toLowerCase().startsWith(q) || d.label.toLowerCase().includes(q)
    );
  }

  async function loadEventDestinations() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, event_date')
        .eq('active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });
      if (error) throw error;

      const eventDests = (data ?? []).map((e) => ({
        path: `/events/${e.id}`,
        label: `Event: ${e.name} (${new Date(e.event_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })})`
      }));
      destinations = [...STATIC_DESTINATIONS, ...eventDests];
    } catch (err) {
      // Non-fatal: static destinations still work.
      console.error('Failed to load event destinations:', err);
    }
  }

  function selectDestination(dest) {
    linkUrl = dest.path;
    linkDropdownOpen = false;
    highlightedIndex = -1;
  }

  function handleLinkKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      linkDropdownOpen = true;
      highlightedIndex = Math.min(highlightedIndex + 1, filteredDestinations.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
    } else if (e.key === 'Enter' && linkDropdownOpen && highlightedIndex >= 0) {
      e.preventDefault();
      selectDestination(filteredDestinations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      linkDropdownOpen = false;
      highlightedIndex = -1;
    }
  }

  /**
   * The link must be a known destination — a curated page or a real event —
   * so a notification can never send members to a 404. Empty means home.
   */
  function validateLink(value) {
    const trimmed = value.trim();
    if (!trimmed) return '/';
    const match = destinations.find((d) => d.path === trimmed);
    return match ? match.path : null;
  }

  // Access control is enforced by officers/+layout; officers only reach here.
  onMount(() => {
    loadReachData();
    loadRoster();
    loadEventDestinations();
  });

  async function loadReachData() {
    try {
      subscriptionCounts = await fetchSubscriptionCounts();
    } catch (err) {
      console.error('Failed to load subscription reach:', err);
      subscriptionCounts = new Map();
    }
  }

  async function loadRoster() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email, is_officer, active')
        .order('name', { ascending: true });
      if (error) throw error;
      // Active members first, then alphabetical (already name-sorted above).
      roster = (data ?? []).sort((a, b) => (b.active === true) - (a.active === true));
    } catch (err) {
      console.error('Failed to load roster:', err);
      roster = [];
    }
  }

  function buildAudiencePayload() {
    if (audienceType === 'officers') return { type: 'officers' };
    if (audienceType === 'members') return { type: 'members', memberIds: selectedMemberIds };
    return { type: 'all' };
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    if (audienceType === 'members' && selectedMemberIds.length === 0) {
      toast.error('Pick at least one member, or choose a different audience.');
      return;
    }

    const safeUrl = validateLink(linkUrl);
    if (safeUrl === null) {
      toast.error('Link must be one of the suggested portal pages — pick from the list.');
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
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          url: safeUrl,
          audience: buildAudiencePayload()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Send failed');
      }

      lastResult = result;
      toast.success(`Notification sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}!`);

      title = '';
      message = '';
      linkUrl = '';

      // Refresh reach data (some subscriptions may have been pruned as expired)
      await loadReachData();
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

<Hero
    title="Send Notification"
    subtitle="Push a message to members — everyone, officers, or a chosen few"
    backgroundImage="/Jax-Banner.jpg"
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
            {#if audienceType === 'all'}
              <strong>{reachCount}</strong> member{reachCount !== 1 ? 's' : ''} subscribed to notifications
            {:else if audienceType === 'officers'}
              <strong>{reachCount}</strong> of {audienceSize} officer{audienceSize !== 1 ? 's' : ''} have notifications enabled
            {:else}
              <strong>{reachCount}</strong> of {audienceSize} selected member{audienceSize !== 1 ? 's' : ''} have notifications enabled
            {/if}
          </p>
        </div>
      </div>

      {#if reachCount === 0}
        <div class="empty-notice">
          {#if audienceType === 'all'}
            No members have enabled push notifications yet. Members can enable them using the bell
            icon in the header.
          {:else if audienceType === 'members' && selectedMemberIds.length === 0}
            Pick members below to see how many can be reached.
          {:else}
            None of this audience has notifications enabled — sending now will reach no one.
          {/if}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSend} class="notification-form">
        <div class="form-group">
          <span class="form-label" id="audience-label">Audience</span>
          <div class="audience-options" role="radiogroup" aria-labelledby="audience-label">
            {#each audienceOptions as option}
              <button
                type="button"
                role="radio"
                aria-checked={audienceType === option.value}
                class="audience-option"
                class:selected={audienceType === option.value}
                disabled={isSending}
                on:click={() => (audienceType = option.value)}
              >
                <svelte:component this={option.icon} size={16} strokeWidth={2} />
                {option.label}
              </button>
            {/each}
          </div>
        </div>

        {#if audienceType === 'members'}
          <div class="form-group">
            <label for="notif-members" class="form-label">Choose members</label>
            {#if selectedMembers.length > 0}
              <div class="chips">
                {#each selectedMembers as m (m.id)}
                  <span class="chip">
                    {m.name || m.email}
                    <button
                      type="button"
                      class="chip-remove"
                      aria-label={`Remove ${m.name || m.email}`}
                      on:click={() => removeMember(m.id)}
                      disabled={isSending}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                {/each}
              </div>
            {/if}
            <div class="link-picker">
              <input
                id="notif-members"
                type="text"
                class="form-control"
                role="combobox"
                aria-expanded={memberDropdownOpen}
                aria-controls="notif-member-options"
                aria-autocomplete="list"
                autocomplete="off"
                bind:value={memberQuery}
                on:focus={() => (memberDropdownOpen = true)}
                on:input={() => { memberDropdownOpen = true; memberHighlightedIndex = -1; }}
                on:keydown={handleMemberKeydown}
                on:blur={() => setTimeout(() => (memberDropdownOpen = false), 150)}
                placeholder="Search members by name or email"
                disabled={isSending}
              />
              {#if memberDropdownOpen && filteredRoster.length > 0}
                <ul id="notif-member-options" class="link-options" role="listbox">
                  {#each filteredRoster.slice(0, 50) as m, i (m.id)}
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === memberHighlightedIndex}
                        class="link-option"
                        class:highlighted={i === memberHighlightedIndex}
                        on:mousedown|preventDefault={() => toggleMember(m)}
                      >
                        <span class="option-label">
                          {m.name || m.email}
                          {#if !m.active}<span class="option-inactive">inactive</span>{/if}
                        </span>
                        <span class="option-path">
                          {subscriptionCounts.has(m.id) ? '🔔 subscribed' : 'no notifications'}
                        </span>
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            <div class="field-hint">
              Only members with notifications enabled will receive the push — the count above
              reflects who's reachable.
            </div>
          </div>
        {/if}

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

        <div class="form-group">
          <label for="notif-link" class="form-label">Link to page <span class="optional">(optional)</span></label>
          <div class="link-picker">
          <input
            id="notif-link"
            type="text"
            class="form-control"
            role="combobox"
            aria-expanded={linkDropdownOpen}
            aria-controls="notif-link-options"
            aria-autocomplete="list"
            autocomplete="off"
            bind:value={linkUrl}
            on:focus={() => (linkDropdownOpen = true)}
            on:input={() => { linkDropdownOpen = true; highlightedIndex = -1; }}
            on:keydown={handleLinkKeydown}
            on:blur={() => setTimeout(() => (linkDropdownOpen = false), 150)}
            placeholder="Start typing, e.g. /events"
            maxlength="200"
            disabled={isSending}
          />
          {#if linkDropdownOpen && filteredDestinations.length > 0}
            <ul id="notif-link-options" class="link-options" role="listbox">
              {#each filteredDestinations as dest, i (dest.path)}
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === highlightedIndex}
                    class="link-option"
                    class:highlighted={i === highlightedIndex}
                    on:mousedown|preventDefault={() => selectDestination(dest)}
                  >
                    <span class="option-label">{dest.label}</span>
                    <span class="option-path">{dest.path}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
          </div>
          <div class="field-hint">
            Where tapping the notification takes members. Leave blank for the home page.
            Pick from the list — upcoming events appear as you type <code>/events/</code>.
          </div>
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
            disabled={isSending || !title.trim() || !message.trim() || (audienceType === 'members' && selectedMemberIds.length === 0)}
          >
            <Bell size={16} />
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </form>
    </Card>
  </Container>

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

  .optional {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-normal);
  }

  .field-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  /* Audience selector (#134) */
  .audience-options {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .audience-option {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    background: var(--color-bg-card);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
  }

  .audience-option:hover:not(:disabled) {
    border-color: var(--color-brand-primary);
  }

  .audience-option.selected {
    border-color: var(--color-brand-primary);
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
  }

  .audience-option:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    border-radius: var(--radius-full);
  }

  .chip-remove:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.1);
  }

  .option-inactive {
    margin-left: var(--space-2);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-normal);
    font-style: italic;
  }

  .link-picker {
    position: relative;
  }

  .link-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin: var(--space-1) 0 0;
    padding: var(--space-1);
    list-style: none;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    max-height: 260px;
    overflow-y: auto;
  }

  .link-option {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: none;
    background: none;
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    text-align: left;
    font-size: var(--font-size-sm);
  }

  .link-option:hover,
  .link-option.highlighted {
    background: var(--color-brand-primary-light);
  }

  .option-label {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .option-path {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45%;
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
    background: var(--color-success-bg, var(--color-success-bg));
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
