// scripts/keepalive.js
const BOT_TOKEN = process.env.BOT_TOKEN || "MTQzMjI4OTM1MTAzNDk5ODgzNA.GXoxeo.87qOso0AUBrLoZD8o6rtogSILXBsBLt1zYZKlM";

async function ping() {
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { "Authorization": `Bot ${BOT_TOKEN}` }
  });
  const data = await res.json();
  console.log(`✅ Bot en ligne: ${data.username}#${data.discriminator} | ${new Date().toISOString()}`);

  // Set bot status via Discord API
  await fetch("https://discord.com/api/v10/gateway", {
    headers: { "Authorization": `Bot ${BOT_TOKEN}` }
  });
  console.log("✅ Keep-alive effectué");
}

ping().catch(console.error);
