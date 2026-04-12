## Système de Gestion Hospitalière (SGH)

##Développeurs : 
	Nifoutia Moupefo Zidane ; Mougoue Steve Brondon
##Encadreur : 
	M. Amougou

### 1. Introduction
Ce document présente l'analyse technique et fonctionnelle exhaustive du Système de Gestion Hospitalière (SGH). Il est basé exclusivement sur l'implémentation réelle du projet, incluant le backend Laravel et le frontend React.

### 2. Contexte et Objectifs
L'application vise à numériser la gestion des patients, des médecins, des rendez-vous et des consultations médicales au sein d'un établissement de santé, en assurant la sécurité des données et une isolation stricte des dossiers médicaux selon les privilèges des utilisateurs.

### 3. Analyse Fonctionnelle

#### Profils Utilisateurs
- **Administrateur (admin)** :
    - Gestion complète des ressources (Médecins, Patients, Rendez-vous).
    - Accès aux statistiques globales du dashboard.
    - Consultation des logs système (Notifications).
- **Médecin (medecin)** :
    - Accès restreint : ne voit que ses propres rendez-vous et les visites qu'il a effectuées.
    - Gestion du profil personnel.
    - Saisie des consultations médicales pour ses patients.

#### Modules Implémentés
- **Authentification** : Système de connexion sécurisé avec jetons (Sanctum). Gestion des comptes actifs/inactifs.
- **Gestion Patients** : Enregistrement, suivi des dossiers, génération automatique d'un numéro unique (ULID).
- **Gestion Médecins** : Création de profils, affectation de spécialités, gestion de la disponibilité et envoi automatique d'emails de bienvenue.
- **Gestion Rendez-vous** : Planification avec détection automatique de chevauchement (slots de 30 min) et vérification de la disponibilité du médecin.
- **Gestion Consultations** : Saisie des examens, symptômes, diagnostics, traitements et constantes vitales (IMC, poids/taille).
- **Dashboard & Statistiques** : Visualisation des indicateurs clés (Total patients, RDV du jour, etc.) adaptée au rôle de l'utilisateur.
- **Notifications & Logs** : Système de traçabilité des actions critiques (Création patient, suppression RDV, etc.).

### 4. Architecture Technique

#### Architecture Backend (Laravel)
- **Version** : Laravel 10.10 / PHP 8.1.
- **Architecture** : API RESTful (MVC).
- **Sécurité** : 
    - Laravel Sanctum (Token-based Auth).
    - Middlewares : `auth:sanctum`.
    - Validation : Form Requests et validation inline.
- **Base de Données** :
    - **Models & Eloquent** : `User`, `Medecin`, `Patient`, `RendezVous`, `VisiteMedicale`, `Notification`.
    - **Relations** : User hasOne Medecin, Patient hasMany RendezVous/Visites, etc.
    - **Notifications/Mail** : `AppointmentConfirmation`, `DoctorWelcomeMail`.
    - **Transactions DB** : Utilisées pour garantir l'intégrité des données lors des créations liées (User + Medecin).

#### Architecture Frontend (React)
- **Version** : React 19.
- **Build Tool** : Vite.
- **Gestion d'état** :
    - **Context API** : `AuthContext`, `ThemeContext`.
    - **TanStack Query** (v5) : Gestion du cache et des requêtes asynchrones.
- **Routing** : React Router 7 avec protection des routes (`ProtectedRoute`, `PublicRoute`) basée sur les rôles.
- **UI Framework** : Tailwind CSS 4, Radix UI (Slot), Lucide Icons, Framer Motion (animations).
- **Appels API** : Axios avec intercepteurs (gestion automatique du token `auth_token` dans le `sessionStorage`).

### 5. Base de Données (Schéma Logique)

- **users** : email (unique), password (hash), role (admin/medecin).
- **medecins** : nom, specialite, contact, email, genre, disponible, actif, user_id (FK).
- **patients** : numero_unique (ULID), nom, date_naissance, sexe, contact, email, adresse, antecedents_medicaux, profession, deleted_at (SoftDeletes).
- **rendez_vous** : patient_id (FK), medecin_id (FK), medecin_remplacant_id (FK), date_heure, motif, statut (prevu, confirme, en_cours, effectue, annule, reporte), observation.
- **visites_medicales** : patient_id (FK), medecin_id (FK), rendez_vous_id (FK, unique), date_visite, examen, symptomes, diagnostic, maladie, traitement, allergies, maladie_chronique, poids, taille, imc.
- **notifications** : user_id (FK), type, message, read_at.

### 6. Sécurité & Optimisations

- **Sécurité** :
    - Hachage des mots de passe (Bcrypt/Argon2).
    - Protection contre injection SQL via Eloquent.
    - Protection CORS configurée.
    - Isolation des données : Un médecin ne peut pas accéder aux dossiers patients ou rendez-vous d'autres médecins via les contrôleurs API.
- **Performances** :
    - **Pagination** : Résultats API paginés (par défaut 12 ou 20).
    - **Optimisation Eloquent** : Utilisation de `with()` pour éviter le problème N+1.
    - **Frontend Lazy Loading** : Chargement différé des pages via React Suspense.

### 7. Flux Utilisateur (Workflow)

1.  **Connexion** : L'utilisateur saisit ses identifiants -> Réception d'un token Sanctum -> Stockage en `sessionStorage`.
2.  **Dashboard** : 
    - Admin voit les statistiques globales.
    - Médecin voit ses rendez-vous du jour et ses dernières visites.
3.  **Consultation d'un dossier patient** :
    - Admin voit tout l'historique.
    - Médecin ne voit que les rendez-vous et visites liés à *son* ID médecin.
4.  **Prise de rendez-vous** : Vérification en temps réel de la non-chevauchement des horaires et de la disponibilité du médecin.

### 8. Limites et Perspectives

- **Limites Actuelles** :
    - Absence de tests unitaires/fonctionnels automatisés détectables.
    - Logique de permission parfois codée en dur dans les contrôleurs au lieu d'utiliser des Policies dédiées.
    - Pas de système de logs de fichiers (`storage/logs`) analysé, seulement une table `notifications` pour l'audit trail UI.
- **Perspectives** :
    - Implémentation de tests de charge.
    - Ajout de la génération de PDF pour les ordonnances (non détecté comme implémenté dans le code parcouru).
    - Refactorisation vers des `Policies` Laravel pour une gestion plus granulaire du RBAC.

### 9. Conclusion
Le SGH est une application robuste, bien structurée sur les standards modernes (Laravel/React). L'architecture respecte les principes de séparation des responsabilités et assure une isolation efficace des données médicales sensibles.
