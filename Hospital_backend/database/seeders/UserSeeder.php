<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@hospital.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create doctor users (will be linked to medecins later)
        $doctors = [
            ['name' => 'Dr. Jean Dupont', 'email' => 'jean.dupont@hospital.com'],
            ['name' => 'Dr. Marie Martin', 'email' => 'marie.martin@hospital.com'],
            ['name' => 'Dr. Pierre Bernard', 'email' => 'pierre.bernard@hospital.com'],
            ['name' => 'Dr. Sophie Dubois', 'email' => 'sophie.dubois@hospital.com'],
            ['name' => 'Dr. Luc Thomas', 'email' => 'luc.thomas@hospital.com'],
        ];

        foreach ($doctors as $doctor) {
            User::firstOrCreate(
                ['email' => $doctor['email']],
                [
                    'name' => $doctor['name'],
                    'password' => Hash::make('password'),
                    'role' => 'medecin',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
