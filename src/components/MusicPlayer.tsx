'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  Track,
  RepeatMode,
  JukeboxState,
  loadJukeboxState,
  saveJukeboxState,
  getTrackById,
  getTrackName
} from '@/utils/jukeboxManager';
import { getAudioManager, AudioManager } from '@/utils/audioManager';

interface MusicPlayerProps {
  className?: string;
  onTrackChange?: (track: Track | null) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '', onTrackChange }) => {
  const { language } = useLanguage();
  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(loadJukeboxState());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const audioManager = useRef<AudioManager>(getAudioManager());

  // Track actual
  const currentTrack = jukeboxState.currentTrack ? getTrackById(jukeboxState.currentTrack) : null;

  // Configurar callbacks del audio manager
  useEffect(() => {
    const manager = audioManager.current;

    manager.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    manager.onPlayStateChange((isPlaying) => {
      setJukeboxState(prev => {
        const newState = { ...prev, isPlaying };
        saveJukeboxState(newState);
        return newState;
      });
    });

    manager.onTrackEnd(() => {
      handleNext();
    });

    return () => {
      // Cleanup se maneja en el audioManager
    };
  }, []);

  // Notificar cambios de track
  useEffect(() => {
    if (onTrackChange) {
      onTrackChange(currentTrack);
    }
  }, [currentTrack, onTrackChange]);

  // Cargar track cuando cambia (solo si no está ya cargado)
  useEffect(() => {
    if (currentTrack) {
      const currentAudioTrack = audioManager.current.getCurrentTrack();

      // Solo cargar si es un track diferente
      if (!currentAudioTrack || currentAudioTrack.id !== currentTrack.id) {
        setIsLoading(true);
        audioManager.current.loadTrack(currentTrack, false)
          .then(() => {
            setIsLoading(false);
            // Si el estado dice que debe estar reproduciéndose, reproducir
            if (jukeboxState.isPlaying) {
              audioManager.current.play().catch(console.error);
            }
          })
          .catch((error) => {
            console.error('Error loading track:', error);
            setIsLoading(false);
          });
      }
    }
  }, [currentTrack, jukeboxState.isPlaying]);

  // Función para actualizar el estado del jukebox
  const updateJukeboxState = (updates: Partial<JukeboxState>) => {
    setJukeboxState(prev => {
      const newState = { ...prev, ...updates };
      saveJukeboxState(newState);
      return newState;
    });
  };

  // Reproducir/pausar
  const handlePlayPause = async () => {
    if (!currentTrack) return;

    try {
      await audioManager.current.togglePlayPause();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Siguiente canción
  const handleNext = () => {
    if (jukeboxState.queue.length === 0) return;

    let nextIndex = jukeboxState.currentQueueIndex + 1;

    // Manejar repetición
    if (nextIndex >= jukeboxState.queue.length) {
      if (jukeboxState.repeat === 'all') {
        nextIndex = 0;
      } else if (jukeboxState.repeat === 'one') {
        nextIndex = jukeboxState.currentQueueIndex;
      } else {
        // No repeat, parar
        updateJukeboxState({ isPlaying: false });
        return;
      }
    }

    const nextTrackId = jukeboxState.queue[nextIndex];
    updateJukeboxState({
      currentTrack: nextTrackId,
      currentQueueIndex: nextIndex
    });
  };

  // Canción anterior
  const handlePrevious = () => {
    if (jukeboxState.queue.length === 0) return;

    // Si llevamos más de 3 segundos, reiniciar la canción actual
    if (currentTime > 3) {
      audioManager.current.seek(0);
      return;
    }

    let prevIndex = jukeboxState.currentQueueIndex - 1;

    if (prevIndex < 0) {
      if (jukeboxState.repeat === 'all') {
        prevIndex = jukeboxState.queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    const prevTrackId = jukeboxState.queue[prevIndex];
    updateJukeboxState({
      currentTrack: prevTrackId,
      currentQueueIndex: prevIndex
    });
  };

  // Alternar shuffle
  const handleShuffle = () => {
    updateJukeboxState({ shuffle: !jukeboxState.shuffle });
  };

  // Cambiar modo de repetición
  const handleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(jukeboxState.repeat);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateJukeboxState({ repeat: nextMode });
  };

  // Cambiar volumen
  const handleVolumeChange = (volume: number) => {
    audioManager.current.setVolume(volume);
    updateJukeboxState({ volume });
  };

  // Buscar en la canción
  const handleSeek = (time: number) => {
    audioManager.current.seek(time);
  };

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    return AudioManager.formatTime(seconds);
  };

  // Obtener icono de repetición
  const getRepeatIcon = () => {
    switch (jukeboxState.repeat) {
      case 'one': return Repeat1;
      case 'all': return Repeat;
      default: return Repeat;
    }
  };

  if (!currentTrack) {
    return (
      <div className={`music-player bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🎵</div>
          <p className="text-sm">
            {language === 'es' ? 'Selecciona una canción para reproducir' :
             language === 'en' ? 'Select a song to play' :
             'Seleziona una canzone da riprodurre'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`music-player bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Información de la canción */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
            {currentTrack.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {getTrackName(currentTrack, language)}
            </h3>
            <p className="text-sm text-gray-600">
              {currentTrack.game.toUpperCase()} • {currentTrack.category}
            </p>
          </div>
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-1 cursor-pointer"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 handleSeek(percent * duration);
               }}>
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles de reproducción */}
      <div className="p-4 pt-2">
        <div className="flex items-center justify-center gap-4">
          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            className={`p-2 rounded-full transition-colors ${
              jukeboxState.shuffle 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shuffle size={16} />
          </button>

          {/* Anterior */}
          <button
            onClick={handlePrevious}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={jukeboxState.queue.length === 0}
          >
            <SkipBack size={20} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {jukeboxState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Siguiente */}
          <button
            onClick={handleNext}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={jukeboxState.queue.length === 0}
          >
            <SkipForward size={20} />
          </button>

          {/* Repetir */}
          <button
            onClick={handleRepeat}
            className={`p-2 rounded-full transition-colors ${
              jukeboxState.repeat !== 'none' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {React.createElement(getRepeatIcon(), { size: 16 })}
          </button>
        </div>

        {/* Control de volumen */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleVolumeChange(jukeboxState.volume > 0 ? 0 : 0.7)}
            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
          >
            {jukeboxState.volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={jukeboxState.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-8">
            {Math.round(jukeboxState.volume * 100)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
