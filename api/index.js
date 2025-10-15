const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const app = express();

// Security middleware - Disable X-Powered-By header
app.disable('x-powered-by');

// Store de sessions pour contexte conversationnel (en production, utiliser Redis)
const conversationSessions = new Map();

// Configuration IA pour réponses intelligentes
const AI_CONFIG = {
  sentiment: {
    positive: ['excellent', 'super', 'parfait', 'génial', 'fantastique'],
    negative: ['problème', 'difficile', 'compliqué', 'dur', 'impossible'],
    neutral: ['ok', 'bien', 'ça va', 'normal', 'standard']
  },
  contextDuration: 15 * 60 * 1000, // 15 minutes
  maxContextHistory: 5
};
// CORS configuration for security
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Charger les données du CV
const cvData = require('./cv.json');
const rateLimit = require('express-rate-limit');

// Rate limiting for webhook endpoint
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use(express.json());

// Route pour obtenir un token Dialogflow
app.get('/get-dialogflow-token', async (req, res) => {
  try {
    // 🔍 Validation des variables d'environnement
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      console.error('❌ Variable GOOGLE_SERVICE_ACCOUNT non définie');
      return res.status(500).json({ 
        error: 'Configuration manquante',
        details: 'GOOGLE_SERVICE_ACCOUNT non configuré'
      });
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    } catch (parseError) {
      console.error('❌ Erreur parsing GOOGLE_SERVICE_ACCOUNT:', parseError.message);
      return res.status(500).json({ 
        error: 'Configuration invalide',
        details: 'Format JSON invalide pour GOOGLE_SERVICE_ACCOUNT'
      });
    }

    // 🔑 Validation des champs requis du service account
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Champs manquants dans service account:', missingFields);
      return res.status(500).json({ 
        error: 'Configuration incomplète',
        details: `Champs manquants: ${missingFields.join(', ')}`
      });
    }

    console.log('🔐 Tentative d\'authentification Google Cloud...');
    
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/dialogflow'],
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token || !token.token) {
      console.error('❌ Token vide reçu de Google Auth');
      return res.status(500).json({ 
        error: 'Authentification échouée',
        details: 'Token vide reçu'
      });
    }

    console.log('✅ Token Dialogflow généré avec succès');
    res.json({ 
      token: token.token,
      expires_at: token.expiry_date || Date.now() + 3600000 // 1 heure par défaut
    });
    
  } catch (error) {
    console.error('❌ Erreur complète lors de la génération du token:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // 🎯 Messages d'erreur spécifiques selon le type d'erreur
    let userMessage = 'Erreur serveur lors de la génération du token';
    let statusCode = 500;
    
    if (error.message?.includes('invalid_grant')) {
      userMessage = 'Credentials Google invalides ou expirés';
      statusCode = 401;
    } else if (error.message?.includes('service account')) {
      userMessage = 'Configuration du service account incorrecte';
      statusCode = 500;
    } else if (error.code === 'ENOTFOUND') {
      userMessage = 'Problème de connectivité avec Google APIs';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
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

// 🧠 Classe pour gérer le contexte conversationnel intelligent
class ConversationContext {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.history = [];
    this.currentTopic = null;
    this.userPreferences = {};
    this.lastInteraction = Date.now();
    this.sentiment = 'neutral';
  }

  addInteraction(intent, parameters, response) {
    this.history.push({
      timestamp: Date.now(),
      intent: intent.displayName,
      parameters,
      response: response.substring(0, 100) + '...'
    });
    
    // Garder seulement les dernières interactions
    if (this.history.length > AI_CONFIG.maxContextHistory) {
      this.history.shift();
    }
    
    this.lastInteraction = Date.now();
    this.updateCurrentTopic(intent.displayName);
  }

  updateCurrentTopic(intentName) {
    const topicMap = {
      'competences': 'competences',
      'competence_detail': 'competences',
      'experience': 'experience',
      'experience_detail': 'experience',
      'formation': 'formation',
      'formation_detail': 'formation',
      'projets': 'projets',
      'projet_detail': 'projets'
    };
    this.currentTopic = topicMap[intentName] || null;
  }

  isExpired() {
    return Date.now() - this.lastInteraction > AI_CONFIG.contextDuration;
  }

  getRelatedSuggestions() {
    const suggestions = {
      'competences': [
        "Veux-tu voir des projets utilisant une technologie spécifique ?",
        "Quel type de développement t'intéresse le plus ?",
        "As-tu des questions sur mon expérience avec ces technologies ?"
      ],
      'experience': [
        "Veux-tu connaître les compétences acquises dans une entreprise ?",
        "T'intéresses-tu à un type de poste en particulier ?",
        "Veux-tu voir des projets liés à cette expérience ?"
      ],
      'projets': [
        "Quel type de projet t'intéresse le plus ?",
        "Veux-tu voir le code source d'un projet ?",
        "As-tu des questions techniques sur l'implémentation ?"
      ]
    };
    
    return suggestions[this.currentTopic] || [
      "Que veux-tu savoir d'autre sur mon profil ?",
      "As-tu des questions sur un domaine spécifique ?"
    ];
  }
}

// 🎯 Fonction d'analyse de sentiment avancée
const analyzeSentiment = (text) => {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Compter les mots positifs/négatifs
  let positiveScore = 0;
  let negativeScore = 0;
  
  AI_CONFIG.sentiment.positive.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  AI_CONFIG.sentiment.negative.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

// 🔍 Recherche floue intelligente
const fuzzySearch = (searchTerm, items, property) => {
  if (!items || !Array.isArray(items)) return [];
  
  const results = items.map(item => {
    const target = property ? item[property] : item;
    const similarity = calculateSimilarity(searchTerm.toLowerCase(), target.toLowerCase());
    return { item, similarity };
  });
  
  return results
    .filter(r => r.similarity > 0.3) // Seuil de similarité
    .sort((a, b) => b.similarity - a.similarity)
    .map(r => r.item);
};

// Calcul de similarité (algorithme de Levenshtein simplifié)
const calculateSimilarity = (a, b) => {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1.0;
  
  // Recherche de sous-chaînes communes
  if (longer.includes(shorter)) return 0.8;
  if (shorter.includes(longer.substring(0, 3))) return 0.6;
  
  return 0.2; // Similarité minimale
};

// 🎨 Génération de réponses adaptatives selon le sentiment
const adaptResponseToSentiment = (response, sentiment, context) => {
  const adaptations = {
    positive: {
      prefix: ["Super ! ", "Excellent ! ", "Parfait ! "],
      suffix: [" 🎉", " 👍", " ✨"]
    },
    negative: {
      prefix: ["Je comprends, ", "Pas de souci, ", "D'accord, "],
      suffix: [" N'hésite pas si tu as besoin de précisions.", " Je suis là pour t'aider.", " On peut creuser davantage si tu veux."]
    },
    neutral: {
      prefix: ["", "Alors, ", "Bien, ", "D'accord, ", "Je vois que tu es intéressé par ce sujet."],
      suffix: ["", " Que veux-tu savoir d'autre ?", " As-tu d'autres questions ?"]
    }
  };
  
  const adaptation = adaptations[sentiment] || adaptations.neutral;
  const prefix = adaptation.prefix[Math.floor(Math.random() * adaptation.prefix.length)];
  const suffix = adaptation.suffix[Math.floor(Math.random() * adaptation.suffix.length)];
  
  return prefix + response + suffix;
};

// 🧠 Détection d'affirmation et négation dans le contexte
const detectAffirmationNegation = (text) => {
  const lowerText = text.toLowerCase();
  
  // Patterns d'affirmation
  const affirmationPatterns = [
    /\b(oui|yes|ok|d'accord|parfait|exactement|correct|c'est ça|tout à fait|absolument)\b/,
    /\b(merci|super|génial|excellent|cool|top|bien)\b/,
    /\b(j'aime|j'adore|m'intéresse|intéressant|impressionnant)\b/
  ];
  
  // Patterns de négation
  const negationPatterns = [
    /\b(non|no|pas|jamais|aucun|rien|nope|nan)\b/,
    /\b(pas vraiment|pas du tout|pas trop|pas tellement)\b/,
    /\b(je ne|j'ai pas|n'ai pas|ne sais pas|connais pas)\b/
  ];
  
  const hasAffirmation = affirmationPatterns.some(pattern => pattern.test(lowerText));
  const hasNegation = negationPatterns.some(pattern => pattern.test(lowerText));
  
  if (hasAffirmation && !hasNegation) return 'affirmation';
  if (hasNegation && !hasAffirmation) return 'negation';
  if (hasAffirmation && hasNegation) return 'mixed';
  return 'neutral';
};

// 🎯 Génération de réponses adaptées au contexte d'affirmation/négation
const adaptResponseToContext = (response, affirmationStatus, context, intent) => {
  const contextualAdaptations = {
    affirmation: {
      competences: [
        "Parfait ! Je vois que tu t'intéresses à mes compétences techniques. ",
        "Super ! Ravi que mes compétences t'intéressent. ",
        "Excellent ! Tu veux creuser davantage sur mes technologies ? "
      ],
      experience: [
        "Génial ! Mon parcours professionnel semble te plaire. ",
        "Super ! Tu veux en savoir plus sur une expérience spécifique ? ",
        "Parfait ! Ces expériences m'ont beaucoup appris. "
      ],
      projets: [
        "Formidable ! Mes projets t'inspirent ? ",
        "Cool ! Tu veux voir le code ou une démo ? ",
        "Excellent ! J'ai pris plaisir à développer ces projets. "
      ],
      default: [
        "Parfait ! Je suis content que ça t'intéresse. ",
        "Super ! On continue sur ce sujet ? ",
        "Génial ! Tu veux approfondir ? "
      ]
    },
    
    negation: {
      competences: [
        "Pas de problème ! Peut-être qu'un autre domaine t'intéresse plus ? ",
        "Je comprends, tout le monde a ses préférences tech. ",
        "D'accord ! Tu cherches quelque chose de spécifique ? "
      ],
      experience: [
        "Pas de souci ! Tu préfères peut-être voir mes projets ou compétences ? ",
        "Je comprends, ce type d'expérience ne correspond peut-être pas à ce que tu cherches. ",
        "D'accord ! Qu'est-ce qui t'intéresserait davantage ? "
      ],
      projets: [
        "Pas de problème ! Quel type de projet t'intéresserait plus ? ",
        "Je comprends, ces projets ne correspondent peut-être pas à tes attentes. ",
        "D'accord ! Tu cherches quelque chose de plus spécifique ? "
      ],
      default: [
        "Pas de problème ! Qu'est-ce qui t'intéresserait plutôt ? ",
        "Je comprends ! On peut changer de sujet. ",
        "D'accord ! Dis-moi ce que tu aimerais savoir. "
      ]
    },
    
    mixed: {
      default: [
        "Je vois que tu as des sentiments mitigés ! ",
        "Intéressant, tu sembles avoir des réserves. ",
        "Je comprends ta position nuancée. "
      ]
    }
  };
  
  if (affirmationStatus === 'neutral') return response;
  
  const currentTopic = context.currentTopic || 'default';
  const adaptationCategory = contextualAdaptations[affirmationStatus];
  const adaptationOptions = adaptationCategory[currentTopic] || adaptationCategory.default;
  
  if (!adaptationOptions) return response;
  
  const selectedAdaptation = adaptationOptions[Math.floor(Math.random() * adaptationOptions.length)];
  
  // Pour les négations, ajouter des suggestions alternatives
  if (affirmationStatus === 'negation') {
    const alternatives = generateAlternativeSuggestions(currentTopic, context);
    return selectedAdaptation + response + alternatives;
  }
  
  // Pour les affirmations, encourager l'exploration
  if (affirmationStatus === 'affirmation') {
    const encouragements = generateEncouragements(currentTopic, context);
    return selectedAdaptation + response + encouragements;
  }
  
  return selectedAdaptation + response;
};

// 💡 Génération de suggestions alternatives pour les négations
const generateAlternativeSuggestions = (currentTopic, context) => {
  const alternatives = {
    competences: [
      "<br><br>💭 Alternatives : Mes projets • Mon expérience • Ma formation",
      "<br><br>🔄 Peut-être que mes réalisations concrètes t'intéresseraient plus ?"
    ],
    experience: [
      "<br><br>💭 Alternatives : Mes compétences techniques • Mes projets • Ma formation",
      "<br><br>🔄 Veux-tu plutôt voir ce que j'ai créé ?"
    ],
    projets: [
      "<br><br>💭 Alternatives : Mes compétences • Mon expérience • Contact",
      "<br><br>🔄 Tu préfères peut-être discuter de mes compétences techniques ?"
    ],
    default: [
      "<br><br>💭 Je peux te parler de : Compétences • Projets • Expérience • Formation • Contact",
      "<br><br>🔄 Qu'est-ce qui t'intéresserait le plus ?"
    ]
  };
  
  const options = alternatives[currentTopic] || alternatives.default;
  return options[Math.floor(Math.random() * options.length)];
};

// 🚀 Génération d'encouragements pour les affirmations
const generateEncouragements = (currentTopic, context) => {
  const encouragements = {
    competences: [
      "<br><br>🔍 Tu veux voir ces compétences en action dans mes projets ?",
      "<br><br>💡 Je peux te montrer comment j'utilise ces technologies !",
      "<br><br>⚡ Veux-tu des détails sur une technologie spécifique ?"
    ],
    experience: [
      "<br><br>🎯 Tu veux connaître les compétences acquises lors de ces expériences ?",
      "<br><br>📂 Je peux te montrer les projets liés à cette expérience !",
      "<br><br>💼 Veux-tu des détails sur un poste particulier ?"
    ],
    projets: [
      "<br><br>🛠️ Tu veux voir le code source ou une démo ?",
      "<br><br>⚙️ Je peux t'expliquer les défis techniques rencontrés !",
      "<br><br>🎨 Veux-tu connaître le processus de développement ?"
    ],
    default: [
      "<br><br>🚀 Continuons à explorer ! Que veux-tu savoir d'autre ?",
      "<br><br>✨ Je suis là pour répondre à toutes tes questions !",
      "<br><br>🎪 N'hésite pas à creuser davantage !"
    ]
  };
  
  const options = encouragements[currentTopic] || encouragements.default;
  return options[Math.floor(Math.random() * options.length)];
};

app.post('/webhook', (req, res) => {
  try {
    const { queryResult, session } = req.body;
    const { intent, parameters, queryText } = queryResult;
    
    // 🧠 Gestion intelligente du contexte de session
    const sessionId = session ? session.split('/').pop() : 'anonymous';
    let context = conversationSessions.get(sessionId);
    
    if (!context || context.isExpired()) {
      context = new ConversationContext(sessionId);
      conversationSessions.set(sessionId, context);
    }
    
    // Analyse du sentiment de la requête utilisateur
    const userSentiment = analyzeSentiment(queryText);
    context.sentiment = userSentiment;
    
    // 🎯 Détection d'affirmation/négation pour adaptation contextuelle
    const affirmationStatus = detectAffirmationNegation(queryText);

    let responseText = '';
    let richResponses = [];
    let suggestions = [];

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
        
        // 🎯 Suggestions personnalisées pour la première interaction
        suggestions = [
          "Mes compétences principales",
          "Mon expérience professionnelle", 
          "Mes projets récents",
          "Ma formation"
        ];
        break;

      case 'competences':
        responseText = `Voici mes compétences principales :<br>${formatList(cvData.competences.liste, 'nom')}<br><br>`;
        responseText += "Tu veux des détails sur une technologie en particulier ?";
        
        // 🎯 Suggestions adaptées selon l'historique de conversation
        if (context.history.length > 0) {
          suggestions = ["Technologies front-end", "Développement mobile", "Intelligence artificielle", "Outils de développement"];
        }
        break;

      case 'competence_detail':
        const competenceName = parameters.competence;
        
        // 🔍 Recherche intelligente avec fuzzy matching
        let competenceObj = findInList(cvData.competences.liste, competenceName, 'nom');
        
        // Si pas trouvé, essayer la recherche floue
        if (!competenceObj) {
          const fuzzyResults = fuzzySearch(competenceName, cvData.competences.liste, 'nom');
          competenceObj = fuzzyResults[0];
        }
        
        let competenceDetails = competenceObj ? cvData.competences.details[competenceObj.nom] : null;

        // 🎯 Gestion contextuelle avancée
        if (!competenceObj && competenceName.toLowerCase().includes('web')) {
          responseText = `En développement web, j'utilise principalement Angular, TypeScript, HTML/CSS et JavaScript.`;
          suggestions = [
            "Détails sur Angular et TypeScript",
            "Voir mes projets web", 
            "Technologies front-end vs back-end"
          ];
        }
        else if (!competenceObj && (competenceName.toLowerCase().includes('mobile') || competenceName.toLowerCase().includes('android'))) {
          responseText = `En développement mobile, j'utilise surtout Kotlin et Java pour Android.`;
          suggestions = [
            "Projets mobiles réalisés",
            "Détails sur Kotlin",
            "Expérience avec Android Studio"
          ];
        }
        else if (!competenceObj && competenceName.toLowerCase().includes('logiciel')) {
          responseText = `En développement logiciel, j'ai de l'expérience avec C++, Python, Qt et OpenCV.`;
          suggestions = [
            "Applications desktop créées",
            "Projets avec OpenCV",
            "Détails sur Qt et C++"
          ];
        }
        else if (competenceDetails) {
          responseText = `Excellente question sur ${competenceObj.nom} ! `;
          responseText += `${competenceDetails.description}<br>`;
          responseText += `📋 Projets associés : ${competenceDetails.projets.join(', ')}.<br>`;
          responseText += `🛠️ Outils utilisés : ${competenceDetails.outils.join(', ')}.`;
          
          // Suggestions contextuelles basées sur la compétence
          suggestions = [
            `Voir des projets ${competenceObj.nom}`,
            "Autres technologies similaires",
            "Mon parcours d'apprentissage"
          ];
        }
        else if (competenceObj) {
          responseText = `Je connais ${competenceName}, mais je développe encore mes connaissances dans ce domaine.`;
          suggestions = context.getRelatedSuggestions();
        }
        else {
          // 💡 Suggestions intelligentes même en cas d'échec
          const similarCompetences = fuzzySearch(competenceName, cvData.competences.liste, 'nom').slice(0, 3);
          if (similarCompetences.length > 0) {
            responseText = `Je ne maîtrise pas exactement "${competenceName}", mais peut-être cherches-tu `;
            responseText += similarCompetences.map(c => c.nom).join(', ') + ' ?';
          } else {
            responseText = `Je ne maîtrise pas ${competenceName} pour le moment.`;
          }
          responseText += `<br>Voici mes principales compétences :<br> ${formatList(cvData.competences.liste.slice(0, 8), 'nom')}.<br>`;
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
      
      case 'langues':
        responseText = `Je parle plusieurs langues :<br>`;
        responseText += cvData.langues.map(l => `• ${l.nom} : ${l.niveau}`).join('<br>');
        responseText += "<br>Tu veux en savoir plus sur mon niveau dans une langue spécifique ?";

        suggestions = [
          "Niveau d'anglais",
          "Niveau d'allemand",
          "Mes certifications linguistiques"
        ];
        break;

      case 'langue_detail':
        const langueNom = parameters.langue ? parameters.langue.toLowerCase() : '';
        const langue = cvData.langues.find(l => 
          l.nom.toLowerCase().includes(langueNom) || 
          langueNom.includes(l.nom.toLowerCase())
        );

        if (langue) {
          responseText = `Mon niveau en ${langue.nom} est ${langue.niveau}.<br>`;
          
          // Ajouter des détails contextuels selon la langue
          if (langue.nom.toLowerCase() === 'français') {
        responseText += "C'est ma langue maternelle, je la maîtrise parfaitement à l'oral comme à l'écrit.";
          } else if (langue.nom.toLowerCase() === 'anglais') {
        responseText += "J'ai un niveau avancé qui me permet de travailler efficacement dans un environnement international et de consulter la documentation technique en anglais.";
          } else if (langue.nom.toLowerCase() === 'allemand') {
        responseText += "Je peux communiquer couramment en allemand, ce qui est un atout dans la région alsacienne.";
          }
          
          suggestions = [
        "Mes autres compétences linguistiques",
        "Mon expérience en environnement international",
        "Retour aux informations principales"
          ];
        } else {
          responseText = `Je n'ai pas de niveau enregistré pour "${langueNom}".<br>`;
          responseText += `Voici les langues que je parle : ${cvData.langues.map(l => l.nom).join(', ')}.`;
          
          suggestions = cvData.langues.map(l => `Niveau en ${l.nom}`);
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
        // 🎯 Cas par défaut intelligent avec suggestions contextuelles
        if (context.currentTopic) {
          responseText = `Je n'ai pas bien saisi ta question sur ${context.currentTopic}. `;
          suggestions = context.getRelatedSuggestions();
        } else {
          responseText = "Je peux te parler de mon parcours, mes compétences ou mes projets. ";
          suggestions = [
            "Mes compétences techniques",
            "Mon expérience professionnelle",
            "Mes projets récents",
            "Ma formation"
          ];
        }
        responseText += "Que veux-tu savoir ?";
    }

    // 🧠 Enregistrer l'interaction dans le contexte
    context.addInteraction(intent, parameters, responseText);
    
    // � Adapter la réponse selon l'affirmation/négation détectée
    responseText = adaptResponseToContext(responseText, affirmationStatus, context, intent);
    
    // �🎨 Adapter la réponse selon le sentiment (après l'adaptation contextuelle)
    responseText = adaptResponseToSentiment(responseText, userSentiment, context);
    
    // 💡 Ajouter des suggestions si disponibles
    if (suggestions.length > 0) {
      responseText += `<br><br>💭 Suggestions : ${suggestions.join('<br> • ')}`;
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

    // 📊 Ajouter des métadonnées pour le tracking (optionnel)
    response.payload = {
      sessionId: sessionId,
      sentiment: userSentiment,
      topic: context.currentTopic,
      interactionCount: context.history.length
    };

    res.json(response);

  } catch (error) {
    console.error('Erreur dans le webhook :', error);
    res.status(500).json({
      fulfillmentText: "Désolé, une erreur est survenue. Peux-tu répéter ta question ?",
      source: 'webhook'
    });
  }
});

// � Route de diagnostic pour vérifier la configuration Google Cloud
app.get('/diagnose-google-config', (req, res) => {
  try {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      checks: {}
    };

    // Check 1: Variable d'environnement présente
    diagnosis.checks.envVarExists = {
      status: !!process.env.GOOGLE_SERVICE_ACCOUNT,
      message: process.env.GOOGLE_SERVICE_ACCOUNT ? '✅ GOOGLE_SERVICE_ACCOUNT définie' : '❌ GOOGLE_SERVICE_ACCOUNT manquante'
    };

    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      try {
        // Check 2: JSON valide
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        diagnosis.checks.jsonValid = {
          status: true,
          message: '✅ JSON valide'
        };

        // Check 3: Champs requis
        const requiredFields = ['client_email', 'private_key', 'project_id', 'type'];
        const presentFields = requiredFields.filter(field => serviceAccount[field]);
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);

        diagnosis.checks.requiredFields = {
          status: missingFields.length === 0,
          message: missingFields.length === 0 
            ? `✅ Tous les champs requis présents (${presentFields.length})`
            : `❌ Champs manquants: ${missingFields.join(', ')}`,
          present: presentFields,
          missing: missingFields
        };

        // Check 4: Format des champs
        diagnosis.checks.fieldFormats = {
          client_email: {
            valid: serviceAccount.client_email && serviceAccount.client_email.includes('@'),
            value: serviceAccount.client_email ? `${serviceAccount.client_email.substring(0, 20)}...` : 'manquant'
          },
          private_key: {
            valid: serviceAccount.private_key && serviceAccount.private_key.includes('BEGIN PRIVATE KEY'),
            value: serviceAccount.private_key ? `${serviceAccount.private_key.substring(0, 30)}...` : 'manquant'
          },
          project_id: {
            valid: serviceAccount.project_id && serviceAccount.project_id.length > 0,
            value: serviceAccount.project_id || 'manquant'
          }
        };

        // Check 5: Type de service account
        diagnosis.checks.serviceAccountType = {
          status: serviceAccount.type === 'service_account',
          message: serviceAccount.type === 'service_account' 
            ? '✅ Type service_account correct'
            : `❌ Type incorrect: ${serviceAccount.type || 'manquant'}`,
          actual: serviceAccount.type
        };

      } catch (parseError) {
        diagnosis.checks.jsonValid = {
          status: false,
          message: '❌ JSON invalide',
          error: parseError.message
        };
      }
    }

    // Évaluation globale
    const allChecks = Object.values(diagnosis.checks);
    const passedChecks = allChecks.filter(check => check.status === true).length;
    diagnosis.overallStatus = passedChecks === allChecks.length ? 'healthy' : 'issues_found';
    diagnosis.summary = `${passedChecks}/${allChecks.length} vérifications réussies`;

    res.json(diagnosis);
  } catch (error) {
    console.error('Erreur diagnostic :', error);
    res.status(500).json({
      error: 'Erreur lors du diagnostic',
      details: error.message
    });
  }
});

// �📊 Route d'analytics pour surveiller les performances du chatbot
app.get('/chatbot-analytics', (req, res) => {
  try {
    const analytics = {
      totalSessions: conversationSessions.size,
      activeSessions: Array.from(conversationSessions.values()).filter(ctx => !ctx.isExpired()).length,
      topTopics: getTopTopics(),
      avgInteractionsPerSession: getAverageInteractions(),
      sentimentDistribution: getSentimentDistribution()
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Erreur analytics :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
  }
});

// 🧹 Fonction de nettoyage des sessions expirées (à appeler périodiquement)
const cleanupExpiredSessions = () => {
  const now = Date.now();
  const expiredSessions = [];
  
  for (const [sessionId, context] of conversationSessions.entries()) {
    if (context.isExpired()) {
      expiredSessions.push(sessionId);
    }
  }
  
  expiredSessions.forEach(sessionId => {
    conversationSessions.delete(sessionId);
  });
  
  console.log(`🧹 Nettoyage : ${expiredSessions.length} sessions expirées supprimées`);
};

// Fonctions d'analytics helper
const getTopTopics = () => {
  const topics = {};
  for (const context of conversationSessions.values()) {
    if (context.currentTopic) {
      topics[context.currentTopic] = (topics[context.currentTopic] || 0) + 1;
    }
  }
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));
};

const getAverageInteractions = () => {
  const sessions = Array.from(conversationSessions.values());
  if (sessions.length === 0) return 0;
  
  const totalInteractions = sessions.reduce((sum, ctx) => sum + ctx.history.length, 0);
  return Math.round(totalInteractions / sessions.length * 100) / 100;
};

const getSentimentDistribution = () => {
  const sentiments = { positive: 0, negative: 0, neutral: 0 };
  
  for (const context of conversationSessions.values()) {
    sentiments[context.sentiment] = (sentiments[context.sentiment] || 0) + 1;
  }
  
  return sentiments;
};

// 🔄 Nettoyage automatique toutes les heures
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Route de health check améliorée
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: Array.from(conversationSessions.values()).filter(ctx => !ctx.isExpired()).length,
    totalSessions: conversationSessions.size
  });
});

module.exports = app;