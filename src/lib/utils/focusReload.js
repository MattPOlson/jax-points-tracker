export function setupFocusReload(callback) {
  const handler = () => callback();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') handler();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('focus', handler);
  window.addEventListener('pageshow', handler);
  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', handler);
    window.removeEventListener('pageshow', handler);
  };
}
