'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MusicPreviewProps {
  trackId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Global audio manager to ensure only one preview plays at a time
class AudioPreviewManager {
  private static instance: AudioPreviewManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private listeners: Set<(trackId: string | null, isPlaying: boolean) => void> = new Set();

  static getInstance(): AudioPreviewManager {
    if (!AudioPreviewManager.instance) {
      AudioPreviewManager.instance = new AudioPreviewManager();
    }
    return AudioPreviewManager.instance;
  }

  addListener(callback: (trackId: string | null, isPlaying: boolean) => void) {
    this.listeners.add(callback);
  }

  removeListener(callback: (trackId: string | null, isPlaying: boolean) => void) {
    this.listeners.delete(callback);
  }

  private notifyListeners(trackId: string | null, isPlaying: boolean) {
    this.listeners.forEach(callback => callback(trackId, isPlaying));
  }

  async playPreview(trackId: string): Promise<boolean> {
    try {
      // Stop current audio if playing
      this.stopCurrent();

      // Create new audio element
      const audio = new Audio(`/music/previews/${trackId}.mp3`);
      audio.volume = 0.7;
      audio.currentTime = 0;

      // Set up event listeners
      audio.addEventListener('ended', () => {
        this.stopCurrent();
      });

      audio.addEventListener('error', () => {
        console.warn(`Preview not available for track: ${trackId}`);
        this.stopCurrent();
      });

      // Play the audio
      await audio.play();
      
      this.currentAudio = audio;
      this.currentTrackId = trackId;
      this.notifyListeners(trackId, true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (this.currentTrackId === trackId) {
          this.stopCurrent();
        }
      }, 30000);

      return true;
    } catch (error) {
      console.warn(`Failed to play preview for track: ${trackId}`, error);
      return false;
    }
  }

  stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    const wasPlaying = this.currentTrackId !== null;
    this.currentTrackId = null;
    
    if (wasPlaying) {
      this.notifyListeners(null, false);
    }
  }

  isPlaying(trackId: string): boolean {
    return this.currentTrackId === trackId;
  }

  getCurrentTrack(): string | null {
    return this.currentTrackId;
  }
}

export default function MusicPreview({ trackId, className = '', size = 'md', onPlayStateChange }: MusicPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioManager = useRef(AudioPreviewManager.getInstance());

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    md: {
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    lg: {
      button: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Listen to global audio state changes
  useEffect(() => {
    const handleAudioStateChange = (currentTrackId: string | null, playing: boolean) => {
      const isThisTrackPlaying = currentTrackId === trackId && playing;
      setIsPlaying(isThisTrackPlaying);
      setIsLoading(false);
      onPlayStateChange?.(isThisTrackPlaying);
    };

    audioManager.current.addListener(handleAudioStateChange);

    return () => {
      audioManager.current.removeListener(handleAudioStateChange);
    };
  }, [trackId, onPlayStateChange]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioManager.current.stopCurrent();
    } else {
      setIsLoading(true);
      const success = await audioManager.current.playPreview(trackId);
      if (!success) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`
          ${config.button} 
          rounded-full 
          flex items-center justify-center 
          transition-all duration-200 
          transform hover:scale-110
          ${isPlaying 
            ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25' 
            : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isPlaying ? 'Stop Preview' : 'Play Preview'}
      >
        {isLoading ? (
          <div className={`${config.icon} animate-spin border-2 border-white border-t-transparent rounded-full`} />
        ) : isPlaying ? (
          <Pause className={`${config.icon} text-white`} />
        ) : (
          <Play className={`${config.icon} text-white ml-0.5`} />
        )}
      </button>
      
      {size !== 'sm' && (
        <div className="flex items-center gap-1">
          <Volume2 className={`${config.icon} text-white/60`} />
          {isPlaying && (
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-2 bg-green-400 rounded animate-pulse" />
              <div className="w-1 h-3 bg-green-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-2 bg-green-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for managing music previews
export function useMusicPreview() {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioManager = useRef(AudioPreviewManager.getInstance());

  useEffect(() => {
    const handleAudioStateChange = (trackId: string | null, playing: boolean) => {
      setCurrentTrack(trackId);
      setIsPlaying(playing);
    };

    audioManager.current.addListener(handleAudioStateChange);

    return () => {
      audioManager.current.removeListener(handleAudioStateChange);
    };
  }, []);

  const playPreview = (trackId: string) => {
    return audioManager.current.playPreview(trackId);
  };

  const stopPreview = () => {
    audioManager.current.stopCurrent();
  };

  return {
    currentTrack,
    isPlaying,
    playPreview,
    stopPreview
  };
}
