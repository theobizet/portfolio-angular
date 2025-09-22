const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const app = express();
app.use(express.json());
const cvData = require('./cv.json');

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

app.post('/webhook', (req, res) => {
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
      responseText = `Voici mes compétences principales : ${cvData.competences.liste.join(', ')}.
      Tu veux des détails sur une technologie en particulier ?`;
      break;

    case 'competence_detail':
      const competence = parameters.competence.toLowerCase();
      if (cvData.competences.details[competence]) {
        responseText = `Oui, je maîtrise ${competence} !
        ${cvData.competences.details[competence]}`;
      } else {
        responseText = `Je connais ${competence}, mais je n’ai pas encore de projet spécifique à te montrer.
        Voici mes compétences détaillées : ${cvData.competences.liste.join(', ')}.`;
      }
      break;

    case 'experience':
      responseText = `J’ai travaillé chez :
      ${cvData.experiences.map(exp => `• ${exp.entreprise} (${exp.annee})`).join('\n')}
      Tu veux des détails sur une expérience en particulier ?`;
      break;

    case 'experience_detail':
      const entreprise = parameters.entreprise.toLowerCase();
      const exp = cvData.experiences.find(e =>
        e.entreprise.toLowerCase().includes(entreprise)
      );
      if (exp) {
        responseText = `Chez ${exp.entreprise}, j’ai occupé le poste de ${exp.poste} en ${exp.annee}.
        Mes missions incluaient : ${exp.details}`;
      } else {
        responseText = `Je n’ai pas d’expérience enregistrée pour ${entreprise}.
        Voici mes expériences : ${cvData.experiences.map(e => e.entreprise).join(', ')}.`;
      }
      break;

    case 'formation':
      responseText = `Voici mon parcours académique :
      ${cvData.formations.map(f => `• ${f.diplome} à ${f.etablissement} (${f.annee})`).join('\n')}
      Tu veux des précisions sur une formation ?`;
      break;

    case 'formation_detail':
      const formation = parameters.formation.toLowerCase();
      const form = cvData.formations.find(f =>
        f.diplome.toLowerCase().includes(formation) ||
        f.etablissement.toLowerCase().includes(formation)
      );
      if (form) {
        responseText = `Pendant ma ${form.diplome} à ${form.etablissement} (${form.annee}), j’ai étudié :
        ${form.details}`;
      } else {
        responseText = `Je n’ai pas de formation enregistrée pour ${formation}.
        Voici mon parcours : ${cvData.formations.map(f => f.diplome).join(', ')}.`;
      }
      break;

    case 'projets':
      responseText = `Voici quelques projets :
      ${cvData.projets.map(p => `• ${p.nom} (${p.technos.join(', ')})`).join('\n')}
      Tu veux des détails sur l’un d’eux ?`;
      break;

    case 'projet_detail':
      const projet = parameters.projet.toLowerCase();
      const proj = cvData.projets.find(p =>
        p.nom.toLowerCase().includes(projet)
      );
      if (proj) {
        responseText = `${proj.nom} est un projet développé avec ${proj.technos.join(', ')}.
        ${proj.details} Tu peux le voir ici : ${proj.lien}`;
        richResponses = [{
          type: "info",
          title: proj.nom,
          subtitle: proj.details,
          actionLink: proj.lien
        }];
      } else {
        responseText = `Je n’ai pas de projet nommé ${projet}.
        Voici mes projets : ${cvData.projets.map(p => p.nom).join(', ')}.`;
      }
      break;

    case 'contact':
      responseText = `Tu peux me contacter via :
      • Email : ${cvData.contact.email}
      • LinkedIn : ${cvData.contact.linkedin}
      • GitHub : ${cvData.contact.github}
      Quel moyen préfères-tu ?`;
      break;

    case 'collect_contact':
      const typeContact = parameters.type_contact.toLowerCase();
      if (cvData.contact[typeContact]) {
        responseText = `Voici mon ${typeContact} : ${cvData.contact[typeContact]}`;
      } else {
        responseText = `Je n’ai pas de ${typeContact} enregistré.
        Voici mes coordonnées : ${JSON.stringify(cvData.contact)}.`;
      }
      break;

    case 'laisser_message':
      responseText = "Super ! Quel est ton email et ton message ?";
      // Active le fulfillment pour cet intent dans Dialogflow
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
    response['fulfillmentMessages'] = [{
      payload: {
        richContent: [richResponses.map(item => [item])]
      }
    }];
  }

  res.json(response);
});

module.exports = app;
