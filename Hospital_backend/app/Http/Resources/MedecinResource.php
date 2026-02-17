<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedecinResource extends JsonResource
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
            'user' => $this->whenLoaded('user'),
            'nom_medecin' => $this->nom_medecin,
            'specialite' => $this->specialite,
            'contact_medecin' => $this->contact_medecin,
            'email_medecin' => $this->email_medecin,
            'genre_medecin' => $this->genre_medecin,
            'actif' => $this->actif,
            'disponible' => $this->disponible,
            'rendezVous' => RendezVousResource::collection($this->whenLoaded('rendezVous')),
            'visitesMedicales' => VisiteMedicaleResource::collection($this->whenLoaded('visitesMedicales')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];
    }
}
