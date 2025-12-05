'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Heart, Plus } from 'lucide-react';
import {
  Track,
  MusicCategory,
  MusicGame,
  AVAILABLE_TRACKS,
  JukeboxState,
  loadJukeboxState,
  saveJukeboxState,
  getUnlockedTracks,
  isTrackUnlocked,
  getTrackName,
  getTrackDescription,

} from '@/utils/jukeboxManager';
import { AudioManager } from '@/utils/audioManager';

interface MusicLibraryProps {
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  className?: string;
}

// Removido FilterType ya que solo mostraremos canciones desbloqueadas

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  onPlayTrack,
  onAddToQueue,
  onAddToPlaylist,
  className = ''
}) => {
  const { language } = useLanguage();
  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(loadJukeboxState());
  const [gameFilter, setGameFilter] = useState<MusicGame | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');



  // Función para actualizar el estado del jukebox
  const updateJukeboxState = (updates: Partial<JukeboxState>) => {
    setJukeboxState(prev => {
      const newState = { ...prev, ...updates };
      saveJukeboxState(newState);
      return newState;
    });
  };

  // Alternar favorito
  const toggleFavorite = (trackId: string) => {
    const newFavorites = jukeboxState.favoriteTracks.includes(trackId)
      ? jukeboxState.favoriteTracks.filter(id => id !== trackId)
      : [...jukeboxState.favoriteTracks, trackId];
    
    updateJukeboxState({ favoriteTracks: newFavorites });
  };

  // Filtrar tracks (solo mostrar desbloqueados)
  const getFilteredTracks = (): Track[] => {
    // Solo tracks desbloqueados
    let tracks = AVAILABLE_TRACKS.filter(track => jukeboxState.unlockedTracks.includes(track.id));

    // Filtro por juego
    if (gameFilter !== 'all') {
      tracks = tracks.filter(track => track.game === gameFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tracks = tracks.filter(track =>
        getTrackName(track, language).toLowerCase().includes(query) ||
        getTrackDescription(track, language).toLowerCase().includes(query) ||
        track.game.toLowerCase().includes(query) ||
        track.category.toLowerCase().includes(query)
      );
    }

    return tracks;
  };

  const filteredTracks = getFilteredTracks();

  // Juegos disponibles (solo los que tienen tracks desbloqueados)
  const getAvailableGames = () => {
    const unlockedTracks = AVAILABLE_TRACKS.filter(track => jukeboxState.unlockedTracks.includes(track.id));
    const availableGames = Array.from(new Set(unlockedTracks.map(track => track.game)));

    const games = [
      { id: 'all', name: language === 'es' ? 'Todos' : language === 'en' ? 'All' : 'Tutti', icon: '🎮' }
    ];

    if (availableGames.includes('yw1')) {
      games.push({ id: 'yw1', name: 'Yo-kai Watch 1', icon: '🎮' });
    }
    if (availableGames.includes('yw2')) {
      games.push({ id: 'yw2', name: 'Yo-kai Watch 2', icon: '🎮' });
    }
    if (availableGames.includes('yw3')) {
      games.push({ id: 'yw3', name: 'Yo-kai Watch 3', icon: '🎮' });
    }
    if (availableGames.includes('ywb')) {
      games.push({ id: 'ywb', name: 'YW Blasters', icon: '🎮' });
    }
    if (availableGames.includes('ywp')) {
      games.push({ id: 'ywp', name: 'YW Psychic Specters', icon: '🎮' });
    }
    if (availableGames.includes('yw4')) {
      games.push({ id: 'yw4', name: 'Yo-kai Watch 4', icon: '🎮' });
    }

    return games;
  };

  // Manejar reproducción de track
  const handlePlayTrack = (track: Track) => {
    if (!isTrackUnlocked(track.id)) return;
    
    // Crear cola con el track seleccionado
    const unlockedTrackIds = getUnlockedTracks().map(t => t.id);
    updateJukeboxState({
      currentTrack: track.id,
      queue: unlockedTrackIds,
      currentQueueIndex: unlockedTrackIds.indexOf(track.id),
      isPlaying: true
    });
    
    onPlayTrack(track);
  };

  const games = getAvailableGames();

  return (
    <div className={`music-library ${className}`} style={{ height: 'calc(90vh - 200px)' }}>
      <div className="h-full flex flex-col">
        {/* Header fijo */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
          {/* Header con estadísticas */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🎼 {language === 'es' ? 'Biblioteca Musical' : language === 'en' ? 'Music Library' : 'Biblioteca Musicale'}
            </h2>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {jukeboxState.unlockedTracks.length}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'es' ? 'canciones' : language === 'en' ? 'songs' : 'canzoni'}
              </div>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar música...' : language === 'en' ? 'Search music...' : 'Cerca musica...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por juego */}
          <div className="flex gap-2 flex-wrap">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setGameFilter(game.id as MusicGame | 'all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  gameFilter === game.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{game.icon}</span>
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de tracks con scroll FORZADO */}
        <div className="flex-1 overflow-y-scroll" style={{ maxHeight: 'calc(100% - 200px)' }}>
          <div className="p-6 space-y-3">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-lg">
                {language === 'es' ? 'No se encontraron canciones' :
                 language === 'en' ? 'No songs found' :
                 'Nessuna canzone trovata'}
              </p>
            </div>
          ) : (
            filteredTracks.map((track, index) => {
              const isFavorite = jukeboxState.favoriteTracks.includes(track.id);
              const isCurrentTrack = jukeboxState.currentTrack === track.id;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                    isCurrentTrack
                      ? 'bg-blue-50 border-blue-200 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handlePlayTrack(track)}
                >
                  {/* Icono del track */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {track.icon}
                  </div>

                  {/* Información del track */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-gray-800">
                      {getTrackName(track, language)}
                    </h3>
                    <p className="text-sm truncate text-gray-600">
                      {track.game.toUpperCase()} • {track.category} • {AudioManager.formatTime(track.duration)}
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-2">
                    {/* Botón de favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {/* Botón de añadir a playlist */}
                    {onAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPlaylist(track);
                        }}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                        title={language === 'es' ? 'Añadir a lista' : language === 'en' ? 'Add to playlist' : 'Aggiungi alla playlist'}
                      >
                        <Plus size={16} />
                      </button>
                    )}

                    {/* Botón de reproducir */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                    >
                      <Play size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>


    </div>
    </div>
  );
};

export default MusicLibrary;
