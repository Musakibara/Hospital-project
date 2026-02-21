import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 p-8">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                </div>
                <div>
                    <h1 className="text-6xl font-black text-foreground">404</h1>
                    <h2 className="text-2xl font-bold text-foreground mt-2">Page introuvable</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        La page que vous recherchez n'existe pas ou a été déplacée.
                    </p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Link to="/dashboard">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Home className="h-4 w-4" />
                            Retour au Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
