<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RendezVous extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rendez_vous';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'medecin_id',
        'medecin_remplacant_id',
        'date_heure',
        'motif',
        'statut',
        'observation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'date_heure' => 'datetime',
    ];

    /**
     * Get the patient for this rendez-vous.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the medecin for this rendez-vous.
     */
    public function medecin()
    {
        return $this->belongsTo(Medecin::class, 'medecin_id');
    }

    /**
     * Get the substitute medecin for this rendez-vous.
     */
    public function medecinRemplacant()
    {
        return $this->belongsTo(Medecin::class, 'medecin_remplacant_id');
    }

    /**
     * Get the medical visit associated with this rendez-vous.
     */
    public function visiteMedicale()
    {
        return $this->hasOne(VisiteMedicale::class, 'rendez_vous_id');
    }

    /**
     * Scope a query to only include upcoming appointments.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('date_heure', '>', now())
                    ->whereIn('statut', ['prevu', 'confirme']);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_heure', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by medecin.
     */
    public function scopeByMedecin($query, $medecinId)
    {
        return $query->where('medecin_id', $medecinId);
    }

    /**
     * Scope a query to filter by patient.
     */
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }
}
