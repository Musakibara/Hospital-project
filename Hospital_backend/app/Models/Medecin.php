<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medecin extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'nom_medecin',
        'specialite',
        'contact_medecin',
        'email_medecin',
        'genre_medecin',
        'actif',
        'can_edit_profile',
        'disponible',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'actif' => 'boolean',
        'can_edit_profile' => 'boolean',
        'disponible' => 'boolean',
    ];

    /**
     * Get the user account for this medecin.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all rendez-vous for this medecin.
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'medecin_id');
    }

    /**
     * Get all rendez-vous where this medecin is a substitute.
     */
    public function rendezVousAsSubstitute()
    {
        return $this->hasMany(RendezVous::class, 'medecin_remplacant_id');
    }

    /**
     * Get all medical visits for this medecin.
     */
    public function visitesMedicales()
    {
        return $this->hasMany(VisiteMedicale::class, 'medecin_id');
    }

    /**
     * Scope a query to only include active medecins.
     */
    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Scope a query to only include available medecins.
     */
    public function scopeDisponible($query)
    {
        return $query->where('disponible', true);
    }

    /**
     * Scope a query to filter by specialite.
     */
    public function scopeBySpecialite($query, $specialite)
    {
        return $query->where('specialite', $specialite);
    }
}
