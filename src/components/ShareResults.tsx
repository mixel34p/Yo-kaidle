'use client';

import React, { useState } from 'react';
import { GameState, GuessResult, Game } from '@/types/yokai';
import { getTodayDateString } from '@/utils/gameLogic';
import { ClipboardCopy, Twitter, Share2, Facebook, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareResultsProps {
  gameState: GameState;
  className?: string;
}

/**
 * Convierte el estado de una celda a un emoji para compartir
 */
const mapResultToEmoji = (result: 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower' | undefined): string => {
  switch (result) {
    case 'correct':
      return '🟩'; // Verde para correcto
    case 'partial':
    case 'higher':
    case 'lower':
      return '🟨'; // Amarillo para parcialmente correcto
    case 'incorrect':
      return '⬛'; // Negro para incorrecto
    default:
      return '⬜'; // Blanco para valor no comparado
  }
};

/**
 * Genera el patrón de casillas para compartir
 */
const generateSharePattern = (gameState: GameState): string => {
  const { guesses, gameMode, dailyYokai, infiniteYokai, gameStatus } = gameState;
  
  // Determinar el Yo-kai objetivo según el modo de juego
  const targetYokai = gameMode === 'daily' ? dailyYokai : infiniteYokai;
  
  if (!targetYokai || guesses.length === 0) {
    return 'No hay resultados para compartir';
  }
  
  // Obtener número de día para modo diario, o marcar como infinito
  const gameNumber = gameMode === 'daily' 
    ? Math.floor((new Date().getTime() - new Date('2023-09-01').getTime()) / (1000 * 60 * 60 * 24))
    : 'Infinito';
  
  // Generar encabezado
  let pattern = `Yo-kaidle ${gameNumber} - ${guesses.length}/${gameState.maxGuesses}`;
  pattern += gameStatus === 'won' ? ' ✅\n\n' : ' ❌\n\n';
  
  // Generar el patrón para cada fila
  guesses.forEach(guess => {
    const result = guess.result;
    if (!result) return;
    
    // Crear una fila con emojis para cada característica
    const resultRow = [
      // Mostrar solo verde o negro para Yo-kai (no hay parcial)
      mapResultToEmoji(result.isCorrect ? 'correct' : 'incorrect'),
      // Tribu
      mapResultToEmoji(result.tribe === 'correct' ? 'correct' : 'incorrect'),
      // Rango (puede ser higher/lower)
      mapResultToEmoji(result.rank === 'correct' ? 'correct' : result.rank),
      // Elemento
      mapResultToEmoji(result.element === 'correct' ? 'correct' : 'incorrect'),
      // Comida
      mapResultToEmoji(result.favoriteFood === 'correct' ? 'correct' : 'incorrect'),
      // Juego
      mapResultToEmoji(result.game === 'correct' ? 'correct' : 'incorrect')
    ].join('');
    
    pattern += `${resultRow}\n`;
  });
  
  // Añadir enlace al juego
  pattern += '\nhttps://yokaidle.vercel.app/';
  
  return pattern;
};

const ShareResults: React.FC<ShareResultsProps> = ({ gameState, className = '' }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generar el patrón para compartir
  const sharePattern = generateSharePattern(gameState);
  
  // Función para copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sharePattern);
      setCopied(true);
      toast.success('¡Resultado copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('No se pudo copiar el resultado');
    }
  };
  
  // Compartir en Twitter
  const handleShareTwitter = () => {
    const tweetText = encodeURIComponent(sharePattern);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };
  
  // Compartir en Facebook
  const handleShareFacebook = () => {
    const url = encodeURIComponent('https://yokaidle.vercel.app/');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(sharePattern)}`, '_blank');
  };
  
  // Compartir en WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(sharePattern);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  // Usar Web Share API si está disponible
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi resultado en Yo-kaidle',
          text: sharePattern,
          url: 'https://yokaidle.vercel.app/'
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        setShowOptions(true); // Mostrar opciones alternativas si falla
      }
    } else {
      setShowOptions(true); // Si Web Share API no está disponible
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Previsualización del patrón compartido */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg font-mono whitespace-pre-wrap text-lg">
        {sharePattern}
      </div>
      
      {/* Botón principal de compartir */}
      <div className="flex flex-wrap justify-center gap-2 w-full">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-full font-bold transition-transform hover:scale-105 shadow-md"
        >
          <Share2 size={20} />
          Compartir resultado
        </button>
        
        {/* Botón de copiar siempre visible */}
        <button
          onClick={handleCopyToClipboard}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full font-bold transition-transform hover:scale-105 shadow-md ${
            copied ? 'bg-green-500 text-white' : 'bg-secondary text-white'
          }`}
        >
          <ClipboardCopy size={20} />
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      
      {/* Opciones adicionales de compartición */}
      {showOptions && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-2 bg-[#1DA1F2] text-white py-2 px-4 rounded-full font-bold transition-transform hover:scale-105 shadow-md"
          >
            <Twitter size={20} />
            Twitter
          </button>
          
          <button
            onClick={handleShareFacebook}
            className="flex items-center justify-center gap-2 bg-[#4267B2] text-white py-2 px-4 rounded-full font-bold transition-transform hover:scale-105 shadow-md"
          >
            <Facebook size={20} />
            Facebook
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 px-4 rounded-full font-bold transition-transform hover:scale-105 shadow-md"
          >
            <MessageSquare size={20} />
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareResults;
