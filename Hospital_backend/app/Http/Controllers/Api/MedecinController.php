<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;
use App\Http\Resources\MedecinResource;

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
    public function index()
    {
        $medecins = Medecin::with('user')->get();
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
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:medecins,user_id',
            'nom_medecin' => 'required|string|max:255',
            'specialite' => 'required|string|max:255',
            'contact_medecin' => 'required|string|max:20',
            'email_medecin' => 'required|email|max:255',
            'genre_medecin' => 'required|in:Masculin,Féminin,Autre',
            'actif' => 'boolean',
            'can_edit_profile' => 'boolean',
            'disponible' => 'boolean',
        ]);

        $medecin = Medecin::create($validated);

        return new MedecinResource($medecin);
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
    public function show(string $id)
    {
        $medecin = Medecin::with(['user', 'rendezVous'])->findOrFail($id);
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
        $medecin = Medecin::findOrFail($id);

        $validated = $request->validate([
            'nom_medecin' => 'sometimes|string|max:255',
            'specialite' => 'sometimes|string|max:255',
            'contact_medecin' => 'sometimes|string|max:20',
            'email_medecin' => 'sometimes|email|max:255',
            'genre_medecin' => 'sometimes|in:Masculin,Féminin,Autre',
            'actif' => 'boolean',
            'can_edit_profile' => 'boolean',
            'disponible' => 'boolean',
        ]);

        $medecin->update($validated);

        return new MedecinResource($medecin);
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
        $medecin->delete();

        return response()->json(['message' => 'Médecin supprimé avec succès']);
    }
}
