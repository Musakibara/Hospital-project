<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RendezVousResource extends JsonResource
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
            'date_heure' => $this->date_heure->format('Y-m-d H:i:s'),
            'motif' => $this->motif,
            'statut' => $this->statut,
            'observation' => $this->observation,
            'has_visite' => $this->visiteMedicale ? true : false,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
