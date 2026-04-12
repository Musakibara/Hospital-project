<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisiteMedicale;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use App\Http\Resources\VisiteMedicaleResource;
use Illuminate\Support\Facades\Gate;

class VisiteMedicaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (Gate::denies('viewAny', VisiteMedicale::class)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $query = VisiteMedicale::with(['patient', 'medecin']);

        // Filter by Patient
        if ($request->has('patient_id')) {
            $query->byPatient($request->patient_id);
        }

        // --- Isolation par Rôle ---
        $user = $request->user();
        if ($user && $user->role === 'medecin' && $user->medecin) {
            // Un médecin ne voit QUE ses propres visites
            $query->byMedecin($user->medecin->id);
        } elseif ($request->has('medecin_id')) {
            // Pour les admins, on applique le filtre demandé
            $query->byMedecin($request->medecin_id);
        }

        $visites = $query->orderBy('date_visite', 'desc')->paginate(20);
        return VisiteMedicaleResource::collection($visites);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (Gate::denies('create', VisiteMedicale::class)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'rendez_vous_id' => 'nullable|exists:rendez_vous,id|unique:visites_medicales,rendez_vous_id',
            'date_visite' => 'required|date',
            'examen' => 'required|string',
            'symptomes' => 'required|string',
            'diagnostic' => 'required|string',
            'maladie' => 'nullable|string',
            'traitement' => 'required|string',
            'allergie' => 'nullable|string',
            'maladie_chronique' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'observations' => 'nullable|string',
        ]);

        $visite = VisiteMedicale::create($validated);

        NotificationController::log("New medical consultation recorded for patient #{$visite->patient_id}", 'success');

        // Update rendez-vous status to 'effectue' automatically if linked
        if ($visite->rendez_vous_id) {
            $rdv = RendezVous::find($visite->rendez_vous_id);
            if ($rdv && $rdv->statut !== 'effectue') {
                $rdv->update(['statut' => 'effectue']);
            }
        }

        return new VisiteMedicaleResource($visite);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $visite = VisiteMedicale::findOrFail($id);

        if (Gate::denies('view', $visite)) {
            return response()->json(['message' => 'Accès non autorisé à cette visite'], 403);
        }

        $visite->load(['patient', 'medecin', 'rendezVous']);
        return new VisiteMedicaleResource($visite);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visite = VisiteMedicale::findOrFail($id);

        if (Gate::denies('update', $visite)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'examen' => 'sometimes|string',
            'symptomes' => 'sometimes|string',
            'diagnostic' => 'sometimes|string',
            'maladie' => 'nullable|string',
            'traitement' => 'sometimes|string',
            'allergie' => 'nullable|string',
            'maladie_chronique' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'observations' => 'nullable|string',
        ]);

        // Note: We don't allow updating patient_id, medecin_id, or rendez_vous_id typically for medical integrity
        $visite->update($validated);

        return new VisiteMedicaleResource($visite);
    }
}
