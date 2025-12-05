// Gestor de audio para el sistema de jukebox
// Maneja la reproducción, pausa, volumen y eventos de audio

import { Track, RepeatMode } from './jukeboxManager';

export class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onTrackEndCallback: (() => void) | null = null;
  private onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    if (!this.audio) return;

    // Actualización de tiempo
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback && this.audio) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    // Fin de la canción
    this.audio.addEventListener('ended', () => {
      if (this.onTrackEndCallback) {
        this.onTrackEndCallback();
      }
      if (this.onPlayStateChangeCallback) {
        this.onPlayStateChangeCallback(false);
      }
    });

    // Cambios en el estado de reproducción
    this.audio.addEventListener('play', () => {
      if (this.onPlayStateChangeCallback) {
        this.onPlayStateChangeCallback(true);
      }
    });

    this.audio.addEventListener('pause', () => {
      if (this.onPlayStateChangeCallback) {
        this.onPlayStateChangeCallback(false);
      }
    });

    // Manejo de errores
    this.audio.addEventListener('error', (e) => {
      console.error('Error de audio:', e);
      if (this.onPlayStateChangeCallback) {
        this.onPlayStateChangeCallback(false);
      }
    });

    // Cuando los metadatos están cargados
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onTimeUpdateCallback && this.audio) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
    });
  }

  // Cargar y reproducir un track
  async loadTrack(track: Track, usePreview: boolean = false): Promise<void> {
    if (!this.audio) return;

    try {
      this.currentTrack = track;
      const audioSrc = usePreview ? track.preview : track.file;
      
      // Si es la misma fuente, no recargar
      if (this.audio.src !== audioSrc) {
        this.audio.src = audioSrc;
        await new Promise((resolve, reject) => {
          if (!this.audio) return reject(new Error('Audio not available'));
          
          const onCanPlay = () => {
            this.audio!.removeEventListener('canplay', onCanPlay);
            this.audio!.removeEventListener('error', onError);
            resolve(void 0);
          };
          
          const onError = () => {
            this.audio!.removeEventListener('canplay', onCanPlay);
            this.audio!.removeEventListener('error', onError);
            reject(new Error('Failed to load audio'));
          };
          
          this.audio.addEventListener('canplay', onCanPlay);
          this.audio.addEventListener('error', onError);
          this.audio.load();
        });
      }
    } catch (error) {
      console.error('Error loading track:', error);
      throw error;
    }
  }

  // Reproducir
  async play(): Promise<void> {
    if (!this.audio) return;
    
    try {
      await this.audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  // Pausar
  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  // Alternar reproducción/pausa
  async togglePlayPause(): Promise<void> {
    if (!this.audio) return;
    
    if (this.audio.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }

  // Establecer volumen (0.0 - 1.0)
  setVolume(volume: number): void {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  // Obtener volumen actual
  getVolume(): number {
    return this.audio?.volume || 0;
  }

  // Buscar posición en la canción (en segundos)
  seek(time: number): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, time));
  }

  // Obtener tiempo actual
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  // Obtener duración total
  getDuration(): number {
    return this.audio?.duration || 0;
  }

  // Verificar si está reproduciendo
  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  // Obtener track actual
  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  // Establecer callback para actualización de tiempo
  onTimeUpdate(callback: (time: number, duration: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  // Establecer callback para fin de track
  onTrackEnd(callback: () => void): void {
    this.onTrackEndCallback = callback;
  }

  // Establecer callback para cambios de estado de reproducción
  onPlayStateChange(callback: (isPlaying: boolean) => void): void {
    this.onPlayStateChangeCallback = callback;
  }

  // Limpiar recursos
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentTrack = null;
    this.onTimeUpdateCallback = null;
    this.onTrackEndCallback = null;
    this.onPlayStateChangeCallback = null;
  }

  // Formatear tiempo en formato MM:SS
  static formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Verificar si el navegador soporta el formato de audio
  static canPlayType(type: string): boolean {
    if (typeof window === 'undefined') return false;
    const audio = new Audio();
    return audio.canPlayType(type) !== '';
  }

  // Precargar un track (sin reproducir)
  async preloadTrack(track: Track, usePreview: boolean = false): Promise<void> {
    if (!this.audio) return;

    try {
      const audioSrc = usePreview ? track.preview : track.file;
      
      // Crear un nuevo elemento audio para precargar
      const preloadAudio = new Audio();
      preloadAudio.preload = 'metadata';
      preloadAudio.src = audioSrc;
      
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          preloadAudio.removeEventListener('canplay', onCanPlay);
          preloadAudio.removeEventListener('error', onError);
          resolve(void 0);
        };
        
        const onError = () => {
          preloadAudio.removeEventListener('canplay', onCanPlay);
          preloadAudio.removeEventListener('error', onError);
          reject(new Error('Failed to preload audio'));
        };
        
        preloadAudio.addEventListener('canplay', onCanPlay);
        preloadAudio.addEventListener('error', onError);
        preloadAudio.load();
      });
      
      console.log(`🎵 Track precargado: ${track.title_es}`);
    } catch (error) {
      console.error('Error preloading track:', error);
    }
  }
}

// Instancia singleton del gestor de audio
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

// Limpiar la instancia (útil para testing o cleanup)
export function destroyAudioManager(): void {
  if (audioManagerInstance) {
    audioManagerInstance.destroy();
    audioManagerInstance = null;
  }
}
