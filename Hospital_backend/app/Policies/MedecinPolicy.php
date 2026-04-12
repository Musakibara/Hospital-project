<?php

namespace App\Policies;

use App\Models\Medecin;
use App\Models\User;

class MedecinPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function view(User $user, Medecin $medecin): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Medecin $medecin): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            return $user->medecin->id === $medecin->id && $user->medecin->can_edit_profile;
        }

        return false;
    }

    public function delete(User $user, Medecin $medecin): bool
    {
        return $user->role === 'admin';
    }
}
