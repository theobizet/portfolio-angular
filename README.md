# Portfolio — Théo Bizet

Mon portfolio personnel : parcours, expériences, projets et contact, avec un assistant IA qui répond aux questions des visiteurs sur mon profil.

**En ligne :** https://portfolio-angular-theo.vercel.app

## Fonctionnalités

- Pages Accueil, À propos, Éducation, Expérience, Projets, Contact
- Trois langues (français, anglais, allemand) via ngx-translate
- Thème clair / sombre
- Assistant IA (Mistral Small 3.1 sur Cloudflare Workers AI), qui répond dans la langue du site
- Formulaire de contact relayé par le Worker vers Static Forms

## Stack

| Partie | Technologies |
|---|---|
| Front | Angular 20 (SSR), Bootstrap 5, ng-bootstrap, Font Awesome, ngx-translate |
| Assistant et contact | Cloudflare Worker (TypeScript), Workers AI |
| Hébergement | Vercel (site), Cloudflare (Worker) |

## Structure

```
src/app/            Application Angular (composants, services chat / contact / thème)
src/environments/   URL du Worker et choix du moteur de chat
public/assets/      Images et traductions (i18n/fr.json, en.json, de.json)
my-llm-chatbot/     Cloudflare Worker : assistant IA (POST /) et formulaire (POST /contact)
api/                Ancien backend Dialogflow (Express), conservé en secours
```

## Démarrage

Prérequis : Node.js 20+.

```bash
npm install
npm start          # http://localhost:4200
```

Le site utilise par défaut le Worker déployé (`cloudflareWorkerUrl` dans [src/environments/environment.ts](src/environments/environment.ts)).

### Worker

```bash
cd my-llm-chatbot
npm install
npx wrangler secret put STATICFORMS_API_KEY   # une seule fois
npm run dev        # local
npm run deploy     # production
npm test
```

Le profil utilisé par l'assistant est écrit en dur dans [my-llm-chatbot/src/index.ts](my-llm-chatbot/src/index.ts) (`PROFILE`) : à mettre à jour en même temps que le site. Les origines autorisées pour le formulaire sont dans `ALLOWED_FORM_ORIGINS`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm test` | Tests unitaires (Karma) |

Vercel déploie automatiquement à chaque push sur `master`.

## Contact

theobizet@outlook.fr · [GitHub](https://github.com/theobizet)
