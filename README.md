# Portfolio — Théo Bizet

Portfolio personnel : parcours, expériences, projets et contact, avec un assistant IA qui répond aux questions des visiteurs sur mon profil.

**En ligne :** https://theo-bizet.vercel.app

## Fonctionnalités

- Pages Accueil, À propos, Éducation, Expérience, Projets, Contact, et une page 404
- Trois langues (français, anglais, allemand) via ngx-translate, avec un CV PDF téléchargeable dans chaque langue
- Thème clair / sombre
- Badges Credly vérifiables sur la page À propos
- Assistant IA (Mistral Small 3.1 sur Cloudflare Workers AI) qui répond dans la langue du site
- Formulaire de contact : le Worker envoie le message par email via Resend

## Stack

| Partie | Technologies |
|---|---|
| Front | Angular 20 (SPA, composants standalone), Bootstrap 5, ng-bootstrap, Font Awesome, ngx-translate |
| Back | Cloudflare Worker (TypeScript), Workers AI, Resend |
| Hébergement | Vercel (site), Cloudflare (Worker) |

## Architecture

```
Navigateur ──► Vercel (site Angular statique)
    │
    └──► Cloudflare Worker  my-llm-chatbot.theobizet.workers.dev
            ├─ POST /         assistant IA  ──► Workers AI (Mistral)
            ├─ POST /contact  formulaire    ──► Resend ──► email
            └─ GET  /health   état du Worker
```

Le Worker n'accepte que les origines listées dans `ALLOWED_ORIGINS` et limite chaque IP à 10 requêtes par minute (binding `RATE_LIMITER`).

## Structure

```
src/app/component/   Pages et composants (home, about, chat, contact…)
src/app/*.service.ts Services : assistant (llm), contact, thème
src/environments/    URL du Worker
public/assets/       Images, CV PDF et traductions (i18n/fr.json, en.json, de.json)
my-llm-chatbot/      Cloudflare Worker : assistant IA et formulaire de contact
vercel.json          Build, réécriture SPA et en-têtes de sécurité (CSP…)
```

## Démarrage

Prérequis : Node.js 20.19+ ou 22.12+.

```bash
npm install
npm start          # http://localhost:4200
```

En local, le site appelle le Worker déployé (`cloudflareWorkerUrl` dans [src/environments/environment.ts](src/environments/environment.ts)) ; `http://localhost:4200` fait partie des origines autorisées.

### Worker

```bash
cd my-llm-chatbot
npm install
npx wrangler secret put RESEND_API_KEY   # une seule fois
npm run dev                              # local
npm run deploy                           # production
npm test                                 # Vitest
```

À savoir :

- Le profil utilisé par l'assistant est écrit en dur dans [my-llm-chatbot/src/index.ts](my-llm-chatbot/src/index.ts) (`PROFILE`) : à mettre à jour en même temps que le site.
- Les emails partent de l'expéditeur de test Resend (`onboarding@resend.dev`), qui n'envoie qu'à l'adresse du compte Resend. Il faudra le remplacer une fois un domaine vérifié.
- Une nouvelle URL du site doit être ajoutée à `ALLOWED_ORIGINS` dans le Worker et une nouvelle URL du Worker à `connect-src` dans [vercel.json](vercel.json).

## Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement |
| `npm run build` | Build de production dans `dist/portfolio-angular/browser` |
| `npm run watch` | Build de développement en continu |
| `npm test` | Tests unitaires (Karma + Jasmine) |

## Déploiement

- **Site :** Vercel déploie automatiquement à chaque push sur `master`.
- **Worker :** `npm run deploy` dans `my-llm-chatbot/`.

## Contact

theobizet@outlook.fr · [GitHub](https://github.com/theobizet) · [LinkedIn](https://linkedin.com/theobizet)
