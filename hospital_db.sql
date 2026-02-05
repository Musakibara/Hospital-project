-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 04 fév. 2026 à 23:54
-- Version du serveur : 10.4.27-MariaDB
-- Version de PHP : 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `hospital_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `medecins`
--

CREATE TABLE `medecins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nom_medecin` varchar(100) NOT NULL,
  `specialite` varchar(100) NOT NULL,
  `contact_medecin` varchar(20) NOT NULL,
  `email_medecin` varchar(100) NOT NULL,
  `genre_medecin` enum('Masculin','Féminin','Autre') NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Médecin actif ou inactif',
  `can_edit_profile` tinyint(1) NOT NULL DEFAULT 0,
  `disponible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2026_02_04_205119_create_medecins_table', 1),
(6, '2026_02_04_205147_create_patients_table', 1),
(7, '2026_02_04_205158_create_rendez_vous_table', 1),
(8, '2026_02_04_205210_create_visites_medicales_table', 1);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

CREATE TABLE `patients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_unique` varchar(20) NOT NULL,
  `nom_patient` varchar(100) NOT NULL,
  `date_naissance` date NOT NULL,
  `sexe` enum('Masculin','Féminin','Autre') NOT NULL,
  `contact_patient` varchar(20) NOT NULL,
  `email_patient` varchar(100) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `antecedents_medicaux` text DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

CREATE TABLE `rendez_vous` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `medecin_id` bigint(20) UNSIGNED NOT NULL,
  `medecin_remplacant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date_heure` datetime NOT NULL,
  `motif` varchar(255) NOT NULL,
  `statut` enum('prevu','confirme','en_cours','effectue','annule','reporte') NOT NULL DEFAULT 'prevu',
  `observation` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','medecin') NOT NULL DEFAULT 'medecin' COMMENT 'Rôle utilisateur',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `visites_medicales`
--

CREATE TABLE `visites_medicales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `medecin_id` bigint(20) UNSIGNED NOT NULL,
  `rendez_vous_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date_visite` datetime NOT NULL,
  `examen` text NOT NULL,
  `symptomes` text NOT NULL,
  `diagnostic` text NOT NULL,
  `maladie` text NOT NULL,
  `traitement` text NOT NULL,
  `allergie` text DEFAULT NULL,
  `maladie_chronique` text DEFAULT NULL,
  `poids` decimal(5,2) DEFAULT NULL COMMENT 'Weight in kg',
  `taille` decimal(5,2) DEFAULT NULL COMMENT 'Height in cm',
  `imc` decimal(4,2) DEFAULT NULL COMMENT 'BMI',
  `observations` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `medecins`
--
ALTER TABLE `medecins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `medecins_contact_medecin_unique` (`contact_medecin`),
  ADD UNIQUE KEY `medecins_email_medecin_unique` (`email_medecin`),
  ADD UNIQUE KEY `medecins_user_id_unique` (`user_id`),
  ADD KEY `medecins_user_id_index` (`user_id`),
  ADD KEY `medecins_specialite_index` (`specialite`),
  ADD KEY `medecins_disponible_index` (`disponible`),
  ADD KEY `medecins_nom_medecin_index` (`nom_medecin`),
  ADD KEY `medecins_actif_index` (`actif`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patients_numero_unique_unique` (`numero_unique`),
  ADD UNIQUE KEY `patients_contact_patient_unique` (`contact_patient`),
  ADD UNIQUE KEY `patients_email_patient_unique` (`email_patient`),
  ADD KEY `patients_nom_patient_index` (`nom_patient`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Index pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prevent_double_booking` (`medecin_id`,`date_heure`),
  ADD KEY `rendez_vous_medecin_remplacant_id_foreign` (`medecin_remplacant_id`),
  ADD KEY `rendez_vous_patient_id_index` (`patient_id`),
  ADD KEY `rendez_vous_medecin_id_index` (`medecin_id`),
  ADD KEY `rendez_vous_date_heure_index` (`date_heure`),
  ADD KEY `rendez_vous_statut_index` (`statut`),
  ADD KEY `rendez_vous_patient_id_statut_index` (`patient_id`,`statut`),
  ADD KEY `rendez_vous_medecin_id_date_heure_index` (`medecin_id`,`date_heure`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_index` (`role`);

--
-- Index pour la table `visites_medicales`
--
ALTER TABLE `visites_medicales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visites_medicales_patient_id_index` (`patient_id`),
  ADD KEY `visites_medicales_medecin_id_index` (`medecin_id`),
  ADD KEY `visites_medicales_rendez_vous_id_index` (`rendez_vous_id`),
  ADD KEY `visites_medicales_date_visite_index` (`date_visite`),
  ADD KEY `visites_medicales_patient_id_date_visite_index` (`patient_id`,`date_visite`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `medecins`
--
ALTER TABLE `medecins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `visites_medicales`
--
ALTER TABLE `visites_medicales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `medecins`
--
ALTER TABLE `medecins`
  ADD CONSTRAINT `medecins_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD CONSTRAINT `rendez_vous_medecin_id_foreign` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`),
  ADD CONSTRAINT `rendez_vous_medecin_remplacant_id_foreign` FOREIGN KEY (`medecin_remplacant_id`) REFERENCES `medecins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rendez_vous_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `visites_medicales`
--
ALTER TABLE `visites_medicales`
  ADD CONSTRAINT `visites_medicales_medecin_id_foreign` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`),
  ADD CONSTRAINT `visites_medicales_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `visites_medicales_rendez_vous_id_foreign` FOREIGN KEY (`rendez_vous_id`) REFERENCES `rendez_vous` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
