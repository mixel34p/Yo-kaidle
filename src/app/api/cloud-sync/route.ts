/**
 * API Route: Cloud Sync
 * GET /api/cloud-sync - Fetch user's cloud data
 * POST /api/cloud-sync - Save user's localStorage data to cloud
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase
            .from('user_cloud_data')
            .select('data, last_synced, created_at, session_id')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is acceptable
            console.error('[API Cloud Sync] GET error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch cloud data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data?.data || null,
            lastSynced: data?.last_synced || null,
            createdAt: data?.created_at || null,
            sessionId: data?.session_id || null,
            hasCloudData: !!data
        });

    } catch (error) {
        console.error('[API Cloud Sync] Unexpected GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, data, sessionId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { error: 'data must be an object' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const cloudData: any = {
            id: userId,
            data: data,
            last_synced: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Include session_id if provided
        if (sessionId) {
            cloudData.session_id = sessionId;
        }

        const { error } = await supabase
            .from('user_cloud_data')
            .upsert(cloudData, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('[API Cloud Sync] POST error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return NextResponse.json(
                {
                    error: 'Failed to save cloud data',
                    details: error.message,
                    code: error.code,
                    hint: error.hint
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cloud data saved successfully',
            lastSynced: cloudData.last_synced,
            sessionId: cloudData.session_id
        });

    } catch (error) {
        console.error('[API Cloud Sync] Unexpected POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

