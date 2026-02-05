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
        Schema::create('medecins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->onDelete('cascade')->comment('Compte utilisateur du médecin');
            $table->string('nom_medecin', 100);
            $table->string('specialite', 100);
            $table->string('contact_medecin', 20)->unique();
            $table->string('email_medecin', 100)->unique();
            $table->enum('genre_medecin', ['Masculin', 'Féminin', 'Autre']);
            $table->boolean('actif')->default(true)->comment('Médecin actif ou inactif');
            $table->boolean('can_edit_profile')->default(false);
            $table->boolean('disponible')->default(true);
            $table->timestamps();
            // Ajoute une colonne 'deleted_at' pour permettre la suppression logique (Soft Deletes)
            $table->softDeletes();

            // Crée des index sur les colonnes pour optimiser les performances des recherches et des filtres
            $table->index('user_id');
            $table->index('specialite');
            $table->index('disponible');
            $table->index('nom_medecin');
            $table->index('actif');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medecins');
    }
};
