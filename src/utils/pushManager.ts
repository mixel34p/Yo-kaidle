/**
 * Push Notification Manager
 * SIMPLIFIED VERSION - Just requests notification permission without Service Worker
 * TODO: Re-enable full Web Push once SW issues are resolved
 */

import { supabase } from '@/lib/supabase';

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Subscribe to push notifications
 * TEMPORARY: Only requests permission, doesn't create actual push subscription
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
    console.log('[Push] subscribeToPush initiated (SIMPLIFIED MODE)');

    if (!isPushSupported()) {
        console.error('[Push] Notifications not supported');
        return null;
    }

    try {
        console.log('[Push] Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('[Push] Permission result:', permission);

        if (permission === 'granted') {
            console.log('[Push] Permission granted! ✅');
        }

        return null; // No actual subscription yet
    } catch (error) {
        console.error('[Push] Error requesting permission:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    console.log('[Push] Unsubscribe called (SIMPLIFIED MODE)');
    return true;
}

/**
 * Get the current push subscription if exists
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    return null; // No subscriptions in simplified mode
}

/**
 * Update subscription's last_used_at timestamp
 */
export async function updateSubscriptionActivity(): Promise<void> {
    // No-op in simplified mode
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
    // In simplified mode, check if permission is granted
    return Notification.permission === 'granted';
}
