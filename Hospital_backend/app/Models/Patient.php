<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero_unique',
        'nom_patient',
        'date_naissance',
        'sexe',
        'contact_patient',
        'email_patient',
        'adresse',
        'antecedents_medicaux',
        'profession',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'date_naissance' => 'date',
    ];

    /**
     * Get all rendez-vous for this patient.
     */
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'patient_id');
    }

    /**
     * Get all medical visits for this patient.
     */
    public function visitesMedicales()
    {
        return $this->hasMany(VisiteMedicale::class, 'patient_id');
    }

    /**
     * Get the patient's age.
     */
    public function getAgeAttribute()
    {
        return $this->date_naissance->age;
    }

   /**
     * Boot the model to auto-generate numero_unique (UUIDv7) before creating.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->numero_unique)) {
                $model->numero_unique = Str::ulid();
            }
        });
    }

    /**
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nom_patient', 'like', "%{$search}%")
              ->orWhere('numero_unique', 'like', "%{$search}%");
        });
    }
}
