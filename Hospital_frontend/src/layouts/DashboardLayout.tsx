import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Stethoscope,
    LogOut,
    Menu,
    Bell,
    Search,
    Check,
    Clock,
    User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
    <Link
        to={href}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
            active
                ? "bg-teal-500/10 text-teal-700 font-medium"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-full"
            />
        )}
        <Icon className={cn("w-5 h-5", active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600")} />
        <span>{label}</span>
    </Link>
);

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await notificationService.getNotifications();
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Patients', href: '/patients' },
        { icon: LayoutDashboard, label: 'Doctors', href: '/doctors' },
        { icon: Calendar, label: 'Appointments', href: '/appointments' },
        { icon: Stethoscope, label: 'Consultations', href: '/consultations' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transition-transform duration-300 lg:static",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="h-full flex flex-col p-4">
                    <div className="flex items-center gap-2 px-2 mb-8 mt-2">
                        <div className="p-2 bg-teal-500 rounded-lg">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 text-lg leading-tight">MedAdmin</h1>
                            <p className="text-xs text-slate-500">Hospital System</p>
                        </div>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={location.pathname === item.href}
                            />
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-slate-50">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@hospital.com'}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Top Header */}
                <header className="h-14 sm:h-16 bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className=""
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="hidden md:flex items-center text-slate-400 text-sm">
                            <Search className="w-4 h-4 mr-2" />
                            <span className="opacity-70">Search patients, doctors, or appointments...</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("relative text-slate-500 hover:text-slate-700", showNotifications && "bg-slate-100")}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </Button>

                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                            <h3 className="font-bold text-slate-900">Notifications</h3>
                                            <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700" onClick={handleMarkAllRead}>
                                                Mark all as read
                                            </Button>
                                        </div>
                                        <div className="max-h-[400px] overflow-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-400">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={cn(
                                                            "p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors flex gap-3 group relative",
                                                            !notif.read_at && "bg-teal-50/30"
                                                        )}
                                                        onClick={() => !notif.read_at && handleMarkRead(notif.id)}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                                                            notif.type === 'success' ? "bg-green-100 text-green-600" :
                                                                notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                                                    "bg-blue-100 text-blue-600"
                                                        )}>
                                                            {notif.type === 'success' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-900 font-medium leading-snug">
                                                                {notif.message}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                                </span>
                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                    <UserIcon className="w-3 h-3" />
                                                                    {notif.user?.name || 'System'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {!notif.read_at && (
                                                            <div className="absolute top-4 right-4 w-2 h-2 bg-teal-500 rounded-full" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                                            <Link to="/notifications" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                                                View all activity
                                            </Link>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <div className="p-3 sm:p-6 lg:p-8 flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
