# 🤖 Guide d'Intégration LLM - Architecture Service

Ce document explique comment les services d'IA sont architecturés dans le portfolio.

---

## 🏗️ Architecture des Services

### 1. **ChatService** (Orchestrateur Principal)
```
src/app/chat.service.ts
```

Le service unifiée qui:
- ✅ Choisit automatiquement entre **Dialogflow** et **LLM (Cloudflare Workers AI)**
- ✅ Formatte les réponses de manière cohérente
- ✅ Gère les erreurs gracieusement
- ✅ Expose la configuration active

```typescript
// Utilisation simple
this.chatService.sendMessage('Bonjour');
// Retourne une Observable<response>
```

### 2. **LLMService** (Client Cloudflare Workers)
```
src/app/llm.service.ts
```

Service décédié pour appeler le Worker Cloudflare:
- 📡 Envoie des requêtes HTTP POST au Worker
- 🔄 Gère la communication avec Mistral 7B
- ⚡ Lightweight et scalable

```typescript
// Envoi direct
this.llmService.askLLM('Pourquoi le ciel est bleu ?');
```

### 3. **DialogflowService** (Existant)
```
src/app/dialog-flow-service.ts
```

Service d'origine pour Dialogflow:
- 🗣️ Récupère des tokens Dialogflow
- 🔐 Appelle l'API Dialogflow v2 directement
- 📋 Conservé pour compatibilité

---

## 🔄 Flux d'Exécution

```
┌─ Utilisateur envoie message ─┐
│                               │
▼                               ▼
Chat Component          ChatService.sendMessage()
(chat.ts)                   |
                            │
                            ├─► if (useLLM) ──► LLMService
                            │                        │
                            │                        ▼
                            │                  HTTP POST
                            │                  Worker URL
                            │                        │
                            │                        ▼
                            │                  Cloudflare Workers
                            │                  Mistral 7B
                            │                        │
                            │◄─── Réponse formatée ──┘
                            │
                            └─► else ──► DialogflowService
                                             │
                                             ▼
                                        Dialogflow API v2
```

---

## ⚙️ Configuration

### Environment Variables

**Fichier**: `src/environments/environment.ts`

```typescript
export const environment = {
  // Service Dialogflow
  dialogflowProjectId: 'chatbot-portfolio-iqcd',

  // Service LLM (Cloudflare Workers)
  cloudflareWorkerUrl: 'https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev',

  // Sélection du service
  useLLM: false // true pour LLM, false pour Dialogflow
};
```

### Bascule Entre Services

**Option 1 : Par environnement**
```bash
# Développement (Dialogflow)
ng serve

# Production (LLM)
ng serve --configuration production
```

**Option 2 : Runtime Toggle** (Advanced)
```typescript
// Dans n'importe quel composant
environment.useLLM = true; // Bascule à LLM
```

---

## 📡 API Worker

### POST /
Envoie un message au LLM

**Request:**
```json
{
  "prompt": "Explique la relativité",
  "stream": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "response": "La relativité est une théorie...",
  "model": "@cf/mistral/mistral-7b-instruct-v0.1",
  "timestamp": "2024-04-01T10:30:00Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

### GET /health
Vérifiez la santé du Worker

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-01T10:30:00Z"
}
```

---

## 🔐 Sécurité

### Headers
```typescript
// Worker envoie les headers requis
'Access-Control-Allow-Origin': '*' // À restreindre en prod
'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
'Cache-Control': 'no-cache' // Les réponses IA ne sont jamais en cache
```

### Rate Limiting
À implémenter dans le Worker :
```javascript
// Limiter par IP/token
const rateLimiter = new RateLimiter({
  max: 100,     // 100 requêtes
  window: 3600  // par heure
});
```

---

## 📊 Comparaison Services

| Critère | Dialogflow | LLM (Cloudflare) |
|---------|-----------|-----------------|
| **Coût** | Payant (pour + de 180 req/mois) | Gratuit jusqu'à 100k req/mois |
| **Setup** | Complexe (API Key, Agent) | Simple (URL + déploiement) |
| **Latence** | 500-1000ms | 2000-5000ms (premiers appels) |
| **Contexte** | Conversations nativement | Via histoire de messages |
| **Multilingue** | Oui (inclus) | Oui (via prompt) |
| **Temps d'init** | Instant | ~3s (cold start) |
| **Scalabilité** | Google Cloud | Cloudflare Edge Network |

---

## 🛠️ Debugging

### 1. Vérifier quel service est actif
```typescript
console.log(this.chatService.getActiveService());
// Output: "LLM (Cloudflare Workers AI)" ou "Dialogflow"
```

### 2. Tester le Worker localement
```bash
# Terminal 1
cd cloudflare-worker-project
npx wrangler dev

# Terminal 2
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

### 3. Logs du navigateur
```
F12 → Console
Cherche les logs 📨 Envoi via...
```

### 4. Logs Cloudflare
```bash
npx wrangler tail --env production
```

---

## 🚀 Optimisations Futures

- [ ] **Streaming**: Retourner les réponses en temps réel
- [ ] **Historique**: Garder le contexte entre messages
- [ ] **Fine-tuning**: Personnaliser le modèle pour ton portfolio
- [ ] **Caching**: Cacher les réponses courantes
- [ ] **Analytics**: Tracker les patterns de messages
- [ ] **Multi-modèles**: Permettre le choix du modèle (Mistral, Llama, etc.)

---

## 📚 Ressources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Mistral Model Card](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1)
- [Chat Component Source](./component/chat/chat.ts)
- [Deployment Guide](../DEPLOYMENT_CLOUDFLARE_LLM.md)

---

## ❓ FAQ

### Q: Puis-je utiliser plusieurs modèles ?
**R**: Oui, change `@cf/mistral/mistral-7b-instruct-v0.1` par un autre modèle supporté dans `cloudflare-worker.js`.

### Q: Comment ajouter du contexte de conversation ?
**R**: Maintiens une liste de messages et passe-les avec le nouveau message au Worker.

### Q: Quel est le coût mensuel attendu ?
**R**: Gratuit jusqu'à 100k requêtes. Au-delà: $0.50 par million.

### Q: Peut-on faire du streaming ?
**R**: Oui, avec Server-Sent Events (SSE). À implémenter côté Worker et Angular.

---

**Besoin d'aide ? Ouvre une issue ou contacte via le portfolio! 💬**
