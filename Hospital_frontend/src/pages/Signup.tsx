import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, HeartPulse, User } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-teal-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-blue-400/20 rounded-full blur-3xl" />

            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col justify-center items-center relative z-10 p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 max-w-lg text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-teal-500/20 rounded-2xl backdrop-blur-sm border border-teal-500/30">
                            <HeartPulse className="w-12 h-12 text-teal-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-sans tracking-tight">Join Our Community</h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Create an account to manage your medical practice with our advanced platform.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-4 sm:p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-slate-900">Create an account</CardTitle>
                            <CardDescription>Enter your details to get started</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 h-10 transition-all focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type="email"
                                            placeholder="name@hospital.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-10 transition-all focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 h-10 transition-all focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 h-10 transition-all focus:ring-2 focus:ring-teal-500"
                                            required
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-red-500" />
                                        {error}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="justify-center flex-col space-y-2">
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-teal-600 hover:text-teal-500 font-medium transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
