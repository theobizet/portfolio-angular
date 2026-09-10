/*
 * Cloudflare Worker - API Gateway pour LLM (Mistral via Cloudflare Workers AI)
 * 
 * Déployer sur Cloudflare :
 * npm run deploy
 */

interface Env {
  AI: Ai;
  /** Clé API Static Forms, injectée via `wrangler secret put STATICFORMS_API_KEY`. */
  STATICFORMS_API_KEY: string;
}

interface LLMRequest {
  prompt: string;
  stream?: boolean;
}

interface ContactRequest {
  name?: string;
  email?: string;
  message?: string;
  /** Champ piège : invisible pour un humain, rempli par les robots. */
  honeypot?: string;
}

const STATICFORMS_ENDPOINT = 'https://api.staticforms.dev/submit';

/** Origines autorisées à poster le formulaire de contact. */
const ALLOWED_FORM_ORIGINS = [
  'https://portfolio-angular-theo.vercel.app',
  'http://localhost:4200',
];

// Headers CORS à renvoyer systématiquement
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Toutes les réponses JSON du Worker passent par ici (statut + CORS + Content-Type)
const jsonResponse = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });

/**
 * Relaie le formulaire de contact vers Static Forms.
 * La clé API reste côté Worker : elle n'apparaît jamais dans le bundle du site.
 */
const handleContact = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get('Origin');
  if (origin && !ALLOWED_FORM_ORIGINS.includes(origin)) {
    return jsonResponse({ success: false, error: 'Origine non autorisée' }, 403);
  }

  const { name, email, message, honeypot } = (await request.json()) as ContactRequest;

  // Piège à robots : on répond « ok » sans rien transmettre
  if (honeypot) {
    return jsonResponse({ success: true }, 200);
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return jsonResponse({ success: false, error: 'Nom, email et message sont obligatoires' }, 400);
  }

  if (!env.STATICFORMS_API_KEY) {
    console.error('❌ STATICFORMS_API_KEY absente : `wrangler secret put STATICFORMS_API_KEY`');
    return jsonResponse({ success: false, error: 'Formulaire non configuré' }, 500);
  }

  const upstream = await fetch(STATICFORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: env.STATICFORMS_API_KEY,
      subject: 'Contact depuis mon site',
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      replyTo: email.trim(),
    }),
  });

  const result = (await upstream.json()) as { success?: boolean; message?: string };

  if (!upstream.ok || result.success === false) {
    console.error('❌ Static Forms a refusé la soumission:', upstream.status, result.message);
    return jsonResponse({ success: false, error: "L'envoi a échoué, réessaie plus tard." }, 502);
  }

  return jsonResponse({ success: true }, 200);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Route Health Check
      if (request.url.includes('/health') && request.method === 'GET') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200);
      }

      // Route formulaire de contact
      if (request.method === 'POST' && new URL(request.url).pathname === '/contact') {
        return await handleContact(request, env);
      }

      // Route principale - Appel au LLM
      if (request.method === 'POST') {
        try {
          const { prompt, stream = false } = (await request.json()) as LLMRequest;

          if (!prompt) {
            return jsonResponse({ error: 'Prompt is required' }, 400);
          }

          // System prompt enrichi pour présenter Théo Bizet
          const systemPrompt = `Tu es Théo Bizet, développeur junior français basé à Mulhouse, passionné par l'informatique, les technologies innovantes et la création de solutions web/mobile.

PROFIL
- Formation : Licence Informatique (UHA) + Master MIAGE en alternance
- Employeur actuel : Stellantis (2025 - aujourd'hui) - Développement d'outils internes avec Power Apps et Power Automate, ainsi que de tableaux de bord Power BI
- Localisation : Mulhouse, Alsace, France
- Passion : Développement, IA, nouvelles technologies, musique, culture générale

COMPÉTENCES ACQUISES
Langages : Python, TypeScript, JavaScript, C++, Java, PHP, VBA, Bash, PowerShell, SQL, Dart
Frameworks : Angular, React, Laravel, Flutter, Qt, Node.js
Spécialisations : Bases de Données, comptabilité analytique, informatique d'entreprise
Tools : Git/GitHub, Docker, SQL, Power BI, Power Automate, Power Apps

CERTIFICATIONS
- Goethe Pro A2 (2023)
- CLES B2 (2023)

LANGUES
Français (natif), Anglais (C1), Allemand (B1)

EXPÉRIENCE
- Stellantis (2025 - aujourd'hui) : Développeur d'outils internes avec Power Apps, Power Automate, et tableaux de bord Power BI
- E.Leclerc (mai 2025 - septembre 2025) : Stage en comptabilité analytique - développement d'outils de reporting avec SQL et VBA
- ISL (Mai-Août 2024) : Stage Comptabilité - Sécurité, SQL, VBA
- CERP RRM (Fév 2023 - Mai 2025) : Préparateur de commandes
- GRG Alsace (été 2022) : Déploiement de solutions informatiques pour la gestion de stock

PROJETS
- Chatbot avec Mistral LLM via Cloudflare Workers AI
- Portfolio Angular avec SSR, i18n (FR/EN/DE), dark mode
- Jeux : Pong (Python), Labyrinthe (Robot)
- IA : Détection visuelle MobileNet-SSD

POSTE RECHERCHÉ
- Développeur Mobile (Dart Flutter, React Native, Kotlin, Swift)
- Développeur Full Stack (Node.js, Laravel, PHP, Angular, React)
- Développeur logiciel (C++, Java, Python)
- Développeur IA/ML (Python, LLM, Computer Vision)
- CDI junior

OBJECTIFS
- Apprendre et évoluer dans le développement Full Stack, l'IA et la cybersécurité
- Contribuer à des projets innovants et impactants
- Travailler dans une équipe dynamique et passionnée

INSTRUCTIONS
1. Réponds TOUJOURS dans la MÊME LANGUE que l'utilisateur
2. Fais des réponses COURTES (1-2 phrases max)
3. Sois conversationnel et amical, pas formel
4. Pas de liste, pas de formatage complexe
5. Si questions sur compétences : cite 2-3 exemples seulement
6. Si conseil tech : propose UNE solution simple
7. Pour offres emploi : redirige vers formulaire
8. Pas d'emoji, pas d'accents spéciaux si possible
9. Si tu ne sais pas : propose le formulaire
10. N'INVENTE JAMAIS d'informations - reste honnête
11. Si question hors sujet : redirige vers formulaire
12. Si question sur toi : réponds en tant que Théo, pas en tant que chatbot
13. Si question sur ton code : explique brièvement, pas de détails techniques complexes
14. Si question sur ta personnalité : sois humble et modeste
15. Si question sur tes projets : parle de 1-2 projets récents seulement
16. Si question sur tes compétences : parle de 1-2 compétences clés seulement
17. Si question sur ta formation : parle de 1-2 points clés seulement
18. Si question sur ton expérience : parle de 1-2 expériences clés seulement
19. Si question sur tes passions : parle de 1-2 passions clés seulement
20. Si question sur ta localisation : parle de Mulhouse et de l'Alsace seulement

Maintenant, réponds à la question de l'utilisateur en suivant ces instructions à la lettre !`;

          // Appel à Cloudflare Workers AI - Modèle Mistral
          const response = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 300,
            temperature: 0.6,
          });

          // Formater la réponse
          const result = {
            success: true,
            response: (response as any).response,
            model: '@cf/mistral/mistral-7b-instruct-v0.1',
            timestamp: new Date().toISOString(),
          };

          return jsonResponse(result, 200, { 'Cache-Control': 'no-cache' });
        } catch (error) {
          console.error('❌ Erreur LLM:', error);
          return jsonResponse({
            success: false,
            error: (error as Error).message || 'Erreur lors de l\'appel au modèle',
          }, 500);
        }
      }

      // Method not allowed
      return jsonResponse({ error: 'Method not allowed. Use POST /, POST /contact or GET /health' }, 405);
    } catch (globalError) {
      console.error('❌ Erreur globale Worker:', globalError);
      return jsonResponse({
        success: false,
        error: 'Erreur serveur interne',
        details: (globalError as Error).message,
      }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
