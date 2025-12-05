'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Music, Library, List } from 'lucide-react';
import { Track } from '@/utils/jukeboxManager';
import MusicPlayer from './MusicPlayer';
import MusicLibrary from './MusicLibrary';
import PlaylistManager from './PlaylistManager';
import PlaylistSelector from './PlaylistSelector';

interface JukeboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'player' | 'library' | 'playlists';

const JukeboxPanel: React.FC<JukeboxPanelProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('player');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState<boolean>(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);

  // Manejar reproducción de track
  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setActiveTab('player'); // Cambiar a la pestaña del reproductor
  };

  // Manejar añadir a cola
  const handleAddToQueue = (track: Track) => {
    // TODO: Implementar lógica de cola
    console.log('Adding to queue:', track);
  };

  // Manejar añadir a playlist
  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrackForPlaylist(track);
    setShowPlaylistSelector(true);
  };

  if (!isOpen) return null;

  const tabs = [
    {
      id: 'player',
      name: language === 'es' ? 'Reproductor' : language === 'en' ? 'Player' : 'Lettore',
      icon: Music
    },
    {
      id: 'library',
      name: language === 'es' ? 'Biblioteca' : language === 'en' ? 'Library' : 'Biblioteca',
      icon: Library
    },
    {
      id: 'playlists',
      name: language === 'es' ? 'Listas' : language === 'en' ? 'Playlists' : 'Playlist',
      icon: List
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <img
                    src="/icons/menu/music.png"
                    alt="Music"
                    className="w-6 h-6"
                  />
                  {language === 'es' ? 'Jukebox Yo-kai' : language === 'en' ? 'Yo-kai Jukebox' : 'Jukebox Yo-kai'}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'es'
                    ? 'Disfruta de la música de Yo-kai Watch'
                    : language === 'en'
                    ? 'Enjoy Yo-kai Watch music'
                    : 'Goditi la musica di Yo-kai Watch'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === 'player' && (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="max-w-2xl mx-auto">
                      <MusicPlayer
                        onTrackChange={setCurrentTrack}
                        className="mb-6"
                      />

                      {/* Información adicional del track actual */}
                      {currentTrack && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {language === 'es' ? 'Acerca de esta canción' :
                             language === 'en' ? 'About this song' :
                             'Informazioni su questa canzone'}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">
                                {language === 'es' ? 'Juego:' : language === 'en' ? 'Game:' : 'Gioco:'}
                              </span> {currentTrack.game.toUpperCase()}
                            </p>
                            <p>
                              <span className="font-medium">
                                {language === 'es' ? 'Categoría:' : language === 'en' ? 'Category:' : 'Categoria:'}
                              </span> {currentTrack.category}
                            </p>
                            <p>
                              <span className="font-medium">
                                {language === 'es' ? 'Duración:' : language === 'en' ? 'Duration:' : 'Durata:'}
                              </span> {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
                            </p>
                            <p className="mt-3">
                              {currentTrack.description_es}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'library' && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <MusicLibrary
                    onPlayTrack={handlePlayTrack}
                    onAddToQueue={handleAddToQueue}
                    onAddToPlaylist={handleAddToPlaylist}
                  />
                </motion.div>
              )}

              {activeTab === 'playlists' && (
                <motion.div
                  key="playlists"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <PlaylistManager
                    onPlayTrack={handlePlayTrack}
                    onAddToQueue={handleAddToQueue}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer con información */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <img
                  src="/icons/menu/music.png"
                  alt="Music"
                  className="w-4 h-4"
                />
                {language === 'es'
                  ? 'Desbloquea más música completando logros y círculos'
                  : language === 'en'
                  ? 'Unlock more music by completing achievements and circles'
                  : 'Sblocca più musica completando obiettivi e cerchi'
                }
              </p>
            </div>
          </div>

          {/* Selector de Playlist */}
          <PlaylistSelector
            isOpen={showPlaylistSelector}
            onClose={() => {
              setShowPlaylistSelector(false);
              setSelectedTrackForPlaylist(null);
            }}
            track={selectedTrackForPlaylist}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JukeboxPanel;
