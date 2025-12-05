'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Plus } from 'lucide-react';
import {
  Track,
  Playlist,
  JukeboxState,
  loadJukeboxState,
  saveJukeboxState,
  getPlaylistName,
  getTrackName
} from '@/utils/jukeboxManager';

interface PlaylistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ isOpen, onClose, track }) => {
  const { language } = useLanguage();
  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(loadJukeboxState());
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

  // Obtener todas las listas (favoritos + personalizadas)
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
    if (!newPlaylistName.trim() || !track) return;

    const newPlaylist: Playlist = {
      id: `custom_${Date.now()}`,
      name_es: newPlaylistName.trim(),
      name_en: newPlaylistName.trim(),
      name_it: newPlaylistName.trim(),
      tracks: [track.id],
      icon: '🎵',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    updateJukeboxState({
      customPlaylists: [...jukeboxState.customPlaylists, newPlaylist]
    });

    setNewPlaylistName('');
    setShowCreateForm(false);
    onClose();
  };

  // Añadir track a playlist existente
  const addToPlaylist = (playlist: Playlist) => {
    if (!track) return;

    if (playlist.id === 'favorites') {
      // Añadir a favoritos
      const newFavorites = jukeboxState.favoriteTracks.includes(track.id)
        ? jukeboxState.favoriteTracks
        : [...jukeboxState.favoriteTracks, track.id];
      
      updateJukeboxState({ favoriteTracks: newFavorites });
    } else {
      // Añadir a playlist personalizada
      const updatedPlaylists = jukeboxState.customPlaylists.map(p => {
        if (p.id === playlist.id) {
          const newTracks = p.tracks.includes(track.id) 
            ? p.tracks 
            : [...p.tracks, track.id];
          return { ...p, tracks: newTracks };
        }
        return p;
      });

      updateJukeboxState({ customPlaylists: updatedPlaylists });
    }

    onClose();
  };

  if (!isOpen || !track) return null;

  const allPlaylists = getAllPlaylists();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {language === 'es' ? 'Añadir a lista' : language === 'en' ? 'Add to playlist' : 'Aggiungi alla playlist'}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {getTrackName(track, language)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Formulario de crear lista */}
            {showCreateForm ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Nombre de la nueva lista...' : language === 'en' ? 'New playlist name...' : 'Nome nuova playlist...'}
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                  autoFocus
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
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {language === 'es' ? 'Crear nueva lista' : language === 'en' ? 'Create new playlist' : 'Crea nuova playlist'}
              </button>
            )}

            {/* Lista de playlists */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allPlaylists.map((playlist) => {
                const isTrackInPlaylist = playlist.id === 'favorites' 
                  ? jukeboxState.favoriteTracks.includes(track.id)
                  : playlist.tracks.includes(track.id);

                return (
                  <button
                    key={playlist.id}
                    onClick={() => addToPlaylist(playlist)}
                    disabled={isTrackInPlaylist}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                      isTrackInPlaylist
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-xl">{playlist.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {getPlaylistName(playlist, language)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {playlist.tracks.length} {language === 'es' ? 'canciones' : language === 'en' ? 'songs' : 'canzoni'}
                        {isTrackInPlaylist && (
                          <span className="ml-2 text-green-600">
                            ✓ {language === 'es' ? 'Ya añadida' : language === 'en' ? 'Already added' : 'Già aggiunta'}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlaylistSelector;
