/**
 * API Route: Send Push Notifications
 * POST /api/push/send
 * 
 * Protected endpoint to send push notifications to all subscribers
 * Requires API_SECRET header for authentication
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Environment variables - read lazily to avoid build-time errors
const getVapidConfig = () => ({
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    email: process.env.VAPID_EMAIL || 'mailto:miguelelprom@gmail.com'
});

const API_SECRET = process.env.PUSH_API_SECRET;

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Track if VAPID has been configured
let vapidConfigured = false;

interface PushSubscriptionRow {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    user_id: string | null;
    is_active: boolean;
}

export async function POST(request: Request) {
    try {
        // Verify API secret (basic protection)
        const authHeader = request.headers.get('x-api-secret');
        if (API_SECRET && authHeader !== API_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Configure VAPID lazily on first request
        const vapid = getVapidConfig();
        if (!vapid.publicKey || !vapid.privateKey) {
            return NextResponse.json(
                { error: 'VAPID keys not configured' },
                { status: 500 }
            );
        }

        if (!vapidConfigured) {
            webpush.setVapidDetails(vapid.email, vapid.publicKey, vapid.privateKey);
            vapidConfigured = true;
        }

        // Get notification payload from request body
        const body = await request.json().catch(() => ({}));
        const {
            title = '¡Nuevo Yo-kai disponible!',
            body: notificationBody = '¡Un nuevo desafío diario te espera! ¿Podrás adivinar el Yo-kai de hoy?',
            url = '/',
            tag = 'daily-yokai',
            userId = null // Optional: send to specific user only
        } = body;

        const payload = JSON.stringify({
            title,
            body: notificationBody,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag,
            url,
            type: 'daily-yokai',
            timestamp: Date.now()
        });

        // Get all active subscriptions from Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let query = supabase
            .from('push_subscriptions')
            .select('*')
            .eq('is_active', true);

        // If userId specified, only send to that user
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
            console.error('[API Push Send] Error fetching subscriptions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch subscriptions' },
                { status: 500 }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active subscriptions found',
                sent: 0,
                failed: 0
            });
        }

        // Send notifications to all subscribers
        const results = await Promise.allSettled(
            subscriptions.map(async (sub: PushSubscriptionRow) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                try {
                    await webpush.sendNotification(pushSubscription, payload);
                    return { success: true, endpoint: sub.endpoint };
                } catch (error: any) {
                    console.error(`[API Push Send] Failed to send to ${sub.endpoint}:`, error.message);

                    // If subscription is invalid (410 Gone or 404), mark as inactive
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await supabase
                            .from('push_subscriptions')
                            .update({ is_active: false })
                            .eq('endpoint', sub.endpoint);
                    }

                    throw error;
                }
            })
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`[API Push Send] Sent: ${sent}, Failed: ${failed}`);

        return NextResponse.json({
            success: true,
            message: `Notifications sent`,
            sent,
            failed,
            total: subscriptions.length
        });

    } catch (error) {
        console.error('[API Push Send] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint for testing/health check
export async function GET() {
    const vapid = getVapidConfig();
    const configured = !!(vapid.publicKey && vapid.privateKey);

    return NextResponse.json({
        status: 'ok',
        vapidConfigured: configured,
        publicKey: vapid.publicKey ? vapid.publicKey.substring(0, 20) + '...' : null
    });
}
