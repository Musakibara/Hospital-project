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
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        // Vérification du rôle
        if (!in_array($user->role, ['admin', 'medecin'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        // Si médecin, vérifier s'il est actif
        if ($user->role === 'medecin') {
            $medecin = $user->medecin;
            if (!$medecin || !$medecin->actif) {
                return response()->json(['message' => 'Votre compte médecin est inactif'], 403);
            }
        }

        // Isolation du dossier patient pour les médecins : on ne montre que ses propres RDV et visites
        if ($user->role === 'medecin' && $user->medecin) {
            $medecinId = $user->medecin->id;
            $patient = Patient::with([
                'rendezVous' => function($q) use ($medecinId) {
                    $q->where('medecin_id', $medecinId)->with('medecin');
                },
                'visitesMedicales' => function($q) use ($medecinId) {
                    $q->where('medecin_id', $medecinId)->with('medecin');
                }
            ])->findOrFail($id);
        } else {
            $patient = Patient::with(['rendezVous.medecin', 'visitesMedicales.medecin'])->findOrFail($id);
        }

        // Logging de l'accès (Tracé de consultation)
        $roleLabel = $user->role === 'admin' ? 'Administrateur' : 'Dr. ' . ($user->medecin->nom_medecin ?? $user->name);
        NotificationController::log("Consultation dossier patient ID:{$id} ({$patient->nom_patient}) par {$roleLabel}", 'info');

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
