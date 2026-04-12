<?php

namespace App\Providers;

use App\Models\Medecin;
use App\Models\Patient;
use App\Models\RendezVous;
use App\Models\VisiteMedicale;
use App\Policies\MedecinPolicy;
use App\Policies\PatientPolicy;
use App\Policies\RendezVousPolicy;
use App\Policies\VisiteMedicalePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Patient::class => PatientPolicy::class,
        Medecin::class => MedecinPolicy::class,
        RendezVous::class => RendezVousPolicy::class,
        VisiteMedicale::class => VisiteMedicalePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
