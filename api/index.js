const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pour le webhook Dialogflow
app.post('/webhook', (req, res) => {
  const { queryResult } = req.body;
  const { intent, parameters } = queryResult;

  let responseText = '';

  // Logique personnalisée en fonction de l'intent
  switch (intent.displayName) {
    case 'Default Welcome Intent':
      responseText = 'Bonjour ! Comment puis-je t’aider aujourd’hui ?';
      break;
    case 'monIntentPersonnalise':
      responseText = `Voici une réponse personnalisée pour ${parameters.nomParametre || 'ton paramètre'}.`;
      break;
    default:
      responseText = `Désolé, je ne comprends pas l'intent "${intent.displayName}".`;
  }

  // Réponse au format attendu par Dialogflow
  res.json({
    fulfillmentText: responseText,
    source: 'webhook'
  });
});

// Export pour Vercel
module.exports = app;
