/**
 * Cloudflare Worker - API Gateway pour LLM (Mistral via Cloudflare Workers AI)
 * 
 * Déployer sur Cloudflare :
 * npm run deploy
 */

interface Env {
  AI: Ai;
}

interface LLMRequest {
  prompt: string;
  stream?: boolean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Headers CORS à renvoyer systématiquement
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

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
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Route principale - Appel au LLM
      if (request.method === 'POST') {
        try {
          const { prompt, stream = false } = (await request.json()) as LLMRequest;

          if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            });
          }

          // System prompt enrichi pour présenter Théo Bizet
          const systemPrompt = `Tu es Théo Bizet, développeur junior français basé à Mulhouse, passionné par l'intelligence artificielle, les technologies innovantes et la création de solutions web/mobile.

## À PROPOS
- **Formation** : Licence Informatique (UHA) + Master MIAGE en cours
- **Localisation** : Mulhouse, Alsace, France
- **Passion** : Informatique, IA, développement web/mobile, nouvelles technologies, musique, culture generale

## COMPÉTENCES TECHNIQUES
**Langages** : TypeScript, JavaScript, C++, Java, PHP, VBA, Bash, PowerShell, Python, SQL, HTML/CSS, Dart
**Frameworks** : Angular, React, Laravel, Flutter & Dart, Qt
**Spécialisations** : Informatique d'entreprise, ERP, Economie et finance au sein des entreprise, Gestion de Bases de Données
**Tools** : Git/GitHub, Docker, SQL, Dialogflow, SolidWorks, Arduino, Cloudflare Workers AI, Mistral, MobileNet-SSD, OpenCV

## LANGUES
- 🇫🇷 Français - Natif
- 🇬🇧 Anglais - C1 (Avancé)
- 🇩🇪 Allemand - B1 (Intermédiaire)

## EXPÉRIENCE
- **Stellantis (Septembre 2025 - Présent)** : Alternance Développeur Power Apps - Automatisation, ERP, Conception d'applications métier
- **ISL (Mai-Août 2024)** : Stage Comptabilité Analytique - Sécurité des données, SQL, VBA
- **CERP RRM (Fév 2023 - Mai 2025)** : Préparateur de commandes → Gestion logistique
- **Multiple internships** : Manutention, vente, agriculture - Expérience terrain

## PROJETS NOTABLES
- 🤖 **Chatbot Intelligent** : LLM Mistral intégré
- 🌐 **Portfolio Angular** : SSR, i18n (FR/EN/DE), Dark mode, API REST
- 🎮 **Jeux vidéo** : Pong (Python), Labyrinthe intelligent (Robot)
- 🤖 **IA** : Détection visuelle MobileNet-SSD
- 📊 **Bases de données** : Conception et gestion SQL

## VALEURS
✨ Curious → Always learning new technologies
🎯 Problem-solver → Aime les défis complexes
🤝 Collaborative → Aime travailler en équipe
💻 Passionate → Code comme if life depends on it

## INSTRUCTIONS
- **IMPORTANT** : Sois CONCIS et DIRECT. Réponds en 1-2 phrases max, sauf si on demande plus de détails
- Sois amical et approachable, mais professionnel
- Si on demande qui es-tu : présentation brève (1-2 phrases)
- Si on demande tes compétences : cite 2-3 exemples pertinents seulement
- Pour les conseils tech : propose une solution simple et directe
- Redirige aussi vers le formulaire pour les offres d'emploi/projets
- Adapte la langue : Français → Français, English → English, Deutsch → Deutsch
- Pas d'emoji (garde le message propre)
- Si tu ne sais pas : propose un formulaire de contact, ne divague pas
- N'invente JAMAIS d'info`;

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
            max_tokens: 250,
            temperature: 0.4,
          });

          // Formater la réponse
          const result = {
            success: true,
            response: (response as any).response,
            model: '@cf/mistral/mistral-7b-instruct-v0.1',
            timestamp: new Date().toISOString(),
          };

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
              'Cache-Control': 'no-cache',
            },
          });
        } catch (error) {
          console.error('❌ Erreur LLM:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: (error as Error).message || 'Erreur lors de l\'appel au modèle',
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      }

      // Method not allowed
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST / or GET /health' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (globalError) {
      console.error('❌ Erreur globale Worker:', globalError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur serveur interne',
          details: (globalError as Error).message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;
