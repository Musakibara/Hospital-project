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
        $query = RendezVous::with(['patient', 'medecin', 'visiteMedicale']);

        // Filter by Status (Support string, array or comma-separated)
        if ($request->has('statut')) {
            $statut = $request->statut;
            if (is_array($statut)) {
                $query->whereIn('statut', $statut);
            } elseif (str_contains($statut, ',')) {
                $query->whereIn('statut', explode(',', $statut));
            } else {
                $query->byStatut($statut);
            }
        }

        // Filter by Date Range
        if ($request->has('date')) {
            $query->whereDate('date_heure', $request->date);
        }

        // --- Isolation par Rôle ---
        $user = $request->user();
        if ($user && $user->role === 'medecin' && $user->medecin) {
            // Un médecin ne voit QUE ses propres RDV
            $query->byMedecin($user->medecin->id);
        } elseif ($request->has('medecin_id')) {
            // Pour les admins/autres, on applique le filtre demandé
            $query->byMedecin($request->medecin_id);
        }

        // Filter by Patient
        if ($request->has('patient_id')) {
            $query->byPatient($request->patient_id);
        }

        $order = $request->get('order', 'asc'); // Par défaut asc pour la file d'attente
        $perPage = $request->get('per_page', 20);
        
        $rendezVous = $query->orderBy('date_heure', $order)->paginate($perPage);
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
                function ($attribute, $value, $fail) use ($request) {
                    $start = \Carbon\Carbon::parse($value);
                    $end = $start->copy()->addMinutes(RendezVous::DURATION_MINUTES);
                    
                    $overlap = RendezVous::where('medecin_id', $request->medecin_id)
                        ->where(function ($query) use ($start, $end) {
                            $query->whereBetween('date_heure', [$start, $end->copy()->subSecond()])
                                  ->orWhere(function ($q) use ($start, $end) {
                                      $q->where('date_heure', '<=', $start)
                                        ->whereRaw("DATE_ADD(date_heure, INTERVAL ? MINUTE) > ?", [RendezVous::DURATION_MINUTES, $start]);
                                  });
                        })
                        ->where('statut', '!=', 'annule')
                        ->exists();

                    if ($overlap) {
                        $fail('Ce créneau horaire chevauche un rendez-vous existant pour ce médecin.');
                    }

                    // Check if doctor is available (disponible)
                    $medecin = \App\Models\Medecin::find($request->medecin_id);
                    if ($medecin && !$medecin->disponible) {
                        $fail('Le médecin sélectionné est actuellement indisponible (en congé ou absent).');
                    }
                },
            ],
            'motif' => 'required|string|max:255',
            'statut' => 'required|in:prevu,confirme,en_cours,effectue,annule,reporte',
            'observation' => 'nullable|string',
        ], [
            'medecin_remplacant_id.different' => 'Le médecin remplaçant doit être différent du médecin principal.',
        ]);


        $rendezVous = RendezVous::create($validated);

        NotificationController::log("New appointment scheduled for patient #{$rendezVous->patient_id}", 'info');

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
    public function show(Request $request, string $id)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin', 'visiteMedicale'])->findOrFail($id);
        $user = $request->user();

        // Sécurité : Un médecin ne peut voir que ses propres RDV
        if ($user->role === 'medecin' && $user->medecin && $rendezVous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé à ce rendez-vous'], 403);
        }

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
        $user = $request->user();

        // Sécurité : Un médecin ne peut modifier que ses propres RDV
        if ($user->role === 'medecin' && $user->medecin && $rendezVous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé : Vous ne pouvez pas modifier un rendez-vous d\'un confrère'], 403);
        }

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
                'after:now',
                function ($attribute, $value, $fail) use ($request, $rendezVous) {
                    $medecinId = $request->input('medecin_id', $rendezVous->medecin_id);

                    $start = \Carbon\Carbon::parse($value);
                    $end = $start->copy()->addMinutes(RendezVous::DURATION_MINUTES);
                    
                    $overlap = RendezVous::where('medecin_id', $medecinId)
                        ->where('id', '!=', $rendezVous->id)
                        ->where(function ($query) use ($start, $end) {
                            $query->whereBetween('date_heure', [$start, $end->copy()->subSecond()])
                                  ->orWhere(function ($q) use ($start, $end) {
                                      $q->where('date_heure', '<=', $start)
                                        ->whereRaw("DATE_ADD(date_heure, INTERVAL ? MINUTE) > ?", [RendezVous::DURATION_MINUTES, $start]);
                                  });
                        })
                        ->where('statut', '!=', 'annule')
                        ->exists();

                    if ($overlap) {
                        $fail('Ce nouveau créneau chevauche un rendez-vous existant.');
                    }

                    // Check if doctor is available (disponible)
                    $medecin = \App\Models\Medecin::find($medecinId);
                    if ($medecin && !$medecin->disponible) {
                        $fail('Le médecin sélectionné est actuellement indisponible.');
                    }
                },
            ],
            'motif' => 'sometimes|string|max:255',
            'statut' => [
                'sometimes',
                'in:prevu,confirme,en_cours,effectue,annule,reporte',
                function ($attribute, $value, $fail) use ($rendezVous) {
                    if (in_array($rendezVous->statut, ['annule', 'effectue'])) {
                        $fail("Impossible de modifier un rendez-vous qui est déjà '{$rendezVous->statut}'.");
                    }
                }
            ],
            'observation' => 'nullable|string',
        ]);


        $rendezVous->update($validated);

        NotificationController::log("Appointment #{$rendezVous->id} updated to status: {$rendezVous->statut}", 'info');

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
    public function destroy(Request $request, string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $user = $request->user();

        // Sécurité : Un médecin ne peut supprimer que ses propres RDV
        if ($user->role === 'medecin' && $user->medecin && $rendezVous->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Accès non autorisé : Vous ne pouvez pas supprimer un rendez-vous d\'un confrère'], 403);
        }

        $rendezId = $rendezVous->id;
        $rendezVous->delete();

        NotificationController::log("Appointment #{$rendezId} cancelled", 'warning');

        return response()->json(['message' => 'Rendez-vous annulé avec succès']);
    }
}
