# Hospital Management System 🏥

Une solution complète de gestion hospitalière comprenant un Backend Laravel robuste et un Frontend React moderne et premium.

## 🚀 Fonctionnalités Principales

- **Authentification Sécurisée** : Gestion des sessions avec Laravel Sanctum.
- **Contrôle d'Accès par Rôle (RBAC)** :
  - **Admin** : Accès total, gestion des médecins, patients, rendez-vous et statistiques.
  - **Docteur** : Gestion des patients, planification des rendez-vous et saisie des consultations.
- **Tableau de Bord Dynamique** : Statistiques en temps réel et activités récentes.
- **Notifications** : Système d'alertes en temps réel pour les nouveaux rendez-vous et rappels.

---

## 🛠️ Installation

### Prérequis
- PHP 8.1+ & Composer
- Node.js 18+ & NPM
- MySQL 8.0+

### 1. Backend (Laravel)
```bash
git clone https://github.com/Musakibara/Hospital-project.git
cd Hospital_backend
composer install
cp .env.example .env
# Configurez votre base de données dans le .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
L'API sera accessible sur `http://localhost:8000`.

### 2. Frontend (React + Vite)
```bash
cd ../Hospital_frontend
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

---

## 📂 Structure du Projet

```text
Hospital-project/
├── Hospital_backend/          # API Laravel
│   ├── app/Models/            # User, Medecin, Patient, RendezVous...
│   ├── app/Http/Controllers/  # Logique métier et API
│   └── routes/api.php         # Définition des points d'accès
│
└── Hospital_frontend/         # Client React
    ├── src/context/           # AuthContext (Session & RBAC)
    ├── src/services/          # Appels API (Axios)
    ├── src/pages/             # Vues (Dashboard, Patients, Doctors...)
    └── src/layouts/           # Structure Sidebar/Header
```

---

## 🔐 Rôles et Permissions

| Fonctionnalité | Admin | Docteur |
| :--- | :---: | :---: |
| Dashboard & Stats | ✅ | ✅ |
| Gestion des Patients | ✅ | ✅ |
| Gestion des Médecins | ✅ | ❌ |
| Prise de RDV | ✅ | ✅ |
| Consultations | ✅ | ✅ |

---

## 🔌 API Endpoints (Sanctum Protected)

### Authentification
- `POST /api/login` - Connexion
- `POST /api/register` - Inscription
- `GET /api/user` - Profil actuel (nécessite Token)
- `POST /api/logout` - Déconnexion

### Ressources
- `/api/patients` - Gestion des patients
- `/api/medecins` - Gestion des médecins (Admin only)
- `/api/rendez-vous` - Gestion des rendez-vous (Appointments)
- `/api/notifications` - Alertes utilisateur

---

## 🧪 Tests
```bash
# Backend
php artisan test

# Frontend (Linting)
npm run build
```