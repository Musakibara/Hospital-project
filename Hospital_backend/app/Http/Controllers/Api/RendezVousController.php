<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use App\Http\Resources\RendezVousResource;
use Illuminate\Validation\Rule;

class RendezVousController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RendezVous::with(['patient', 'medecin']);

        // Filter by Status
        if ($request->has('statut')) {
            $query->byStatut($request->statut);
        }

        // Filter by Date Range
        if ($request->has('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        // Filter by Medecin (for calendar view)
        if ($request->has('medecin_id')) {
            $query->byMedecin($request->medecin_id);
        }

        // Filter by Patient
        if ($request->has('patient_id')) {
            $query->byPatient($request->patient_id);
        }

        $rendezVous = $query->orderBy('date_heure', 'desc')->paginate(20);
        return RendezVousResource::collection($rendezVous);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'date_heure' => [
                'required', 
                'date', 
                'after:now',
                Rule::unique('rendez_vous')->where(function ($query) use ($request) {
                    return $query->where('medecin_id', $request->medecin_id)
                                 ->where('date_heure', $request->date_heure);
                }),
            ],
            'motif' => 'required|string|max:255',
            'statut' => 'required|in:prevu,confirme,en_cours,effectue,annule,reporte',
            'observation' => 'nullable|string',
        ], [
            'date_heure.unique' => 'Ce créneau horaire est déjà réservé pour ce médecin.'
        ]);

        $rendezVous = RendezVous::create($validated);

        return new RendezVousResource($rendezVous);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin', 'visiteMedicale'])->findOrFail($id);
        return new RendezVousResource($rendezVous);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'medecin_id' => 'sometimes|exists:medecins,id',
            'date_heure' => [
                'sometimes', 
                'date',
                Rule::unique('rendez_vous')->where(function ($query) use ($request, $rendezVous) {
                    return $query->where('medecin_id', $request->input('medecin_id', $rendezVous->medecin_id))
                                 ->where('date_heure', $request->input('date_heure', $rendezVous->date_heure));
                })->ignore($rendezVous->id),
            ],
            'motif' => 'sometimes|string|max:255',
            'statut' => 'sometimes|in:prevu,confirme,en_cours,effectue,annule,reporte',
            'observation' => 'nullable|string',
        ]);

        $rendezVous->update($validated);

        return new RendezVousResource($rendezVous);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->delete();

        return response()->json(['message' => 'Rendez-vous annulé avec succès']);
    }
}
