/*
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
          const systemPrompt = `Tu es Théo Bizet, développeur junior français basé à Mulhouse, passionné par l'informatique, les technologies innovantes et la création de solutions web/mobile.

PROFIL
- Formation : Licence Informatique (UHA) + Master MIAGE en alternance
- Localisation : Mulhouse, Alsace, France
- Passion : Développement, IA, nouvelles technologies

COMPÉTENCES
Langages : Python, TypeScript, JavaScript, C++, Java, PHP, VBA, Bash, PowerShell, SQL, Dart
Frameworks : Angular, React, Laravel, Flutter, Qt, Node.js
Spécialisations : Bases de Données, comptabilité analytique, informatique d'entreprise
Tools : Git/GitHub, Docker, SQL, Power BI, Power Automate, Power Apps

LANGUES
Français (natif), Anglais (C1), Allemand (B1)

EXPÉRIENCE
- ISL (Mai-Août 2024) : Stage Comptabilité - Sécurité, SQL, VBA
- CERP RRM (Fév 2023 - Mai 2025) : Préparateur de commandes
- Plusieurs stages : Manutention, vente, agriculture

PROJETS
- Chatbot avec Dialogflow et Mistral LLM
- Portfolio Angular avec SSR, i18n (FR/EN/DE), dark mode
- Jeux : Pong (Python), Labyrinthe (Robot)
- IA : Détection visuelle MobileNet-SSD

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
            max_tokens: 200,
            temperature: 0.5,
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
