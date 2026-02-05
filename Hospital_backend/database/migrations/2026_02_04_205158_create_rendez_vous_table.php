<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('medecin_id')->constrained('medecins')->onDelete('restrict');
            $table->foreignId('medecin_remplacant_id')->nullable()->constrained('medecins')->onDelete('set null');
            $table->dateTime('date_heure');
            $table->string('motif', 255);
            $table->enum('statut', [
                'prevu',      // RDV programmé
                'confirme',   // Patient a confirmé
                'en_cours',   // Consultation en cours
                'effectue',   // RDV terminé
                'annule',     // Annulé par patient/médecin
                'reporte'     // Reporté à une autre date
            ])->default('prevu');
            $table->text('observation')->nullable();
            $table->timestamps();
            // Ajoute une colonne 'deleted_at' pour permettre la suppression logique (Soft Deletes)
            $table->softDeletes();
            // A doctor shouldn't have multiple appointments at the same time
            $table->unique(['medecin_id', 'date_heure'], 'prevent_double_booking');

            // Crée des index sur les colonnes pour optimiser les performances des recherches et des filtres
            $table->index('patient_id');
            $table->index('medecin_id');
            $table->index('date_heure');
            $table->index('statut');
            $table->index(['patient_id', 'statut']);
            $table->index(['medecin_id', 'date_heure']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
