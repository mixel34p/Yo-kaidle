/**
 * Push Notification Manager
 * Handles Web Push API subscriptions and interactions with the backend
 */

import { supabase } from '@/lib/supabase';

// VAPID public key - must match the one in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
    if (typeof window === 'undefined') return false;

    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Convert URL-safe base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Get the current push subscription if exists
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) return null;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription;
    } catch (error) {
        console.error('[Push] Error getting current subscription:', error);
        return null;
    }
}

/**
 * Subscribe to push notifications
 * Returns the subscription if successful, null otherwise
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        console.error('[Push] Push notifications not supported');
        return null;
    }

    if (!VAPID_PUBLIC_KEY) {
        console.error('[Push] VAPID public key not configured');
        return null;
    }

    try {
        // Request notification permission first
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('[Push] Notification permission denied');
            return null;
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            console.log('[Push] Existing subscription found');
            // Ensure it's saved in the database
            await saveSubscriptionToServer(subscription);
            return subscription;
        }

        // Create new subscription
        console.log('[Push] Creating new push subscription...');
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        });

        // Save to server
        await saveSubscriptionToServer(subscription);

        console.log('[Push] Successfully subscribed to push notifications');
        return subscription;
    } catch (error) {
        console.error('[Push] Error subscribing to push:', error);
        return null;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        const subscription = await getCurrentSubscription();

        if (subscription) {
            // Remove from server first
            await removeSubscriptionFromServer(subscription.endpoint);

            // Then unsubscribe locally
            await subscription.unsubscribe();
            console.log('[Push] Successfully unsubscribed from push notifications');
        }

        return true;
    } catch (error) {
        console.error('[Push] Error unsubscribing from push:', error);
        return false;
    }
}

/**
 * Save subscription to Supabase
 */
async function saveSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
    try {
        const subscriptionJSON = subscription.toJSON();

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser();

        const subscriptionData = {
            endpoint: subscription.endpoint,
            p256dh: subscriptionJSON.keys?.p256dh || '',
            auth: subscriptionJSON.keys?.auth || '',
            user_id: user?.id || null,
            user_agent: navigator.userAgent,
            is_active: true,
            last_used_at: new Date().toISOString()
        };

        // Upsert to handle existing subscriptions
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(subscriptionData, {
                onConflict: 'endpoint',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('[Push] Error saving subscription to server:', error);
            return false;
        }

        console.log('[Push] Subscription saved to server');
        return true;
    } catch (error) {
        console.error('[Push] Error in saveSubscriptionToServer:', error);
        return false;
    }
}

/**
 * Remove subscription from Supabase
 */
async function removeSubscriptionFromServer(endpoint: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);

        if (error) {
            console.error('[Push] Error removing subscription from server:', error);
            return false;
        }

        console.log('[Push] Subscription removed from server');
        return true;
    } catch (error) {
        console.error('[Push] Error in removeSubscriptionFromServer:', error);
        return false;
    }
}

/**
 * Update subscription's last_used_at timestamp
 */
export async function updateSubscriptionActivity(): Promise<void> {
    try {
        const subscription = await getCurrentSubscription();
        if (!subscription) return;

        await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('endpoint', subscription.endpoint);
    } catch (error) {
        console.error('[Push] Error updating subscription activity:', error);
    }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
    const subscription = await getCurrentSubscription();
    return subscription !== null;
}
