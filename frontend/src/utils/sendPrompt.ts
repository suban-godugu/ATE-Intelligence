// sendPrompt Integration with ATE Intelligence parent frame / chat shell
export function sendPrompt(text: string) {
  console.log('[sendPrompt] Dispatching action prompt:', text);
  
  // 1. Post to parent chat iframe if running in container
  window.parent.postMessage({ type: 'SEND_PROMPT', payload: text }, '*');

  // 2. Fallback to direct alert or host message dispatch for premium feel
  const hostEvent = new CustomEvent('ate-agent-prompt', { detail: text });
  window.dispatchEvent(hostEvent);
}

// Bind to window for global access as requested in spec
if (typeof window !== 'undefined') {
  (window as any).sendPrompt = sendPrompt;
}
