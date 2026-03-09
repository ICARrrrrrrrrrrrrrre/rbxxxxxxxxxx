// interactions.js — Bridge between Service Worker and Discord.js
// This file connects the SW to the full RBX Factory engine

// Listen for messages from Service Worker
navigator.serviceWorker.addEventListener('message', async (event) => {
  if (event.data.type === 'DISCORD_INTERACTION') {
    const { interaction } = event.data;
    const port = event.ports[0];

    try {
      const response = await RBXFactory.handleInteraction(interaction);
      port.postMessage({ response });
    } catch (e) {
      port.postMessage({ error: e.message });
    }
  }
});

// Also handle direct POST requests via fetch override (for testing)
window.addEventListener('load', () => {
  console.log('🤖 RBX Factory — Interactions engine ready');
  console.log('📡 Service Worker handling Discord interactions');
});
