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

  // Discord OAuth (#50). Implicit flow: tokens come back to /login in the
  // URL hash, detectSessionInUrl consumes them, and the login page's
  // onAuthStateChange handles the redirect -- same path as magic links.
  // Members with a matching verified email are linked to their existing
  // account by Supabase; anyone else gets a fresh account (open signup,
  // same as email).
  async function signInWithDiscord() {
    loading = true;
    message = null;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: `${window.location.origin}/login` }
      });
      if (error) throw error;
      // The browser is about to navigate away to Discord.
    } catch (err) {
      message = { type: 'error', text: err?.message || 'Could not start Discord sign-in.' };
      loading = false;
    }
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

  {#if view === 'sign_in' || view === 'sign_up'}
    <div class="auth-divider" role="separator"><span>or</span></div>
    <button
      type="button"
      class="discord-button"
      disabled={loading}
      on:click={signInWithDiscord}
    >
      <svg class="discord-mark" viewBox="0 0 127.14 96.36" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"
        />
      </svg>
      Continue with Discord
    </button>
  {/if}

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

  .auth-divider {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: var(--space-4) 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    border-top: 1px solid var(--color-gray-200);
  }

  .discord-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: 0.875rem;
    background-color: #5865f2; /* Discord blurple */
    color: #ffffff;
    border: none;
    border-radius: var(--radius-button);
    cursor: pointer;
    font-size: 1rem;
    font-weight: var(--font-weight-semibold);
    transition: background-color var(--transition-base);
  }

  .discord-button:hover:not(:disabled) {
    background-color: #4752c4;
  }

  .discord-button:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .discord-mark {
    width: 20px;
    height: 16px;
    flex-shrink: 0;
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
