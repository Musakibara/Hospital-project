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
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     path="/api/rendez-vous",
     *     tags={"Appointments"},
     *     summary="List all appointments",
     *     description="Retrieve a list of appointments with optional filtering",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="statut", in="query", required=false, @OA\Schema(type="string", enum={"prevu","confirme","en_cours","effectue","annule","reporte"})),
     *     @OA\Parameter(name="date", in="query", required=false, description="Filter by date (YYYY-MM-DD)", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="medecin_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="patient_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="List of appointments"
     *     )
     * )
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
    /**
     * Store a newly created resource in storage.
     *
     * @OA\Post(
     *     path="/api/rendez-vous",
     *     tags={"Appointments"},
     *     summary="Book a new appointment",
     *     description="Create a new appointment. **Note:** A confirmation email is automatically sent to the patient upon success.",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"patient_id","medecin_id","date_heure","motif","statut"},
     *             @OA\Property(property="patient_id", type="integer", example=1),
     *             @OA\Property(property="medecin_id", type="integer", example=2),
     *             @OA\Property(property="medecin_remplacant_id", type="integer", nullable=true, example=3, description="Optional substitute doctor ID"),
     *             @OA\Property(property="date_heure", type="string", format="date-time", example="2026-12-25 10:00:00"),
     *             @OA\Property(property="motif", type="string", example="Routine Checkup"),
     *             @OA\Property(property="statut", type="string", enum={"prevu","confirme"}, example="prevu"),
     *             @OA\Property(property="observation", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Appointment created and email sent"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation Error (e.g. duplicate slot)"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'medecin_remplacant_id' => [
                'nullable',
                'exists:medecins,id',
                'different:medecin_id', // Prevent assigning same doctor as replacement
            ],
            'date_heure' => [
                'required', 
                'date', 
                'after:now',
                Rule::unique('rendez_vous')->where(function ($query) use ($request) {
                    return $query->where('medecin_id', $request->medecin_id)
                                 ->where('date_heure', $request->date_heure);
                }),
                // Check if replacement doctor is also free at that time (optional but good)
                Rule::unique('rendez_vous', 'date_heure')->where(function ($query) use ($request) {
                    if ($request->medecin_remplacant_id) {
                        return $query->where('medecin_id', $request->medecin_remplacant_id);
                    }
                    return $query->whereRaw('1=0'); // Skip if no replacement
                }),
            ],
            'motif' => 'required|string|max:255',
            'statut' => 'required|in:prevu,confirme,en_cours,effectue,annule,reporte',
            'observation' => 'nullable|string',
        ], [
            'date_heure.unique' => 'Ce créneau horaire est déjà réservé pour ce médecin (ou son remplaçant).',
            'medecin_remplacant_id.different' => 'Le médecin remplaçant doit être différent du médecin principal.',
        ]);

        $rendezVous = RendezVous::create($validated);

        // Load relationships for the email
        $rendezVous->load(['patient', 'medecin', 'medecinRemplacant']);

        // Send confirmation email if patient has an email address
        if ($rendezVous->patient && $rendezVous->patient->email_patient) {
            try {
                \Illuminate\Support\Facades\Mail::to($rendezVous->patient->email_patient)
                    ->send(new \App\Mail\AppointmentConfirmation($rendezVous));
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Illuminate\Support\Facades\Log::error('Erreur envoi email confirmation: ' . $e->getMessage());
            }
        }

        return new RendezVousResource($rendezVous);
    }

    /**
     * Display the specified resource.
     */
    /**
     * Display the specified resource.
     *
     * @OA\Get(
     *     path="/api/rendez-vous/{id}",
     *     tags={"Appointments"},
     *     summary="Get appointment details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Appointment details"
     *     )
     * )
     */
    public function show(string $id)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin', 'visiteMedicale'])->findOrFail($id);
        return new RendezVousResource($rendezVous);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified resource in storage.
     *
     * @OA\Put(
     *     path="/api/rendez-vous/{id}",
     *     tags={"Appointments"},
     *     summary="Update appointment details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Appointment updated successfully"
     *     )
     * )
     */
    public function update(Request $request, string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'medecin_id' => 'sometimes|exists:medecins,id',
            'medecin_remplacant_id' => [
                'nullable',
                'exists:medecins,id',
                'different:medecin_id',
            ],
            'date_heure' => [
                'sometimes', 
                'date',
                Rule::unique('rendez_vous')->where(function ($query) use ($request, $rendezVous) {
                    $medecinId = $request->input('medecin_id', $rendezVous->medecin_id);
                    return $query->where('medecin_id', $medecinId)
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
    /**
     * Remove the specified resource from storage.
     *
     * @OA\Delete(
     *     path="/api/rendez-vous/{id}",
     *     tags={"Appointments"},
     *     summary="Cancel/Delete an appointment",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Appointment cancelled successfully"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->delete();

        return response()->json(['message' => 'Rendez-vous annulé avec succès']);
    }
}
