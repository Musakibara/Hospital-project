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
    public function index()
    {
        $medecins = Medecin::with('user')->get();
        return MedecinResource::collection($medecins);
    }

    /**
     * Store a newly created resource in storage.
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
    public function show(string $id)
    {
        $medecin = Medecin::with(['user', 'rendezVous'])->findOrFail($id);
        return new MedecinResource($medecin);
    }

    /**
     * Update the specified resource in storage.
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
    public function destroy(string $id)
    {
        $medecin = Medecin::findOrFail($id);
        $medecin->delete();

        return response()->json(['message' => 'Médecin supprimé avec succès']);
    }
}
