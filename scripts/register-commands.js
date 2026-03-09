// scripts/register-commands.js
// Run by GitHub Actions to register all slash commands
const BOT_TOKEN = process.env.BOT_TOKEN || "MTQzMjI4OTM1MTAzNDk5ODgzNA.GXoxeo.87qOso0AUBrLoZD8o6rtogSILXBsBLt1zYZKlM";
const APP_ID = process.env.APP_ID || "1432289351034998834";

const commands = [
  { name: "createbot", description: "🤖 Créer votre bot Discord personnalisé avec RBX Factory", options: [
    { type: 3, name: "nom", description: "Nom de votre bot", required: true },
    { type: 3, name: "description", description: "Description de votre bot", required: true },
    { type: 3, name: "prefix", description: "Préfixe des commandes (ex: !)", required: false },
    { type: 3, name: "couleur", description: "Couleur hex des embeds (ex: #ff0000)", required: false },
    { type: 3, name: "token", description: "Token de votre bot Discord", required: false }
  ]},
  { name: "monbot", description: "📊 Gérer votre bot", options: [
    { type: 3, name: "action", description: "Action", required: false, choices: [
      { name: "status", value: "status" }, { name: "configurer", value: "config" },
      { name: "supprimer", value: "delete" }, { name: "modules", value: "modules" }
    ]}
  ]},
  { name: "plan", description: "💎 Voir votre plan actuel" },
  { name: "help", description: "❓ Aide RBX Factory" },
  { name: "equipe", description: "👥 L'équipe RBX Factory" },
  { name: "ping", description: "🏓 Latence du bot" },
  { name: "ban", description: "🔨 Bannir un membre", options: [{ type: 6, name: "membre", description: "Membre", required: true }, { type: 3, name: "raison", description: "Raison", required: false }] },
  { name: "kick", description: "👢 Expulser un membre", options: [{ type: 6, name: "membre", description: "Membre", required: true }, { type: 3, name: "raison", description: "Raison", required: false }] },
  { name: "mute", description: "🔇 Mute un membre", options: [{ type: 6, name: "membre", description: "Membre", required: true }, { type: 3, name: "duree", description: "Durée (ex: 10m)", required: true }, { type: 3, name: "raison", description: "Raison", required: false }] },
  { name: "warn", description: "⚠️ Avertir un membre", options: [{ type: 6, name: "membre", description: "Membre", required: true }, { type: 3, name: "raison", description: "Raison", required: true }] },
  { name: "clear", description: "🗑️ Supprimer des messages", options: [{ type: 4, name: "nombre", description: "Nombre (1-100)", required: true, min_value: 1, max_value: 100 }] },
  { name: "slowmode", description: "🐢 Slowmode", options: [{ type: 4, name: "secondes", description: "Secondes", required: true, min_value: 0, max_value: 21600 }] },
  { name: "lock", description: "🔒 Verrouiller un salon" },
  { name: "unlock", description: "🔓 Déverrouiller un salon" },
  { name: "ticket", description: "🎫 Tickets support", options: [{ type: 3, name: "action", description: "Action", required: true, choices: [{ name: "créer", value: "create" }, { name: "fermer", value: "close" }, { name: "setup", value: "setup" }] }, { type: 3, name: "sujet", description: "Sujet", required: false }] },
  { name: "logs", description: "📋 Logs du serveur", options: [{ type: 3, name: "action", description: "Action", required: true, choices: [{ name: "activer", value: "enable" }, { name: "désactiver", value: "disable" }, { name: "salon", value: "setchannel" }] }, { type: 7, name: "salon", description: "Salon", required: false }] },
  { name: "antiraid", description: "🛡️ Anti-raid", options: [{ type: 3, name: "action", description: "Action", required: true, choices: [{ name: "activer", value: "enable" }, { name: "désactiver", value: "disable" }, { name: "status", value: "status" }] }] },
  { name: "play", description: "🎵 Jouer de la musique [Pro/Premium]", options: [{ type: 3, name: "query", description: "Titre ou URL", required: true }] },
  { name: "skip", description: "⏭️ Passer [Pro/Premium]" },
  { name: "stop", description: "⏹️ Arrêter [Pro/Premium]" },
  { name: "queue", description: "📋 File d'attente [Pro/Premium]" },
  { name: "volume", description: "🔊 Volume [Pro/Premium]", options: [{ type: 4, name: "niveau", description: "0-100", required: true, min_value: 0, max_value: 100 }] },
  { name: "balance", description: "💰 Solde [Pro/Premium]", options: [{ type: 6, name: "membre", description: "Membre", required: false }] },
  { name: "daily", description: "📅 Récompense quotidienne [Pro/Premium]" },
  { name: "work", description: "💼 Travailler [Pro/Premium]" },
  { name: "shop", description: "🏪 Boutique [Pro/Premium]" },
  { name: "transfer", description: "💸 Transférer des coins [Pro/Premium]", options: [{ type: 6, name: "membre", description: "Destinataire", required: true }, { type: 4, name: "montant", description: "Montant", required: true, min_value: 1 }] },
  { name: "rank", description: "⭐ Rang [Pro/Premium]", options: [{ type: 6, name: "membre", description: "Membre", required: false }] },
  { name: "leaderboard", description: "🏆 Classement [Pro/Premium]" },
  { name: "sondage", description: "📊 Créer un sondage [Pro/Premium]", options: [{ type: 3, name: "question", description: "Question", required: true }, { type: 3, name: "option1", description: "Option 1", required: true }, { type: 3, name: "option2", description: "Option 2", required: true }, { type: 3, name: "option3", description: "Option 3", required: false }, { type: 3, name: "option4", description: "Option 4", required: false }] },
  { name: "giveaway", description: "🎉 Giveaway [Pro/Premium]", options: [{ type: 3, name: "prix", description: "Prix", required: true }, { type: 3, name: "duree", description: "Durée", required: true }, { type: 4, name: "gagnants", description: "Gagnants", required: false, min_value: 1, max_value: 10 }] },
  { name: "annonce", description: "📢 Annonce [Pro/Premium]", options: [{ type: 3, name: "message", description: "Message", required: true }, { type: 7, name: "salon", description: "Salon", required: false }] },
  { name: "embed", description: "📝 Embed personnalisé [Pro/Premium]", options: [{ type: 3, name: "titre", description: "Titre", required: true }, { type: 3, name: "description", description: "Description", required: true }, { type: 3, name: "couleur", description: "Couleur hex", required: false }] },
  { name: "rappel", description: "⏰ Rappel [Pro/Premium]", options: [{ type: 3, name: "message", description: "Message", required: true }, { type: 3, name: "duree", description: "Durée", required: true }] },
  { name: "roleinfo", description: "ℹ️ Infos rôle [Premium]", options: [{ type: 8, name: "role", description: "Rôle", required: true }] },
  { name: "serverinfo", description: "🏠 Infos serveur" },
  { name: "userinfo", description: "👤 Infos utilisateur", options: [{ type: 6, name: "membre", description: "Membre", required: false }] },
  { name: "autorole", description: "🎭 AutoRole [Pro/Premium]", options: [{ type: 3, name: "action", description: "Action", required: true, choices: [{ name: "définir", value: "set" }, { name: "supprimer", value: "remove" }] }, { type: 8, name: "role", description: "Rôle", required: false }] },
  { name: "reactionrole", description: "⚡ Reaction Role [Premium]", options: [{ type: 3, name: "message_id", description: "ID du message", required: true }, { type: 3, name: "emoji", description: "Emoji", required: true }, { type: 8, name: "role", description: "Rôle", required: true }] },
  { name: "welcome", description: "👋 Bienvenue", options: [{ type: 3, name: "action", description: "Action", required: true, choices: [{ name: "activer", value: "enable" }, { name: "désactiver", value: "disable" }, { name: "message", value: "setmessage" }, { name: "salon", value: "setchannel" }, { name: "test", value: "test" }] }, { type: 3, name: "valeur", description: "Valeur", required: false }] }
];

async function register() {
  const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
    method: "PUT",
    headers: { "Authorization": `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  const data = await res.json();
  if (!res.ok) { console.error("❌ Erreur:", JSON.stringify(data, null, 2)); process.exit(1); }
  console.log(`✅ ${data.length} commandes enregistrées avec succès !`);
}

register().catch(console.error);
