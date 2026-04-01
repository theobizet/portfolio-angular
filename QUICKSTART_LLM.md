# 🚀 Quick Start - Cloudflare Workers AI en 10 Minutes

**Attention**: Ce guide assume que tu as déjà un compte Cloudflare et Node.js installé.

---

## 1️⃣ Créer le Worker (5 minutes)

```bash
# Créer le projet
npm create cloudflare@latest my-llm-chatbot -- --type hello-world
cd my-llm-chatbot

# Copier le code du Worker
# Ouvre: cloudflare-worker.js du portfolio
# Remplace le contenu de: src/index.js

# Déployer
npx wrangler login
npx wrangler deploy

# 💾 Note l'URL générée (ex: https://my-llm-chatbot.abc123.workers.dev)
```

---

## 2️⃣ Configurer le Portfolio (2 minutes)

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  dialogflowProjectId: 'chatbot-portfolio-iqcd',
  cloudflareWorkerUrl: 'https://my-llm-chatbot.abc123.workers.dev', // 🔴 COPIE L'URL D'ÉTAPE 1
  useLLM: true, // 🔴 CHANGE À TRUE
};
```

---

## 3️⃣ Tester (3 minutes)

```bash
# Depuis le répertoire du portfolio
ng serve
# Ouvre http://localhost:4200/chat et envoie un message
```

---

## ❓ Ça Ne Marche Pas ?

### Error 1: "Worker URL non configurée"
→ T'as oublié de configurer `cloudflareWorkerUrl` dans environment.ts

### Error 2: CORS error
→ Ajoute ton domaine à `ALLOWED_ORIGINS` dans le Worker:
```javascript
const allowedOrigins = ['https://ton-portfolio.vercel.app', 'http://localhost:4200'];
if (allowedOrigins.includes(request.headers.get('origin'))) {
  response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin'));
}
```

### Error 3: "Model not found" (500)
→ Workers AI n'est pas activé. Va sur https://dash.cloudflare.com/ → Workers → Enable AI

---

## ✅ Tout Marche ? Déploye en Prod !

```bash
git add src/environments/environment.ts src/app/chat.service.ts src/app/llm.service.ts src/app/component/chat/chat.ts
git commit -m "feat: enable Cloudflare Workers AI LLM"
git push
# Vercel redéploie automatiquement
```

---

## 📚 Besoin de Plus de Détails ?

- [Guide Complet de Déploiement](./DEPLOYMENT_CLOUDFLARE_LLM.md)
- [Architecture des Services](./LLM_INTEGRATION_GUIDE.md)
- [Checklist Complète](./CLOUDFLARE_LLM_CHECKLIST.md)

---

**C'est fait ! 🎉 Ton chatbot utilise maintenant un vrai LLM on-premises !**
