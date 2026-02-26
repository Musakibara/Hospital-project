<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    /**
     * Handle an incoming authentication request.
     *
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Authentication"},
     *     summary="Login user",
     *     description="Authenticate user and return a token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@hospital.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="access_token", type="string"),
     *             @OA\Property(property="token_type", type="string", example="Bearer"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Invalid credentials"
     *     )
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Check if medecin is active
        if ($user->role === 'medecin') {
            $medecin = $user->medecin;
            if ($medecin && !$medecin->actif) {
                throw ValidationException::withMessages([
                    'email' => ['Votre compte est inactif. Veuillez contacter l\'administrateur.'],
                ]);
            }
        }


        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load medecin profile if applicable (eager load)
        if ($user->role === 'medecin') {
            $user->load('medecin');
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Handle logout request.
     */
    /**
     * Handle logout request.
     *
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Revoke the authentication token",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully"
     *     )
     * )
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Get the authenticated user.
     */
    /**
     * Get the authenticated user.
     *
     * @OA\Get(
     *     path="/api/user",
     *     tags={"Authentication"},
     *     summary="Get authenticated user",
     *     description="Return user profile",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User profile retrieved"
     *     )
     * )
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'medecin') {
            $user->load('medecin');
        }

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($user, $validated, $request) {
            $user->update($validated);

            // If user is a medecin, sync the medecin profile as well
            if ($user->role === 'medecin' && $user->medecin) {
                $medecinData = $request->validate([
                    'nom_medecin' => 'sometimes|string|max:255',
                    'specialite' => 'sometimes|string|max:255',
                    'contact_medecin' => 'sometimes|string|max:255',
                    'email_medecin' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
                    'genre_medecin' => 'sometimes|in:Masculin,Féminin,Autre',
                ]);

                // Sync name and email to medecin table if they were updated in user table
                if (isset($validated['name'])) $medecinData['nom_medecin'] = $validated['name'];
                if (isset($validated['email'])) $medecinData['email_medecin'] = $validated['email'];

                $user->medecin->update($medecinData);
            }

            if ($user->role === 'medecin') {
                $user->load('medecin');
            }

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $user
            ]);
        });
    }

    /**
     * Change the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.'
            ], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.'
        ]);
    }
}
