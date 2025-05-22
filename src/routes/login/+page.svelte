<script>
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(async () => {
    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      goto('/');
      return;
    }

    // Listen for login/signup events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        goto('/');
      }
    });
    return () => subscription.unsubscribe();
  });
</script>

<Auth
  supabaseClient={supabase}
  appearance={{ theme: ThemeSupa }}
  providers={[]}
/>
