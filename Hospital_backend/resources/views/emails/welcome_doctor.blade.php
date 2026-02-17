<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .header { background: linear-gradient(to right, #0d9488, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #64748b; }
        .credentials { background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue, Dr. {{ $doctorName }}</h1>
        </div>
        <div class="content">
            <p>Bonjour,</p>
            <p>Nous sommes ravis de vous accueillir au sein de notre plateforme de gestion hospitalière. Votre profil de médecin a été créé avec succès.</p>
            <p>Voici vos identifiants pour accéder à votre tableau de bord :</p>
            
            <div class="credentials">
                <p><strong>Email :</strong> {{ $email }}</p>
                <p><strong>Mot de passe temporaire :</strong> <span style="font-family: monospace; font-size: 1.2em; color: #b91c1c;">{{ $password }}</span></p>
            </div>

            <p style="color: #6366f1; font-weight: 500;">🔔 Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>

            <center>
                <a href="{{ config('app.url') }}" class="button">Se connecter au portail</a>
            </center>

            <p>Si vous avez des questions, n'hésitez pas à contacter l'administration.</p>
            <p>Cordialement,<br>L'équipe Administrative</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Hospital Manager. Tous droits réservés.
        </div>
    </div>
</body>
</html>
