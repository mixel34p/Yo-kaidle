'use client';

import React, { useState, useEffect } from 'react';
import { Yokai, tribeIcons, elementColors, elementIcons, rankIcons, gameLogos, GameMode, tribeTranslations, elementTranslations, foodTranslations, foodIcons } from '@/types/yokai';
import NextYokaiTimer from './NextYokaiTimer';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameOverMessageProps {
  dailyYokai: Yokai;
  won: boolean;
  gameMode: GameMode; // Agregar el modo de juego
  onClose?: () => void; // Prop para cerrar la ventana
  showStats?: () => void; // Prop para mostrar estadísticas
  playAgain?: () => void; // Nueva prop para jugar de nuevo (solo para modo infinito)
  gameStatus?: 'playing' | 'won' | 'lost'; // Estado actual del juego
  onMidnightReached?: () => void; // Nueva prop para manejar el evento de medianoche
  guesses?: Yokai[]; // Intentos realizados por el jugador (array de Yokais)
  maxGuesses?: number; // Número máximo de intentos permitidos
  pointsEarned?: number; // Puntos ganados en esta partida
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({
  dailyYokai,
  won,
  gameMode,
  onClose,
  showStats,
  playAgain,
  gameStatus = won ? 'won' : 'lost', // Por defecto, usar won para determinar el estado
  onMidnightReached,
  guesses = [],
  maxGuesses = 6,
  pointsEarned = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [isSharing, setIsSharing] = useState(false); // Para evitar múltiples operaciones de compartir simultáneas

  // Hook para traducciones
  const { t, language, getYokaiName, getTribeTranslation, getElementTranslation, getFoodTranslation } = useLanguage();

  // Usar los iconos de elementos importados arriba

  // Obtener iconos con el manejo apropiado de extensiones
  const getTribeIcon = () => {
    // Extensiones correctas para tribus
    if (dailyYokai.tribe === 'Brave') {
      return '/images/tribes/Brave.PNG';
    }
    return `/images/tribes/${dailyYokai.tribe.toLowerCase()}.png`;
  };
  
  const getGameIcon = () => {
    // Los juegos usan las iniciales en minúscula
    if (dailyYokai.game === 'Yo-kai Watch 1') return '/images/games/yw1.png';
    if (dailyYokai.game === 'Yo-kai Watch 2') return '/images/games/yw2.png';
    if (dailyYokai.game === 'Yo-kai Watch 3') return '/images/games/yw3.png';
    if (dailyYokai.game === 'Yo-kai Watch 4') return '/images/games/yw4.png';
    if (dailyYokai.game === 'Yo-kai Watch Blasters') return '/images/games/ywb.png';
    if (dailyYokai.game === 'Yo-kai Watch Busters 2') return '/images/games/ywb2.png';
    
    return `/images/games/yw1.png`; // Default fallback
  };
  
  const getElementIcon = () => {
    // Usar la definición de iconos de elementos
    return elementIcons[dailyYokai.element] || '/images/elements/none.png';
  };
  
  const getRankIcon = () => {
    // Asegurar el formato exacto para los rangos
    const rankLower = dailyYokai.rank.toLowerCase();
    // Verificar que sea exactamente este formato para todos los rangos
    return `/images/ranks/rank-${rankLower}.png`;
  };
  
  const tribeIcon = getTribeIcon();
  const gameIcon = getGameIcon();
  const elementIcon = getElementIcon();
  const rankIcon = getRankIcon();

  useEffect(() => {
    // Mostrar la ventana con una pequeña animación de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (won) {
        setShowConfetti(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [won]);

  const handleCloseClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Dar tiempo para la animación de salida
  };

  const handleStatsClick = () => {
    if (showStats) {
      showStats();
    }
  };

  // Generar la línea de emojis para representar los intentos
  const generateEmojiResults = () => {
    if (!guesses || guesses.length === 0) return '';
    
    const resultText = guesses.map(yokai => {
      // Comparar el Yokai adivinado con el Yokai diario para obtener el resultado
      const normalizedYokai = yokai;
      const result = compareYokai(dailyYokai, normalizedYokai);
      
      // Crear una línea de emojis para cada atributo
      const tribeEmoji = result.tribe === 'correct' ? '🟩' : '🟥';
      const rankEmoji = result.rank === 'correct' ? '🟩' : (result.rank === 'higher' || result.rank === 'lower' ? '🟨' : '🟥');
      const elementEmoji = result.element === 'correct' ? '🟩' : '🟥';
      const foodEmoji = result.favoriteFood === 'correct' ? '🟩' : '🟥';
      const gameEmoji = result.game === 'correct' ? '🟩' : '🟥';
      
      return `${tribeEmoji}${rankEmoji}${elementEmoji}${foodEmoji}${gameEmoji}`;
    }).join('\n');
    
    return resultText;
  };
  

  
  // Función para comparar dos Yokais y determinar el resultado
  const compareYokai = (targetYokai: Yokai, guessedYokai: Yokai) => {
    const result: any = {
      isCorrect: targetYokai.id === guessedYokai.id
    };
    
    // Verificar tribu
    result.tribe = targetYokai.tribe === guessedYokai.tribe ? 'correct' : 'incorrect';
    
    // Verificar rango (A, B, C, etc.)
    if (targetYokai.rank === guessedYokai.rank) {
      result.rank = 'correct';
    } else {
      // Convertir rango a valor numérico para comparar
      const rankValues: { [key: string]: number } = {
        'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1
      };
      
      const targetRankValue = rankValues[targetYokai.rank] || 0;
      const guessedRankValue = rankValues[guessedYokai.rank] || 0;
      
      if (guessedRankValue > targetRankValue) {
        result.rank = 'lower'; // El rango adivinado es mayor (S es mayor que A)
      } else {
        result.rank = 'higher'; // El rango adivinado es menor
      }
    }
    
    // Verificar elemento
    result.element = targetYokai.element === guessedYokai.element ? 'correct' : 'incorrect';
    
    // Verificar comida favorita
    result.favoriteFood = targetYokai.favoriteFood === guessedYokai.favoriteFood ? 'correct' : 'incorrect';
    
    // Verificar juego
    result.game = targetYokai.game === guessedYokai.game ? 'correct' : 'incorrect';
    
    return result;
  };

  // Crear el mensaje a compartir
  const createShareMessage = () => {
    // Determinar si mostrar el nombre del Yo-kai (solo en modo infinito)
    const showYokaiName = gameMode === 'infinite';
    
    // Traducir el modo de juego
    const modoJuego = gameMode === 'daily' ? t.dailyMode : t.infiniteMode;

    // Encabezado con el modo y los intentos
    let message = t.shareHeader.replace('{mode}', modoJuego) + '\n';
    message += t.shareAttempts.replace('{current}', guesses.length.toString()).replace('{max}', maxGuesses.toString()) + '\n\n';
    
    // Añadir línea de emojis para cada intento
    message += generateEmojiResults();
    
    // Añadir información del Yo-kai
    message += `\n\n`;
    // Mostrar el nombre del Yo-kai solo en modo infinito
    if (showYokaiName) {
      message += `${t.yokaiLabel}: ${getYokaiName(dailyYokai)}\n`;
      message += `${t.tribe}: ${getTribeTranslation(dailyYokai.tribe)}`;
      message += `\n${t.game}: ${dailyYokai.game}`;
    }


    // Añadir enlace al juego
    message += `\n\n${t.shareFooter}`;
    
    return message;
  };

  // Abrir la pantalla de compartir
  const openShareScreen = () => {
    setShowShareScreen(true);
  };

  // Cerrar la pantalla de compartir
  const closeShareScreen = () => {
    setShowShareScreen(false);
  };

  // Función para compartir usando Web Share API
  const handleShare = async () => {
    // Evitar múltiples operaciones de compartir simultáneas
    if (isSharing) return;
    
    setIsSharing(true);
    const shareMessage = createShareMessage();
    
    try {
      if (navigator.share) {
        // Usar Web Share API si está disponible
        await navigator.share({
          title: t.shareTitle,
          text: shareMessage
        });
      } else {
        // Fallback a copiar al portapapeles
        await navigator.clipboard.writeText(shareMessage);
        setShareStatus('copied');
        // Resetear el estado después de 3 segundos
        setTimeout(() => {
          setShareStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShareStatus('error');
      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setShareStatus('idle');
      }, 3000);
    } finally {
      // Importante: resetear el estado de compartir para permitir nuevos intentos
      setTimeout(() => {
        setIsSharing(false);
      }, 1000);
    }
  };

  // Función para compartir en Twitter
  const handleTwitterShare = () => {
    const shareMessage = createShareMessage();
    const encodedMessage = encodeURIComponent(shareMessage);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
    window.open(twitterUrl, '_blank');
  };
  
  // Función para compartir en Facebook
  const handleFacebookShare = () => {
    const shareUrl = 'https://yokaidle.vercel.app';
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };
  
  // Función para compartir por WhatsApp
  const handleWhatsAppShare = () => {
    const shareMessage = createShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  // Función para compartir por correo electrónico
  const handleEmailShare = () => {
    const shareMessage = createShareMessage();
    const emailSubject = t.emailSubject;
    const emailBody = shareMessage;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl);
  };
  
  // Función para copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
      const shareMessage = createShareMessage();
      await navigator.clipboard.writeText(shareMessage);
      setShareStatus('copied');
      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setShareStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setShareStatus('error');
    }
  };

  return (
    <>
      {/* Pantalla de compartir */}
      {showShareScreen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] transition-opacity duration-300">
          {/* Fondo oscuro con desenfoque */}
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeShareScreen}></div>
          
          {/* Ventana modal de compartir */}
          <div 
            className="relative max-w-md w-11/12 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100"
            style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(66, 196, 255, 0.4)' }}
          >
            {/* Cabecera */}
            <div className="p-4 text-center bg-gradient-to-r from-[#22AD55] to-[#0F5298]">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">
                {t.share}
              </h2>
            </div>
            
            {/* Contenido */}
            <div className="p-6">
              {/* Vista previa del mensaje */}
              <div className="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Vista previa:</h3>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-opacity-20 bg-black p-2 rounded">
                  {createShareMessage()}
                </pre>
              </div>


              
              {/* Opciones de compartir */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Copiar al portapapeles */}
                <button
                  onClick={handleCopyToClipboard}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{shareStatus === 'copied' ? t.copied : t.copyToClipboard}</span>
                </button>
                
                {/* Web Share API (si está disponible) */}
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                  disabled={isSharing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{t.share}</span>
                </button>
                
                {/* Twitter */}
                <button
                  onClick={handleTwitterShare}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#1da1f2" className="mb-2">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
                
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#25D366" className="mb-2">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                
                {/* Facebook */}
                <button
                  onClick={handleFacebookShare}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#1877F2" className="mb-2">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
                
                {/* Email */}
                <button
                  onClick={handleEmailShare}
                  className="p-3 rounded-lg shadow-md flex flex-col items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'rgba(234, 242, 255, 0.15)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email</span>
                </button>
              </div>
              
              {/* Botón de cerrar */}
              <button
                onClick={closeShareScreen}
                className="w-full py-2 rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', color: 'white' }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Fondo oscuro con desenfoque */}
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleCloseClick}></div>
      
      {/* Ventana modal */}
      <div 
        className={`relative max-w-md w-11/12 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
        style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(66, 196, 255, 0.4)' }}
      >
        {/* Se eliminó el botón X de la esquina superior */}
        
        {/* Cabecera con fondo de gradiente */}
        <div className={`p-6 text-center ${won ? 'bg-gradient-to-r from-[#22AD55] to-[#0F5298]' : 'bg-gradient-to-r from-[#FF315B] to-[#8A3FFC]'}`}>
          <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">
            {won ? t.congratulations.toUpperCase() : 'GAME OVER'}
          </h2>
          <p className="text-white text-opacity-90 text-lg">
            {won
              ? t.wonMessage
              : t.lostMessage
            }
          </p>

          {gameMode === 'daily' && (
            <p className="text-white text-opacity-75 text-sm mt-1">
              {t.comeBackTomorrow}
            </p>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {/* Imagen y nombre del Yo-kai */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <img 
                src={dailyYokai.image_url || dailyYokai.imageurl || dailyYokai.img || dailyYokai.image} 
                alt={getYokaiName(dailyYokai)}
                className="w-full h-full object-contain drop-shadow-lg animate-float"
              />
              
              {/* Estrella decorativa en la esquina si ganó */}
              {won && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 animate-pulse shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--gold-accent)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>{getYokaiName(dailyYokai)}</h3>
          </div>
          
          {/* Características con iconos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Tribu */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0">
                <img src={tribeIcon} alt={dailyYokai.tribe} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.tribe}</p>
                <p className="font-medium text-white">{getTribeTranslation(dailyYokai.tribe)}</p>
              </div>
            </div>
            
            {/* Rango */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center rounded-md" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                {/* Forzar el nombre exacto del archivo para evitar problemas */}
                {dailyYokai.rank === 'E' ? (
                  <img src="/images/ranks/rank-e.png" alt="Rango E" className="w-8 h-8 object-contain" />
                ) : (
                  <img src={rankIcon} alt={dailyYokai.rank} className="w-8 h-8 object-contain" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.rank}</p>
                <p className="font-medium text-white">{dailyYokai.rank}</p>
              </div>
            </div>
            
            {/* Elemento */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center">
                <img src={elementIcon} alt={dailyYokai.element} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.element}</p>
                <p className="font-medium text-white">{getElementTranslation(dailyYokai.element)}</p>
              </div>
            </div>

            {/* Comida Favorita */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center">
                <img 
                  src={foodIcons[dailyYokai.favoriteFood]} 
                  alt={getFoodTranslation(dailyYokai.favoriteFood)}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.food}</p>
                <p className="font-medium text-white">{getFoodTranslation(dailyYokai.favoriteFood)}</p>
              </div>
            </div>
            
            {/* Juego */}
            <div className="p-3 rounded-lg shadow-sm flex items-center" style={{ background: 'rgba(234, 242, 255, 0.15)', borderLeft: '3px solid var(--accent-color)' }}>
              <div className="w-10 h-10 mr-3 flex-shrink-0">
                <img src={gameIcon} alt={dailyYokai.game} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.game}</p>
                <p className="font-medium text-white">{dailyYokai.game}</p>
              </div>
            </div>
          </div>
          
          {/* Puntos ganados en modo diario */}
          {gameMode === 'daily' && won && pointsEarned > 0 && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img
                    src="/icons/points-icon.png"
                    alt="Puntos"
                    className="w-6 h-6"
                  />
                  <span className="text-white font-bold text-xl">
                    +{pointsEarned} {t.points}
                  </span>
                </div>
                <p className="text-white text-opacity-90 text-sm">
                  {language === 'es' ? 'Por adivinar el Yo-kai del día' : language === 'en' ? 'For guessing the daily Yo-kai' : 'Per aver indovinato lo Yo-kai del giorno'}
                </p>
              </div>
            </div>
          )}

          {/* Timer para el próximo Yo-kai (solo en modo diario y cuando el juego ha terminado) */}
          {gameMode === 'daily' && (gameStatus === 'won' || gameStatus === 'lost') && (
            <div className="mt-6">
              <NextYokaiTimer
                gameStatus={won ? 'won' : 'lost'}
                gameMode={gameMode}
                onMidnightReached={onMidnightReached}
              />
            </div>
          )}
          
          {/* Puntos ganados en modo infinito */}
          {gameMode === 'infinite' && won && pointsEarned > 0 && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img
                    src="/icons/points-icon.png"
                    alt="Puntos"
                    className="w-6 h-6"
                  />
                  <span className="text-white font-bold text-xl">
                    +{pointsEarned} {t.points}
                  </span>
                </div>
                <p className="text-white text-opacity-90 text-sm">
                  {language === 'es' ? 'Por adivinar un Yo-kai' : language === 'en' ? 'For guessing a Yo-kai' : 'Per aver indovinato uno Yo-kai'}
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col space-y-3">
            {/* Primer fila de botones */}
            <div className="flex space-x-3">
              <button
                onClick={handleStatsClick}
                className="flex-1 py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--primary-color), #FF6384)' }}
              >
                {t.showStats}
              </button>
              
              {/* Mostrar botón de jugar de nuevo solo en modo infinito */}
              {gameMode === 'infinite' && (
                <button
                  onClick={() => {
                    if (playAgain) playAgain();
                    handleCloseClick();
                  }}
                  className="flex-1 py-3 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--secondary-color), #1E75D3)' }}
                >
                  {t.playAgain}
                </button>
              )}
            </div>

            {/* Botón de compartir (solo mostrar cuando se ha ganado) */}
            {won && (
              <div className="flex space-x-3">
                {/* Botón principal de compartir que abre la pantalla de compartir */}
                <button
                  onClick={openShareScreen}
                  className="flex-1 py-3 px-4 text-white rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t.share}
                </button>
              </div>
            )}
            
            {/* Segunda fila para el botón de cerrar */}
            <button
              onClick={handleCloseClick}
              className="py-2 rounded-lg font-medium transition-all duration-300 shadow-md transform hover:scale-105"
              style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', color: 'white' }}
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GameOverMessage;
