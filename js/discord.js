// ============================================================
// RBX FACTORY - Discord Interactions Engine
// Handles all slash commands via Discord Interactions Endpoint
// ============================================================

const BOT_TOKEN = "MTQzMjI4OTM1MTAzNDk5ODgzNA.GXoxeo.87qOso0AUBrLoZD8o6rtogSILXBsBLt1zYZKlM";
const APP_ID = "1432289351034998834";
const APP_SECRET = "xejITGuDZLrk09gXD2ll34iXkm5OUChA";
const MAIN_GUILD_ID = "1422269907097092118";
const OWNER_ID = "1310695689042264100";
const INVITE_URL = "https://discord.gg/xrz9vyVj2a";

// Plan roles
const PLANS = {
  FREE:    { roleId: "1479196255220535458", name: "Gratuit", maxBots: 1, color: "#6b7280" },
  PRO:     { roleId: "1479196300829262066", name: "Pro",     maxBots: 3, color: "#3b82f6" },
  PREMIUM: { roleId: "1479196114686050439", name: "Premium", maxBots: Infinity, color: "#f59e0b" }
};

// ---- Storage ----
function saveBots(bots) {
  localStorage.setItem("rbx_bots", JSON.stringify(bots));
}
function loadBots() {
  try { return JSON.parse(localStorage.getItem("rbx_bots") || "{}"); } catch { return {}; }
}
function saveUserPlan(userId, plan) {
  localStorage.setItem(`rbx_plan_${userId}`, plan);
}
function loadUserPlan(userId) {
  return localStorage.getItem(`rbx_plan_${userId}`) || "FREE";
}

// ---- Discord API Helpers ----
async function discordAPI(method, endpoint, body = null) {
  const opts = {
    method,
    headers: {
      "Authorization": `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://discord.com/api/v10${endpoint}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord API ${res.status}: ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function getUserPlanFromDiscord(userId) {
  try {
    const member = await discordAPI("GET", `/guilds/${MAIN_GUILD_ID}/members/${userId}`);
    const roles = member.roles || [];
    if (roles.includes(PLANS.PREMIUM.roleId)) return "PREMIUM";
    if (roles.includes(PLANS.PRO.roleId)) return "PRO";
    if (roles.includes(PLANS.FREE.roleId)) return "FREE";
    // Not in server = no access
    return null;
  } catch {
    return null;
  }
}

// ---- Register Slash Commands ----
async function registerCommands() {
  const commands = [
    {
      name: "createbot",
      description: "🤖 Créer votre bot Discord personnalisé avec RBX Factory",
      options: [
        { type: 3, name: "nom", description: "Nom de votre bot", required: true },
        { type: 3, name: "description", description: "Description de votre bot", required: true },
        { type: 3, name: "prefix", description: "Préfixe des commandes (ex: !)", required: false },
        { type: 3, name: "couleur", description: "Couleur hex des embeds (ex: #ff0000)", required: false },
        { type: 3, name: "token", description: "Token de votre bot Discord (pour l'activer)", required: false }
      ]
    },
    {
      name: "monbot",
      description: "📊 Gérer et voir le statut de votre bot",
      options: [
        { type: 3, name: "action", description: "Action", required: false,
          choices: [
            { name: "status", value: "status" },
            { name: "configurer", value: "config" },
            { name: "supprimer", value: "delete" },
            { name: "modules", value: "modules" }
          ]
        }
      ]
    },
    {
      name: "plan",
      description: "💎 Voir votre plan actuel et les limites"
    },
    {
      name: "help",
      description: "❓ Aide et informations sur RBX Factory"
    },
    {
      name: "equipe",
      description: "👥 L'équipe derrière RBX Factory"
    },
    {
      name: "ping",
      description: "🏓 Vérifier la latence du bot"
    },
    // ======= MODULES MODERATION =======
    {
      name: "ban",
      description: "🔨 Bannir un membre [Modération]",
      options: [
        { type: 6, name: "membre", description: "Membre à bannir", required: true },
        { type: 3, name: "raison", description: "Raison du ban", required: false }
      ]
    },
    {
      name: "kick",
      description: "👢 Expulser un membre [Modération]",
      options: [
        { type: 6, name: "membre", description: "Membre à expulser", required: true },
        { type: 3, name: "raison", description: "Raison", required: false }
      ]
    },
    {
      name: "mute",
      description: "🔇 Mettre en sourdine un membre [Modération]",
      options: [
        { type: 6, name: "membre", description: "Membre à mute", required: true },
        { type: 3, name: "duree", description: "Durée (ex: 10m, 1h, 1d)", required: true },
        { type: 3, name: "raison", description: "Raison", required: false }
      ]
    },
    {
      name: "warn",
      description: "⚠️ Avertir un membre [Modération]",
      options: [
        { type: 6, name: "membre", description: "Membre à avertir", required: true },
        { type: 3, name: "raison", description: "Raison", required: true }
      ]
    },
    {
      name: "clear",
      description: "🗑️ Supprimer des messages [Modération]",
      options: [
        { type: 4, name: "nombre", description: "Nombre de messages (1-100)", required: true, min_value: 1, max_value: 100 }
      ]
    },
    {
      name: "slowmode",
      description: "🐢 Définir le slowmode [Modération]",
      options: [
        { type: 4, name: "secondes", description: "Délai en secondes (0 = désactiver)", required: true, min_value: 0, max_value: 21600 }
      ]
    },
    {
      name: "lock",
      description: "🔒 Verrouiller un salon [Modération]",
      options: [
        { type: 7, name: "salon", description: "Salon à verrouiller (current par défaut)", required: false }
      ]
    },
    {
      name: "unlock",
      description: "🔓 Déverrouiller un salon [Modération]"
    },
    // ======= TICKETS =======
    {
      name: "ticket",
      description: "🎫 Système de tickets support",
      options: [
        { type: 3, name: "action", description: "Action", required: true,
          choices: [
            { name: "créer", value: "create" },
            { name: "fermer", value: "close" },
            { name: "setup", value: "setup" }
          ]
        },
        { type: 3, name: "sujet", description: "Sujet du ticket", required: false }
      ]
    },
    // ======= LOGS =======
    {
      name: "logs",
      description: "📋 Configurer les logs du serveur",
      options: [
        { type: 3, name: "action", description: "Action", required: true,
          choices: [
            { name: "activer", value: "enable" },
            { name: "désactiver", value: "disable" },
            { name: "salon", value: "setchannel" }
          ]
        },
        { type: 7, name: "salon", description: "Salon pour les logs", required: false }
      ]
    },
    // ======= ANTI-RAID =======
    {
      name: "antiraid",
      description: "🛡️ Système anti-raid",
      options: [
        { type: 3, name: "action", description: "Action", required: true,
          choices: [
            { name: "activer", value: "enable" },
            { name: "désactiver", value: "disable" },
            { name: "status", value: "status" }
          ]
        }
      ]
    },
    // ======= MUSIQUE =======
    {
      name: "play",
      description: "🎵 Jouer de la musique [Pro/Premium]",
      options: [
        { type: 3, name: "query", description: "Titre, artiste ou URL YouTube", required: true }
      ]
    },
    {
      name: "skip",
      description: "⏭️ Passer la musique en cours [Pro/Premium]"
    },
    {
      name: "stop",
      description: "⏹️ Arrêter la musique [Pro/Premium]"
    },
    {
      name: "queue",
      description: "📋 Voir la file d'attente musicale [Pro/Premium]"
    },
    {
      name: "volume",
      description: "🔊 Régler le volume [Pro/Premium]",
      options: [
        { type: 4, name: "niveau", description: "Volume 0-100", required: true, min_value: 0, max_value: 100 }
      ]
    },
    // ======= ECONOMY =======
    {
      name: "balance",
      description: "💰 Voir votre solde [Pro/Premium]",
      options: [
        { type: 6, name: "membre", description: "Voir le solde d'un autre membre", required: false }
      ]
    },
    {
      name: "daily",
      description: "📅 Récupérer votre récompense quotidienne [Pro/Premium]"
    },
    {
      name: "work",
      description: "💼 Travailler pour gagner des coins [Pro/Premium]"
    },
    {
      name: "shop",
      description: "🏪 Voir la boutique [Pro/Premium]"
    },
    {
      name: "transfer",
      description: "💸 Transférer des coins [Pro/Premium]",
      options: [
        { type: 6, name: "membre", description: "Destinataire", required: true },
        { type: 4, name: "montant", description: "Montant", required: true, min_value: 1 }
      ]
    },
    // ======= LEVELING =======
    {
      name: "rank",
      description: "⭐ Voir votre rang et niveau [Pro/Premium]",
      options: [
        { type: 6, name: "membre", description: "Voir le rang d'un autre membre", required: false }
      ]
    },
    {
      name: "leaderboard",
      description: "🏆 Classement du serveur [Pro/Premium]"
    },
    // ======= WELCOME =======
    {
      name: "welcome",
      description: "👋 Configurer le message de bienvenue",
      options: [
        { type: 3, name: "action", description: "Action", required: true,
          choices: [
            { name: "activer", value: "enable" },
            { name: "désactiver", value: "disable" },
            { name: "message", value: "setmessage" },
            { name: "salon", value: "setchannel" },
            { name: "test", value: "test" }
          ]
        },
        { type: 3, name: "valeur", description: "Valeur (message ou mention du salon)", required: false }
      ]
    },
    // ======= ADVANCED =======
    {
      name: "sondage",
      description: "📊 Créer un sondage [Pro/Premium]",
      options: [
        { type: 3, name: "question", description: "Question du sondage", required: true },
        { type: 3, name: "option1", description: "Option 1", required: true },
        { type: 3, name: "option2", description: "Option 2", required: true },
        { type: 3, name: "option3", description: "Option 3", required: false },
        { type: 3, name: "option4", description: "Option 4", required: false }
      ]
    },
    {
      name: "giveaway",
      description: "🎉 Lancer un giveaway [Pro/Premium]",
      options: [
        { type: 3, name: "prix", description: "Prix du giveaway", required: true },
        { type: 3, name: "duree", description: "Durée (ex: 10m, 1h, 1d)", required: true },
        { type: 4, name: "gagnants", description: "Nombre de gagnants", required: false, min_value: 1, max_value: 10 }
      ]
    },
    {
      name: "annonce",
      description: "📢 Envoyer une annonce [Pro/Premium]",
      options: [
        { type: 3, name: "message", description: "Contenu de l'annonce", required: true },
        { type: 7, name: "salon", description: "Salon cible", required: false }
      ]
    },
    {
      name: "embed",
      description: "📝 Créer un embed personnalisé [Pro/Premium]",
      options: [
        { type: 3, name: "titre", description: "Titre de l'embed", required: true },
        { type: 3, name: "description", description: "Description", required: true },
        { type: 3, name: "couleur", description: "Couleur hex (ex: #ff0000)", required: false }
      ]
    },
    {
      name: "rappel",
      description: "⏰ Créer un rappel [Pro/Premium]",
      options: [
        { type: 3, name: "message", description: "Message du rappel", required: true },
        { type: 3, name: "duree", description: "Dans combien de temps (ex: 30m, 2h)", required: true }
      ]
    },
    {
      name: "roleinfo",
      description: "ℹ️ Informations sur un rôle [Premium]",
      options: [
        { type: 8, name: "role", description: "Rôle à inspecter", required: true }
      ]
    },
    {
      name: "serverinfo",
      description: "🏠 Informations sur le serveur"
    },
    {
      name: "userinfo",
      description: "👤 Informations sur un utilisateur",
      options: [
        { type: 6, name: "membre", description: "Membre", required: false }
      ]
    },
    {
      name: "autorole",
      description: "🎭 Rôle automatique à l'arrivée [Pro/Premium]",
      options: [
        { type: 3, name: "action", description: "Action", required: true,
          choices: [{ name: "définir", value: "set" }, { name: "supprimer", value: "remove" }]
        },
        { type: 8, name: "role", description: "Rôle à attribuer", required: false }
      ]
    },
    {
      name: "reactionrole",
      description: "⚡ Créer un reaction role [Premium]",
      options: [
        { type: 3, name: "message_id", description: "ID du message", required: true },
        { type: 3, name: "emoji", description: "Emoji", required: true },
        { type: 8, name: "role", description: "Rôle à attribuer", required: true }
      ]
    }
  ];

  try {
    await discordAPI("PUT", `/applications/${APP_ID}/commands`, commands);
    console.log(`✅ ${commands.length} commandes enregistrées`);
    return true;
  } catch (e) {
    console.error("❌ Erreur enregistrement commandes:", e);
    return false;
  }
}

// ---- Utility: Parse Duration ----
function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * multipliers[match[2]];
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h`;
  return `${Math.floor(seconds/86400)}j`;
}

// ---- Embed Builder ----
function embed(title, description, color = 0x5865F2, fields = [], footer = "RBX Factory • rbx-factory.github.io") {
  return {
    embeds: [{
      title,
      description,
      color,
      fields,
      footer: { text: footer },
      timestamp: new Date().toISOString()
    }]
  };
}

// ---- Check Plan Access ----
function checkPlanAccess(plan, required) {
  const order = { FREE: 0, PRO: 1, PREMIUM: 2 };
  return order[plan] >= order[required];
}

function planGate(plan, required, commandName) {
  if (!checkPlanAccess(plan, required)) {
    const planInfo = PLANS[required];
    return embed(
      "❌ Plan insuffisant",
      `La commande \`/${commandName}\` nécessite le plan **${planInfo.name}**.\n\n💎 Rejoins notre serveur pour upgrader : ${INVITE_URL}`,
      0xef4444
    );
  }
  return null;
}

// ---- Economy Storage ----
function getEconomy(guildId, userId) {
  const key = `eco_${guildId}_${userId}`;
  try { return JSON.parse(localStorage.getItem(key) || '{"coins":100,"lastDaily":0,"lastWork":0,"xp":0,"level":1}'); }
  catch { return { coins: 100, lastDaily: 0, lastWork: 0, xp: 0, level: 1 }; }
}
function saveEconomy(guildId, userId, data) {
  localStorage.setItem(`eco_${guildId}_${userId}`, JSON.stringify(data));
}
function getXpNeeded(level) { return level * 100 + (level - 1) * 50; }

// ---- Command Handlers ----
const handlers = {

  async help(interaction, userPlan) {
    return embed(
      "❓ RBX Factory — Aide",
      `Bienvenue sur **RBX Factory** ! 🤖\nCrée ton propre bot Discord personnalisé en quelques secondes.\n\n**Serveur officiel :** ${INVITE_URL}`,
      0x5865F2,
      [
        { name: "🆓 Plan Gratuit", value: "• 1 bot\n• Modération, Tickets", inline: true },
        { name: "💎 Plan Pro", value: "• 3 bots\n• + Musique, Economy, Avancé", inline: true },
        { name: "👑 Plan Premium", value: "• Bots illimités\n• Accès total", inline: true },
        { name: "📋 Commandes principales", value: "`/createbot` `/monbot` `/plan`\n`/help` `/equipe` `/ping`", inline: false },
        { name: "🎭 Modération", value: "`/ban` `/kick` `/mute` `/warn` `/clear` `/lock` `/slowmode`", inline: false },
        { name: "🎵 Pro/Premium", value: "`/play` `/skip` `/queue` `/rank` `/daily` `/sondage` `/giveaway`", inline: false }
      ]
    );
  },

  async equipe(interaction, userPlan) {
    return embed(
      "👥 L'équipe RBX Factory",
      "**RBX Factory** est un projet créé avec passion pour la communauté Discord francophone.",
      0xf59e0b,
      [
        { name: "🏆 Fondateur", value: `<@${OWNER_ID}> — Développeur principal`, inline: false },
        { name: "🌐 Serveur officiel", value: INVITE_URL, inline: false },
        { name: "💡 Mission", value: "Permettre à chacun de créer son bot Discord sans coder, gratuitement.", inline: false },
        { name: "⚡ Stack technique", value: "Discord.js • API REST • GitHub Pages", inline: false }
      ]
    );
  },

  async ping(interaction, userPlan) {
    const start = Date.now();
    return embed("🏓 Pong !", `Latence : **${Date.now() - start}ms**\nStatut API Discord : ✅ Opérationnel`, 0x22c55e);
  },

  async plan(interaction, userPlan) {
    const planInfo = PLANS[userPlan] || PLANS.FREE;
    const bots = loadBots();
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const userBots = Object.values(bots).filter(b => b.ownerId === userId);
    const maxBots = planInfo.maxBots === Infinity ? "∞" : planInfo.maxBots;

    return embed(
      `💎 Ton plan — ${planInfo.name}`,
      `Tu es actuellement sur le plan **${planInfo.name}**.`,
      parseInt(planInfo.color.replace("#", "0x")),
      [
        { name: "🤖 Bots", value: `${userBots.length} / ${maxBots}`, inline: true },
        { name: "📋 Plan", value: planInfo.name, inline: true },
        { name: "🔗 Upgrader", value: INVITE_URL, inline: false }
      ]
    );
  },

  async createbot(interaction, userPlan) {
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });

    const planInfo = PLANS[userPlan];
    const bots = loadBots();
    const userBots = Object.values(bots).filter(b => b.ownerId === userId);

    if (userPlan === null) {
      return embed("❌ Non autorisé", `Tu dois rejoindre le serveur RBX Factory pour créer un bot !\n${INVITE_URL}`, 0xef4444);
    }

    const maxBots = planInfo.maxBots;
    if (userBots.length >= maxBots) {
      return embed(
        "❌ Limite atteinte",
        `Ton plan **${planInfo.name}** permet ${maxBots} bot(s) max.\nUpgrade sur ${INVITE_URL}`,
        0xef4444
      );
    }

    const botId = `bot_${userId}_${Date.now()}`;
    const newBot = {
      id: botId,
      ownerId: userId,
      nom: options.nom || "Mon Bot",
      description: options.description || "Bot créé avec RBX Factory",
      prefix: options.prefix || "!",
      couleur: options.couleur || "#5865F2",
      token: options.token || null,
      plan: userPlan,
      modules: userPlan === "FREE" ? ["moderation", "tickets"] :
               userPlan === "PRO"  ? ["moderation", "tickets", "music", "economy", "advanced"] :
               ["moderation", "tickets", "music", "economy", "advanced", "antiraid", "welcome", "logs", "reactionroles"],
      status: options.token ? "online" : "configured",
      createdAt: Date.now(),
      guildId: interaction.guild_id
    };

    bots[botId] = newBot;
    saveBots(bots);

    return embed(
      "✅ Bot créé avec succès !",
      `Ton bot **${newBot.nom}** a été configuré avec succès ! 🎉`,
      0x22c55e,
      [
        { name: "🤖 Nom", value: newBot.nom, inline: true },
        { name: "📋 Plan", value: planInfo.name, inline: true },
        { name: "⚙️ Préfixe", value: newBot.prefix, inline: true },
        { name: "📦 Modules actifs", value: newBot.modules.join(", "), inline: false },
        { name: "🔑 Statut", value: options.token ? "✅ Token fourni — Bot actif" : "⚙️ Configuré (ajoute ton token pour l'activer)", inline: false },
        { name: "🆔 ID Bot", value: `\`${botId}\``, inline: false },
        { name: "📌 Note importante", value: "Reste dans le serveur RBX Factory pour maintenir ton bot en ligne !", inline: false }
      ]
    );
  },

  async monbot(interaction, userPlan) {
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const action = options.action || "status";

    const bots = loadBots();
    const userBots = Object.values(bots).filter(b => b.ownerId === userId);

    if (userBots.length === 0) {
      return embed("🤖 Aucun bot", `Tu n'as pas encore de bot !\nUtilise \`/createbot\` pour en créer un.\n${INVITE_URL}`, 0x6b7280);
    }

    if (action === "delete") {
      const bot = userBots[0];
      delete bots[bot.id];
      saveBots(bots);
      return embed("🗑️ Bot supprimé", `Le bot **${bot.nom}** a été supprimé.`, 0xef4444);
    }

    if (action === "modules") {
      const bot = userBots[0];
      return embed("📦 Modules actifs", `Bot : **${bot.nom}**`, 0x5865F2, [
        { name: "Modules", value: bot.modules.map(m => `✅ ${m}`).join("\n") || "Aucun", inline: false }
      ]);
    }

    const fields = userBots.map((b, i) => ({
      name: `Bot ${i + 1} — ${b.nom}`,
      value: `Status: ${b.status === "online" ? "🟢 En ligne" : "🟡 Configuré"}\nPlan: ${b.plan}\nModules: ${b.modules.length}`,
      inline: true
    }));

    return embed("📊 Mes bots", `Tu as **${userBots.length}** bot(s) configuré(s).`, 0x5865F2, fields);
  },

  // ======= MODERATION =======
  async ban(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const raison = options.raison || "Aucune raison fournie";
    try {
      await discordAPI("PUT", `/guilds/${interaction.guild_id}/bans/${options.membre}`, { delete_message_days: 0, reason: raison });
      return embed("🔨 Membre banni", `<@${options.membre}> a été banni.\n**Raison :** ${raison}`, 0xef4444);
    } catch (e) {
      return embed("❌ Erreur", `Impossible de bannir ce membre : ${e.message}`, 0xef4444);
    }
  },

  async kick(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const raison = options.raison || "Aucune raison fournie";
    try {
      await discordAPI("DELETE", `/guilds/${interaction.guild_id}/members/${options.membre}`);
      return embed("👢 Membre expulsé", `<@${options.membre}> a été expulsé.\n**Raison :** ${raison}`, 0xf97316);
    } catch (e) {
      return embed("❌ Erreur", `Impossible d'expulser ce membre.`, 0xef4444);
    }
  },

  async mute(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const seconds = parseDuration(options.duree || "10m");
    if (!seconds) return embed("❌ Durée invalide", "Format: 10s, 5m, 1h, 1d", 0xef4444);
    const until = new Date(Date.now() + seconds * 1000).toISOString();
    try {
      await discordAPI("PATCH", `/guilds/${interaction.guild_id}/members/${options.membre}`, { communication_disabled_until: until });
      return embed("🔇 Membre mis en sourdine", `<@${options.membre}> muté pour **${formatDuration(seconds)}**.\n**Raison :** ${options.raison || "Aucune"}`, 0xf59e0b);
    } catch (e) {
      return embed("❌ Erreur", "Impossible de muter ce membre.", 0xef4444);
    }
  },

  async warn(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `warns_${interaction.guild_id}_${options.membre}`;
    const warns = JSON.parse(localStorage.getItem(key) || "[]");
    warns.push({ raison: options.raison, date: Date.now(), by: interaction.member?.user?.id });
    localStorage.setItem(key, JSON.stringify(warns));
    return embed("⚠️ Avertissement", `<@${options.membre}> a reçu un avertissement.\n**Raison :** ${options.raison}\n**Total warns :** ${warns.length}`, 0xf59e0b);
  },

  async clear(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    try {
      const messages = await discordAPI("GET", `/channels/${interaction.channel_id}/messages?limit=${options.nombre}`);
      const ids = messages.map(m => m.id);
      await discordAPI("POST", `/channels/${interaction.channel_id}/messages/bulk-delete`, { messages: ids });
      return embed("🗑️ Messages supprimés", `**${ids.length}** messages supprimés.`, 0x22c55e);
    } catch (e) {
      return embed("❌ Erreur", "Impossible de supprimer les messages (trop anciens?)", 0xef4444);
    }
  },

  async slowmode(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    try {
      await discordAPI("PATCH", `/channels/${interaction.channel_id}`, { rate_limit_per_user: options.secondes });
      return embed("🐢 Slowmode", options.secondes === 0 ? "Slowmode désactivé." : `Slowmode défini à **${options.secondes}s**.`, 0x22c55e);
    } catch (e) {
      return embed("❌ Erreur", "Impossible de modifier le slowmode.", 0xef4444);
    }
  },

  async lock(interaction, userPlan) {
    const channelId = interaction.channel_id;
    try {
      const channel = await discordAPI("GET", `/channels/${channelId}`);
      const perms = channel.permission_overwrites || [];
      const everyoneId = interaction.guild_id;
      const existing = perms.find(p => p.id === everyoneId);
      const deny = BigInt(existing?.deny || 0) | BigInt(0x800);
      await discordAPI("PATCH", `/channels/${channelId}`, {
        permission_overwrites: [...perms.filter(p => p.id !== everyoneId), { id: everyoneId, type: 0, deny: deny.toString(), allow: "0" }]
      });
      return embed("🔒 Salon verrouillé", "Ce salon a été verrouillé. Seuls les modérateurs peuvent écrire.", 0xef4444);
    } catch (e) {
      return embed("❌ Erreur", "Impossible de verrouiller ce salon.", 0xef4444);
    }
  },

  async unlock(interaction, userPlan) {
    const channelId = interaction.channel_id;
    try {
      const channel = await discordAPI("GET", `/channels/${channelId}`);
      const perms = (channel.permission_overwrites || []).filter(p => p.id !== interaction.guild_id);
      await discordAPI("PATCH", `/channels/${channelId}`, { permission_overwrites: perms });
      return embed("🔓 Salon déverrouillé", "Ce salon est à nouveau accessible à tous.", 0x22c55e);
    } catch (e) {
      return embed("❌ Erreur", "Impossible de déverrouiller ce salon.", 0xef4444);
    }
  },

  // ======= TICKETS =======
  async ticket(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const userId = interaction.member?.user?.id || interaction.user?.id;

    if (options.action === "create") {
      try {
        const channel = await discordAPI("POST", `/guilds/${interaction.guild_id}/channels`, {
          name: `ticket-${interaction.member?.user?.username || userId}`,
          type: 0,
          topic: `Ticket de <@${userId}> | Sujet: ${options.sujet || "Support"}`,
          permission_overwrites: [
            { id: interaction.guild_id, type: 0, deny: "1024", allow: "0" },
            { id: userId, type: 1, allow: "117760", deny: "0" }
          ]
        });
        await discordAPI("POST", `/channels/${channel.id}/messages`, {
          embeds: [{
            title: "🎫 Nouveau Ticket",
            description: `Bonjour <@${userId}> !\nUn membre de l'équipe va te répondre bientôt.\n\n**Sujet :** ${options.sujet || "Support général"}\n\nPour fermer ce ticket : \`/ticket fermer\``,
            color: 0x5865F2,
            footer: { text: "RBX Factory — Support System" }
          }]
        });
        return embed("🎫 Ticket créé", `Ton ticket a été créé : <#${channel.id}>`, 0x22c55e);
      } catch (e) {
        return embed("❌ Erreur", "Impossible de créer le ticket.", 0xef4444);
      }
    }

    if (options.action === "close") {
      try {
        await discordAPI("PATCH", `/channels/${interaction.channel_id}`, { name: `fermé-${Date.now()}` });
        setTimeout(async () => {
          try { await discordAPI("DELETE", `/channels/${interaction.channel_id}`); } catch {}
        }, 5000);
        return embed("🔒 Ticket fermé", "Ce ticket sera supprimé dans 5 secondes.", 0xef4444);
      } catch {
        return embed("❌ Erreur", "Impossible de fermer ce ticket.", 0xef4444);
      }
    }

    return embed("🎫 Tickets", "Actions : `créer`, `fermer`, `setup`", 0x5865F2);
  },

  // ======= ECONOMY =======
  async balance(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "balance");
    if (gate) return gate;
    const userId = interaction.member?.user?.id;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const targetId = options.membre || userId;
    const eco = getEconomy(interaction.guild_id, targetId);
    return embed("💰 Solde", `Compte de <@${targetId}>`, 0xf59e0b, [
      { name: "💵 Coins", value: `**${eco.coins}** 🪙`, inline: true },
      { name: "⭐ Niveau", value: `**${eco.level}**`, inline: true },
      { name: "📊 XP", value: `${eco.xp} / ${getXpNeeded(eco.level)}`, inline: true }
    ]);
  },

  async daily(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "daily");
    if (gate) return gate;
    const userId = interaction.member?.user?.id;
    const eco = getEconomy(interaction.guild_id, userId);
    const now = Date.now();
    const cooldown = 86400000;
    if (now - eco.lastDaily < cooldown) {
      const remaining = formatDuration(Math.ceil((cooldown - (now - eco.lastDaily)) / 1000));
      return embed("⏰ Daily déjà récupéré", `Reviens dans **${remaining}** !`, 0xf59e0b);
    }
    const reward = Math.floor(Math.random() * 200) + 100;
    eco.coins += reward;
    eco.lastDaily = now;
    saveEconomy(interaction.guild_id, userId, eco);
    return embed("📅 Daily récupéré !", `Tu as reçu **+${reward}** 🪙\nSolde total : **${eco.coins}** 🪙`, 0x22c55e);
  },

  async work(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "work");
    if (gate) return gate;
    const userId = interaction.member?.user?.id;
    const eco = getEconomy(interaction.guild_id, userId);
    const now = Date.now();
    const cooldown = 3600000;
    if (now - eco.lastWork < cooldown) {
      const remaining = formatDuration(Math.ceil((cooldown - (now - eco.lastWork)) / 1000));
      return embed("⏰ Déjà travaillé", `Reviens dans **${remaining}** !`, 0xf59e0b);
    }
    const jobs = ["développeur", "designer", "streamer", "modérateur", "chef cuisinier", "astronaute"];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earn = Math.floor(Math.random() * 100) + 50;
    eco.coins += earn;
    eco.xp += 10;
    if (eco.xp >= getXpNeeded(eco.level)) { eco.xp -= getXpNeeded(eco.level); eco.level++; }
    eco.lastWork = now;
    saveEconomy(interaction.guild_id, userId, eco);
    return embed("💼 Travail terminé !", `Tu as travaillé comme **${job}** et gagné **+${earn}** 🪙\nSolde : **${eco.coins}** 🪙`, 0x22c55e);
  },

  async transfer(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "transfer");
    if (gate) return gate;
    const userId = interaction.member?.user?.id;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const eco = getEconomy(interaction.guild_id, userId);
    if (eco.coins < options.montant) return embed("❌ Fonds insuffisants", `Tu n'as que **${eco.coins}** 🪙`, 0xef4444);
    eco.coins -= options.montant;
    const targetEco = getEconomy(interaction.guild_id, options.membre);
    targetEco.coins += options.montant;
    saveEconomy(interaction.guild_id, userId, eco);
    saveEconomy(interaction.guild_id, options.membre, targetEco);
    return embed("💸 Transfert effectué", `**${options.montant}** 🪙 envoyés à <@${options.membre}>.\nTon nouveau solde : **${eco.coins}** 🪙`, 0x22c55e);
  },

  async shop(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "shop");
    if (gate) return gate;
    return embed("🏪 Boutique", "Articles disponibles :", 0xf59e0b, [
      { name: "🎭 Rôle VIP", value: "500 🪙 — Rôle exclusif", inline: true },
      { name: "🎨 Couleur pseudo", value: "300 🪙 — Personnalisation", inline: true },
      { name: "⭐ Boost XP", value: "200 🪙 — x2 XP pendant 1h", inline: true }
    ]);
  },

  // ======= LEVELING =======
  async rank(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "rank");
    if (gate) return gate;
    const userId = interaction.member?.user?.id;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const targetId = options.membre || userId;
    const eco = getEconomy(interaction.guild_id, targetId);
    return embed("⭐ Rang", `Profil de <@${targetId}>`, 0x8b5cf6, [
      { name: "📊 Niveau", value: `**${eco.level}**`, inline: true },
      { name: "✨ XP", value: `**${eco.xp}** / ${getXpNeeded(eco.level)}`, inline: true },
      { name: "💵 Coins", value: `**${eco.coins}** 🪙`, inline: true }
    ]);
  },

  async leaderboard(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "leaderboard");
    if (gate) return gate;
    return embed("🏆 Classement", "Le classement sera disponible une fois que des membres auront utilisé les commandes d'économie.", 0xf59e0b);
  },

  // ======= MUSIC =======
  async play(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "play");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    return embed("🎵 Musique", `⚠️ La commande musique nécessite un vrai serveur pour la gestion audio.\n\nRecherche : **${options.query}**\n\nCette fonctionnalité est disponible via le bot hébergé.`, 0x1db954);
  },

  async skip(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "skip"); if (gate) return gate;
    return embed("⏭️ Skip", "Piste suivante !", 0x1db954);
  },

  async stop(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "stop"); if (gate) return gate;
    return embed("⏹️ Stop", "Musique arrêtée.", 0x1db954);
  },

  async queue(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "queue"); if (gate) return gate;
    return embed("📋 File d'attente", "La file d'attente est vide.", 0x1db954);
  },

  async volume(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "volume"); if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    return embed("🔊 Volume", `Volume défini à **${options.niveau}%**`, 0x1db954);
  },

  // ======= ADVANCED =======
  async sondage(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "sondage");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const opts = [options.option1, options.option2, options.option3, options.option4].filter(Boolean);
    const emojis = ["1️⃣","2️⃣","3️⃣","4️⃣"];
    const fields = opts.map((o, i) => ({ name: `${emojis[i]} Option ${i+1}`, value: o, inline: true }));
    try {
      const msg = await discordAPI("POST", `/channels/${interaction.channel_id}/messages`, {
        embeds: [{ title: `📊 ${options.question}`, fields, color: 0x5865F2, footer: { text: "Réagis pour voter !" } }]
      });
      for (let i = 0; i < opts.length; i++) {
        await discordAPI("PUT", `/channels/${interaction.channel_id}/messages/${msg.id}/reactions/${encodeURIComponent(emojis[i])}/@me`);
      }
    } catch {}
    return embed("📊 Sondage créé !", `Sondage sur : **${options.question}**`, 0x22c55e);
  },

  async giveaway(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "giveaway");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const seconds = parseDuration(options.duree || "1h");
    const gagnants = options.gagnants || 1;
    const endTime = new Date(Date.now() + (seconds || 3600) * 1000);
    try {
      const msg = await discordAPI("POST", `/channels/${interaction.channel_id}/messages`, {
        embeds: [{
          title: `🎉 GIVEAWAY — ${options.prix}`,
          description: `Réagis avec 🎉 pour participer !\n\n**Fin :** <t:${Math.floor(endTime.getTime()/1000)}:R>\n**Gagnants :** ${gagnants}\n**Organisé par :** <@${interaction.member?.user?.id}>`,
          color: 0xff6b6b,
          footer: { text: "RBX Factory — Giveaway System" }
        }]
      });
      await discordAPI("PUT", `/channels/${interaction.channel_id}/messages/${msg.id}/reactions/${encodeURIComponent("🎉")}/@me`);
    } catch {}
    return embed("🎉 Giveaway lancé !", `Prix : **${options.prix}** pour **${gagnants}** gagnant(s) dans **${formatDuration(seconds || 3600)}**.`, 0x22c55e);
  },

  async annonce(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "annonce");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const channelId = options.salon || interaction.channel_id;
    try {
      await discordAPI("POST", `/channels/${channelId}/messages`, {
        embeds: [{
          title: "📢 Annonce",
          description: options.message,
          color: 0x5865F2,
          footer: { text: `Annonce par RBX Factory` },
          timestamp: new Date().toISOString()
        }]
      });
      return embed("✅ Annonce envoyée", `Annonce publiée dans <#${channelId}>.`, 0x22c55e);
    } catch {
      return embed("❌ Erreur", "Impossible d'envoyer l'annonce.", 0xef4444);
    }
  },

  async embed(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "embed");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const color = options.couleur ? parseInt(options.couleur.replace("#", ""), 16) : 0x5865F2;
    try {
      await discordAPI("POST", `/channels/${interaction.channel_id}/messages`, {
        embeds: [{ title: options.titre, description: options.description, color, footer: { text: "RBX Factory" } }]
      });
      return embed("✅ Embed créé !", "Embed publié avec succès.", 0x22c55e);
    } catch {
      return embed("❌ Erreur", "Impossible de créer l'embed.", 0xef4444);
    }
  },

  async rappel(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "rappel");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const seconds = parseDuration(options.duree);
    if (!seconds) return embed("❌ Durée invalide", "Format: 30s, 5m, 2h", 0xef4444);
    const userId = interaction.member?.user?.id;
    const channelId = interaction.channel_id;
    setTimeout(async () => {
      try {
        await discordAPI("POST", `/channels/${channelId}/messages`, {
          content: `⏰ <@${userId}> Rappel : **${options.message}**`
        });
      } catch {}
    }, seconds * 1000);
    return embed("⏰ Rappel créé !", `Je te rappellerai dans **${formatDuration(seconds)}** : *${options.message}*`, 0x22c55e);
  },

  async serverinfo(interaction, userPlan) {
    try {
      const guild = await discordAPI("GET", `/guilds/${interaction.guild_id}?with_counts=true`);
      return embed(
        `🏠 ${guild.name}`,
        guild.description || "Aucune description",
        0x5865F2,
        [
          { name: "👥 Membres", value: `${guild.approximate_member_count || "?"}`, inline: true },
          { name: "🟢 En ligne", value: `${guild.approximate_presence_count || "?"}`, inline: true },
          { name: "🆔 ID", value: guild.id, inline: true },
          { name: "📅 Créé le", value: `<t:${Math.floor(((BigInt(guild.id) >> BigInt(22)) + BigInt(1420070400000)) / BigInt(1000))}:D>`, inline: true },
          { name: "🌍 Région", value: guild.preferred_locale || "?", inline: true },
          { name: "⭐ Boosts", value: `${guild.premium_subscription_count || 0}`, inline: true }
        ]
      );
    } catch {
      return embed("❌ Erreur", "Impossible de récupérer les infos du serveur.", 0xef4444);
    }
  },

  async userinfo(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const targetId = options.membre || interaction.member?.user?.id;
    try {
      const member = await discordAPI("GET", `/guilds/${interaction.guild_id}/members/${targetId}`);
      const user = member.user;
      return embed(
        `👤 ${user.username}`,
        "",
        0x5865F2,
        [
          { name: "🏷️ Tag", value: `${user.username}#${user.discriminator}`, inline: true },
          { name: "🆔 ID", value: user.id, inline: true },
          { name: "🤖 Bot", value: user.bot ? "Oui" : "Non", inline: true },
          { name: "📅 Rejoint le", value: `<t:${Math.floor(new Date(member.joined_at).getTime()/1000)}:D>`, inline: true },
          { name: "🎭 Rôles", value: member.roles.slice(0,5).map(r => `<@&${r}>`).join(", ") || "Aucun", inline: false }
        ]
      );
    } catch {
      return embed("❌ Erreur", "Impossible de récupérer les infos.", 0xef4444);
    }
  },

  async roleinfo(interaction, userPlan) {
    const gate = planGate(userPlan, "PREMIUM", "roleinfo");
    if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    try {
      const roles = await discordAPI("GET", `/guilds/${interaction.guild_id}/roles`);
      const role = roles.find(r => r.id === options.role);
      if (!role) return embed("❌ Rôle introuvable", "", 0xef4444);
      return embed(
        `🎭 ${role.name}`,
        "",
        role.color || 0x5865F2,
        [
          { name: "🆔 ID", value: role.id, inline: true },
          { name: "🎨 Couleur", value: `#${role.color.toString(16).padStart(6,"0")}`, inline: true },
          { name: "📌 Position", value: `${role.position}`, inline: true },
          { name: "🤖 Managé", value: role.managed ? "Oui" : "Non", inline: true },
          { name: "💎 Mentionnable", value: role.mentionable ? "Oui" : "Non", inline: true }
        ]
      );
    } catch {
      return embed("❌ Erreur", "Impossible de récupérer les infos du rôle.", 0xef4444);
    }
  },

  async welcome(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `welcome_${interaction.guild_id}`;
    const config = JSON.parse(localStorage.getItem(key) || '{"enabled":false,"channel":null,"message":"Bienvenue {user} !"}');

    if (options.action === "enable") { config.enabled = true; localStorage.setItem(key, JSON.stringify(config)); return embed("✅ Bienvenue activée", "Le système de bienvenue est maintenant actif.", 0x22c55e); }
    if (options.action === "disable") { config.enabled = false; localStorage.setItem(key, JSON.stringify(config)); return embed("🔕 Bienvenue désactivée", "", 0xef4444); }
    if (options.action === "setmessage") { config.message = options.valeur || config.message; localStorage.setItem(key, JSON.stringify(config)); return embed("✅ Message défini", `Message : **${config.message}**`, 0x22c55e); }
    if (options.action === "setchannel") { config.channel = options.valeur; localStorage.setItem(key, JSON.stringify(config)); return embed("✅ Salon défini", `Salon : ${options.valeur}`, 0x22c55e); }
    if (options.action === "test") {
      const msg = config.message.replace("{user}", `<@${interaction.member?.user?.id}>`);
      try { await discordAPI("POST", `/channels/${config.channel || interaction.channel_id}/messages`, { content: msg }); } catch {}
      return embed("✅ Test envoyé", msg, 0x22c55e);
    }
    return embed("👋 Bienvenue", `Statut : ${config.enabled ? "✅ Actif" : "❌ Inactif"}`, 0x5865F2);
  },

  async antiraid(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `antiraid_${interaction.guild_id}`;
    const config = JSON.parse(localStorage.getItem(key) || '{"enabled":false}');
    if (options.action === "enable") { config.enabled = true; localStorage.setItem(key, JSON.stringify(config)); return embed("🛡️ Anti-Raid activé", "Protection anti-raid activée.", 0x22c55e); }
    if (options.action === "disable") { config.enabled = false; localStorage.setItem(key, JSON.stringify(config)); return embed("🛡️ Anti-Raid désactivé", "", 0x6b7280); }
    return embed("🛡️ Anti-Raid", `Statut : ${config.enabled ? "✅ Actif" : "❌ Inactif"}`, 0x5865F2);
  },

  async logs(interaction, userPlan) {
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `logs_${interaction.guild_id}`;
    const config = JSON.parse(localStorage.getItem(key) || '{"enabled":false,"channel":null}');
    if (options.action === "enable") { config.enabled = true; localStorage.setItem(key, JSON.stringify(config)); return embed("📋 Logs activés", "", 0x22c55e); }
    if (options.action === "disable") { config.enabled = false; localStorage.setItem(key, JSON.stringify(config)); return embed("📋 Logs désactivés", "", 0xef4444); }
    if (options.action === "setchannel") { config.channel = options.salon; localStorage.setItem(key, JSON.stringify(config)); return embed("📋 Salon de logs défini", `<#${options.salon}>`, 0x22c55e); }
    return embed("📋 Logs", `Statut : ${config.enabled ? "✅ Actif" : "❌ Inactif"}`, 0x5865F2);
  },

  async autorole(interaction, userPlan) {
    const gate = planGate(userPlan, "PRO", "autorole"); if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `autorole_${interaction.guild_id}`;
    if (options.action === "set") { localStorage.setItem(key, options.role); return embed("🎭 AutoRole défini", `Rôle <@&${options.role}> attribué automatiquement.`, 0x22c55e); }
    if (options.action === "remove") { localStorage.removeItem(key); return embed("🎭 AutoRole supprimé", "", 0xef4444); }
    return embed("🎭 AutoRole", `Rôle actuel : ${localStorage.getItem(key) ? `<@&${localStorage.getItem(key)}>` : "Aucun"}`, 0x5865F2);
  },

  async reactionrole(interaction, userPlan) {
    const gate = planGate(userPlan, "PREMIUM", "reactionrole"); if (gate) return gate;
    const options = {};
    (interaction.data?.options || []).forEach(o => { options[o.name] = o.value; });
    const key = `rr_${interaction.guild_id}`;
    const rrs = JSON.parse(localStorage.getItem(key) || "[]");
    rrs.push({ messageId: options.message_id, emoji: options.emoji, roleId: options.role });
    localStorage.setItem(key, JSON.stringify(rrs));
    try {
      await discordAPI("PUT", `/channels/${interaction.channel_id}/messages/${options.message_id}/reactions/${encodeURIComponent(options.emoji)}/@me`);
    } catch {}
    return embed("⚡ Reaction Role créé", `Emoji ${options.emoji} → <@&${options.role}>`, 0x22c55e);
  }
};

// ---- Main Interaction Handler ----
async function handleInteraction(interaction) {
  if (interaction.type === 1) return { type: 1 }; // PING

  if (interaction.type === 2) {
    const commandName = interaction.data?.name;
    const userId = interaction.member?.user?.id || interaction.user?.id;

    // Verify user plan from Discord
    let userPlan = await getUserPlanFromDiscord(userId);
    if (userPlan === null) {
      // Not in server — no access (unless it's help/equipe/ping)
      const freeCommands = ["help", "equipe", "ping", "createbot"];
      if (!freeCommands.includes(commandName)) {
        return {
          type: 4,
          data: embed("❌ Accès refusé",
            `Tu dois rejoindre le serveur **RBX Factory** pour utiliser ce bot !\n\n🔗 ${INVITE_URL}\n\n⚠️ Quitter le serveur désactivera ton bot.`,
            0xef4444
          )
        };
      }
      userPlan = "FREE";
    }

    const handler = handlers[commandName];
    if (!handler) {
      return { type: 4, data: embed("❓ Commande inconnue", `Commande \`/${commandName}\` introuvable.`, 0xef4444) };
    }

    try {
      const response = await handler(interaction, userPlan);
      return { type: 4, data: response };
    } catch (e) {
      console.error(`Erreur commande /${commandName}:`, e);
      return { type: 4, data: embed("❌ Erreur interne", `Une erreur s'est produite.\n\`${e.message}\``, 0xef4444) };
    }
  }

  return { type: 4, data: embed("❓ Type inconnu", "", 0xef4444) };
}

// ---- Verify Discord Signature ----
async function verifyDiscordRequest(request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp) return false;

  const body = await request.text();
  const encoder = new TextEncoder();

  try {
    const keyData = hexToBytes(APP_SECRET);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "Ed25519" }, false, ["verify"]
    );
    const data = encoder.encode(timestamp + body);
    const sig = hexToBytes(signature);
    return await crypto.subtle.verify({ name: "Ed25519" }, key, sig, data);
  } catch {
    return false;
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Export
window.RBXFactory = {
  handleInteraction,
  verifyDiscordRequest,
  registerCommands,
  discordAPI,
  getUserPlanFromDiscord,
  loadBots,
  saveBots,
  PLANS,
  BOT_TOKEN,
  APP_ID,
  MAIN_GUILD_ID
};
