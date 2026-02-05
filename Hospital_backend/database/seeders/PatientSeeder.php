<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = [
            [
                'numero_unique' => 'PAT-2026-001',
                'nom_patient' => 'Alice Moreau',
                'date_naissance' => '1985-03-15',
                'sexe' => 'Féminin',
                'contact_patient' => '+33687654321',
                'email_patient' => 'alice.moreau@email.com',
                'adresse' => '12 Rue de la Paix, 75001 Paris',
                'antecedents_medicaux' => 'Hypertension artérielle',
                'profession' => 'Enseignante',
            ],
            [
                'numero_unique' => 'PAT-2026-002',
                'nom_patient' => 'Marc Lefevre',
                'date_naissance' => '1972-07-22',
                'sexe' => 'Masculin',
                'contact_patient' => '+33687654322',
                'email_patient' => 'marc.lefevre@email.com',
                'adresse' => '45 Avenue des Champs, 75008 Paris',
                'antecedents_medicaux' => 'Diabète type 2, Asthme',
                'profession' => 'Comptable',
            ],
            [
                'numero_unique' => 'PAT-2026-003',
                'nom_patient' => 'Emma Rousseau',
                'date_naissance' => '1995-11-08',
                'sexe' => 'Féminin',
                'contact_patient' => '+33687654323',
                'email_patient' => 'emma.rousseau@email.com',
                'adresse' => '78 Boulevard Saint-Michel, 75006 Paris',
                'antecedents_medicaux' => null,
                'profession' => 'Graphiste',
            ],
            [
                'numero_unique' => 'PAT-2026-004',
                'nom_patient' => 'Thomas Petit',
                'date_naissance' => '1960-01-30',
                'sexe' => 'Masculin',
                'contact_patient' => '+33687654324',
                'email_patient' => 'thomas.petit@email.com',
                'adresse' => '23 Rue Victor Hugo, 75016 Paris',
                'antecedents_medicaux' => 'Cholestérol élevé, Antécédents cardiaques familiaux',
                'profession' => 'Retraité',
            ],
            [
                'numero_unique' => 'PAT-2026-005',
                'nom_patient' => 'Julie Garnier',
                'date_naissance' => '1988-05-17',
                'sexe' => 'Féminin',
                'contact_patient' => '+33687654325',
                'email_patient' => 'julie.garnier@email.com',
                'adresse' => '56 Rue de Rivoli, 75004 Paris',
                'antecedents_medicaux' => 'Allergies saisonnières',
                'profession' => 'Avocate',
            ],
            [
                'numero_unique' => 'PAT-2026-006',
                'nom_patient' => 'Olivier Simon',
                'date_naissance' => '2010-09-12',
                'sexe' => 'Masculin',
                'contact_patient' => '+33687654326',
                'email_patient' => null,
                'adresse' => '89 Avenue Montaigne, 75008 Paris',
                'antecedents_medicaux' => 'Aucun',
                'profession' => 'Étudiant',
            ],
            [
                'numero_unique' => 'PAT-2026-007',
                'nom_patient' => 'Camille Laurent',
                'date_naissance' => '1978-12-03',
                'sexe' => 'Autre',
                'contact_patient' => '+33687654327',
                'email_patient' => 'camille.laurent@email.com',
                'adresse' => '34 Rue La Fayette, 75009 Paris',
                'antecedents_medicaux' => 'Migraine chronique',
                'profession' => 'Architecte',
            ],
            [
                'numero_unique' => 'PAT-2026-008',
                'nom_patient' => 'Lucas Bonnet',
                'date_naissance' => '1992-04-25',
                'sexe' => 'Masculin',
                'contact_patient' => '+33687654328',
                'email_patient' => 'lucas.bonnet@email.com',
                'adresse' => '67 Rue de la République, 75011 Paris',
                'antecedents_medicaux' => 'Fracture bras gauche (2018)',
                'profession' => 'Développeur',
            ],
        ];

        foreach ($patients as $patientData) {
            Patient::firstOrCreate(
                ['numero_unique' => $patientData['numero_unique']],
                $patientData
            );
        }
    }
}
