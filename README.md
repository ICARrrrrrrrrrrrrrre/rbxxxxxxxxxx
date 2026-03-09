# 🤖 RBX Factory

Bot Discord as a Service — Créez votre bot Discord personnalisé sans coder.

## 🚀 Déploiement sur GitHub Pages

### 1. Créer le repo GitHub
1. Crée un repo public nommé `rbx-factory` (ou `USERNAME.github.io`)
2. Upload tous les fichiers de ce ZIP
3. Active GitHub Pages dans Settings → Pages → Branch: `main`, Folder: `/ (root)`

### 2. Configurer Discord Developer Portal
1. Va sur https://discord.com/developers/applications
2. Sélectionne ton application (ID: `1432289351034998834`)
3. Va dans **General Information**
4. Dans **Interactions Endpoint URL**, mets :
   ```
   https://TON-USERNAME.github.io/rbx-factory/
   ```
   ou si tu utilises le repo principal :
   ```
   https://TON-USERNAME.github.io/
   ```
5. Clique **Save Changes** — Discord va vérifier l'URL ✅

### 3. Activer GitHub Actions
1. Va dans ton repo → Settings → Secrets → Actions
2. Ajoute ces secrets :
   - `BOT_TOKEN` = `MTQzMjI4OTM1MTAzNDk5ODgzNA.GXoxeo.87qOso0AUBrLoZD8o6rtogSILXBsBLt1zYZKlM`
   - `APP_ID` = `1432289351034998834`

Les commandes seront auto-enregistrées à chaque push et toutes les 5 minutes.

### 4. Comment ça marche ?
```
Utilisateur tape /createbot sur Discord
        ↓
Discord envoie POST vers ton GitHub Pages URL
        ↓
Service Worker intercepte la requête
        ↓
discord.js traite la commande
        ↓
Réponse JSON renvoyée à Discord
        ↓
Discord affiche la réponse dans le serveur
```

## 📋 Plans

| Plan | Rôle Discord | Bots | Modules |
|------|-------------|------|---------|
| Gratuit | `1479196255220535458` | 1 | Modération, Tickets |
| Pro | `1479196300829262066` | 3 | +Musique, Economy, Avancé |
| Premium | `1479196114686050439` | ∞ | Tout |

## ⚠️ Important
- Les membres **doivent rester** dans le serveur RBX Factory pour garder leur bot actif
- Les commandes `/help` et `/equipe` sont **toujours présentes** (non supprimables)
- Le bot affiche toujours "Créé par RBX Factory" dans le footer

## 🔗 Liens
- Serveur Discord : https://discord.gg/xrz9vyVj2a
- Dashboard : https://TON-USERNAME.github.io/rbx-factory/
