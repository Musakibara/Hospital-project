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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('numero_unique', 20)->unique();
            $table->string('nom_patient', 100);
            $table->date('date_naissance');
            $table->enum('sexe', ['Masculin', 'Féminin', 'Autre']);
            $table->string('contact_patient', 20)->unique();
            $table->string('email_patient', 100)->nullable()->unique();
            $table->text('adresse')->nullable();
            $table->text('antecedents_medicaux')->nullable();
            $table->string('profession', 255)->nullable();
            $table->timestamps();
            // Ajoute une colonne 'deleted_at' pour permettre la suppression logique (Soft Deletes)
            $table->softDeletes();

            // Crée des index sur les colonnes pour optimiser les performances des recherches et des filtres
            $table->index('nom_patient');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
