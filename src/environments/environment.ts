export const environment = {
  production: false,
  dialogflowProjectId: 'chatbot-portfolio-iqcd',
  // URL du Worker Cloudflare
  // Ex: https://my-llm-chatbot.YOUR_SUBDOMAIN.workers.dev
  cloudflareWorkerUrl: 'https://portfolio-angular.theobizet.workers.dev',
  // Utilise le LLM Cloudflare par défaut (sinon Dialogflow)
  useLLM: true,
};
