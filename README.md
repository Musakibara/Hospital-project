   git clone https://github.com/Musakibara/Hospital-project.git
   cd Hospital_backend
   ```

2. **Installer les dépendances PHP**
   ```bash
   composer install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   ```
   Modifier le fichier `.env` avec vos informations de base de données :
   ```env
   DB_CONNECTION=mysql
   DB_HOST=[IP_ADDRESS]
   DB_PORT=3306
   DB_DATABASE=hospital_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Générer la clé d'application**
   ```bash
   php artisan key:generate
   ```

5. **Exécuter les migrations**
   ```bash
   php artisan migrate
   ```

6. **Créer les données initiales**
   ```bash
   php artisan db:seed
   ```

7. **Démarrer le serveur**
   ```bash
   php artisan serve
   ```
   L'API sera disponible sur `http://localhost:8000`

## 📂 Structure du Projet

```
Hospital_backend/
├── app/
│   ├── Http/Controllers/  # Contrôleurs API
│   ├── Models/              # Modèles Eloquent
│   ├── Requests/            # Formulaires de validation
│   └── Resources/           # Formats de réponse JSON
├── database/
│   ├── migrations/          # Migrations de base de données
│   ├── seeders/             # Seeders pour données initiales
│   └── factories/           # Factories pour tests
├── routes/
│   ├── api.php              # Routes API
│   └── web.php              # Routes web (si applicable)
├── config/                  # Fichiers de configuration
├── public/                  # Fichiers publics
└── storage/                 # Fichiers stockés
```

## 🔌 Points d'Accès API

### Authentification
- `POST /api/auth/register` - Enregistrer un nouvel utilisateur
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter
- `GET /api/auth/me` - Obtenir le profil actuel

### Utilisateurs
- `GET /api/users` - Lister tous les utilisateurs
- `GET /api/users/{id}` - Obtenir un utilisateur
- `PUT /api/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

### Hôpitaux
- `GET /api/hospitals` - Lister les hôpitaux
- `POST /api/hospitals` - Créer un hôpital
- `GET /api/hospitals/{id}` - Obtenir un hôpital
- `PUT /api/hospitals/{id}` - Mettre à jour un hôpital
- `DELETE /api/hospitals/{id}` - Supprimer un hôpital

### Médecins
- `GET /api/doctors` - Lister les médecins
- `POST /api/doctors` - Créer un médecin
- `GET /api/doctors/{id}` - Obtenir un médecin
- `PUT /api/doctors/{id}` - Mettre à jour un médecin
- `DELETE /api/doctors/{id}` - Supprimer un médecin

### Patients
- `GET /api/patients` - Lister les patients
- `POST /api/patients` - Créer un patient
- `GET /api/patients/{id}` - Obtenir un patient
- `PUT /api/patients/{id}` - Mettre à jour un patient
- `DELETE /api/patients/{id}` - Supprimer un patient

### Rendez-vous
- `GET /api/appointments` - Lister les rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/{id}` - Obtenir un rendez-vous
- `PUT /api/appointments/{id}` - Mettre à jour un rendez-vous
- `DELETE /api/appointments/{id}` - Supprimer un rendez-vous

### Consultations
- `GET /api/consultations` - Lister les consultations
- `POST /api/consultations` - Enregistrer une consultation
- `GET /api/consultations/{id}` - Obtenir une consultation
- `PUT /api/consultations/{id}` - Mettre à jour une consultation
- `DELETE /api/consultations/{id}` - Supprimer une consultation

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT valide dans l'en-tête `Authorization` :

```
Authorization: Bearer {token}
```

## 🧪 Tests

Pour exécuter les tests unitaires et de fonctionnalités :

```bash
php artisan test