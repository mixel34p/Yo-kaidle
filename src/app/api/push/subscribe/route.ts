/**
 * API Route: Subscribe to Push Notifications
 * POST /api/push/subscribe
 * 
 * Receives a push subscription and stores it in Supabase
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subscription, userId } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Invalid subscription data' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Extract keys from subscription
        const keys = subscription.keys || {};

        const subscriptionData = {
            endpoint: subscription.endpoint,
            p256dh: keys.p256dh || '',
            auth: keys.auth || '',
            user_id: userId || null,
            user_agent: request.headers.get('user-agent') || 'Unknown',
            is_active: true,
            last_used_at: new Date().toISOString()
        };

        // Upsert subscription (update if exists, insert if not)
        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert(subscriptionData, {
                onConflict: 'endpoint',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('[API Push Subscribe] Error:', error);
            return NextResponse.json(
                { error: 'Failed to save subscription' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription saved successfully',
            id: data?.id
        });

    } catch (error) {
        console.error('[API Push Subscribe] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);

        if (error) {
            console.error('[API Push Subscribe] Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete subscription' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription deleted successfully'
        });

    } catch (error) {
        console.error('[API Push Subscribe] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
