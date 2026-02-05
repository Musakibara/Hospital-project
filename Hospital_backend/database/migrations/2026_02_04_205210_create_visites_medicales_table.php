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
        Schema::create('visites_medicales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('restrict');
            $table->foreignId('medecin_id')->constrained('medecins')->onDelete('restrict');
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            $table->dateTime('date_visite');
            $table->text('examen');
            $table->text('symptomes');
            $table->text('diagnostic');
            $table->text('maladie');
            $table->text('traitement');
            $table->text('allergie')->nullable();
            $table->text('maladie_chronique')->nullable();
            $table->decimal('poids', 5, 2)->nullable()->comment('Weight in kg');
            $table->decimal('taille', 5, 2)->nullable()->comment('Height in cm');
            $table->decimal('imc', 4, 2)->nullable()->comment('BMI');
            $table->text('observations')->nullable();
            $table->timestamps();
            // PAS de softDeletes() - les visites sont immuables

            // Index
            $table->index('patient_id');
            $table->index('medecin_id');
            $table->index('rendez_vous_id');
            $table->index('date_visite');
            $table->index(['patient_id', 'date_visite']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visites_medicales');
    }
};
