export type SuggestionType = 'frame' | 'background' | 'music' | 'title';

export interface SuggestionData {
    suggestionType: SuggestionType;
    name: string;
    description: string;
    imageUrl?: string;
    referenceUrl?: string;
    username: string;
    userId: string;
    avatarUrl?: string;
}

/**
 * Envía una sugerencia de contenido a Discord
 */
export async function submitSuggestion(data: SuggestionData): Promise<{ success: boolean; error?: string }> {
    try {
        await sendToDiscord(data);
        return { success: true };
    } catch (error) {
        console.error('Error submitting suggestion:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al enviar la sugerencia',
        };
    }
}

/**
 * Envía la sugerencia a Discord mediante webhook
 */
async function sendToDiscord(data: SuggestionData) {
    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error('Discord webhook no configurado');
    }

    // Configuración por tipo de sugerencia
    const typeConfig = {
        frame: {
            emoji: '🖼️',
            title: 'Sugerencia de Marco',
            color: 0xFFD700, // Dorado
        },
        background: {
            emoji: '🌄',
            title: 'Sugerencia de Fondo',
            color: 0x22C55E, // Verde
        },
        music: {
            emoji: '🎵',
            title: 'Sugerencia de Música',
            color: 0xA855F7, // Púrpura
        },
        title: {
            emoji: '🏷️',
            title: 'Sugerencia de Título',
            color: 0x3B82F6, // Azul
        },
    };

    const config = typeConfig[data.suggestionType];

    // Construir campos del embed
    const fields = [
        {
            name: '📝 Nombre',
            value: data.name,
            inline: true,
        },
        {
            name: '👤 Sugerido por',
            value: data.username,
            inline: true,
        },
        {
            name: '📋 Descripción',
            value: data.description.length > 1000
                ? data.description.substring(0, 997) + '...'
                : data.description,
            inline: false,
        },
    ];

    // Añadir URL de imagen si existe
    if (data.imageUrl) {
        fields.push({
            name: '🔗 URL de Imagen',
            value: data.imageUrl,
            inline: false,
        });
    }

    // Añadir URL de referencia si existe
    if (data.referenceUrl) {
        fields.push({
            name: '🔗 URL de Referencia',
            value: data.referenceUrl,
            inline: false,
        });
    }

    // Añadir ID del usuario para referencia
    fields.push({
        name: '🆔 User ID',
        value: `\`${data.userId}\``,
        inline: true,
    });

    const embed: Record<string, unknown> = {
        title: `${config.emoji} ${config.title}`,
        color: config.color,
        fields,
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Yo-kaidle Sugerencias',
            icon_url: 'https://yokaidle.vercel.app/icons/icon-192.png',
        },
    };

    // Añadir imagen al embed si es de tipo frame o background
    if (data.imageUrl && (data.suggestionType === 'frame' || data.suggestionType === 'background')) {
        embed.image = { url: data.imageUrl };
    }

    // Añadir thumbnail del avatar del usuario
    if (data.avatarUrl) {
        embed.thumbnail = { url: data.avatarUrl };
    }

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embeds: [embed],
            username: 'Yo-kaidle Sugerencias',
            avatar_url: 'https://yokaidle.vercel.app/icons/icon-192.png',
        }),
    });

    if (!response.ok) {
        throw new Error('Error al enviar a Discord');
    }
}
