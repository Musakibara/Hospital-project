<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;
use App\Http\Resources\MedecinResource;
use Illuminate\Support\Facades\Gate;

use App\Models\User;
use App\Mail\DoctorWelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class MedecinController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     path="/api/medecins",
     *     tags={"Doctors"},
     *     summary="List all doctors",
     *     description="Retrieve a list of all doctors",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of doctors"
     *     )
     * )
     */
    public function index(Request $request)
    {
        if (Gate::denies('viewAny', Medecin::class)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $query = Medecin::with('user');

        if ($request->has('disponible')) {
            $query->where('disponible', $request->boolean('disponible'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom_medecin', 'like', "%{$search}%")
                  ->orWhere('specialite', 'like', "%{$search}%")
                  ->orWhere('email_medecin', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $medecins = $query->paginate($perPage);
        return MedecinResource::collection($medecins);
    }


    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     *
     * @OA\Post(
     *     path="/api/medecins",
     *     tags={"Doctors"},
     *     summary="Create a new doctor",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=201,
     *         description="Doctor created successfully"
     *     )
     * )
     */
    public function store(Request $request)
    {
        if (Gate::denies('create', Medecin::class)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom_medecin' => 'required|string|max:255',
            'specialite' => 'required|string|max:255',
            'contact_medecin' => 'required|string|max:255',
            'email_medecin' => 'required|email|max:255|unique:users,email',
            'genre_medecin' => 'required|in:Masculin,Féminin,Autre',
            'actif' => 'boolean',
            'can_edit_profile' => 'boolean',
            'disponible' => 'boolean',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Generate a secure random password
            $plainPassword = Str::random(10);

            // 2. Create the User account
            $user = User::create([
                'name' => $validated['nom_medecin'],
                'email' => $validated['email_medecin'],
                'password' => Hash::make($plainPassword),
                'role' => 'medecin',
            ]);

            // 3. Create the Medecin profile linked to the user
            $medecinData = array_merge($validated, ['user_id' => $user->id]);
            $medecin = Medecin::create($medecinData);

            // 4. Send Welcome Email
            Mail::to($validated['email_medecin'])->send(new DoctorWelcomeMail(
                $validated['nom_medecin'],
                $validated['email_medecin'],
                $plainPassword
            ));

            return new MedecinResource($medecin);
        });
    }



    /**
     * Display the specified resource.
     */
    /**
     * Display the specified resource.
     *
     * @OA\Get(
     *     path="/api/medecins/{id}",
     *     tags={"Doctors"},
     *     summary="Get doctor details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Doctor details"
     *     )
     * )
     */
    public function show(Request $request, string $id)
    {
        $medecin = Medecin::findOrFail($id);

        if (Gate::denies('view', $medecin)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $medecin = Medecin::with([
            'user', 
            'rendezVous.patient', 
            'visitesMedicales.patient'
        ])->findOrFail($id);
        
        return new MedecinResource($medecin);
    }


    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified resource in storage.
     *
     * @OA\Put(
     *     path="/api/medecins/{id}",
     *     tags={"Doctors"},
     *     summary="Update doctor details",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Doctor updated successfully"
     *     )
     * )
     */
    public function update(Request $request, string $id)
    {
        $medecin = Medecin::with('user')->findOrFail($id);

        if (Gate::denies('update', $medecin)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom_medecin' => 'sometimes|required|string|max:255',
            'specialite' => 'sometimes|required|string|max:255',
            'contact_medecin' => 'sometimes|required|string|max:255',
            'email_medecin' => 'sometimes|required|email|max:255|unique:users,email,' . ($medecin->user_id ?? 0),
            'genre_medecin' => 'sometimes|required|in:Masculin,Féminin,Autre',
            'actif' => 'sometimes|boolean',
            'can_edit_profile' => 'boolean',
            'disponible' => 'sometimes|boolean',
        ]);

        return DB::transaction(function () use ($medecin, $validated) {
            // Logic: if account is deactivated, it must be unavailable
            if (isset($validated['actif']) && $validated['actif'] == false) {
                $validated['disponible'] = false;
            }

            // Sync User data if provided
            if ($medecin->user) {
                $userData = [];
                if (isset($validated['nom_medecin'])) $userData['name'] = $validated['nom_medecin'];
                if (isset($validated['email_medecin'])) $userData['email'] = $validated['email_medecin'];
                
                if (!empty($userData)) {
                    $medecin->user->update($userData);
                }
            }

            $medecin->update($validated);

            return new MedecinResource($medecin);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Remove the specified resource from storage.
     *
     * @OA\Delete(
     *     path="/api/medecins/{id}",
     *     tags={"Doctors"},
     *     summary="Delete a doctor",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Doctor deleted successfully"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $medecin = Medecin::findOrFail($id);

        if (Gate::denies('delete', $medecin)) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            return DB::transaction(function () use ($medecin) {
                $user = $medecin->user;
                
                // Delete the medecin profile
                $medecin->delete();

                // Delete the associated user account if it exists
                if ($user) {
                    $user->delete();
                }

                return response()->json(['message' => 'Médecin et compte utilisateur supprimés avec succès']);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Check if it's a constraint violation error (SQLSTATE 23000)
            if ($e->getCode() == 23000) {
                return response()->json([
                    'message' => 'Impossible de supprimer ce médecin car il possède un historique de rendez-vous ou de visites. Veuillez plutôt le désactiver pour conserver les données.'
                ], 422);
            }
            throw $e;
        }
    }

}
