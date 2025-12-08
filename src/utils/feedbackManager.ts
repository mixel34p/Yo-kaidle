export interface FeedbackData {
  feedbackType: 'bug' | 'suggestion' | 'other';
  title: string;
  description: string;
  username?: string;
  priority?: 'low' | 'medium' | 'high';
  pageUrl?: string;
}

/**
 * Envía feedback directamente a Discord (sin Supabase)
 */
export async function submitFeedback(data: FeedbackData): Promise<{ success: boolean; error?: string }> {
  try {
    const browserInfo = getBrowserInfo();
    const deviceInfo = getDeviceInfo();
    const pageUrl = data.pageUrl || window.location.href;

    // Enviar directamente a Discord
    await sendToDiscord(data, browserInfo, deviceInfo, pageUrl);

    return { success: true };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar el feedback',
    };
  }
}

/**
 * Obtiene información del navegador
 */
function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Desconocido';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  return browser;
}

/**
 * Obtiene información del dispositivo
 */
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const screenSize = `${window.innerWidth}x${window.innerHeight}`;

  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let os = 'Desconocido';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${device} | ${os} | ${screenSize}`;
}

/**
 * Envía una notificación a Discord
 */
async function sendToDiscord(
  data: FeedbackData,
  browserInfo: string,
  deviceInfo: string,
  pageUrl: string
) {
  const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Discord webhook no configurado');
  }

  // Configuración por tipo
  const typeConfig = {
    bug: {
      emoji: '🐛',
      title: 'Bug Reportado',
      color: 0xEF4444, // Rojo
    },
    suggestion: {
      emoji: '💡',
      title: 'Nueva Sugerencia',
      color: 0xF59E0B, // Ámbar
    },
    other: {
      emoji: '📝',
      title: 'Feedback',
      color: 0x3B82F6, // Azul
    },
  };

  // Configuración de prioridad
  const priorityConfig = {
    low: { emoji: '🟢', label: 'Baja' },
    medium: { emoji: '🟡', label: 'Media' },
    high: { emoji: '🔴', label: 'Alta' },
  };

  const config = typeConfig[data.feedbackType];
  const priority = data.priority ? priorityConfig[data.priority] : null;

  // Construir campos del embed
  const fields = [
    {
      name: '📋 Descripción',
      value: data.description.length > 1000
        ? data.description.substring(0, 997) + '...'
        : data.description,
      inline: false,
    },
    {
      name: '👤 Usuario',
      value: data.username || 'Anónimo',
      inline: true,
    },
  ];

  // Añadir prioridad solo para bugs
  if (data.feedbackType === 'bug' && priority) {
    fields.push({
      name: '⚠️ Prioridad',
      value: `${priority.emoji} ${priority.label}`,
      inline: true,
    });
  }

  // Añadir información técnica
  fields.push(
    {
      name: '📍 Página',
      value: `[${new URL(pageUrl).pathname}](${pageUrl})`,
      inline: false,
    },
    {
      name: '🌐 Navegador',
      value: browserInfo,
      inline: true,
    },
    {
      name: '📱 Dispositivo',
      value: deviceInfo,
      inline: true,
    }
  );

  const embed = {
    title: `${config.emoji} ${config.title}`,
    description: `**${data.title}**`,
    color: config.color,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Yo-kaidle Feedback',
      icon_url: 'https://yokaidle.vercel.app/icons/icon-192.png',
    },
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [embed],
      username: 'Yo-kaidle Feedback',
      avatar_url: 'https://yokaidle.vercel.app/icons/icon-192.png',
    }),
  });

  if (!response.ok) {
    throw new Error('Error al enviar a Discord');
  }
}
