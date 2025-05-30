'use client';

import React, { useRef, useEffect } from 'react';
import { Yokai, tribeTranslations, elementTranslations } from '@/types/yokai';

interface ResultImageProps {
  dailyYokai: Yokai;
  gameMode: 'daily' | 'infinite';
  attempts: number;
  maxAttempts: number;
  emojiResults: string[];
  onImageGenerated?: (imageUrl: string) => void;
}

const ResultImage: React.FC<ResultImageProps> = ({ 
  dailyYokai, 
  gameMode, 
  attempts, 
  maxAttempts, 
  emojiResults,
  onImageGenerated 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const generateImage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Configurar dimensiones del canvas
      const width = 600;
      const height = 800;
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar fondo
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0F5298');
      gradient.addColorStop(1, '#22AD55');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Añadir borde
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      
      // Añadir título
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Yo-kaidle', width / 2, 80);
      
      // Añadir subtítulo con modo de juego
      const modoJuego = gameMode === 'daily' ? 'diario' : 'infinito';
      ctx.font = '28px Arial';
      ctx.fillText(`¡He adivinado el Yo-kai en modo ${modoJuego}!`, width / 2, 130);
      
      // Mostrar intentos
      ctx.font = '24px Arial';
      ctx.fillText(`Intentos: ${attempts}/${maxAttempts}`, width / 2, 180);
      
      // Cargar y dibujar imagen del Yo-kai (solo en modo infinito)
      if (gameMode === 'infinite') {
        try {
          const yokaiImg = new Image();
          yokaiImg.crossOrigin = 'anonymous';
          yokaiImg.src = dailyYokai.image_url || dailyYokai.imageurl || dailyYokai.img || dailyYokai.image || '';
          
          await new Promise((resolve, reject) => {
            yokaiImg.onload = resolve;
            yokaiImg.onerror = reject;
            // Timeout de seguridad
            setTimeout(resolve, 3000);
          });
          
          // Dibujar imagen del Yo-kai
          const imgSize = 150;
          ctx.save();
          // Crear un círculo para la imagen
          ctx.beginPath();
          ctx.arc(width / 2, 250, imgSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          // Dibujar imagen en el círculo
          ctx.drawImage(yokaiImg, width / 2 - imgSize / 2, 250 - imgSize / 2, imgSize, imgSize);
          ctx.restore();
          
          // Añadir nombre del Yo-kai
          ctx.font = 'bold 32px Arial';
          ctx.fillText(dailyYokai.name, width / 2, 350);
          
          // Añadir información del Yo-kai
          ctx.font = '22px Arial';
          ctx.fillText(`Tribu: ${tribeTranslations[dailyYokai.tribe]}`, width / 2, 390);
          ctx.fillText(`Juego: ${dailyYokai.game}`, width / 2, 420);
        } catch (error) {
          console.error('Error al cargar la imagen del Yo-kai:', error);
          // Fallback si no se puede cargar la imagen
          ctx.font = 'bold 32px Arial';
          ctx.fillText('¡Yo-kai adivinado!', width / 2, 250);
          
          if (gameMode === 'infinite') {
            ctx.font = '22px Arial';
            ctx.fillText(`Nombre: ${dailyYokai.name}`, width / 2, 290);
            ctx.fillText(`Tribu: ${tribeTranslations[dailyYokai.tribe]}`, width / 2, 320);
            ctx.fillText(`Juego: ${dailyYokai.game}`, width / 2, 350);
          }
        }
      } else {
        // En modo diario no mostramos el Yo-kai para evitar spoilers
        ctx.font = 'bold 32px Arial';
        ctx.fillText('¡Yo-kai adivinado!', width / 2, 250);
      }
      
      // Dibujar resultados de emojis
      ctx.font = '28px Arial';
      ctx.fillText('Resultados:', width / 2, gameMode === 'infinite' ? 480 : 300);
      
      // Dibujar cada línea de emojis
      let yPos = gameMode === 'infinite' ? 520 : 340;
      const emojiSize = 30;
      
      for (let i = 0; i < emojiResults.length; i++) {
        const emojis = emojiResults[i];
        const xStart = width / 2 - (emojis.length * emojiSize) / 2;
        
        for (let j = 0; j < emojis.length; j++) {
          ctx.font = `${emojiSize}px Arial`;
          ctx.fillText(emojis[j], xStart + j * emojiSize, yPos);
        }
        
        yPos += 40;
      }
      
      // Añadir URL y QR code
      ctx.font = '20px Arial';
      ctx.fillText('https://yokaidle.vercel.app', width / 2, height - 50);
      
      // Convertir canvas a imagen
      const imageUrl = canvas.toDataURL('image/png');
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    };
    
    generateImage();
  }, [dailyYokai, gameMode, attempts, maxAttempts, emojiResults, onImageGenerated]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }} // Ocultar el canvas, solo lo usamos para generar la imagen
    />
  );
};

export default ResultImage;
