'use client';

import React from 'react';
import { Background, AVAILABLE_BACKGROUNDS, BackgroundId } from '@/utils/backgroundsManager';

interface ProfileBannerProps {
  backgroundId?: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function ProfileBanner({ 
  backgroundId = 'default', 
  height = 'md', 
  className = '',
  children 
}: ProfileBannerProps) {
  // Buscar el fondo en la configuración
  const background = AVAILABLE_BACKGROUNDS.find(bg => bg.id === backgroundId as BackgroundId);
  
  // Configuraciones de altura
  const heightConfig = {
    sm: 'h-24',
    md: 'h-32 md:h-40',
    lg: 'h-40 md:h-48'
  };

  // Si no se encuentra el fondo, usar el default
  const finalBackground = background || AVAILABLE_BACKGROUNDS[0];

  return (
    <div className={`
      ${heightConfig[height]}
      relative
      rounded-lg
      overflow-hidden
      shadow-lg
      ${className}
    `}>
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: finalBackground.style.backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay oscuro para mejorar legibilidad del contenido */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Contenido del banner */}
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center p-4">
          {children}
        </div>
      )}
    </div>
  );
}
