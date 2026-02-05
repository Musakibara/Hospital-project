# Documentation API - Hospital Manager

## 🌍 Base URL
L'URL de base pour toutes les requêtes est :
`http://localhost:8000/api`

## 🔐 Authentification
L'API utilise **Laravel Sanctum**.

### 1. Login
**POST** `/login`
Permet de récupérer le token d'authentification.
```json
{
  "email": "medecin@hospital.com",
  "password": "password"
}
```
**Réponse :**
```json
{
  "access_token": "1|AbCdEf123456...",
  "token_type": "Bearer",
  "user": { ... }
}
```

### 2. Authentifier les requêtes suivantes
Pour toutes les routes protégées, ajoutez le token dans le **Header** de la requête :
```http
Authorization: Bearer <votre_token>
Accept: application/json
Content-Type: application/json
```

---

## 🏥 Endpoints Principaux

### 👨‍⚕️ Médecins (`/medecins`)
- `GET /medecins` : Liste tous les médecins (avec leur profil utilisateur).
- `POST /medecins` : Créer un médecin.
- `GET /medecins/{id}` : Détails d'un médecin.
- `PUT /medecins/{id}` : Mettre à jour.
- `DELETE /medecins/{id}` : Supprimer.

### 👤 Patients (`/patients`)
- `GET /patients` : Liste des patients (paginée).
  - *Recherche* : `?search=Dupont` (cherche nom, email ou téléphone).
- `POST /patients` : Créer un patient.
- `GET /patients/{id}` : Dossier complet du patient.

### 📅 Rendez-Vous (`/rendez-vous`)
- `GET /rendez-vous` : Liste des RDV.
  - *Filtres* :
    - `?date=2024-02-05`
    - `?medecin_id=1`
    - `?patient_id=5`
    - `?statut=prevu` (prevu, confirme, en_cours, effectue, annule)
- `POST /rendez-vous` : Prendre un RDV.
  - **Validation** : Empêche les doublons (même médecin, même heure).
- `PUT /rendez-vous/{id}` : Modifier (ex: changer le statut).

### 📝 Visites Médicales (`/visites-medicales`)
- `POST /visites-medicales` : Enregistrer une consultation.
  - **Note** : Si vous liez un `rendez_vous_id`, le statut du RDV passera automatiquement à `effectue`.
- `GET /visites-medicales?patient_id=X` : Historique des visites d'un patient.

## ⚠️ Codes Erreurs Courants
- **401 Unauthorized** : Token manquant ou invalide.
- **422 Unprocessable Entity** : Erreur de validation (ex: email manquant, créneau déjà pris).
  - Le détail des champs en erreur est renvoyé dans le JSON.
- **404 Not Found** : Ressource introuvable.
