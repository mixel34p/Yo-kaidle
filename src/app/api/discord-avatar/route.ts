/**
 * API Route: Discord Avatar
 * GET /api/discord-avatar?discordId=123456789
 * Fetches the current avatar URL for a Discord user using the bot token.
 */

import { NextRequest, NextResponse } from 'next/server';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET(request: NextRequest) {
    try {
        if (!DISCORD_BOT_TOKEN) {
            return NextResponse.json(
                { error: 'Discord bot token not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const discordId = searchParams.get('discordId');

        if (!discordId) {
            return NextResponse.json(
                { error: 'discordId is required' },
                { status: 400 }
            );
        }

        // Llamar a la API de Discord con el bot token
        const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            },
            // Cache por 5 minutos para no abusar de la API de Discord
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            console.error('[API Discord Avatar] Discord API error:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch Discord user data' },
                { status: response.status }
            );
        }

        const discordUser = await response.json();
        const avatarHash = discordUser.avatar;

        if (!avatarHash) {
            // Usuario sin avatar personalizado - usar avatar por defecto de Discord
            const defaultIndex = (parseInt(discordId) >> 22) % 6;
            return NextResponse.json({
                success: true,
                avatarUrl: `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`,
                isDefault: true
            });
        }

        // Construir URL del CDN de Discord
        const ext = avatarHash.startsWith('a_') ? 'gif' : 'webp';
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=256`;

        return NextResponse.json({
            success: true,
            avatarUrl,
            isDefault: false
        });

    } catch (error) {
        console.error('[API Discord Avatar] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
