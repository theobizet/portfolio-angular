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
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Route Health Check
    if (request.url.includes('/health') && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
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
              'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
            },
          });
        }

        // Appel à Cloudflare Workers AI - Modèle Mistral
        const response = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant IA helpful et conversationnel. Réponds en français si la question est en français, en anglais si elle est en anglais.',
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
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
            'Cache-Control': 'no-cache', // Les réponses IA ne doivent pas être en cache
          },
        });
      } catch (error) {
        console.error('Erreur LLM:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || 'Erreur lors de l\'appel au modèle',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
            },
          }
        );
      }
    }

    // Autre requête
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      },
    });
  },
};
