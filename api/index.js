const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const app = express();
app.use(express.json());

// Charger la clé du compte de service depuis une variable d'environnement
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Route pour obtenir un token Dialogflow
app.get('/get-dialogflow-token', async (req, res) => {
  try {
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/dialogflow'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    res.json({ token: token.token });
  } catch (error) {
    console.error('Erreur token :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Webhook pour Dialogflow
app.post('/webhook', (req, res) => {
  console.log('Webhook appelé :', req.body);
  res.json({ fulfillmentText: "Réponse du webhook Vercel !" });
});

module.exports = app;
