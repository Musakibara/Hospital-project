<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function view(User $user, Patient $patient): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            if (!$user->medecin->actif) {
                return false;
            }
            return $patient->rendezVous()->where('medecin_id', $user->medecin->id)->exists()
                || $patient->visitesMedicales()->where('medecin_id', $user->medecin->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function update(User $user, Patient $patient): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }
}
