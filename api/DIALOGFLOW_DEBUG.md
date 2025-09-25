# 🔧 Guide de dépannage - Erreur Dialogflow 500

## 🚨 Diagnostic de l'erreur

L'erreur 500 sur `/get-dialogflow-token` indique généralement un problème de configuration Google Cloud. Voici comment diagnostiquer et résoudre le problème :

## 🔍 Étape 1: Diagnostic automatique

Accédez à cette URL pour un diagnostic complet :
```
https://portfolio-angular-theo.vercel.app/diagnose-google-config
```

Cette route vérifie automatiquement :
- ✅ Présence de la variable `GOOGLE_SERVICE_ACCOUNT`
- ✅ Validité du JSON
- ✅ Champs requis présents
- ✅ Format des credentials
- ✅ Type de service account

## 🛠️ Étape 2: Vérifications manuelles

### 1. **Vérifier la variable d'environnement**

Dans Vercel, allez dans :
1. **Project Settings** → **Environment Variables**
2. Vérifiez que `GOOGLE_SERVICE_ACCOUNT` existe
3. Vérifiez que le JSON est complet et valide

### 2. **Format attendu du service account JSON**

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

### 3. **Champs critiques à vérifier**

| Champ | Description | Problème fréquent |
|-------|-------------|-------------------|
| `type` | Doit être `"service_account"` | Parfois `"user"` par erreur |
| `project_id` | ID du projet Google Cloud | Doit correspondre au projet Dialogflow |
| `private_key` | Clé privée RSA | Doit inclure `-----BEGIN/END PRIVATE KEY-----` |
| `client_email` | Email du service account | Format `xxx@xxx.iam.gserviceaccount.com` |

## 🔑 Étape 3: Régénérer les credentials (si nécessaire)

### Dans Google Cloud Console :

1. **Aller à IAM & Admin** → **Service Accounts**
2. **Trouver votre service account** (ou en créer un nouveau)
3. **Cliquer sur Actions** → **Manage keys**
4. **Add Key** → **Create new key** → **JSON**
5. **Télécharger le fichier JSON**

### Permissions requises pour le service account :

- **Dialogflow API Client** (`roles/dialogflow.client`)
- **Dialogflow API Admin** (`roles/dialogflow.admin`) [optionnel]

## 🚀 Étape 4: Mettre à jour Vercel

1. **Copier le contenu du nouveau JSON**
2. **Aller dans Vercel** → **Project Settings** → **Environment Variables**
3. **Modifier `GOOGLE_SERVICE_ACCOUNT`**
4. **Coller le JSON complet** (attention aux caractères d'échappement)
5. **Redéployer** le projet

## 🔄 Étape 5: Test de validation

Après mise à jour, testez dans l'ordre :

1. **Diagnostic** : `GET /diagnose-google-config`
2. **Token** : `GET /get-dialogflow-token`
3. **Webhook** : `POST /webhook` avec payload Dialogflow

## 🐛 Erreurs communes et solutions

### ❌ "invalid_grant"
- **Cause** : Clé privée invalide ou service account désactivé
- **Solution** : Régénérer une nouvelle clé JSON

### ❌ "service account does not exist"
- **Cause** : Service account supprimé ou project_id incorrect
- **Solution** : Vérifier l'existence du service account dans Google Cloud

### ❌ "JSON invalide"
- **Cause** : Caractères d'échappement ou coupure du JSON
- **Solution** : Vérifier l'intégrité du JSON avec un validateur

### ❌ "Configuration manquante"
- **Cause** : Variable d'environnement vide ou non définie
- **Solution** : Vérifier la présence de `GOOGLE_SERVICE_ACCOUNT` dans Vercel

## 📋 Checklist finale

- [ ] Service account existe dans Google Cloud
- [ ] Permissions Dialogflow accordées
- [ ] JSON complet et valide
- [ ] Variable d'environnement correctement définie dans Vercel
- [ ] Projet redéployé après changements
- [ ] Diagnostic `/diagnose-google-config` passe tous les tests
- [ ] Route `/get-dialogflow-token` retourne un token valide

## 📞 Si le problème persiste

1. **Vérifiez les logs Vercel** : Functions → Logs
2. **Testez localement** avec les mêmes credentials
3. **Contactez le support** avec le résultat du diagnostic

---

*Cette erreur est généralement liée à la configuration Google Cloud et se résout facilement en suivant ces étapes.*