# 🚀 Guide de Test avec Postman

Voici comment tester l'API Hospital Manager étape par étape avec Postman.

## 1. Créer une Collection
1.  Ouvrez Postman.
2.  Cliquez sur **"Collections"** (à gauche) > **"+"** (Nouvelle collection).
3.  Nommez-la : `Hospital API`.

## 2. Configurer les Variables (Optionnel mais recommandé)
Pour éviter de retaper l'URL et le Token à chaque fois.
1.  Cliquez sur la collection `Hospital API`.
2.  Allez dans l'onglet **"Variables"**.
3.  Ajoutez une variable :
    *   **Variable** : `base_url`
    *   **Initial value** : `http://localhost:8000/api`
    *   **Current value** : `http://localhost:8000/api`
4.  Ajoutez une variable :
    *   **Variable** : `token`
    *   **Initial value** : `(laisser vide)`
    *   **Current value** : `(laisser vide)`
5.  Cliquez sur **Save** (Ctrl+S).

## 3. Headers (TRES IMPORTANT)
Pour forcer Laravel à renvoyer du JSON (et non du HTML en cas d'erreur) :
1.  Dans votre requête (ou mieux, dans la Collection "Hospital API" > onglet **Authorization** ou **Pre-request Script**... mais le plus simple est dans la requête pour commencer), ajoutez :
2.  Onglet **Headers** :
    *   Key: `Accept`
    *   Value: `application/json`
3.  Faites-le pour **TOUTES** les requêtes.

## 4. Première Requête : Login
1.  Faites **Add Request** -> Nommez-la `Login`.
2.  Méthode : **POST**.
3.  URL : `{{base_url}}/login`
4.  **Headers** : Vérifiez que `Accept: application/json` est présent.
5.  Onglet **Body** -> Sélectionnez **raw** -> **JSON**.
6.  Collez ceci :
    ```json
    {
      "email": "jean.dupont@hospital.com",
      "password": "password"
    }
    ```
    *(Note: Le mot de passe est `password` pour tous les comptes de test).*
6.  Cliquez sur **Send**.
7.  **Copiez le token** reçu dans la réponse (`access_token`, sans les guillemets).
8.  Allez dans les variables de la Collection (étape 2) et collez le token dans la **Current value** de la variable `token`. **Sauvegardez !**

## 4. Requêtes Protégées (ex: Liste des Médecins)
1.  Faites **Add Request** -> Nommez-la `Get Médecins`.
2.  Méthode : **GET**.
3.  URL : `{{base_url}}/medecins`
4.  Onglet **Authorization** :
    *   Type : **Bearer Token**
    *   Token : `{{token}}`
5.  Cliquez sur **Send**.
    *   ✅ Vous devriez voir la liste des médecins.

## 5. Créer un Rendez-Vous (POST)
1.  Faites **Add Request** -> Nommez-la `Prise de RDV`.
2.  Méthode : **POST**.
3.  URL : `{{base_url}}/rendez-vous`
4.  Onglet **Authorization** : Type **Bearer Token** (`{{token}}`).
5.  Onglet **Body** -> **raw** -> **JSON** :
    ```json
    {
      "patient_id": 1,
      "medecin_id": 1,
      "date_heure": "2026-03-10 14:00:00",
      "motif": "Mal de tête",
      "statut": "prevu"
    }
    ```
6.  Cliquez sur **Send**.

---


---

# 📚 Référence Complète des Requêtes (Cheatsheet)

Voici la liste exacte des requêtes à créer pour tout tester. Assurez-vous d'avoir le **Token** dans l'onglet Authorization pour chacune.

## 👥 Patients
### 1. Lister les Patients
*   **Method**: `GET`
*   **URL**: `{{base_url}}/patients`

### 2. Créer un Patient
*   **Method**: `POST`
*   **URL**: `{{base_url}}/patients`
*   **Body (JSON)**:
    ```json
    {
        "numero_unique": "PAT-2024-001",
        "nom_patient": "Alice Merveille",
        "date_naissance": "1990-05-15",
        "sexe": "Féminin",
        "contact_patient": "0600000001",
        "email_patient": "alice@test.com",
        "adresse": "10 rue de la Paix",
        "antecedents_medicaux": "Aucun",
        "profession": "Enseignante"
    }
    ```

### 3. Voir un Patient
*   **Method**: `GET`
*   **URL**: `{{base_url}}/patients/1`

---

## 👨‍⚕️ Médecins
### 1. Lister les Médecins
*   **Method**: `GET`
*   **URL**: `{{base_url}}/medecins`

### 2. Voir un Médecin spécifique
*   **Method**: `GET`
*   **URL**: `{{base_url}}/medecins/1`

---

## 📅 Rendez-Vous
### 1. Lister les RDV
*   **Method**: `GET`
*   **URL**: `{{base_url}}/rendez-vous`

### 2. Prendre un RDV
*   **Method**: `POST`
*   **URL**: `{{base_url}}/rendez-vous`
*   **Body (JSON)**:
    ```json
    {
        "patient_id": 1,
        "medecin_id": 1,
        "date_heure": "2026-10-20 09:00:00",
        "motif": "Consultation générale",
        "statut": "prevu"
    }
    ```
    *Note: Changez la date si vous avez une erreur de doublon.*

### 3. Modifier le statut d'un RDV (Annuler)
*   **Method**: `PUT`
*   **URL**: `{{base_url}}/rendez-vous/1`
*   **Body (JSON)**:
    ```json
    {
        "statut": "annule"
    }
    ```

---

## 📝 Visites Médicales
### 1. Enregistrer une Consultation
*   **Method**: `POST`
*   **URL**: `{{base_url}}/visites-medicales`
*   **Body (JSON)**:
    ```json
    {
        "patient_id": 1,
        "medecin_id": 1,
        "rendez_vous_id": 1,
        "date_visite": "2026-10-20 09:30:00",
        "examen": "Tension artérielle normale",
        "symptomes": "Fatigue",
        "diagnostic": "Rien à signaler",
        "traitement": "Repos",
        "poids": 70,
        "taille": 175
    }
    ```
    *Note: Si le RDV #1 existe, son statut passera automatiquement à `effectue`.*

