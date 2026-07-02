<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  /**
   * Native replacement for the deprecated @supabase/auth-ui-svelte Auth
   * component (#86). Feature parity: email/password sign in, sign up,
   * magic link, password reset, and the post-recovery password update.
   *
   * @type {'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password' | 'update_password'}
   */
  export let view = 'sign_in';

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let loading = false;
  /** @type {{ type: 'error' | 'success', text: string } | null} */
  let message = null;

  $: showEmail = view !== 'update_password';
  $: showPassword = view === 'sign_in' || view === 'sign_up' || view === 'update_password';

  const TITLES = {
    sign_in: 'Sign in',
    sign_up: 'Create account',
    magic_link: 'Sign in with magic link',
    forgotten_password: 'Reset your password',
    update_password: 'Set a new password'
  };

  const SUBMIT_LABELS = {
    sign_in: 'Sign in',
    sign_up: 'Sign up',
    magic_link: 'Send magic link',
    forgotten_password: 'Send reset instructions',
    update_password: 'Update password'
  };

  function setView(next) {
    view = next;
    message = null;
    password = '';
  }

  async function handleSubmit() {
    loading = true;
    message = null;

    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Redirect is handled by the page's onAuthStateChange listener.
      } else if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        message = { type: 'success', text: 'Check your email to confirm your account.' };
      } else if (view === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        message = { type: 'success', text: 'Check your email for the login link.' };
      } else if (view === 'forgotten_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        message = { type: 'success', text: 'Check your email for the password reset link.' };
      } else if (view === 'update_password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        message = { type: 'success', text: 'Password updated — you are signed in.' };
        dispatch('passwordUpdated');
      }
    } catch (err) {
      message = { type: 'error', text: err?.message || 'Something went wrong. Please try again.' };
    } finally {
      loading = false;
    }
  }
</script>

<form class="auth-form" on:submit|preventDefault={handleSubmit}>
  <h2 class="auth-title">{TITLES[view]}</h2>

  {#if showEmail}
    <label class="auth-label" for="auth-email">Email address</label>
    <input
      id="auth-email"
      class="auth-input"
      type="email"
      bind:value={email}
      autocomplete="email"
      placeholder="Your email address"
      required
      disabled={loading}
    />
  {/if}

  {#if showPassword}
    <label class="auth-label" for="auth-password">
      {view === 'update_password' ? 'New password' : 'Password'}
    </label>
    <input
      id="auth-password"
      class="auth-input"
      type="password"
      bind:value={password}
      autocomplete={view === 'sign_in' ? 'current-password' : 'new-password'}
      placeholder={view === 'update_password' ? 'Your new password' : 'Your password'}
      minlength="6"
      required
      disabled={loading}
    />
  {/if}

  {#if message}
    <div class="auth-message {message.type}" role={message.type === 'error' ? 'alert' : 'status'}>
      {message.text}
    </div>
  {/if}

  <button class="auth-button" type="submit" disabled={loading}>
    {loading ? 'Please wait…' : SUBMIT_LABELS[view]}
  </button>

  <div class="auth-links">
    {#if view === 'sign_in'}
      <button type="button" class="auth-link" on:click={() => setView('magic_link')}>
        Sign in with magic link
      </button>
      <button type="button" class="auth-link" on:click={() => setView('forgotten_password')}>
        Forgot your password?
      </button>
      <button type="button" class="auth-link" on:click={() => setView('sign_up')}>
        Don't have an account? Sign up
      </button>
    {:else if view === 'sign_up'}
      <button type="button" class="auth-link" on:click={() => setView('sign_in')}>
        Already have an account? Sign in
      </button>
    {:else if view === 'magic_link' || view === 'forgotten_password'}
      <button type="button" class="auth-link" on:click={() => setView('sign_in')}>
        Back to sign in
      </button>
    {/if}
  </div>
</form>

<style>
  .auth-form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .auth-title {
    margin: 0 0 var(--space-4);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: center;
  }

  .auth-label {
    display: block;
    margin-bottom: var(--space-2);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-700);
    font-size: var(--font-size-sm);
  }

  .auth-input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: var(--space-4);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    transition: border-color var(--transition-base);
  }

  .auth-input:focus {
    outline: none;
    border-color: var(--color-brand-primary);
  }

  .auth-button {
    width: 100%;
    padding: 0.875rem;
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    transition: background-color var(--transition-base);
  }

  .auth-button:hover:not(:disabled) {
    background-color: var(--color-brand-primary-hover);
  }

  .auth-button:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .auth-message {
    margin: 0 0 var(--space-4);
    padding: 0.75rem;
    border-radius: var(--radius-lg);
    font-size: 0.9rem;
  }

  .auth-message.error {
    background-color: var(--color-danger-bg-softest);
    color: var(--color-danger);
    border: 1px solid var(--color-danger-bg);
  }

  .auth-message.success {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success-border);
  }

  .auth-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-4);
    text-align: center;
  }

  .auth-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-brand-primary);
    font-size: var(--font-size-sm);
    text-decoration: underline;
  }

  .auth-link:hover {
    color: var(--color-brand-primary-hover);
  }

  /* 16px inputs prevent iOS zoom-on-focus (parity with the old Auth UI config) */
  @media (max-width: 768px) {
    .auth-input {
      font-size: 16px;
    }
  }
</style>
