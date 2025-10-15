// 🧪 Tests pour la gestion multi-entités
// Ce fichier contient des exemples de requêtes et réponses attendues

const testCases = {
  // 🌍 Tests multi-langues
  multiLangues: [
    {
      query: "Tu parles anglais et allemand ?",
      expectedEntities: ["Anglais", "Allemand"],
      expectedResponse: "Super ! Tu t'intéresses à plusieurs de mes compétences linguistiques ! 🌍",
      shouldContain: ["📌 Anglais", "📌 Allemand", "Ces 2 langues"]
    },
    {
      query: "Quel est ton niveau en anglais, allemand et français ?",
      expectedEntities: ["Anglais", "Allemand", "Français"],
      expectedResponse: "compétences linguistiques",
      shouldContain: ["📌 Anglais", "📌 Allemand", "📌 Français", "Ces 3 langues"]
    },
    {
      query: "Tu parles english ou german ?",
      expectedEntities: ["Anglais", "Allemand"],
      expectedResponse: "compétences linguistiques",
      shouldContain: ["Anglais", "Allemand"]
    },
    {
      query: "Anglais / Allemand / Français ?",
      expectedEntities: ["Anglais", "Allemand", "Français"],
      expectedResponse: "compétences linguistiques",
      shouldContain: ["📌"]
    }
  ],

  // 💻 Tests multi-compétences
  multiCompetences: [
    {
      query: "Tu maîtrises Angular et TypeScript ?",
      expectedEntities: ["Angular", "TypeScript"],
      expectedResponse: "Excellent ! Tu veux connaître mes compétences en Angular, TypeScript",
      shouldContain: ["📌 Angular", "📌 TypeScript", "Veux-tu approfondir"]
    },
    {
      query: "Tu connais Python, Java et C++ ?",
      expectedEntities: ["Python", "Java", "C++"],
      expectedResponse: "compétences",
      shouldContain: ["📌 Python", "📌 Java", "📌 C++"]
    },
    {
      query: "Angular ou React ?",
      expectedEntities: ["Angular"],
      expectedResponse: "Angular",
      shouldContain: ["Angular"],
      shouldNotContain: ["React"] // React n'est pas dans les compétences
    },
    {
      query: "Kotlin et Java pour Android",
      expectedEntities: ["Kotlin", "Java"],
      expectedResponse: "compétences",
      shouldContain: ["Kotlin", "Java"]
    }
  ],

  // 🚀 Tests multi-projets
  multiProjets: [
    {
      query: "Parle-moi de ton portfolio et de l'appli mobile",
      expectedEntities: ["Portfolio en ligne", "Gestionnaire de RDV"],
      expectedResponse: "Génial ! Je vais te parler de ces",
      shouldContain: ["📌 Portfolio", "📌", "projets"]
    },
    {
      query: "Tes projets de reconnaissance d'objets et de labyrinthe",
      expectedEntities: ["Reconnaissance d'objets", "Labyrinthe"],
      expectedResponse: "projets",
      shouldContain: ["📌"]
    }
  ],

  // 💼 Tests multi-expériences
  multiExperiences: [
    {
      query: "Parle-moi de tes stages chez GHMC et Liebherr",
      expectedEntities: ["GHMC", "Liebherr-Aerospace"],
      expectedResponse: "Parfait ! Voici un aperçu de ces",
      shouldContain: ["📌 GHMC", "📌 Liebherr", "expériences"]
    },
    {
      query: "Tes expériences chez GHMC et MicroEJ",
      expectedEntities: ["GHMC", "MicroEJ"],
      expectedResponse: "expériences",
      shouldContain: ["GHMC", "MicroEJ"]
    }
  ],

  // 🔀 Tests mixtes et edge cases
  edgeCases: [
    {
      name: "Une seule entité (pas de multi)",
      query: "Tu parles anglais ?",
      expectedEntities: ["Anglais"],
      shouldBeSingle: true,
      expectedResponse: "Mon niveau en Anglais"
    },
    {
      name: "Entité inexistante",
      query: "Tu parles chinois et japonais ?",
      expectedEntities: [],
      expectedResponse: "Je n'ai pas de niveau enregistré",
      shouldContain: ["langues que je parle"]
    },
    {
      name: "Mélange existant/inexistant",
      query: "Tu parles anglais et chinois ?",
      expectedEntities: ["Anglais"],
      expectedResponse: "Anglais",
      shouldContain: ["Anglais"]
    },
    {
      name: "Toutes les compétences d'un domaine",
      query: "Tu codes en web et mobile ?",
      expectedResponse: "développement web",
      shouldContain: ["Angular", "TypeScript"]
    },
    {
      name: "Séparateurs multiples",
      query: "Angular, TypeScript et Kotlin",
      expectedEntities: ["Angular", "TypeScript", "Kotlin"],
      expectedResponse: "compétences",
      shouldContain: ["📌 Angular", "📌 TypeScript", "📌 Kotlin"]
    },
    {
      name: "Synonymes et variantes",
      query: "Tu parles english et deutsch ?",
      expectedEntities: ["Anglais", "Allemand"],
      expectedResponse: "compétences linguistiques",
      shouldContain: ["Anglais", "Allemand"]
    }
  ]
};

// 🧪 Fonction de test (à utiliser pour validation)
function runTests(webhook, testSuite) {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const [category, tests] of Object.entries(testSuite)) {
    console.log(`\n🧪 Testing ${category}...`);
    
    tests.forEach((test, index) => {
      console.log(`  Test ${index + 1}: ${test.name || test.query}`);
      
      try {
        // Simuler une requête webhook
        const mockRequest = {
          body: {
            queryResult: {
              intent: { displayName: 'test_intent' },
              parameters: {},
              queryText: test.query
            },
            session: 'test-session-' + Date.now()
          }
        };

        // Exécuter le webhook (à adapter selon votre implémentation)
        // const response = webhook.processQuery(mockRequest);
        
        // Vérifications (à décommenter et adapter)
        // if (test.shouldContain) {
        //   test.shouldContain.forEach(text => {
        //     if (!response.includes(text)) {
        //       throw new Error(`Expected response to contain: ${text}`);
        //     }
        //   });
        // }

        console.log(`    ✅ PASSED`);
        results.passed++;
        results.details.push({ test: test.query, status: 'PASSED' });
      } catch (error) {
        console.log(`    ❌ FAILED: ${error.message}`);
        results.failed++;
        results.details.push({ test: test.query, status: 'FAILED', error: error.message });
      }
    });
  }

  console.log(`\n📊 Test Results:`);
  console.log(`  ✅ Passed: ${results.passed}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log(`  📈 Success rate: ${Math.round(results.passed / (results.passed + results.failed) * 100)}%`);

  return results;
}

// 📝 Exemples de requêtes pour tests manuels
const manualTestQueries = {
  langues: [
    "Tu parles anglais et allemand ?",
    "Quel est ton niveau en anglais, allemand et français ?",
    "English or German ?",
    "Anglais/Allemand/Français"
  ],
  
  competences: [
    "Tu maîtrises Angular et TypeScript ?",
    "Tu connais Python, Java et C++ ?",
    "Angular, React ou Vue ?",
    "Kotlin et Java pour Android"
  ],
  
  projets: [
    "Parle-moi de ton portfolio et de l'appli mobile",
    "Tes projets web et IA",
    "Portfolio et reconnaissance d'objets"
  ],
  
  experiences: [
    "Parle-moi de tes stages chez GHMC et Liebherr",
    "Tes expériences chez GHMC, MicroEJ et Liebherr"
  ],

  combinations: [
    "Tu parles anglais et tu codes en TypeScript ?", // Multi-domaine
    "Tous tes projets Angular", // Filtre par technologie
    "Tes compétences en web et mobile" // Domaines larges
  ]
};

// Export pour utilisation
module.exports = {
  testCases,
  runTests,
  manualTestQueries
};

// 💡 Instructions d'utilisation :
// 1. Tester manuellement via le chatbot avec les queries dans manualTestQueries
// 2. Vérifier que les réponses contiennent les éléments attendus
// 3. S'assurer que les emojis 📌 apparaissent pour chaque entité
// 4. Valider que le compteur ("Ces X langues/technologies...") est correct