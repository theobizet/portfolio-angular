# 🚀 Guide de Déploiement - Cloudflare Workers AI LLM

## 📋 Vue d'ensemble

Ce guide explique comment déployer un Worker Cloudflare exécutant le modèle **Mistral-7B** via **Workers AI** et l'intégrer à ton portfolio Angular.

---

## 🔧 **Phase 1 : Créer et Déployer le Worker Cloudflare**

### 1.1. Prérequis
- Compte Cloudflare gratuit : https://dash.cloudflare.com/sign-up
- Node.js et npm installés

### 1.2. Créer le projet Worker

```bash
# Créer un nouveau projet Worker Cloudflare
npm create cloudflare@latest my-llm-chatbot -- --type hello-world

# Accéder au répertoire
cd my-llm-chatbot
```

### 1.3. Ajouter le code du Worker

1. Ouvre `src/index.js` (ou crée-le s'il n'existe pas)
2. Copie le contenu de `cloudflare-worker.js` de ce projet
3. Colle-le dans `src/index.js`

### 1.4. Configurer wrangler.toml

Ouvre `wrangler.toml` et assure-toi que la configuration ressemble à ceci :

```toml
#:schema node_modules/wrangler/config-schema.json

name = "my-llm-chatbot"
type = "service"
main = "src/index.js"
compatibility_date = "2024-01-01"

# Ajoute les liaisons pour Workers AI
[[env.production.env_vars]]
ALLOWED_ORIGINS = "https://ton-portfolio.vercel.app"

# Active Workers AI
[env.production]
env_vars = { ALLOWED_ORIGINS = "https://ton-portfolio.vercel.app" }

[[env.production.ai]]
binding = "AI"
```

### 1.5. Déployer

```bash
# Connexion à Cloudflare (première fois)
npx wrangler login

# Déployer le Worker
npx wrangler deploy --env production
```

Tu recevras une URL du type : `https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev`

### 1.6. Tester le Worker

```bash
# Test de connexion
curl https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev/health

# Test complet avec envoi de message
curl -X POST https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Pourquoi le ciel est bleu ?"}'
```

---

## 📱 **Phase 2 : Configurer le Portfolio Angular**

### 2.1. Mise à jour d'environment.ts

Ouvre `src/environments/environment.ts` et configure :

```typescript
export const environment = {
  production: true,
  dialogflowProjectId: 'chatbot-portfolio-iqcd',
  // ✅ Ajoute l'URL de ton Worker
  cloudflareWorkerUrl: 'https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev',
  // ✅ Bascule à true pour utiliser LLM
  useLLM: true,
};
```

### 2.2. Variables d'environnement en développement

Pour le développement local, crée `src/environments/environment.dev.ts` :

```typescript
export const environment = {
  production: false,
  dialogflowProjectId: 'chatbot-portfolio-iqcd',
  cloudflareWorkerUrl: 'http://localhost:8787', // URL locale du Worker
  useLLM: true,
};
```

### 2.3. Lancer en développement local (optionnel)

```bash
# Terminal 1 : Lancer le Worker localement
cd my-llm-chatbot
npx wrangler dev

# Terminal 2 : Lancer Angular
ng serve --configuration development
```

---

## 🔄 **Phase 3 : Architecture du Flux**

```
┌─────────────────────────────────────────────────────────────────┐
│                     PORTFOLIO ANGULAR                           │
│  (src/app/component/chat/chat.ts)                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ sendMessage(prompt)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT SERVICE                               │
│  (src/app/chat.service.ts)                                     │
│  - Choisit LLM ou Dialogflow selon environment.useLLM         │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│   LLM Service    │  │ Dialogflow Svc   │
│  (llm.service)   │  │ (dialog-flow)    │
└─────────┬────────┘  └──────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │  HTTP POST Request    │
         │   (CORS enabled)      │
         └──────────┬────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │   CLOUDFLARE WORKER (Serverless)    │
   │   cloudflare-worker.js              │
   │   - Reçoit le prompt                │
   │   - Appelle Workers AI              │
   └──────────┬────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────┐
   │   WORKERS AI - Mistral 7B           │
   │   @cf/mistral/mistral-7b-instruct   │
   │   - Génère la réponse               │
   └──────────┬────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────┐
   │   Réponse JSON                      │
   │   { response: "Texte généré..." }   │
   └──────────┬────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────┐
   │   Angular Chat Component            │
   │   Affiche la réponse                │
   └─────────────────────────────────────┘
```

---

## ⚙️ **Phase 4 : Basculer entre LLM et Dialogflow**

### Option 1 : Par environnement

```typescript
// environment.prod.ts - Production avec LLM
export const environment = {
  production: true,
  useLLM: true,
  cloudflareWorkerUrl: 'https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev',
};

// environment.ts - Développement avec Dialogflow
export const environment = {
  production: false,
  useLLM: false,
};
```

### Option 2 : Toggle en runtime (avancé)

Ajoute un sélecteur dans le composant chat :

```html
<!-- chat.html -->
<div class="card-header">
  <h2 class="pb-2">
    <i class="fa fa-commenting me-2"></i>Chatbot Assistant
    <small class="text-muted">({{ activeService }})</small>
  </h2>
</div>
```

---

## 🔐 **Phase 5 : Sécurité et Bonnes Pratiques**

### ✅ À faire
- ✅ Ajouter CORS pour ton domaine seulement
- ✅ Limiter les tokens à la durée de vie courte
- ✅ Monitorer l'usage avec Cloudflare Analytics
- ✅ Ajouter un rate limiting

### ❌ À ne pas faire
- ❌ Exposer des tokens API ou clés secrètes
- ❌ Appeler directement l'API Hugging Face depuis le navigateur
- ❌ Laisser CORS ouvert (`*`) en production

### Configuration CORS Sécurisée

```javascript
// Dans cloudflare-worker.js
const allowedOrigins = [
  'https://ton-portfolio.vercel.app',
  'https://www.ton-portfolio.com',
  'http://localhost:4200' // Développement
];

const origin = request.headers.get('origin');
const isAllowed = allowedOrigins.includes(origin);

if (isAllowed) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

---

## 📊 **Phase 6 : Monitoring et Logs**

### Voir les logs du Worker

```bash
# Logs en temps réel
npx wrangler tail

# Avec filtrage
npx wrangler tail --env production
```

### Analytics Cloudflare

1. Va sur https://dash.cloudflare.com/
2. Sélectionne ton account
3. Workers & Pages → my-llm-chatbot → Analytics

---

## 🚨 **Troubleshooting**

### Erreur : "Could not resolve @vercel/speed-insights"
✅ Corrigée ! L'import a été supprimé dans `src/main.ts`.

### Erreur 500 : "Model not found"
- Vérifiez que Workers AI est activé dans ton compte Cloudflare
- Vérifiez le modèle utilisé : `@cf/mistral/mistral-7b-instruct-v0.1`

### CORS Error en développement
- Ajoute `http://localhost:4200` à `allowedOrigins` dans le Worker
- Relance le Worker avec `npx wrangler dev`

### Worker timeout
- Les réponses LLM peuvent prendre 5-10 secondes
- Augmente le timeout dans Angular (par défaut 30s)

---

## 📈 **Tarification Cloudflare**

| Usage | Coût |
|-------|------|
| < 100k requêtes/mois | **Gratuit** |
| 100k - 10M requêtes | $0.50 par million |
| > 10M requêtes | Contacter Cloudflare |

---

## ✨ **Prochaines Étapes**

1. ✅ Déployer le Worker
2. ✅ Configurer environment.ts
3. ✅ Tester en développement local
4. ✅ Déployer sur Vercel
5. 🔄 Monitorer les logs et usage
6. 💡 Considérer ajouter le streaming des réponses

---

## 🤝 **Support**

- **Cloudflare Docs** : https://developers.cloudflare.com/workers-ai/
- **Workers & Pages** : https://developers.cloudflare.com/workers/
- **Mistral 7B** : https://mistral.ai/

---

**Déploiement réussi ? 🎉 Envoie-moi un message dans le chatbot !**
