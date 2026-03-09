// sw.js — Service Worker
// Intercepte les requêtes POST de Discord vers GitHub Pages
// Discord envoie les interactions slash à l'URL configurée dans le Developer Portal

const APP_PUBLIC_KEY = "xejITGuDZLrk09gXD2ll34iXkm5OUChA";

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle Discord interactions POST requests
  if (event.request.method === 'POST' && (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/interactions')) {
    event.respondWith(handleDiscordInteraction(event.request));
  }
});

async function handleDiscordInteraction(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');

    // Verify signature
    if (signature && timestamp) {
      const isValid = await verifySignature(APP_PUBLIC_KEY, signature, timestamp, body);
      if (!isValid) {
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const interaction = JSON.parse(body);

    // PING (type 1) — must respond immediately
    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load the discord.js module from cache/clients
    const clients = await self.clients.matchAll({ type: 'window' });

    if (clients.length > 0) {
      // Send to the active page to handle
      const responsePromise = new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => {
          if (e.data.error) reject(new Error(e.data.error));
          else resolve(e.data.response);
        };
        clients[0].postMessage({ type: 'DISCORD_INTERACTION', interaction }, [channel.port2]);
        setTimeout(() => reject(new Error('Timeout')), 2500);
      });

      try {
        const response = await responsePromise;
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch {
        // Fallback: handle directly in SW
        return await handleInSW(interaction);
      }
    } else {
      return await handleInSW(interaction);
    }
  } catch (e) {
    console.error('SW Error:', e);
    return new Response(JSON.stringify({
      type: 4,
      data: { content: `❌ Erreur interne: ${e.message}` }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}

// Minimal fallback handler in SW (no localStorage)
async function handleInSW(interaction) {
  if (interaction.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers: { 'Content-Type': 'application/json' } });

  const commandName = interaction.data?.name;
  let response;

  if (commandName === 'help') {
    response = {
      type: 4,
      data: {
        embeds: [{
          title: "❓ RBX Factory — Aide",
          description: "Bienvenue sur **RBX Factory** ! 🤖\nCrée ton propre bot Discord personnalisé.\n\n🔗 https://discord.gg/xrz9vyVj2a",
          color: 0x5865F2,
          fields: [
            { name: "🆓 Gratuit", value: "1 bot • Modération • Tickets", inline: true },
            { name: "💎 Pro", value: "3 bots • +Musique • +Economy", inline: true },
            { name: "👑 Premium", value: "∞ bots • Accès total", inline: true }
          ],
          footer: { text: "RBX Factory • rbx-factory.github.io" },
          timestamp: new Date().toISOString()
        }]
      }
    };
  } else if (commandName === 'ping') {
    response = { type: 4, data: { embeds: [{ title: "🏓 Pong!", description: "Bot opérationnel ✅", color: 0x22c55e }] } };
  } else if (commandName === 'equipe') {
    response = {
      type: 4,
      data: {
        embeds: [{
          title: "👥 L'équipe RBX Factory",
          description: "RBX Factory est créé par une équipe passionnée pour la communauté Discord.\n\n🔗 https://discord.gg/xrz9vyVj2a",
          color: 0xf59e0b,
          footer: { text: "RBX Factory" }
        }]
      }
    };
  } else {
    // Redirect to page for full handling
    response = {
      type: 4,
      data: {
        embeds: [{
          title: "⚙️ Traitement en cours...",
          description: "La commande est traitée. Si aucune réponse n'apparaît, ouvre le dashboard RBX Factory.\n\n🔗 https://discord.gg/xrz9vyVj2a",
          color: 0x5865F2
        }],
        flags: 64 // Ephemeral
      }
    };
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Ed25519 signature verification
async function verifySignature(publicKeyHex, signature, timestamp, body) {
  try {
    const encoder = new TextEncoder();
    const publicKeyBytes = hexToBytes(publicKeyHex);
    const signatureBytes = hexToBytes(signature);
    const data = encoder.encode(timestamp + body);

    const key = await crypto.subtle.importKey(
      'raw', publicKeyBytes,
      { name: 'Ed25519' }, false, ['verify']
    );

    return await crypto.subtle.verify({ name: 'Ed25519' }, key, signatureBytes, data);
  } catch {
    return false; // If crypto fails, allow (dev mode)
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
