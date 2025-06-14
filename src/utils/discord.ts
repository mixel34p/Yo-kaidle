export function getDiscordAvatarUrl(user: any): string {
  if (!user) return '/default-avatar.png';

  // Si el usuario tiene una URL de avatar personalizada en user_metadata, úsala
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }

  // Si el usuario tiene un avatar de Discord, construye la URL
  const discordId = user.user_metadata?.provider_id;
  const discordAvatarHash = user.user_metadata?.avatar;
  
  if (discordId && discordAvatarHash) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatarHash}.png`;
  }

  // Si no hay avatar, usa el avatar por defecto
  return '/default-avatar.png';
}

export function getDiscordUsername(user: any): string {
  if (!user) return 'Usuario';

  // Intenta usar el nombre personalizado si existe
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  // Si no, usa el nombre de usuario de Discord
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }

  // Si no hay nombre, usa un valor por defecto
  return 'Usuario';
}
