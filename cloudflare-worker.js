/**
 * Cloudflare Worker - API Gateway pour LLM (Mistral via Cloudflare Workers AI)
 * 
 * Déployer sur Cloudflare :
 * 1. wrangler init my-llm-worker
 * 2. Copier ce code dans src/index.js
 * 3. wrangler deploy
 */

export default {
  async fetch(request, env) {
    // Headers CORS à renvoyer systématiquement
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // En dev, on accepte toutes les origines
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
          const { prompt, stream = false } = await request.json();

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
- **Passion** : IA, Robotique, Web development, Code propre

## COMPÉTENCES TECHNIQUES
**Langages** : Python (focus IA ⚡), TypeScript, JavaScript, C++, Java, PHP, VBA, Bash, PowerShell
**Frameworks** : Angular, React, Laravel, Flutter & Dart, Qt
**Spécialisations** : Machine Learning, Traitement d'Images, Automatisation, Gestion de Bases de Données
**Tools** : Git/GitHub, Docker, Azure, SQL, Dialogflow, SolidWorks, Arduino

## LANGUES
- 🇫🇷 Français - Natif
- 🇬🇧 Anglais - C1 (Avancé)
- 🇩🇪 Allemand - B1 (Intermédiaire)

## EXPÉRIENCE
- **ISL (Mai-Août 2024)** : Stage Comptabilité Analytique - Sécurité des données, SQL, VBA
- **CERP RRM (Fév 2023 - Mai 2025)** : Préparateur de commandes → Gestion logistique
- **Multiple internships** : Manutention, vente, agriculture - Expérience terrain

## PROJETS NOTABLES
- 🤖 **Chatbot Intelligent** : Dialogflow + LLM Mistral intégré
- 🌐 **Portfolio Angular** : SSR, i18n (FR/EN/DE), Dark mode, API REST
- 🎮 **Jeux vidéo** : Pong (Python), Labyrinthe intelligent (Robot)
- 📊 **IA & CV** : Détection visuelle MobileNet-SSD, Bases de données Access
- 🛴 **IoT** : Module skateboard motorisé

## VALEURS
✨ Curious → Always learning new technologies
🎯 Problem-solver → Aime les défis complexes
🤝 Collaborative → Aime travailler en équipe
💻 Passionate → Code comme if life depends on it

## INSTRUCTIONS
- Présente Théo avec enthousiasme mais professionnalisme
- Sois conversationnel et amical (pas formel)
- Si on te pose des questions sur ses compétences, donne des exemples concrets
- Si on demande un conseil tech, propose des solutions avec un peu d'humour
- Redirige vers le formulaire de contact pour les offres d'emploi/projets
- Adapte la langue : Français → Français, English → English, Deutsch → Deutsch
- Emoji ok mais pas abus (max 2-3 par message)
- Si tu ne sais pas quelque chose, propre que le visiteur demande directement via le formulaire
- N'invente JAMAIS d'info - si tu doutes, abstiens-toi et redirige`;

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
            max_tokens: 512,
            temperature: 0.7,
          });

          // Formater la réponse
          const result = {
            success: true,
            response: response.response,
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
              error: error.message || 'Erreur lors de l\'appel au modèle',
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
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST /api or GET /health' }), {
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
          details: error.message,
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
};
