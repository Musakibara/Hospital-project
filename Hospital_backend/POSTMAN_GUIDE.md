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

## Astuce de Pro (Script Automatique)
Pour que le token se mette à jour tout seul après le login :
1.  Allez dans la requête **Login** > Onglet **Scripts** > **Post-response**.
2.  Collez ce code :
    ```javascript
    if (pm.response.code === 200) {
        var jsonData = pm.response.json();
        pm.collectionVariables.set("token", jsonData.access_token);
        console.log("Token mis à jour !");
    }
    ```
3.  La prochaine fois que vous ferez `Login`, la variable `{{token}}` se mettra à jour toute seule pour toutes les autres requêtes !
