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
  return items.map(item => `• ${property ? item[property] : item}`).join('<br>');
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
        // Si des variations existent dans cvData.presentation.variations, choisir aléatoirement
        if (cvData.presentation.variations && Array.isArray(cvData.presentation.variations) && cvData.presentation.variations.length > 0) {
          const variation = cvData.presentation.variations[Math.floor(Math.random() * cvData.presentation.variations.length)];
          responseText = `${variation} ${cvData.presentation.question_suivante}`;
        } else {
          responseText = `${cvData.presentation.profil} ${cvData.presentation.question_suivante}`;
        }
        break;

      case 'competences':
        responseText = `Voici mes compétences principales :<br>${formatList(cvData.competences.liste, 'nom')}<br><br>`;
        responseText += "Tu veux des détails sur une technologie en particulier ?";
        break;

      case 'competence_detail':
        const competenceName = parameters.competence;
        let competenceObj = findInList(cvData.competences.liste, competenceName, 'nom');
        let competenceDetails = competenceObj ? cvData.competences.details[competenceObj.nom] : null;

        // Gestion pour "développement web"
        if (!competenceObj && competenceName.toLowerCase().includes('web')) {
          responseText = `En développement web, j'utilise principalement Angular, TypeScript, HTML/CSS et JavaScript. Tu veux des détails sur l'une de ces technologies ?`;
        }
        // Gestion pour "développement mobile"
        else if (!competenceObj && (competenceName.toLowerCase().includes('mobile') || competenceName.toLowerCase().includes('android'))) {
          responseText = `En développement mobile, j'utilise surtout Kotlin et Java pour Android. Tu veux des détails sur Kotlin, Java ou un projet mobile en particulier ?`;
        }
        // Gestion pour "développement logiciel"
        else if (!competenceObj && competenceName.toLowerCase().includes('logiciel')) {
          responseText = `En développement logiciel, j'ai de l'expérience avec C++, Python, Qt et OpenCV pour créer des applications de bureau et des outils spécialisés. Tu veux des détails sur l'une de ces technologies ou sur un projet logiciel ?`;
        }
        else if (competenceDetails) {
          responseText = `Oui, je maîtrise ${competenceObj.nom} :<br>`;
          responseText += `${competenceDetails.description}<br>`;
          responseText += `Projets associés : ${competenceDetails.projets.join(', ')}.<br>`;
          responseText += `Outils utilisés : ${competenceDetails.outils.join(', ')}.`;
        } else {
          responseText = `Je connais ${competenceName}, mais je n’ai pas encore de détails spécifiques à te montrer.<br>`;
          responseText += `Voici mes compétences : ${formatList(cvData.competences.liste, 'nom')}.`;
        }
        break;

      case 'experience':
        responseText = `J’ai travaillé chez :<br>${formatList(cvData.experiences, 'entreprise')}<br>`;
        responseText += "Tu veux des détails sur une expérience en particulier ?";
        break;

      case 'experience_detail':
        const entreprise = parameters.entreprise.toLowerCase();
        const exp = findInList(cvData.experiences, entreprise, 'entreprise');

        if (exp) {
          responseText = `Chez ${exp.entreprise} (${exp.annee} à ${exp.lieu}), j’ai occupé le poste de ${exp.poste} (${exp.type}).<br>`;
          responseText += "Mes missions incluaient :<br>";
          responseText += exp.details.map(detail => `- ${detail}`).join('<br>');
          responseText += `<br>Compétences acquises : ${exp.competences.join(', ')}.`;
        } else {
          responseText = `Je n’ai pas d’expérience enregistrée pour ${entreprise}.<br>`;
          responseText += `Voici mes expériences : ${formatList(cvData.experiences, 'entreprise')}.`;
        }
        break;

      case 'formation':
        responseText = `Voici mon parcours académique :<br>`;
        responseText += cvData.formations.map(f =>
          `• ${f.diplome} à ${f.etablissement} (${f.annee})`
        ).join('<br>');
        responseText += "<br>Tu veux des précisions sur une formation ?";
        break;

      case 'formation_detail':
        const formationTerm = parameters.formation.toLowerCase();
        const form = cvData.formations.find(f =>
          f.diplome.toLowerCase().includes(formationTerm) ||
          f.etablissement.toLowerCase().includes(formationTerm)
        );

        if (form) {
          responseText = `Pendant ma ${form.diplome} à ${form.etablissement} (${form.annee}, ${form.lieu}) :<br>`;
          responseText += form.details.map(detail => `- ${detail}`).join('<br>');
          responseText += `<br>Compétences acquises : ${form.competences.join(', ')}.`;
        } else {
          responseText = `Je n’ai pas de formation enregistrée pour "${formationTerm}".<br>`;
          responseText += `Voici mon parcours : ${formatList(cvData.formations, 'diplome')}.`;
        }
        break;

      case 'projets':
        responseText = `Voici quelques projets :<br>`;
        responseText += cvData.projets.map(p =>
          `• ${p.nom} (${p.technos.join(', ')}) - ${p.annee}`
        ).join('<br>');
        responseText += "<br>Tu veux des détails sur l’un d’eux ?";
        break;

      case 'projet_detail':
        const projetName = parameters.projet.toLowerCase();
        const proj = findInList(cvData.projets, projetName, 'nom');

        if (proj) {
          responseText = `${proj.nom} (${proj.annee}) :<br>${proj.description}<br>`;
          responseText += `Technologies : ${proj.technos.join(', ')}.<br>`;

          if (proj.lien) responseText += `Lien : ${proj.lien}<br>`;
          if (proj.github) responseText += `Code source : ${proj.github}<br>`;

          responseText += "Détails :<br>";
          responseText += proj.details.map(detail => `- ${detail}`).join('<br>');

          if (proj.lien || proj.github) {
            richResponses = [{
              type: "info",
              title: proj.nom,
              subtitle: proj.description,
              actionLink: proj.lien || proj.github
            }];
          }
        } else {
          responseText = `Je n’ai pas de projet nommé "${projetName}".<br>`;
          responseText += `Voici mes projets : ${formatList(cvData.projets, 'nom')}.`;
        }
        break;

      case 'contact':
        responseText = `Tu peux me contacter via :<br>`;
        responseText += `• Email : ${cvData.contact.email}<br>`;
        responseText += `• LinkedIn : ${cvData.contact.linkedin}<br>`;
        responseText += `• GitHub : ${cvData.contact.github}<br>`;
        responseText += `• Site web : ${cvData.contact.site}<br>`;
        responseText += "Quel moyen préfères-tu ?";
        break;

      case 'collect_contact':
        const typeContact = parameters.type_contact.toLowerCase();
        if (cvData.contact[typeContact]) {
          responseText = `Voici mon ${typeContact} : ${cvData.contact[typeContact]}`;
        } else {
          responseText = `Je n’ai pas de ${typeContact} enregistré.<br>`;
          responseText += "Voici mes coordonnées disponibles :<br>";
          for (const [key, value] of Object.entries(cvData.contact)) {
            if (value) responseText += `• ${key} : ${value}<br>`;
          }
        }
        break;

      case 'laisser_message':
        //responseText = "Super ! Quel est ton email et ton message ?";
        // Pour gérer une conversation multi-étapes, utilise outputContexts
        responseText = "Je ne peux pas encore recevoir de messages directement, mais tu peux m’envoyer un email via mon adresse de contact ou la section 'envoyer un message' de mon site.";
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
