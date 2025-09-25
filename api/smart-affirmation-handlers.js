// 🎯 Exemple d'utilisation optimale de detectAffirmationNegation
// Ce fichier montre comment intégrer intelligemment la détection d'affirmation/négation

// Cas d'usage 1: Réaction aux présentations de compétences
function handleCompetencesFeedback(queryText, context, cvData) {
  const affirmationStatus = detectAffirmationNegation(queryText);
  
  switch (affirmationStatus) {
    case 'affirmation':
      // L'utilisateur est intéressé par les compétences
      if (queryText.toLowerCase().includes('angular')) {
        return {
          response: "Super ! Tu t'intéresses à Angular ? C'est ma spécialité ! " + 
                   cvData.competences.details.Angular.description,
          suggestions: ["Projets Angular", "TypeScript aussi", "Voir le code"]
        };
      } else {
        return {
          response: "Parfait ! Quelle technologie te passionne le plus ?",
          suggestions: ["Angular", "Kotlin", "Python", "C++", "Intelligence artificielle"]
        };
      }
      
    case 'negation':
      // L'utilisateur n'est pas intéressé par les compétences techniques
      return {
        response: "Je comprends ! Peut-être que mes réalisations concrètes t'intéresseraient plus ?",
        suggestions: ["Mes projets", "Mon expérience", "Ma formation", "Mes réalisations"]
      };
      
    case 'mixed':
      // Sentiment mitigé - l'utilisateur a des réserves
      return {
        response: "Je vois que tu as des questions ! Veux-tu que je précise certains points ?",
        suggestions: ["Niveau d'expertise", "Projets concrets", "Expérience pratique"]
      };
      
    default:
      // Réponse neutre standard
      return {
        response: "Tu veux des détails sur une technologie en particulier ?",
        suggestions: ["Technologies web", "Développement mobile", "IA et données"]
      };
  }
}

// Cas d'usage 2: Gestion des suivis de conversation
function handleFollowUpResponse(queryText, context, intent) {
  const affirmationStatus = detectAffirmationNegation(queryText);
  const lastTopic = context.currentTopic;
  
  // Réponses adaptées selon le contexte précédent
  const contextualResponses = {
    affirmation: {
      competences: [
        "Excellent ! Continuons sur les technologies qui t'intéressent.",
        "Super ! Tu veux voir ces compétences en action dans mes projets ?",
        "Parfait ! Je peux te détailler mon expérience avec ces outils."
      ],
      projets: [
        "Génial ! Quel aspect des projets t'intéresse le plus ?",
        "Formidable ! Tu veux voir le code ou une démonstration ?",
        "Cool ! Je peux t'expliquer les défis techniques rencontrés."
      ],
      experience: [
        "Excellent ! Ces expériences m'ont beaucoup appris.",
        "Super ! Tu veux connaître les compétences acquises ?",
        "Parfait ! Je peux détailler mes missions et réalisations."
      ]
    },
    
    negation: {
      competences: [
        "Pas de souci ! Peut-être que mes projets concrets t'intéresseraient plus ?",
        "Je comprends ! Tu préfères voir les réalisations pratiques ?",
        "D'accord ! Qu'est-ce qui te motiverait davantage ?"
      ],
      projets: [
        "Pas de problème ! Quel type de projet te plairait plus ?",
        "Je comprends ! Tu cherches quelque chose de plus spécifique ?",
        "D'accord ! Mes autres réalisations t'intéresseraient peut-être ?"
      ],
      experience: [
        "Pas de souci ! Mon parcours académique t'intéresse peut-être plus ?",
        "Je comprends ! Tu préfères mes compétences techniques ?",
        "D'accord ! Qu'est-ce qui correspondrait mieux à tes attentes ?"
      ]
    }
  };
  
  const responseCategory = contextualResponses[affirmationStatus];
  if (responseCategory && responseCategory[lastTopic]) {
    const options = responseCategory[lastTopic];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  return "Que veux-tu savoir d'autre ?";
}

// Cas d'usage 3: Détection d'intérêt spécifique
function detectSpecificInterest(queryText, affirmationStatus) {
  const interests = {
    angular: /angular|typescript|web|frontend|front-end/i,
    mobile: /mobile|android|kotlin|java|app/i,
    ai: /intelligence|artificielle|ai|machine|learning|data/i,
    backend: /backend|back-end|serveur|api|base.*données/i,
    experience: /travail|entreprise|stage|professionnel|équipe/i
  };
  
  for (const [topic, pattern] of Object.entries(interests)) {
    if (pattern.test(queryText)) {
      return {
        topic,
        enthusiasm: affirmationStatus,
        confidence: affirmationStatus === 'affirmation' ? 'high' : 
                   affirmationStatus === 'negation' ? 'low' : 'medium'
      };
    }
  }
  
  return { topic: 'general', enthusiasm: affirmationStatus, confidence: 'medium' };
}

// Cas d'usage 4: Adaptation du niveau de détail
function adaptDetailLevel(affirmationStatus, context) {
  const interactionCount = context.history.length;
  
  if (affirmationStatus === 'affirmation') {
    // L'utilisateur est engagé - fournir plus de détails
    if (interactionCount >= 3) {
      return {
        level: 'detailed',
        approach: 'technical',
        includeLinks: true,
        suggestDeepDive: true
      };
    } else {
      return {
        level: 'moderate',
        approach: 'balanced',
        includeLinks: true,
        suggestDeepDive: false
      };
    }
  } else if (affirmationStatus === 'negation') {
    // L'utilisateur semble moins intéressé - rester concis
    return {
      level: 'brief',
      approach: 'practical',
      includeLinks: false,
      suggestAlternatives: true
    };
  } else {
    // Niveau standard
    return {
      level: 'standard',
      approach: 'informative',
      includeLinks: false,
      suggestDeepDive: false
    };
  }
}

// Cas d'usage 5: Génération de questions de suivi intelligentes
function generateSmartFollowUps(affirmationStatus, currentTopic, context) {
  const followUps = {
    affirmation: {
      competences: [
        "Veux-tu voir ces compétences appliquées dans mes projets ?",
        "T'intéresses-tu à mon processus d'apprentissage ?",
        "As-tu des questions techniques spécifiques ?"
      ],
      projets: [
        "Veux-tu explorer le code source ?",
        "T'intéresses-tu aux défis techniques rencontrés ?",
        "As-tu des questions sur l'architecture ?"
      ],
      experience: [
        "Veux-tu connaître mes réalisations concrètes ?",
        "T'intéresses-tu aux compétences développées ?",
        "As-tu des questions sur le contexte de travail ?"
      ]
    },
    
    negation: [
      "Qu'est-ce qui t'intéresserait davantage ?",
      "Vers quoi aimerais-tu orienter notre conversation ?",
      "Y a-t-il un aspect spécifique qui te motive ?"
    ],
    
    neutral: [
      "As-tu des questions particulières ?",
      "Veux-tu que je détaille certains points ?",
      "Qu'est-ce qui pourrait t'être utile ?"
    ]
  };
  
  if (affirmationStatus === 'affirmation' && followUps.affirmation[currentTopic]) {
    const options = followUps.affirmation[currentTopic];
    return options[Math.floor(Math.random() * options.length)];
  } else if (followUps[affirmationStatus]) {
    const options = followUps[affirmationStatus];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  return "Que veux-tu savoir d'autre ?";
}

// Export des fonctions pour utilisation dans le webhook principal
module.exports = {
  handleCompetencesFeedback,
  handleFollowUpResponse,
  detectSpecificInterest,
  adaptDetailLevel,
  generateSmartFollowUps
};