const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const app = express();
app.use(express.json());

// Charger les données du CV
const cvData = require('./cv.json');

// Route pour obtenir un token Dialogflow
app.get('/get-dialogflow-token', async (req, res) => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/dialogflow'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    res.json({ token: token.token });
  } catch (error) {
    console.error('Erreur token :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la génération du token' });
  }
});

// Helper pour formater les listes
const formatList = (items, property) => {
  if (!items || !Array.isArray(items)) return "Aucune donnée disponible.";
  return items.map(item => `• ${property ? item[property] : item}`).join('\n');
};

// Helper pour trouver un élément dans une liste (case-insensitive)
const findInList = (list, searchTerm, property) => {
  if (!list || !Array.isArray(list)) return null;
  return list.find(item =>
    property ?
      item[property].toLowerCase().includes(searchTerm.toLowerCase()) :
      item.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

app.post('/webhook', (req, res) => {
  try {
    const { queryResult } = req.body;
    const { intent, parameters } = queryResult;

    let responseText = '';
    let richResponses = [];

    // Logique pour chaque intent
    switch (intent.displayName) {
      case 'presentation':
        responseText = `${cvData.presentation.profil} ${cvData.presentation.question_suivante}`;
        break;

      case 'competences':
        responseText = `Voici mes compétences principales :\n${formatList(cvData.competences.liste, 'nom')}\n\n`;
        responseText += "Tu veux des détails sur une technologie en particulier ?";
        break;

      case 'competence_detail':
        const competenceName = parameters.competence;
        const competenceObj = findInList(cvData.competences.liste, competenceName, 'nom');
        const competenceDetails = competenceObj ? cvData.competences.details[competenceObj.nom] : null;

        if (competenceDetails) {
          responseText = `Oui, je maîtrise ${competenceObj.nom} (Niveau: ${competenceObj.niveau}, ${competenceObj.annees} ans d'expérience) :\n`;
          responseText += `${competenceDetails.description}\n`;
          responseText += `Projets associés : ${competenceDetails.projets.join(', ')}.\n`;
          responseText += `Outils utilisés : ${competenceDetails.outils.join(', ')}.`;
        } else {
          responseText = `Je connais ${competenceName}, mais je n’ai pas encore de détails spécifiques à te montrer.\n`;
          responseText += `Voici mes compétences : ${formatList(cvData.competences.liste, 'nom')}.`;
        }
        break;

      case 'experience':
        responseText = `J’ai travaillé chez :\n${formatList(cvData.experiences, 'entreprise')}\n`;
        responseText += "Tu veux des détails sur une expérience en particulier ?";
        break;

      case 'experience_detail':
        const entreprise = parameters.entreprise.toLowerCase();
        const exp = findInList(cvData.experiences, entreprise, 'entreprise');

        if (exp) {
          responseText = `Chez ${exp.entreprise} (${exp.annee} à ${exp.lieu}), j’ai occupé le poste de ${exp.poste} (${exp.type}).\n`;
          responseText += "Mes missions incluaient :\n";
          responseText += exp.details.map(detail => `- ${detail}`).join('\n');
          responseText += `\nCompétences acquises : ${exp.competences.join(', ')}.`;
        } else {
          responseText = `Je n’ai pas d’expérience enregistrée pour ${entreprise}.\n`;
          responseText += `Voici mes expériences : ${formatList(cvData.experiences, 'entreprise')}.`;
        }
        break;

      case 'formation':
        responseText = `Voici mon parcours académique :\n`;
        responseText += cvData.formations.map(f =>
          `• ${f.diplome} à ${f.etablissement} (${f.annee})`
        ).join('\n');
        responseText += "\nTu veux des précisions sur une formation ?";
        break;

      case 'formation_detail':
        const formationTerm = parameters.formation.toLowerCase();
        const form = cvData.formations.find(f =>
          f.diplome.toLowerCase().includes(formationTerm) ||
          f.etablissement.toLowerCase().includes(formationTerm)
        );

        if (form) {
          responseText = `Pendant ma ${form.diplome} à ${form.etablissement} (${form.annee}, ${form.lieu}) :\n`;
          responseText += form.details.map(detail => `- ${detail}`).join('\n');
          responseText += `\nCompétences acquises : ${form.competences.join(', ')}.`;
        } else {
          responseText = `Je n’ai pas de formation enregistrée pour "${formationTerm}".\n`;
          responseText += `Voici mon parcours : ${formatList(cvData.formations, 'diplome')}.`;
        }
        break;

      case 'projets':
        responseText = `Voici quelques projets :\n`;
        responseText += cvData.projets.map(p =>
          `• ${p.nom} (${p.technos.join(', ')}) - ${p.annee}`
        ).join('\n');
        responseText += "\nTu veux des détails sur l’un d’eux ?";
        break;

      case 'projet_detail':
        const projetName = parameters.projet.toLowerCase();
        const proj = findInList(cvData.projets, projetName, 'nom');

        if (proj) {
          responseText = `${proj.nom} (${proj.annee}) :\n${proj.description}\n`;
          responseText += `Technologies : ${proj.technos.join(', ')}.\n`;

          if (proj.lien) responseText += `Lien : ${proj.lien}\n`;
          if (proj.github) responseText += `Code source : ${proj.github}\n`;

          responseText += "Détails :\n";
          responseText += proj.details.map(detail => `- ${detail}`).join('\n');

          if (proj.lien || proj.github) {
            richResponses = [{
              type: "info",
              title: proj.nom,
              subtitle: proj.description,
              actionLink: proj.lien || proj.github
            }];
          }
        } else {
          responseText = `Je n’ai pas de projet nommé "${projetName}".\n`;
          responseText += `Voici mes projets : ${formatList(cvData.projets, 'nom')}.`;
        }
        break;

      case 'contact':
        responseText = `Tu peux me contacter via :\n`;
        responseText += `• Email : ${cvData.contact.email}\n`;
        responseText += `• LinkedIn : ${cvData.contact.linkedin}\n`;
        responseText += `• GitHub : ${cvData.contact.github}\n`;
        responseText += `• Site web : ${cvData.contact.site}\n`;
        responseText += "Quel moyen préfères-tu ?";
        break;

      case 'collect_contact':
        const typeContact = parameters.type_contact.toLowerCase();
        if (cvData.contact[typeContact]) {
          responseText = `Voici mon ${typeContact} : ${cvData.contact[typeContact]}`;
        } else {
          responseText = `Je n’ai pas de ${typeContact} enregistré.\n`;
          responseText += "Voici mes coordonnées disponibles :\n";
          for (const [key, value] of Object.entries(cvData.contact)) {
            if (value) responseText += `• ${key} : ${value}\n`;
          }
        }
        break;

      case 'laisser_message':
        responseText = "Super ! Quel est ton email et ton message ?";
        // Pour gérer une conversation multi-étapes, utilise outputContexts
        break;

      case 'merci':
        responseText = "Avec plaisir ! N’hésite pas à revenir si tu as d’autres questions. Bonne journée !";
        break;

      default:
        responseText = "Je peux te parler de mon parcours, mes compétences ou mes projets. Que veux-tu savoir ?";
    }

    // Réponse avec rich content si nécessaire
    const response = {
      fulfillmentText: responseText,
      source: 'webhook'
    };

    if (richResponses.length > 0) {
      response.fulfillmentMessages = [{
        payload: {
          richContent: [richResponses]
        }
      }];
    }

    res.json(response);

  } catch (error) {
    console.error('Erreur dans le webhook :', error);
    res.status(500).json({
      fulfillmentText: "Désolé, une erreur est survenue. Peux-tu répéter ta question ?",
      source: 'webhook'
    });
  }
});

module.exports = app;
