<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use App\Http\Resources\PatientResource;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Patient::query();

        // Support de recherche textuelle globale (Nom ou Numéro unique)
        if ($request->has('search')) {
            $query->search($request->search);
        }


        // Gestion du tri (Par défaut : nom_patient en ordre croissant)
        $sortBy = $request->get('sort_by', 'nom_patient');
        $direction = $request->get('direction', 'asc');
        
        // Sécurité pour éviter les colonnes inexistantes ou directions invalides
        $allowedSortColumns = ['nom_patient', 'created_at', 'numero_unique'];
        if (in_array($sortBy, $allowedSortColumns) && in_array($direction, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('nom_patient', 'asc');
        }

        $patients = $query->paginate(20);
        return PatientResource::collection($patients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_unique' => 'required|unique:patients',
            'nom_patient' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string',
            'contact_patient' => 'required|string',
            'email_patient' => 'nullable|email|unique:patients',
            'adresse' => 'required|string',
            'antecedents_medicaux' => 'nullable|string',
            'profession' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        NotificationController::log("New patient registered: {$patient->nom_patient}", 'success');

        return new PatientResource($patient);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $patient = Patient::with(['rendezVous', 'visitesMedicales'])->findOrFail($id);
        return new PatientResource($patient);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'nom_patient' => 'sometimes|string|max:255',
            'contact_patient' => 'sometimes|string',
            'email_patient' => 'nullable|email|unique:patients,email_patient,' . $id,
            'adresse' => 'sometimes|string',
            'antecedents_medicaux' => 'nullable|string',
            'profession' => 'nullable|string',
        ]);

        $patient->update($validated);

        NotificationController::log("Patient information updated: {$patient->nom_patient}", 'info');

        return new PatientResource($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $patient = Patient::findOrFail($id);
        $patientName = $patient->nom_patient;
        $patient->delete();

        NotificationController::log("Patient record deleted: {$patientName}", 'warning');

        return response()->json(['message' => 'Patient supprimé avec succès']);
    }
}
