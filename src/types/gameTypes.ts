import { Yokai, GameMode } from './yokai';

export interface GameState {
  gameStatus: 'playing' | 'won' | 'lost';
  gameMode: GameMode;
  dailyYokai: Yokai;
  infiniteYokai?: Yokai;
  guesses: any[];
  // Añadir otras propiedades según sea necesario
}
