# 🎨 Portfolio Angular & Chatbot Intelligent

Portfolio personnel interactif avec un chatbot Dialogflow intelligent qui transforme un CV statique en expérience conversationnelle.

## 📚 Table des matières

### Partie 1 : Portfolio Angular
- [À propos du projet](#à-propos-du-projet)
- [Installation et démarrage](#installation-et-démarrage)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)

### Partie 2 : Chatbot Intelligent
- [Introduction au chatbot](#introduction-au-chatbot)
- [Fonctionnalités intelligentes](#fonctionnalités-intelligentes)
- [Configuration du chatbot](#configuration-du-chatbot)
- [API Routes](#api-routes)
- [Guide d'utilisation](#guide-dutilisation)
- [Gestion multi-entités](#gestion-multi-entités)
- [Détection affirmation/négation](#détection-affirmationnégation)
- [Dépannage et debugging](#dépannage-et-debugging)
- [Analytics et métriques](#analytics-et-métriques)
- [Exemples avancés](#exemples-avancés)

---

# 🎨 Partie 1 : Portfolio Angular

## 🎯 À propos du projet

Ce projet est un portfolio personnel moderne qui sert de vitrine pour mes compétences en développement web. Il intègre un chatbot Dialogflow intelligent qui permet aux recruteurs d'interagir avec mon CV de manière conversationnelle.

### Fonctionnalités principales
- **Portfolio responsive** - Design adapté à tous les écrans
- **Chatbot Dialogflow intelligent** - CV interactif conversationnel
- **Animations Angular** - Interface fluide et moderne
- **Multi-langue** - Support FR/EN/DE
- **Design moderne** - Interface épurée et professionnelle

## 🚀 Installation et démarrage

### Prérequis

- Node.js (version 18 ou supérieure)
- Angular CLI (`npm install -g @angular/cli`)
- npm ou yarn

### Installation

1. **Clonez le repository** :
```bash
git clone https://github.com/theobizet/portfolio-angular.git
cd portfolio-angular
```

2. **Installez les dépendances** :
```bash
npm install
```

3. **Installez les dépendances API** :
```bash
cd api
npm install
cd ..
```

### Serveur de développement

**Frontend Angular** :
```bash
ng serve
```
Naviguez vers `http://localhost:4200/`

**Backend API (webhook Dialogflow)** :
```bash
cd api
npm start
```
API disponible sur `http://localhost:3000`

### Build pour production

```bash
# Build Angular
ng build

# Les artefacts seront dans le répertoire dist/
```

### Tests

**Tests unitaires** :
```bash
ng test
```

**Tests end-to-end** :
```bash
ng e2e
```

**Tests du chatbot** :
```bash
cd api
npm test
```

## 📁 Structure du projet

```
portfolio-angular/
├── src/                          # Code source Angular
│   ├── app/
│   │   ├── component/           # Composants Angular
│   │   │   ├── home/           # Page d'accueil
│   │   │   ├── about/          # À propos
│   │   │   ├── experience/     # Expériences
│   │   │   ├── education/      # Formation
│   │   │   ├── projects/       # Projets
│   │   │   ├── contact/        # Contact
│   │   │   ├── chat/           # Chatbot interface
│   │   │   └── navigation-bar/ # Barre de navigation
│   │   ├── dialog-flow-service.ts    # Service Dialogflow
│   │   ├── theme.service.ts          # Service thème dark/light
│   │   └── app.routes.ts             # Configuration des routes
│   ├── environments/            # Variables d'environnement
│   ├── styles.css              # Styles globaux
│   └── index.html              # Point d'entrée HTML
├── api/                         # Backend API Dialogflow
│   ├── index.js                # Webhook principal
│   ├── cv.json                 # Données du CV
│   └── package.json            # Dépendances API
├── public/                      # Assets statiques
│   └── assets/                 # Images, i18n, etc.
├── angular.json                # Configuration Angular
├── package.json                # Dépendances frontend
└── vercel.json                 # Configuration déploiement
```

## 🛠️ Technologies utilisées

### Frontend
- **Angular 20.3.2** - Framework principal
- **TypeScript** - Langage de programmation
- **RxJS** - Programmation réactive
- **ng-bootstrap** - Composants UI Bootstrap
- **CSS3** - Styles et animations

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework serveur web
- **Dialogflow** - Service NLU (Natural Language Understanding)
- **Google Cloud** - Authentification et services

### Déploiement
- **Vercel** - Hosting et déploiement continu
- **GitHub Actions** - CI/CD

---

# 🤖 Partie 2 : Chatbot Intelligent

## 🎯 Introduction au chatbot

Ce chatbot Dialogflow transforme un CV statique en une expérience conversationnelle interactive et intelligente. Il répond aux questions des recruteurs de manière naturelle, contextuelle et personnalisée.

### Évolution du chatbot

**Avant (FAQ basique)** :
```
User: "Tu parles anglais ?"
Bot: "Je parle anglais niveau B2."
User: "Et allemand ?"
Bot: "Je parle allemand niveau B1."
```

**Après (Intelligence contextuelle)** :
```
User: "Tu parles anglais et allemand ?"
Bot: "Super ! Tu t'intéresses à plusieurs de mes compétences linguistiques ! 🌍

📌 Anglais : B2 Avancé
→ Niveau avancé pour environnement professionnel international

📌 Allemand : B1 Courant
→ Communication courante, atout régional en Alsace

Ces 2 langues me permettent de travailler dans des contextes multiculturels variés !

💡 Veux-tu en savoir plus sur une langue en particulier ?"
```

---

## 🧠 Fonctionnalités intelligentes

### 1. 🎭 Gestion du contexte conversationnel

Le chatbot maintient le contexte de la conversation pour des échanges plus naturels.

**Fonctionnalités** :
- **Historique des interactions** : Mémorise les 5 dernières questions/réponses
- **Durée de session** : 15 minutes d'inactivité avant réinitialisation
- **Suivi des sujets** : Sait de quoi vous avez parlé récemment
- **État émotionnel** : Adapte son ton en fonction du sentiment détecté

**Exemple** :
```javascript
conversationContext.set(session, {
  history: [
    { query: "Quelles sont tes compétences ?", response: "...", timestamp: Date.now() },
    { query: "Tu maîtrises Angular ?", response: "...", timestamp: Date.now() }
  ],
  lastTopics: ['competences', 'angular'],
  sentiment: 'positive',
  lastInteraction: Date.now()
});
```

**Cas d'usage** :
```
User: "Quelles sont tes compétences ?"
Bot: "Je maîtrise Angular, TypeScript, Python..."
User: "Et en mobile ?"
Bot: (comprend que "mobile" se réfère aux compétences) "En développement mobile, je connais Kotlin et Java..."
```

### 2. 🔍 Recherche floue (Fuzzy Search)

Le chatbot tolère les fautes de frappe et trouve les correspondances approximatives.

**Algorithme** : Levenshtein Distance avec seuil de similarité 0.3

**Exemples** :
| Requête avec faute | Détection | Réponse |
|-------------------|-----------|---------|
| "angler" | Anglais (similarité 0.71) | Détails sur l'anglais |
| "typscript" | TypeScript (similarité 0.82) | Détails sur TypeScript |
| "pithon" | Python (similarité 0.67) | Détails sur Python |
| "portfolo" | Portfolio (similarité 0.78) | Détails du portfolio |

**Implémentation** :
```javascript
const calculateSimilarity = (str1, str2) => {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLen);
};

const fuzzySearch = (searchTerm, dataList, threshold = 0.3) => {
  return dataList.find(item => 
    calculateSimilarity(searchTerm, item.nom) >= threshold
  );
};
```

### 3. 😊 Analyse de sentiment

Le chatbot détecte l'émotion de l'utilisateur et adapte ses réponses.

**Sentiments détectés** :
- **Positif** 😊 : "super", "génial", "excellent", "parfait", "merci"
- **Négatif** 😔 : "non", "pas", "jamais", "aucun", "mauvais"
- **Neutre** 😐 : Toutes les autres requêtes

**Exemple d'adaptation** :
```javascript
// Sentiment positif détecté
if (sentiment === 'positive') {
  response = "Super ! " + response;
  response += "\n\n💡 Veux-tu en savoir plus sur...";
}

// Sentiment négatif détecté
if (sentiment === 'negative') {
  response = "Je comprends. " + response;
  response += "\n\nJe peux t'aider avec autre chose ?";
}
```

**Cas d'usage** :
```
User: "Génial ! Parle-moi de tes projets"
Bot: (détecte sentiment positif) "Super ! Voici mes projets les plus récents ! 🚀..."

User: "Tu ne connais pas React ?"
Bot: (détecte négation) "Non, je ne maîtrise pas React actuellement. En revanche, je maîtrise Angular..."
```

### 4. 💬 Suggestions intelligentes

Le chatbot propose des questions de suivi pertinentes basées sur le contexte.

**Types de suggestions** :
- Après une réponse sur les compétences → Suggère des projets utilisant cette compétence
- Après une réponse sur une langue → Suggère les projets dans cette langue
- Après une réponse sur un projet → Suggère les technologies utilisées

**Exemple** :
```javascript
const generateSmartSuggestions = (context) => {
  const lastTopic = context.lastTopics[0];
  
  if (lastTopic === 'competence_detail') {
    return [
      "Montre-moi des projets utilisant cette technologie",
      "Quelle est ton expérience avec cette compétence ?",
      "Quels sont tes projets les plus récents ?"
    ];
  }
  
  if (lastTopic === 'langue_detail') {
    return [
      "As-tu des projets dans cette langue ?",
      "As-tu travaillé dans un pays parlant cette langue ?",
      "Quel est ton niveau exact ?"
    ];
  }
};
```

### 5. 🎨 Personnalisation des réponses

Le chatbot adapte son ton et son contenu en fonction du profil de l'utilisateur.

**Profils détectés** :
- **Recruteur technique** : Ton professionnel, détails techniques
- **Recruteur RH** : Ton chaleureux, soft skills
- **Étudiant/Collègue** : Ton décontracté, conseils

**Adaptation automatique** :
```javascript
const adaptResponseToContext = (baseResponse, context) => {
  const sentiment = context.sentiment;
  const history = context.history;
  
  // Détecte si l'utilisateur pose beaucoup de questions techniques
  const technicalQuestions = history.filter(h => 
    h.query.includes('techno') || h.query.includes('code')
  ).length;
  
  if (technicalQuestions > 2) {
    // Mode recruteur technique
    return baseResponse + "\n\n💻 Plus de détails techniques disponibles...";
  }
  
  return baseResponse;
};
```

### 6. 📊 Analytics et métriques

Le chatbot track les interactions pour optimiser les réponses.

**Métriques collectées** :
- Nombre de requêtes par intent
- Temps de réponse moyen
- Questions les plus fréquentes
- Taux de satisfaction (basé sur sentiment)
- Parcours utilisateur (séquence de questions)

**Dashboard analytics** : `/chatbot-analytics`

---

## ⚙️ Configuration du chatbot

### Variables d'environnement

Créez un fichier `.env` dans le dossier `api/` :

```env
# Google Cloud Service Account (requis pour Dialogflow)
GOOGLE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Configuration du chatbot (optionnel)
CONTEXT_DURATION_MINUTES=15
MAX_CONTEXT_HISTORY=5
FUZZY_SEARCH_THRESHOLD=0.3
```

### Configuration du contexte conversationnel

```javascript
const AI_CONFIG = {
  // Durée de vie du contexte conversationnel
  CONTEXT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Nombre maximum d'interactions mémorisées
  MAX_CONTEXT_HISTORY: 5,
  
  // Seuil de similarité pour la recherche floue
  FUZZY_SEARCH_THRESHOLD: 0.3,
  
  // Mots-clés pour l'analyse de sentiment
  SENTIMENT_KEYWORDS: {
    positive: ['super', 'génial', 'excellent', 'parfait', 'merci', 'top'],
    negative: ['non', 'pas', 'jamais', 'aucun', 'mauvais', 'nul'],
    neutral: []
  },
  
  // Patterns pour la détection d'affirmation/négation
  AFFIRMATION_PATTERNS: [
    /\b(oui|yes|ouais|ok|d'accord|exactement|bien sûr|absolument)\b/i,
    /\b(je (?:suis|veux|vais|dois))\b/i,
    /\b(c'est (?:vrai|correct|exact))\b/i
  ],
  
  NEGATION_PATTERNS: [
    /\b(non|no|jamais|aucun|pas du tout)\b/i,
    /\bnon\s*,/i,
    /\b(ne|n')\s+\w+\s+(pas|plus|jamais|rien|aucun)\b/i
  ]
};
```

---

## 🛣️ API Routes

### 1. **POST /webhook** (Principal)

Endpoint principal pour Dialogflow.

**Request** :
```json
{
  "queryResult": {
    "queryText": "Tu parles anglais ?",
    "intent": {
      "displayName": "langue_detail"
    },
    "parameters": {
      "langue": "anglais"
    }
  },
  "session": "unique-session-id"
}
```

**Response** :
```json
{
  "fulfillmentText": "Mon niveau en Anglais est B2 Avancé...",
  "fulfillmentMessages": [
    {
      "text": {
        "text": ["Mon niveau en Anglais est B2 Avancé..."]
      }
    }
  ]
}
```

### 2. **GET /chatbot-analytics**

Récupère les statistiques d'utilisation du chatbot.

**Response** :
```json
{
  "totalRequests": 1234,
  "intentDistribution": {
    "presentation": 234,
    "competences": 456,
    "projets": 189,
    "contact": 123
  },
  "sentimentAnalysis": {
    "positive": 678,
    "negative": 89,
    "neutral": 467
  },
  "multiEntityQueries": {
    "total": 45,
    "byType": {
      "langues": 18,
      "competences": 20,
      "projets": 5
    }
  },
  "averageResponseTime": "125ms",
  "topQuestions": [
    "Quelles sont tes compétences ?",
    "Tu parles anglais ?",
    "Parle-moi de ton portfolio"
  ]
}
```

### 3. **GET /health**

Vérifie l'état du serveur.

**Response** :
```json
{
  "status": "healthy",
  "uptime": "3h 45m 12s",
  "activeContexts": 12,
  "version": "2.0.0"
}
```

### 4. **GET /diagnose-google-config**

Diagnostic complet de la configuration Google Cloud.

**Response** :
```json
{
  "status": "success",
  "checks": {
    "environmentVariableExists": true,
    "validJSON": true,
    "requiredFieldsPresent": true,
    "serviceAccountType": true,
    "emailFormat": true,
    "privateKeyFormat": true
  },
  "serviceAccount": {
    "type": "service_account",
    "project_id": "chatbot-portfolio-iqcd",
    "client_email": "dialogflow-xxxxx@chatbot-portfolio-iqcd.iam.gserviceaccount.com"
  },
  "message": "✅ Configuration Google Cloud valide !"
}
```

### 5. **GET /get-dialogflow-token**

Génère un token d'authentification Dialogflow (pour le frontend).

**Response** :
```json
{
  "token": "ya29.c.Kp8BDQj...",
  "expiresIn": 3600
}
```

---

## 📖 Guide d'utilisation

### Intégration dans Dialogflow

#### 1. Configuration du webhook

Dans Dialogflow Console :
1. **Fulfillment** → Enable Webhook
2. **URL** : `https://votre-domaine.vercel.app/webhook`
3. **Headers** : `Content-Type: application/json`

#### 2. Training phrases suggérées

**Intent: presentation**
```
Qui es-tu ?
Présente-toi
C'est quoi ton profil ?
```

**Intent: competences**
```
Quelles sont tes compétences ?
Tu maîtrises quoi comme technos ?
Liste tes compétences techniques
```

**Intent: competence_detail** (avec paramètre @competence)
```
Tu connais Angular ?
Parle-moi de TypeScript
C'est quoi ton niveau en Python ?
```

**Intent: langues**
```
Quelles langues tu parles ?
Tes compétences linguistiques ?
Tu parles quelles langues ?
```

**Intent: langue_detail** (avec paramètre @langue)
```
Tu parles anglais ?
C'est quoi ton niveau en allemand ?
Tu maîtrises le français ?
```

**Intent: projets**
```
Quels sont tes projets ?
Montre-moi ton portfolio
Tu as fait quoi comme projets ?
```

**Intent: projet_detail** (avec paramètre @projet)
```
Parle-moi de ton portfolio
C'est quoi le projet de reconnaissance d'objets ?
Détails sur l'application mobile
```

**Intent: experience**
```
Quelle est ton expérience ?
Où as-tu travaillé ?
Parle-moi de tes stages
```

**Intent: formation**
```
Quelle est ta formation ?
Où as-tu étudié ?
Ton parcours scolaire ?
```

**Intent: contact**
```
Comment te contacter ?
Quel est ton email ?
Tu es sur LinkedIn ?
```

---

## 🌍 Gestion multi-entités

### Problématique résolue

Un recruteur peut poser des questions complexes combinant plusieurs entités :
- **"Tu parles anglais et allemand ?"**
- **"Tu maîtrises Angular et TypeScript ?"**
- **"Parle-moi de ton portfolio et de ton appli mobile"**

Le webhook détecte automatiquement ces requêtes multi-entités et génère des réponses structurées.

### Fonctionnement technique

#### 1. Extraction multi-entités

```javascript
const extractMultipleEntities = (text, entityType, dataSource) => {
  // Normalisation du texte
  const normalizedText = text.toLowerCase();
  
  // Séparateurs multiples : "et", "ou", ",", ";", "/"
  const separators = /\s+(et|ou)\s+|[,;\/]/gi;
  const segments = normalizedText.split(separators).filter(s => s && s.trim());
  
  const detectedEntities = [];
  
  // Recherche avec synonymes et fuzzy matching
  segments.forEach(segment => {
    const trimmed = segment.trim();
    
    // Recherche exacte
    let found = dataSource.find(item => 
      item.nom.toLowerCase() === trimmed
    );
    
    // Recherche par synonymes
    if (!found) {
      found = dataSource.find(item => 
        item.synonymes?.some(syn => syn.toLowerCase() === trimmed)
      );
    }
    
    // Recherche floue (typo tolerance)
    if (!found) {
      found = fuzzySearch(trimmed, dataSource, 0.3);
    }
    
    if (found && !detectedEntities.includes(found)) {
      detectedEntities.push(found);
    }
  });
  
  return detectedEntities;
};
```

#### 2. Traitement intelligent

```javascript
const handleMultipleEntities = (entities, entityType, cvData) => {
  if (entities.length === 0) {
    return `Désolé, je n'ai pas trouvé ces ${entityType} dans mon CV.`;
  }
  
  if (entities.length === 1) {
    // Réponse simple pour une seule entité
    return formatSingleEntityResponse(entities[0], entityType);
  }
  
  // Réponse multi-entités structurée
  let response = `Super ! Tu t'intéresses à plusieurs de mes ${entityType} ! 🌍\n\n`;
  
  entities.forEach((entity, index) => {
    response += `📌 ${entity.nom}\n`;
    response += `→ ${entity.description || entity.details}\n`;
    
    if (entity.niveau) response += `→ Niveau : ${entity.niveau}\n`;
    if (entity.technologies) response += `→ Technologies : ${entity.technologies.join(', ')}\n`;
    
    response += '\n';
  });
  
  response += `Ces ${entities.length} ${entityType} me permettent de travailler dans des contextes variés !\n\n`;
  response += `💡 Veux-tu approfondir l'un de ces ${entityType} en particulier ?`;
  
  return response;
};
```

### Types d'entités gérées

#### 🌍 Langues

**Question simple** :
```
User: "Tu parles anglais ?"
Bot: "Mon niveau en Anglais est B2 Avancé..."
```

**Question multi-langues** :
```
User: "Tu parles anglais et allemand ?"
Bot: "Super ! Tu t'intéresses à plusieurs de mes compétences linguistiques ! 🌍

📌 Anglais : B2 Avancé
→ Niveau avancé pour environnement professionnel international

📌 Allemand : B1 Courant
→ Communication courante, atout régional en Alsace

Ces 2 langues me permettent de travailler dans des contextes multiculturels variés !

💡 Veux-tu en savoir plus sur une langue en particulier ?"
```

**Synonymes détectés** :
- Anglais : english, anglophone
- Allemand : german, deutsch, germanophone
- Français : french, francais, francophone

#### 💻 Compétences techniques

**Question multi-compétences** :
```
User: "Tu connais Angular et TypeScript ?"
Bot: "Excellent ! Tu veux connaître mes compétences en Angular, TypeScript ! 💻

📌 Angular
→ Développement d'applications web dynamiques avec Angular 20+
→ Projets : Portfolio en ligne, Gestionnaire de RDV

📌 TypeScript
→ Utilisation avancée de TypeScript pour applications scalables
→ Projets : Portfolio Angular, Applications web modernes

Veux-tu approfondir l'une de ces 2 technologies en particulier ?"
```

**Synonymes détectés** :
- Angular : angularjs, angular 2+
- JavaScript : js, es6, ecmascript
- TypeScript : ts
- Python : py
- C++ : cpp, c plus plus

#### 🚀 Projets

**Question multi-projets** :
```
User: "Parle-moi de ton portfolio et de l'appli de reconnaissance d'objets"
Bot: "Génial ! Je vais te parler de ces 2 projets ! 🚀

📌 Portfolio en ligne (2024)
→ Site vitrine personnel développé avec Angular 20+
→ Technologies : Angular, TypeScript, Vercel, Dialogflow

📌 Reconnaissance d'objets avec MobileNetSSD (2023)
→ Application Python utilisant le deep learning
→ Technologies : Python, OpenCV, TensorFlow, MobileNetSSD"
```

#### 💼 Expériences professionnelles

**Question multi-expériences** :
```
User: "Parle-moi de tes stages chez GHMC et Liebherr"
Bot: "Parfait ! Voici un aperçu de ces 2 expériences ! 💼

📌 GHMC (2023)
→ Poste : Développeur Full Stack (Stage)
→ Lieu : Mulhouse, France
→ Compétences clés : Angular, TypeScript, Gestion de projet

📌 Liebherr-Aerospace (2022)
→ Poste : Assistant informatique (Stage)
→ Lieu : Lindenberg, Allemagne
→ Compétences clés : VBA, SQL, Gestion de bases de données"
```

### Patterns de détection

**Séparateurs reconnus** :
- **"et"** : "Angular et TypeScript"
- **"ou"** : "Python ou Java"
- **","** : "Anglais, Allemand, Français"
- **";"** : "Portfolio; Appli mobile"
- **"/"** : "Angular/TypeScript"

**Exemples de requêtes complexes** :

| Requête utilisateur | Entités détectées | Réponse |
|---------------------|-------------------|---------|
| "Tu parles anglais et allemand ?" | 2 langues | Comparatif des 2 langues |
| "Angular, TypeScript et Kotlin ?" | 3 compétences | Vue d'ensemble des 3 technologies |
| "Tes projets portfolio et mobile ?" | 2 projets | Détails des 2 projets |
| "GHMC et Liebherr" | 2 expériences | Résumé des 2 expériences |

### Cas d'usage avancés

**Cas 1 : Question comparative**
```
User: "Quelle est la différence entre tes compétences Angular et React ?"
Bot: Détecte Angular (✓) et React (✗)
     → "Je maîtrise Angular mais pas React..."
     → Propose des alternatives
```

**Cas 2 : Détection partielle**
```
User: "Tu parles anglais, allemand et chinois ?"
Bot: Détecte Anglais (✓), Allemand (✓), Chinois (✗)
     → Affiche les 2 langues maîtrisées
     → Signale l'absence du chinois
```

**Cas 3 : Domaines multiples**
```
User: "Tu codes en web et mobile ?"
Bot: Détecte "web" et "mobile" (domaines)
     → Liste les technologies web (Angular, TypeScript...)
     → Liste les technologies mobile (Kotlin, Java...)
```

---

## ✅ Détection affirmation/négation

### Vue d'ensemble

Le système détecte automatiquement si l'utilisateur répond par **OUI**, **NON**, ou des patterns **mixtes** pour adapter les réponses contextuellement.

### Patterns détectés

#### 1. **Affirmations**

**Patterns français** :
```javascript
/\b(oui|yes|ouais|ok|d'accord|exactement|bien sûr|absolument|tout à fait|carrément)\b/i
/\b(je (?:suis|veux|vais|dois|peux|pense))\b/i
/\b(c'est (?:vrai|correct|exact|ça|bon))\b/i
/\b(pourquoi pas|volontiers|avec plaisir)\b/i
```

**Exemples** :
- "Oui", "Yes", "Ouais, pourquoi pas"
- "Ok, je veux bien", "D'accord", "Exactement !"
- "Bien sûr", "Je suis intéressé", "C'est exact"

#### 2. **Négations**

**Patterns français** :
```javascript
/\b(non|no|jamais|aucun|pas du tout|nullement)\b/i
/\bnon\s*,/i
/\b(ne|n')\s+\w+\s+(pas|plus|jamais|rien|aucun)\b/i
/\b(pas (?:vraiment|trop|encore|du tout))\b/i
```

**Exemples** :
- "Non", "No", "Jamais", "Pas du tout"
- "Je ne pense pas", "Ce n'est pas le cas"
- "Pas vraiment", "Non, merci", "Aucun intérêt"

#### 3. **Patterns mixtes**

```javascript
"Oui, mais pas maintenant"
"Non, pas encore, mais bientôt"
"Peut-être pas tout de suite"
"Oui, mais ce n'est pas ma priorité"
```

### Implémentation

```javascript
const detectAffirmationNegation = (text) => {
  if (!text) return { type: 'neutral', confidence: 0 };
  
  const normalized = text.toLowerCase().trim();
  
  // Patterns d'affirmation
  const affirmationPatterns = [
    /\b(oui|yes|ouais|ok|d'accord|exactement|bien sûr|absolument)\b/i,
    /\b(je (?:suis|veux|vais|dois))\b/i,
    /\b(c'est (?:vrai|correct|exact))\b/i
  ];
  
  // Patterns de négation
  const negationPatterns = [
    /\b(non|no|jamais|aucun|pas du tout)\b/i,
    /\bnon\s*,/i,
    /\b(ne|n')\s+\w+\s+(pas|plus|jamais|rien|aucun)\b/i
  ];
  
  const hasAffirmation = affirmationPatterns.some(pattern => pattern.test(normalized));
  const hasNegation = negationPatterns.some(pattern => pattern.test(normalized));
  
  if (hasAffirmation && hasNegation) {
    return { type: 'mixed', confidence: 0.8, details: 'Contient affirmation ET négation' };
  }
  
  if (hasAffirmation) {
    return { type: 'affirmation', confidence: 0.95 };
  }
  
  if (hasNegation) {
    return { type: 'negation', confidence: 0.95 };
  }
  
  return { type: 'neutral', confidence: 0 };
};
```

---

## 🔧 Dépannage et debugging

### Erreur 500 : Token Dialogflow

#### Diagnostic automatique

Accédez à cette URL pour un diagnostic complet :
```
https://portfolio-angular-theo.vercel.app/diagnose-google-config
```

**Vérifications automatiques** :
- ✅ Présence de la variable `GOOGLE_SERVICE_ACCOUNT`
- ✅ Validité du JSON
- ✅ Champs requis présents
- ✅ Format des credentials
- ✅ Type de service account

#### Format attendu du service account JSON

```json
{
  "type": "service_account",
  "project_id": "votre-projet-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "votre-service@votre-projet.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### Champs critiques

| Champ | Description | Problème fréquent |
|-------|-------------|-------------------|
| `type` | Doit être `"service_account"` | Parfois `"user"` par erreur |
| `project_id` | ID du projet Google Cloud | Doit correspondre au projet Dialogflow |
| `private_key` | Clé privée RSA | Doit inclure `-----BEGIN/END PRIVATE KEY-----` |
| `client_email` | Email du service account | Format `xxx@xxx.iam.gserviceaccount.com` |

#### Régénérer les credentials

**Dans Google Cloud Console** :

1. **Aller à IAM & Admin** → **Service Accounts**
2. **Trouver votre service account** (ou en créer un nouveau)
3. **Cliquer sur Actions** → **Manage keys**
4. **Add Key** → **Create new key** → **JSON**
5. **Télécharger le fichier JSON**

**Permissions requises** :
- **Dialogflow API Client** (`roles/dialogflow.client`)
- **Dialogflow API Admin** (`roles/dialogflow.admin`) [optionnel]

#### Checklist de résolution

- [ ] Service account existe dans Google Cloud
- [ ] Permissions Dialogflow accordées
- [ ] JSON complet et valide
- [ ] Variable d'environnement correctement définie dans Vercel
- [ ] Projet redéployé après changements
- [ ] Diagnostic `/diagnose-google-config` passe tous les tests
- [ ] Route `/get-dialogflow-token` retourne un token valide

---

## 📊 Analytics et métriques

### Dashboard analytics

Accès : `GET /chatbot-analytics`

### Métriques disponibles

#### 1. **Usage général**
```json
{
  "totalRequests": 1234,
  "uniqueSessions": 567,
  "averageSessionDuration": "8m 30s",
  "activeUsers": 23,
  "peakHours": ["10h-12h", "14h-16h"]
}
```

#### 2. **Distribution des intents**
```json
{
  "intentDistribution": {
    "presentation": 234,
    "competences": 456,
    "competence_detail": 189,
    "langues": 123,
    "projets": 234,
    "projet_detail": 145,
    "experience": 89,
    "formation": 67,
    "contact": 234,
    "merci": 345
  }
}
```

#### 3. **Analyse de sentiment**
```json
{
  "sentimentAnalysis": {
    "positive": 678,
    "negative": 89,
    "neutral": 467,
    "percentagePositive": "55%"
  }
}
```

#### 4. **Questions multi-entités**
```json
{
  "multiEntityQueries": {
    "total": 45,
    "byType": {
      "langues": 18,
      "competences": 20,
      "projets": 5,
      "experiences": 2
    },
    "topCombinations": [
      {"entities": ["Anglais", "Allemand"], "count": 12},
      {"entities": ["Angular", "TypeScript"], "count": 15}
    ]
  }
}
```

---

## 🎓 Exemples avancés

### Exemple 1 : Conversation contextuelle complète

```
User: "Bonjour"
Bot: "Bonjour ! Je suis Théo, développeur Full Stack..."

User: "Quelles sont tes compétences ?"
Bot: "Je maîtrise plusieurs technologies : Angular, TypeScript, Python..."

User: "Parle-moi d'Angular"
Bot: (contexte: l'utilisateur s'intéresse aux compétences)
     "Super ! Angular est une de mes compétences principales..."

User: "Tu as des projets avec ça ?"
Bot: (contexte: conversation sur Angular)
     "Oui ! Voici mes projets Angular : Portfolio, Gestionnaire de RDV..."

User: "Montre-moi le portfolio"
Bot: "Excellent choix ! Mon portfolio est développé avec Angular 20+..."
```

### Exemple 2 : Gestion des fautes de frappe

```
User: "Tu connais typscript ?"
Bot: (fuzzy match: typescript, similarité 0.82)
     "Je pense que tu veux dire TypeScript ! Oui, je le maîtrise..."

User: "Et pithon ?"
Bot: (fuzzy match: python, similarité 0.67)
     "Tu parles de Python ? Oui, c'est une de mes compétences..."
```

### Exemple 3 : Sentiment négatif + suggestion

```
User: "Tu ne connais pas React ?"
Bot: (détecte négation + sentiment négatif)
     "Non, je ne maîtrise pas React actuellement. 😔
     
     En revanche, je maîtrise Angular qui est un framework similaire !
     
     💡 Veux-tu en savoir plus sur mes compétences frontend ?"
```

### Exemple 4 : Multi-entités + affirmation

```
User: "Tu parles anglais et allemand ?"
Bot: (détecte 2 langues)
     "Super ! Tu t'intéresses à plusieurs de mes compétences linguistiques ! 🌍
     
     📌 Anglais : B2 Avancé
     📌 Allemand : B1 Courant
     
     💡 Veux-tu en savoir plus sur une langue en particulier ?"

User: "Oui, l'anglais"
Bot: (détecte affirmation + contexte langue)
     "Parfait ! Mon niveau d'anglais est B2 Avancé.
     J'ai utilisé l'anglais dans plusieurs contextes professionnels..."
```

---

## 🚀 Améliorations futures

### 1. **Intégration de l'IA générative**
- Utiliser OpenAI GPT-4 pour des réponses plus naturelles
- Génération dynamique de réponses basées sur le contexte

### 2. **Système de recommandation**
- Suggérer des compétences complémentaires
- Recommander des projets similaires

### 3. **Multi-langue**
- Support complet de l'anglais et de l'allemand
- Détection automatique de la langue de l'utilisateur

### 4. **Apprentissage continu**
- Machine learning pour améliorer les réponses
- Analyse des questions non comprises

### 5. **Intégration avancée**
- Webhooks pour notifications
- API REST complète pour le CV
- Export automatique du CV en PDF

---

## 📝 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

**Théo Bizet** - Développeur Full Stack

- Portfolio : https://portfolio-angular-theo.vercel.app
- GitHub : [@theobizet](https://github.com/theobizet)
- LinkedIn : [Votre LinkedIn]

---

*Dernière mise à jour : Octobre 2025*
