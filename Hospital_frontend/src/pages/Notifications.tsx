import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationService.getNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

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

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">System Notifications</h1>
                    <p className="text-slate-500 mt-1">Track system activities, logins, and medical updates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>
            </div>

            <Card className="border-border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-muted rounded-full" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted/50 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-8 w-8 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No activities recorded</h3>
                            <p className="text-slate-500">System events will appear here as they happen.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 sm:p-6 transition-all border-l-4",
                                        !notif.read_at ? "bg-teal-50/20 dark:bg-teal-900/10 border-teal-500" : "bg-card border-transparent hover:bg-muted/10"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm",
                                            notif.type === 'success' ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" :
                                                notif.type === 'warning' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                        )}>
                                            {notif.type === 'success' ? <Check className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                                                <p className={cn(
                                                    "text-base leading-snug",
                                                    !notif.read_at ? "font-semibold text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-xs text-slate-400 whitespace-nowrap font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                                                    <UserIcon className="w-3 h-3" />
                                                    {notif.user?.name || 'System'}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                    notif.type === 'success' ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" :
                                                        notif.type === 'warning' ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" :
                                                            "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
                                                )}>
                                                    {notif.type}
                                                </span>
                                            </div>
                                        </div>
                                        {!notif.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8 w-8 p-0 shrink-0"
                                                onClick={() => handleMarkRead(notif.id)}
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;
