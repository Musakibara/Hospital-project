import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    User as UserIcon,
    Mail,
    Phone,
    Stethoscope,
    Save,
    ShieldCheck,
    Activity,
    Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        contact_medecin: '',
        specialite: '',
        genre_medecin: 'Masculin'
    });

    const isDoctor = user?.role === 'medecin';

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                contact_medecin: user.medecin?.contact_medecin || '',
                specialite: user.medecin?.specialite || '',
                genre_medecin: user.medecin?.genre_medecin || 'Masculin'
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedUser = await authService.updateProfile(formData);
            updateUser(updatedUser);
            toast.success("Profil mis à jour avec succès");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Mon Profil</h1>
                    <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et professionnelles.</p>
                </div>
                <div className="px-4 py-2 bg-teal-50 dark:bg-teal-900/20 rounded-full border border-teal-100 dark:border-teal-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-teal-700 dark:text-teal-400 capitalize">{user?.role} certifié</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Summary Card */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <CardHeader className="pb-4 relative">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-3xl mb-4 border border-white/30 shadow-lg">
                                {user?.name?.[0] || 'D'}
                            </div>
                            <CardTitle className="text-2xl font-bold">{user?.name}</CardTitle>
                            <CardDescription className="text-teal-100 font-medium opacity-90">
                                {isDoctor ? (user?.medecin?.specialite || 'Généraliste') : 'Administrateur'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <Activity className="w-4 h-4 text-teal-200" />
                                <span>Statut : <span className="font-bold text-emerald-300">Actif</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                <Lock className="w-4 h-4 text-teal-200" />
                                <span>Rôle : <span className="font-bold text-teal-100 capitalize">{user?.role}</span></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Sécurité</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground mb-4">Mettez à jour votre mot de passe pour maintenir la sécurité de votre compte.</p>
                            <Button
                                variant="outline"
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full text-xs hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-colors"
                            >
                                <Lock className="w-3 h-3 mr-2" />
                                Changer le mot de passe
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
                        <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-teal-600" />
                                Informations du Profil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-semibold">Nom Complet</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-semibold">Email Professionnel</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/20"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {isDoctor && (
                                        <>
                                            <div className="space-y-2">
                                                <label htmlFor="contact_medecin" className="text-sm font-semibold">Téléphone / Contact</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="contact_medecin"
                                                        value={formData.contact_medecin}
                                                        onChange={(e) => setFormData({ ...formData, contact_medecin: e.target.value })}
                                                        placeholder="+221 ..."
                                                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/20"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="specialite" className="text-sm font-semibold">Spécialité Médicale</label>
                                                <div className="relative">
                                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        id="specialite"
                                                        value={formData.specialite}
                                                        onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                                                        className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-teal-500/20"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-semibold">Genre</label>
                                                <div className="flex gap-4 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg w-fit">
                                                    {['Masculin', 'Féminin', 'Autre'].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, genre_medecin: g as any })}
                                                            className={cn(
                                                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                                formData.genre_medecin === g
                                                                    ? "bg-white dark:bg-slate-800 text-teal-600 shadow-sm"
                                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                            )}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-11 shadow-lg shadow-teal-500/20"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enregistrement...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Enregistrer les modifications
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default Profile;
