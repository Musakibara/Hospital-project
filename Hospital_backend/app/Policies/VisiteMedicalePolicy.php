<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VisiteMedicale;

class VisiteMedicalePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function view(User $user, VisiteMedicale $visiteMedicale): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            return $visiteMedicale->medecin_id === $user->medecin->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin']);
    }

    public function update(User $user, VisiteMedicale $visiteMedicale): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'medecin' && $user->medecin) {
            return $visiteMedicale->medecin_id === $user->medecin->id;
        }

        return false;
    }

    public function delete(User $user, VisiteMedicale $visiteMedicale): bool
    {
        return $user->role === 'admin';
    }
}
