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
- `POST /api/register` - Enregistrer un nouvel utilisateur
- `POST /api/login` - Se connecter
- `POST /api/logout` - Se déconnecter
- `GET /api/user` - Obtenir le profil actuel

### Médecins
- `GET /api/medecins` - Lister les médecins
- `POST /api/medecins` - Créer un médecin
- `GET /api/medecins/{id}` - Obtenir un médecin
- `PUT /api/medecins/{id}` - Mettre à jour un médecin
- `DELETE /api/medecins/{id}` - Supprimer un médecin

### Patients
- `GET /api/patients` - Lister les patients
- `POST /api/patients` - Créer un patient
- `GET /api/patients/{id}` - Obtenir un patient
- `PUT /api/patients/{id}` - Mettre à jour un patient
- `DELETE /api/patients/{id}` - Supprimer un patient

### Rendez-vous
- `GET /api/rendez-vous` - Lister les rendez-vous
- `POST /api/rendez-vous` - Créer un rendez-vous
- `GET /api/rendez-vous/{id}` - Obtenir un rendez-vous
- `PUT /api/rendez-vous/{id}` - Mettre à jour un rendez-vous
- `DELETE /api/rendez-vous/{id}` - Supprimer un rendez-vous

### Visites Médicales
- `GET /api/visites-medicales` - Lister les visites médicales
- `POST /api/visites-medicales` - Enregistrer une visite
- `GET /api/visites-medicales/{id}` - Obtenir une visite
- `PUT /api/visites-medicales/{id}` - Mettre à jour une visite

### Notifications
- `GET /api/notifications` - Lister les notifications
- `POST /api/notifications/{id}/read` - Marquer comme lue
- `POST /api/notifications/read-all` - Marquer tout comme lu

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT valide dans l'en-tête `Authorization` :

```
Authorization: Bearer {token}
```

## 🧪 Tests

Pour exécuter les tests unitaires et de fonctionnalités :

```bash
php artisan test