<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisiteMedicale extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'visites_medicales';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'rendez_vous_id',
        'date_visite',
        'examen',
        'symptomes',
        'diagnostic',
        'maladie',
        'traitement',
        'allergie',
        'maladie_chronique',
        'poids',
        'taille',
        'imc',
        'observations',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'date_visite' => 'datetime',
        'poids' => 'decimal:2',
        'taille' => 'decimal:2',
        'imc' => 'decimal:2',
    ];

    /**
     * Get the patient for this visite.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the medecin who performed this visite.
     */
    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    /**
     * Get the rendez-vous associated with this visite.
     */
    public function rendezVous()
    {
        return $this->belongsTo(RendezVous::class, 'rendez_vous_id');
    }

    /**
     * Scope a query to filter by patient.
     */
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Scope a query to filter by medecin.
     */
    public function scopeByMedecin($query, $medecinId)
    {
        return $query->where('medecin_id', $medecinId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_visite', [$startDate, $endDate]);
    }

    /**
     * Get the patient's medical history.
     */
    public function scopePatientHistory($query, $patientId)
    {
        return $query->where('patient_id', $patientId)
                    ->orderBy('date_visite', 'desc');
    }
}
