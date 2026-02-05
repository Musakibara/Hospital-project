<?php

namespace Database\Seeders;

use App\Models\RendezVous;
use App\Models\VisiteMedicale;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VisiteMedicaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get only completed appointments (statut 'effectue')
        $completedRendezVous = RendezVous::where('statut', 'effectue')->get();

        foreach ($completedRendezVous as $rdv) {
            // Check if a visit already exists for this RDV
            if (VisiteMedicale::where('rendez_vous_id', $rdv->id)->exists()) {
                continue;
            }

            VisiteMedicale::create([
                'patient_id' => $rdv->patient_id,
                'medecin_id' => $rdv->medecin_id,
                'rendez_vous_id' => $rdv->id,
                'date_visite' => $rdv->date_heure,
                'examen' => 'Examen clinique complet',
                'symptomes' => 'Douleurs abdominales, fièvre légère',
                'diagnostic' => 'Gastro-entérite virale',
                'maladie' => 'Gastro-entérite',
                'traitement' => 'Repos, hydratation, Paratécétamol 1g si fièvre',
                'allergie' => 'Aucune connue', // Could be fetched from patient
                'maladie_chronique' => $rdv->patient->antecedents_medicaux,
                'poids' => rand(60, 90),
                'taille' => rand(160, 190),
                'imc' => 24.5, // Calculated ideally
                'observations' => $rdv->observation ?? 'Patient coopératif',
            ]);
        }
        
        // Also create some visits WITHOUT appointments (Urgences, walk-ins)
        $patients = \App\Models\Patient::all();
        $medecins = \App\Models\Medecin::all();
        
        if ($patients->isNotEmpty() && $medecins->isNotEmpty()) {
            VisiteMedicale::create([
                'patient_id' => $patients->first()->id,
                'medecin_id' => $medecins->first()->id,
                'rendez_vous_id' => null, // Walk-in
                'date_visite' => Carbon::now()->subDays(2),
                'examen' => 'Prise de tension, auscultation cardiaque',
                'symptomes' => 'Palpitations',
                'diagnostic' => 'Tachycardie sinusale liée au stress',
                'maladie' => 'Stress / Anxiété',
                'traitement' => 'Repos, exercices de respiration',
                'allergie' => null,
                'maladie_chronique' => null,
                'poids' => 75.5,
                'taille' => 175,
                'imc' => 24.6,
                'observations' => 'Patient venu sans RDV suite à palpitations',
            ]);
        }
    }
}
