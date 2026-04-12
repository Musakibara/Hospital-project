<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::with('user')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead()
    {
        Notification::whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Static helper to log activity
     */
    public static function log($message, $type = 'info')
    {
        $userId = Auth::id();
        
        if (!$userId) {
            $systemUser = User::firstOrCreate(
                ['email' => 'system@hospital.local'],
                ['name' => 'System', 'password' => Hash::make(Str::random(32)), 'role' => 'system']
            );
            $userId = $systemUser->id;
        }

        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
        ]);
    }
}
