<?php

namespace App\Policies;

use App\Models\RendezVous;
use App\Models\User;

class RendezVousPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function view(User $user, RendezVous $rendezVous): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            return $rendezVous->medecin_id === $user->medecin->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function update(User $user, RendezVous $rendezVous): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            return $rendezVous->medecin_id === $user->medecin->id;
        }

        return false;
    }

    public function delete(User $user, RendezVous $rendezVous): bool
    {
        return $user->role === 'admin';
    }
}
