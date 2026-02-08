<!DOCTYPE html>
<html>
<head>
    <title>Confirmation de Rendez-vous</title>
</head>
<body>
    <h1>Bonjour {{ $rendezVous->patient->nom_patient }},</h1>
    
    <p>Votre rendez-vous a été confirmé avec succès.</p>
    
    <h3>Détails du rendez-vous :</h3>
    <ul>
        <li><strong>Médecin :</strong> Dr. {{ $rendezVous->medecin->nom_medecin }}</li>
        <li><strong>Spécialité :</strong> {{ $rendezVous->medecin->specialite }}</li>
        <li><strong>Date et Heure :</strong> {{ $rendezVous->date_heure->format('d/m/Y à H:i') }}</li>
        <li><strong>Motif :</strong> {{ $rendezVous->motif }}</li>
    </ul>

    @if($rendezVous->medecin_remplacant_id)
        <p><strong>Note :</strong> Vous serez reçu par Dr. {{ $rendezVous->medecinRemplacant->nom_medecin }} (Remplaçant).</p>
    @endif

    <p>Merci de votre confiance.</p>
</body>
</html>
