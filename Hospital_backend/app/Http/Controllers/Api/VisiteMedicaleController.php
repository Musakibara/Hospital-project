<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisiteMedicale;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use App\Http\Resources\VisiteMedicaleResource;

class VisiteMedicaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
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
        $visite = VisiteMedicale::with(['patient', 'medecin', 'rendezVous'])->findOrFail($id);
        $user = $request->user();

        // Sécurité : Un médecin ne peut voir que ses propres visites
        if ($user->role === 'medecin' && $user->medecin && $visite->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé à cette visite'], 403);
        }

        return new VisiteMedicaleResource($visite);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visite = VisiteMedicale::findOrFail($id);
        $user = $request->user();

        // Sécurité : Un médecin ne peut modifier que ses propres visites
        if ($user->role === 'medecin' && $user->medecin && $visite->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé : Vous ne pouvez pas modifier une visite d\'un confrère'], 403);
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
