<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\RendezVous;
use App\Models\VisiteMedicale;
use App\Models\Medecin;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics and recent data based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->format('Y-m-d');

        if ($user->role === 'medecin') {
            $medecin = $user->medecin;
            
            if (!$medecin) {
                return response()->json(['message' => 'Profil médecin non trouvé'], 404);
            }

            $medecinId = $medecin->id;

            // Stats pour le médecin
            $stats = [
                'total_patients' => VisiteMedicale::where('medecin_id', $medecinId)->distinct('patient_id')->count('patient_id'),
                'today_appointments' => RendezVous::where('medecin_id', $medecinId)
                    ->whereDate('date_heure', $today)
                    ->whereIn('statut', ['prevu', 'confirme', 'en_cours'])
                    ->count(),
                'total_visites' => VisiteMedicale::where('medecin_id', $medecinId)->count(),
                'pending_appointments' => RendezVous::where('medecin_id', $medecinId)
                    ->whereIn('statut', ['prevu', 'confirme', 'en_cours'])
                    ->count(),
            ];

            // Données récentes pour le médecin
            $recentData = [
                'appointments' => RendezVous::with('patient')
                    ->where('medecin_id', $medecinId)
                    ->whereDate('date_heure', $today)
                    ->orderBy('date_heure', 'asc')
                    ->take(10)
                    ->get(),
                'visites' => VisiteMedicale::with('patient')
                    ->where('medecin_id', $medecinId)
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get(),
            ];

            return response()->json([
                'role' => 'medecin',
                'stats' => $stats,
                'recent_data' => $recentData
            ]);
        }

        // Stats Globales (Admin)
        $stats = [
            'total_patients' => Patient::count(),
            'total_doctors' => Medecin::count(),
            'total_appointments' => RendezVous::count(),
            'total_visites' => VisiteMedicale::count(),
        ];

        $recentData = [
            'appointments' => RendezVous::with(['patient', 'medecin'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
            'visites' => VisiteMedicale::with(['patient', 'medecin'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ];

        return response()->json([
            'role' => 'admin',
            'stats' => $stats,
            'recent_data' => $recentData
        ]);
    }
}
