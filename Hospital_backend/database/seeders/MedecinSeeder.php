<?php

namespace Database\Seeders;

use App\Models\Medecin;
use App\Models\User;
use Illuminate\Database\Seeder;

class MedecinSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medecins = [
            [
                'email' => 'jean.dupont@hospital.com',
                'nom_medecin' => 'Dr. Jean Dupont',
                'specialite' => 'Cardiologie',
                'contact_medecin' => '+33612345001',
                'email_medecin' => 'jean.dupont@hospital.com',
                'genre_medecin' => 'Masculin',
            ],
            [
                'email' => 'marie.martin@hospital.com',
                'nom_medecin' => 'Dr. Marie Martin',
                'specialite' => 'Pédiatrie',
                'contact_medecin' => '+33612345002',
                'email_medecin' => 'marie.martin@hospital.com',
                'genre_medecin' => 'Féminin',
            ],
            [
                'email' => 'pierre.bernard@hospital.com',
                'nom_medecin' => 'Dr. Pierre Bernard',
                'specialite' => 'Chirurgie',
                'contact_medecin' => '+33612345003',
                'email_medecin' => 'pierre.bernard@hospital.com',
                'genre_medecin' => 'Masculin',
            ],
            [
                'email' => 'sophie.dubois@hospital.com',
                'nom_medecin' => 'Dr. Sophie Dubois',
                'specialite' => 'Dermatologie',
                'contact_medecin' => '+33612345004',
                'email_medecin' => 'sophie.dubois@hospital.com',
                'genre_medecin' => 'Féminin',
            ],
            [
                'email' => 'luc.thomas@hospital.com',
                'nom_medecin' => 'Dr. Luc Thomas',
                'specialite' => 'Neurologie',
                'contact_medecin' => '+33612345005',
                'email_medecin' => 'luc.thomas@hospital.com',
                'genre_medecin' => 'Masculin',
            ],
        ];

        foreach ($medecins as $medecinData) {
            // Find the user by email
            $user = User::where('email', $medecinData['email'])->first();
            
            if ($user) {
                // Create medecin profile linked to user
                Medecin::firstOrCreate(
                    ['email_medecin' => $medecinData['email_medecin']],
                    [
                        'user_id' => $user->id,
                        'nom_medecin' => $medecinData['nom_medecin'],
                        'specialite' => $medecinData['specialite'],
                        'contact_medecin' => $medecinData['contact_medecin'],
                        'genre_medecin' => $medecinData['genre_medecin'],
                        'actif' => true,
                        'can_edit_profile' => true,
                        'disponible' => true,
                    ]
                );
            }
        }
    }
}
