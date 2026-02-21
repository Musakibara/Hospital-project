# 🩺 Roadmap de Transformation Opérationnelle

Ce document sert de guide stratégique pour transformer ce prototype en un **Système de Gestion Hospitalière (SGH)** complet et prêt pour la production. Utilisez ce fichier pour orienter les futures phases de développement.

---

## 🏗️ 1. Fondations Techniques (Assainissement)
*Indispensable pour la robustesse et l'évolutivité.*

- [ ] **Internationalisation (i18n)** : Implémenter `react-i18next`. Remplacer tous les textes "en" par des clés de traduction pour unifier l'interface en français.
- [ ] **Sécurité des Sessions** : Migrer du `sessionStorage` vers des **cookies HttpOnly** pour stocker les JWT (protection contre XSS).
- [ ] **Validation stricte (Zod)** : Ajouter des schémas de validation pour chaque formulaire (`Appointments`, `Consultations`, `Patients`) afin d'éviter les données corrompues.
- [ ] **Error Boundaries** : Créer des composants de secours pour capturer les erreurs de rendu et éviter que l'application entière ne crash.
- [ ] **Tests de Non-Régression** : Mettre en place `Vitest` pour les services et `Cypress` pour les flux critiques (Login -> Création Patient -> Consultation).

---

## 🩺 2. Module de Consultation Avancé
*Pour passer d'une simple note à un dossier médical réel.*

- [ ] **Générateur d'Ordonnances (PDF)** : Ajouter un bouton en fin de consultation pour générer une ordonnance PDF téléchargeable/imprimable.
- [ ] **Suivi des Constantes (Graphiques)** : Intégrer `Recharts` pour afficher l'évolution du poids, de la tension et de la température sur le dossier patient.
- [ ] **Triage des Urgences** : Ajouter un code couleur (Rouge, Orange, Vert) sur le dashboard pour prioriser les rendez-vous selon l'état du patient.
- [ ] **Historique de Médication** : Un onglet dédié listant tous les médicaments prescrits au patient au fil du temps.

---

## 💰 3. Module Administratif & Facturation
*Rendre le système capable de gérer l'aspect business de l'hôpital.*

- [ ] **Facturation Automatique** : Générer une facture basée sur le type de consultation et les actes réalisés.
- [ ] **Gestion des Assurances** : Ajouter des champs dans le dossier patient pour les numéros de mutuelle et le taux de prise en charge.
- [ ] **Inventaire Pharmacie** : Système de stock minimal pour les médicaments courants, avec alertes de péremption.

---

## 🛡️ 4. Sécurité, Conformité & Audit
*Essentiel pour la protection des données de santé.*

- [ ] **Journal d'Audit (Audit Trail)** : Enregistrer en base de données chaque consultation de dossier patient (Qui ? Quand ? Quoi ?).
- [ ] **Gestion Fine des Rôles (RBAC)** : Distinguer précisément les droits des infirmiers (lecture/constantes), des médecins (diagnostic/prescription) et des administrateurs.
- [ ] **Chiffrement au Repos** : Chiffrer les champs sensibles (antécédents, diagnostics) dans la base de données.

---

## 📱 5. Expérience Utilisateur (UX) & Mobilité
- [ ] **Mode Hors-Ligne (PWA)** : Permettre la saisie des constantes même sans connexion internet (synchronisation automatique au retour réseau).
- [ ] **Notifications Push** : Alerter les médecins sur leur bureau/mobile lors de l'arrivée d'un patient urgent.
- [ ] **Dashboard Personnalisé** : Widgets configurables pour chaque type de personnel (médecin vs secrétaire).

---

> **Note aux Futurs Développeurs :** Priorisez la **Phase 1** avant d'ajouter des fonctionnalités métier lourdes. Un système instable sur des données de santé est dangereux.
