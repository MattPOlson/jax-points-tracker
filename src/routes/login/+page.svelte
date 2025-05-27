<script>
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { browser } from '$app/environment';

  let subscription;
  let redirectTo = '';

  onMount(() => {
    if (browser) {
      redirectTo = window.location.origin;
    }

    const init = async () => {
      try {
        // Check if user is already logged in
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          console.log('User already logged in:', session.user.id);
          user.set(session.user);
          goto('/');
          return;
        }

        // Listen for login/signup events
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Auth state changed:', _event, session?.user?.id);
          if (session?.user) {
            user.set(session.user);
            goto('/');
          }
        });

        subscription = data.subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        user.set(null);
      }
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  });
</script>

<div class="auth-wrapper">
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    providers={[]}
    redirectTo={redirectTo}
  />
</div>

<style>
  .auth-wrapper {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
  }

  :global(.supabase-auth-ui_ui-container) {
    width: 100%;
  }

  :global(.supabase-auth-ui_ui-input) {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  :global(.supabase-auth-ui_ui-button) {
    width: 100%;
    padding: 0.75rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  :global(.supabase-auth-ui_ui-button:hover) {
    background-color: #388e3c;
  }

  :global(.supabase-auth-ui_ui-label) {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  :global(.supabase-auth-ui_ui-message) {
    margin: 1rem 0;
    padding: 0.5rem;
    border-radius: 4px;
  }

  :global(.supabase-auth-ui_ui-message.error) {
    background-color: #ffebee;
    color: #c62828;
  }
</style>
