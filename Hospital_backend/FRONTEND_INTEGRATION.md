# Guide d'Intégration Frontend (API Hospital)

Ce guide fournit des exemples concrets pour connecter votre application Frontend (React, Vue, etc.) à l'API Backend Laravel.

## 🛠 Configuration Recommandée (Axios)

Créez une instance Axios globale pour gérer automatiquement le token.

```javascript
import axios from 'axios';

// Configuration de base
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

---

## 🔐 Authentification

### 1. Se connecter (Login)
```javascript
async function login(email, password) {
    try {
        // 1. Appel API
        const response = await api.post('/login', { email, password });
        
        // 2. Stocker le token et l'utilisateur
        const { access_token, user } = response.data;
        localStorage.setItem('auth_token', access_token);
        localStorage.setItem('user_info', JSON.stringify(user));
        
        console.log("Connecté en tant que :", user.name);
        return user;
    } catch (error) {
        console.error("Erreur de connexion :", error.response?.data?.message);
    }
}
```

### 2. Se déconnecter (Logout)
```javascript
async function logout() {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
}
```

---

## 👨‍⚕️ Gestion des Médecins

### Récupérer la liste
```javascript
async function getMedecins() {
    const response = await api.get('/medecins');
    // Renvoie un tableau d'objets médecins
    return response.data.data; 
}
```

---

## 📅 Gestion des Rendez-Vous

### Prendre un Rendez-vous
```javascript
async function createRendezVous(patientId, medecinId, date, motif) {
    try {
        const payload = {
            patient_id: patientId,
            medecin_id: medecinId,
            date_heure: date, // Format: "2024-02-05 14:30:00"
            motif: motif,
            statut: 'prevu'
        };

        const response = await api.post('/rendez-vous', payload);
        alert("Rendez-vous confirmé !");
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 422) {
            alert("Erreur : Ce créneau est probablement déjà pris.");
        }
    }
}
```

---

## 📝 Visites Médicales (Consultations)

### Enregistrer une visite (Médecin)
Cela mettra automatiquement le statut du RDV à "effectue".

```javascript
async function saveConsultation(rendezVousId, formData) {
    const payload = {
        rendez_vous_id: rendezVousId,
        patient_id: formData.patientId,
        medecin_id: formData.medecinId,
        date_visite: new Date().toISOString().slice(0, 19).replace('T', ' '),
        examen: formData.examen,
        diagnosis: formData.diagnostic,
        traitement: formData.traitement,
        // ... autres champs optionnels
    };

    await api.post('/visites-medicales', payload);
}
```

## ⚠️ Gestion des Erreurs courantes

| Status | Signification | Action Frontend |
| :--- | :--- | :--- |
| **401** | Non autorisé | Rediriger vers la page de Login. |
| **422** | Erreur de Validation | Afficher les erreurs sous les champs du formulaire. |
| **403** | Interdit | L'utilisateur n'a pas les droits (ex: un médecin qui veut supprimer un admin). |
