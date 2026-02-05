<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisiteMedicaleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'medecin' => new MedecinResource($this->whenLoaded('medecin')),
            'rendez_vous' => $this->rendez_vous_id ? [
                'id' => $this->rendez_vous_id,
                'date' => $this->whenLoaded('rendezVous', function () {
                    return $this->rendezVous->date_heure;
                })
            ] : null,
            'date_visite' => $this->date_visite->format('Y-m-d H:i:s'),
            'examen' => $this->examen,
            'symptomes' => $this->symptomes,
            'diagnostic' => $this->diagnostic,
            'maladie' => $this->maladie,
            'traitement' => $this->traitement,
            'allergie' => $this->allergie,
            'maladie_chronique' => $this->maladie_chronique,
            'poids' => $this->poids,
            'taille' => $this->taille,
            'imc' => $this->imc,
            'observations' => $this->observations,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
