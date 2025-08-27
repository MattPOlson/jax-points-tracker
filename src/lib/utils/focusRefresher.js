import { onMount } from 'svelte';

export function onTabFocus(callback) {
  onMount(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        callback();
      }
    };

    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
  });
}

// More graceful tab focus handler for Supabase connectivity issues
export function setupGracefulTabRefresh() {
  onMount(() => {
    let isFirstLoad = true;
    let refreshTimeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFirstLoad) {
        console.log('🔄 Tab became visible - initiating graceful refresh');
        
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        // Show a brief loading indicator (if you want to add one)
        // Then do a graceful refresh
        refreshTimeout = setTimeout(() => {
          // Use location.reload() which is more graceful than window.location.reload()
          // It preserves form data and is less jarring
          window.location.reload();
        }, 100); // Small delay to make it feel less abrupt
      }
      isFirstLoad = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });
}
