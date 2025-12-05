'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Plus, Trash2, Music } from 'lucide-react';
import {
  Track,
  Playlist,
  JukeboxState,
  loadJukeboxState,
  saveJukeboxState,
  getTrackById,
  getPlaylistName,
  getTrackName
} from '@/utils/jukeboxManager';
import { AudioManager } from '@/utils/audioManager';

interface PlaylistManagerProps {
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  className?: string;
}

const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  onPlayTrack,
  onAddToQueue,
  className = ''
}) => {
  const { language } = useLanguage();
  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(loadJukeboxState());
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');

  // Función para actualizar el estado del jukebox
  const updateJukeboxState = (updates: Partial<JukeboxState>) => {
    setJukeboxState(prev => {
      const newState = { ...prev, ...updates };
      saveJukeboxState(newState);
      return newState;
    });
  };

  // Obtener todas las listas (solo favoritos + personalizadas)
  const getAllPlaylists = (): Playlist[] => {
    const favoritesPlaylist: Playlist = {
      id: 'favorites',
      name_es: 'Favoritas',
      name_en: 'Favorites',
      name_it: 'Preferite',
      tracks: jukeboxState.favoriteTracks,
      icon: '⭐',
      isCustom: false,
      createdAt: new Date().toISOString()
    };

    return [
      favoritesPlaylist,
      ...jukeboxState.customPlaylists
    ];
  };

  // Crear nueva lista de reproducción
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `custom_${Date.now()}`,
      name_es: newPlaylistName.trim(),
      name_en: newPlaylistName.trim(),
      name_it: newPlaylistName.trim(),
      tracks: [],
      icon: '🎵',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    updateJukeboxState({
      customPlaylists: [...jukeboxState.customPlaylists, newPlaylist]
    });

    setNewPlaylistName('');
    setShowCreateForm(false);
    setSelectedPlaylist(newPlaylist);
  };

  // Eliminar lista personalizada
  const deletePlaylist = (playlistId: string) => {
    updateJukeboxState({
      customPlaylists: jukeboxState.customPlaylists.filter(p => p.id !== playlistId)
    });

    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
    }
  };

  // Reproducir lista completa
  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;

    const firstTrack = getTrackById(playlist.tracks[0]);
    if (!firstTrack) return;

    updateJukeboxState({
      currentTrack: firstTrack.id,
      queue: playlist.tracks,
      currentQueueIndex: 0,
      isPlaying: true
    });

    onPlayTrack(firstTrack);
  };

  // Reproducir track específico de la lista
  const playTrackFromPlaylist = (track: Track, playlist: Playlist) => {
    const trackIndex = playlist.tracks.indexOf(track.id);

    updateJukeboxState({
      currentTrack: track.id,
      queue: playlist.tracks,
      currentQueueIndex: trackIndex,
      isPlaying: true
    });

    onPlayTrack(track);
  };

  const allPlaylists = getAllPlaylists();

  return (
    <div className={`playlist-manager ${className}`} style={{ height: 'calc(90vh - 200px)' }}>
      <div className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Lista de playlists */}
          <div className="lg:col-span-1 flex flex-col h-full">
            {/* Header fijo */}
            <div className="flex-shrink-0 flex items-center justify-between mb-4 px-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {language === 'es' ? 'Listas de Reproducción' :
                 language === 'en' ? 'Playlists' :
                 'Playlist'}
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title={language === 'es' ? 'Crear nueva lista' : language === 'en' ? 'Create new playlist' : 'Crea nuova playlist'}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Formulario de crear lista */}
            <div className="flex-shrink-0 px-6">
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <input
                    type="text"
                    placeholder={language === 'es' ? 'Nombre de la lista...' : language === 'en' ? 'Playlist name...' : 'Nome playlist...'}
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createPlaylist}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      {language === 'es' ? 'Crear' : language === 'en' ? 'Create' : 'Crea'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewPlaylistName('');
                      }}
                      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-lg transition-colors"
                    >
                      {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annulla'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Lista de playlists con scroll FORZADO */}
            <div className="overflow-y-scroll px-6" style={{ height: 'calc(100% - 120px)', maxHeight: '400px' }}>
              <div className="space-y-2 pb-4">
                {allPlaylists.map((playlist) => (
                  <motion.div
                key={playlist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPlaylist?.id === playlist.id
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-xl">{playlist.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {getPlaylistName(playlist, language)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {playlist.tracks.length} {language === 'es' ? 'canciones' : language === 'en' ? 'songs' : 'canzoni'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {playlist.tracks.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPlaylist(playlist);
                        }}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    
                    {playlist.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido de la playlist seleccionada */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {selectedPlaylist ? (
              <div className="h-full flex flex-col">
                {/* Header de la playlist */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl">
                        {selectedPlaylist.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {getPlaylistName(selectedPlaylist, language)}
                        </h2>
                        <p className="text-gray-600">
                          {selectedPlaylist.tracks.length} {language === 'es' ? 'canciones' : language === 'en' ? 'songs' : 'canzoni'}
                        </p>
                      </div>
                    </div>

                    {selectedPlaylist.tracks.length > 0 && (
                      <button
                        onClick={() => playPlaylist(selectedPlaylist)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <Play size={16} />
                        {language === 'es' ? 'Reproducir Todo' : language === 'en' ? 'Play All' : 'Riproduci Tutto'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de tracks con scroll FORZADO */}
                <div className="overflow-y-scroll" style={{ height: 'calc(100% - 120px)', maxHeight: '500px' }}>
                  <div className="p-6 space-y-3">
                    {selectedPlaylist.tracks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>
                          {language === 'es' ? 'Esta lista está vacía' :
                           language === 'en' ? 'This playlist is empty' :
                           'Questa playlist è vuota'}
                        </p>
                      </div>
                    ) : (
                      selectedPlaylist.tracks.map((trackId, index) => {
                    const track = getTrackById(trackId);
                    if (!track) return null;

                    const isCurrentTrack = jukeboxState.currentTrack === track.id;

                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center p-3 rounded-lg border transition-all ${
                          isCurrentTrack
                            ? 'bg-blue-50 border-blue-200 shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Número de track */}
                        <div className="w-8 text-center text-sm text-gray-500 mr-3">
                          {index + 1}
                        </div>

                        {/* Icono del track */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                          {track.icon}
                        </div>

                        {/* Información del track */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {getTrackName(track, language)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {track.game.toUpperCase()} • {AudioManager.formatTime(track.duration)}
                          </p>
                        </div>

                        {/* Botón de reproducir */}
                        <button
                          onClick={() => playTrackFromPlaylist(track, selectedPlaylist)}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                        >
                          <Play size={16} />
                        </button>
                      </motion.div>
                    );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">
                    {language === 'es' ? 'Selecciona una lista de reproducción' :
                     language === 'en' ? 'Select a playlist' :
                     'Seleziona una playlist'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;
