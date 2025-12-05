'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface WikiaImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}

const WikiaImage: React.FC<WikiaImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  style = {},
  onError: onErrorCallback
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Función para limpiar URLs de Wikia
    const cleanWikiaUrl = (url: string): string => {
      if (!url) return '';

      // Si es una URL de wikia.nocookie.net, procesarla
      if (url.includes('wikia.nocookie.net') || url.includes('static.wikia.nocookie.net')) {
        // Quitar los parámetros de consulta
        let cleanUrl = url.split('?')[0];

        // Extraer el nombre del archivo y la ruta de imágenes
        const regex = /\/youkai-watch\/images\/([a-z0-9])\/([a-z0-9]{2})\/([^/]+)\/(revision|scale)/i;
        const match = cleanUrl.match(regex);

        if (match) {
          // Primer grupo = letra, segundo grupo = dos letras, tercer grupo = nombre_archivo
          const basePath = 'https://static.wikia.nocookie.net/youkai-watch';
          const firstChar = match[1];
          const secondChars = match[2];
          const fileName = match[3];

          // Reconstruir la URL sin la parte /revision/latest
          return `${basePath}/images/${firstChar}/${secondChars}/${fileName}`;
        }

        // Si no coincide con el patrón específico, intentar quitar solo /revision/latest
        if (cleanUrl.includes('/revision/')) {
          cleanUrl = cleanUrl.split('/revision/')[0];
        }

        return cleanUrl;
      }

      return url;
    };

    // Procesar la URL al cargar el componente
    const newSrc = cleanWikiaUrl(src);
    setImageSrc(newSrc);
  }, [src]);

  const handleError = () => {
    // Si falla la URL limpia, intentar con un proxy
    if (!error) {
      setError(true);
      // Opción 1: Usar directamente la URL sin limpiar
      setImageSrc(src);

      // Opción 2: Se podría intentar con un proxy si la opción 1 falla
      // const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(src)}`;
      // setImageSrc(proxyUrl);
    } else {
      // Si ya intentamos el fallback y sigue fallando, notificar al padre
      onErrorCallback?.();
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative ${loading ? 'animate-pulse bg-gray-200' : ''}`} style={{ width, height }}>
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ ...style, width, height, objectFit: 'contain' }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default WikiaImage;
