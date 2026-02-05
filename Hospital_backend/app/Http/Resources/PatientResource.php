<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
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
            'numero_unique' => $this->numero_unique,
            'nom_patient' => $this->nom_patient,
            'date_naissance' => $this->date_naissance->format('Y-m-d'),
            'age' => $this->age,
            'sexe' => $this->sexe,
            'contact_patient' => $this->contact_patient,
            'email_patient' => $this->email_patient,
            'adresse' => $this->adresse,
            'antecedents_medicaux' => $this->antecedents_medicaux,
            'profession' => $this->profession,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
