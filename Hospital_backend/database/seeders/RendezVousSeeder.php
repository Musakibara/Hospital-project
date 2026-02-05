<?php

namespace Database\Seeders;

use App\Models\RendezVous;
use App\Models\Patient;
use App\Models\Medecin;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RendezVousSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = Patient::all();
        $medecins = Medecin::all();

        if ($patients->isEmpty() || $medecins->isEmpty()) {
            $this->command->warn('Patients or Medecins not found. Please run PatientSeeder and MedecinSeeder first.');
            return;
        }

        $rendezVous = [
            // Past appointments (effectue)
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->subDays(10)->setTime(9, 0),
                'motif' => 'Consultation générale',
                'statut' => 'effectue',
                'observation' => 'Consultation réalisée sans problème',
            ],
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->subDays(5)->setTime(14, 30),
                'motif' => 'Contrôle post-opératoire',
                'statut' => 'effectue',
                'observation' => 'Guérison normale',
            ],
            
            // Upcoming appointments (prevu)
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addDays(2)->setTime(10, 0),
                'motif' => 'Consultation de routine',
                'statut' => 'prevu',
                'observation' => null,
            ],
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addDays(3)->setTime(15, 30),
                'motif' => 'Suivi diabète',
                'statut' => 'confirme',
                'observation' => 'Patient a confirmé sa présence',
            ],
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addDays(5)->setTime(9, 30),
                'motif' => 'Examen dermatologique',
                'statut' => 'prevu',
                'observation' => null,
            ],
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addWeeks(1)->setTime(11, 0),
                'motif' => 'Consultation cardiologie',
                'statut' => 'prevu',
                'observation' => null,
            ],
            
            // Cancelled appointment
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addDays(4)->setTime(16, 0),
                'motif' => 'Consultation annulée',
                'statut' => 'annule',
                'observation' => 'Patient ne peut pas se présenter',
            ],
            
            // Postponed appointment
            [
                'patient_id' => $patients->random()->id,
                'medecin_id' => $medecins->random()->id,
                'date_heure' => Carbon::now()->addDays(7)->setTime(14, 0),
                'motif' => 'Suivi neurologique',
                'statut' => 'reporte',
                'observation' => 'Reporté à une date ultérieure',
            ],
        ];

        foreach ($rendezVous as $rdvData) {
            RendezVous::firstOrCreate(
                [
                    'medecin_id' => $rdvData['medecin_id'],
                    'date_heure' => $rdvData['date_heure']
                ],
                $rdvData
            );
        }
    }
}
