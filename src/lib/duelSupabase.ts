import { supabase } from './supabase';
import { Yokai, DuelState, DuelOpponent, DuelTurn, DuelResult, AIDifficulty } from '@/types/yokai';

/**
 * Crear un nuevo duelo en la base de datos
 */
export async function createDuelInDB(
  targetYokai: Yokai,
  opponentType: DuelOpponent,
  player1Name: string,
  player2Name: string,
  aiDifficulty?: AIDifficulty,
  roomCode?: string
): Promise<string | null> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se guardará el duelo en la base de datos');
      return null;
    }
    
    // Prepare the parameters for the RPC call
    const params: any = {
      target_yokai_id: targetYokai.id,
      opponent_type: opponentType,
      player1_name: player1Name,
      player2_name: player2Name
    };

    // Add optional parameters if provided
    if (aiDifficulty) {
      params.ai_difficulty = aiDifficulty;
    }

    if (roomCode) {
      params.room_code = roomCode;
    }

    const { data, error } = await supabase.rpc('create_duel', params);
    
    if (error) {
      console.error('Error al crear duelo en la base de datos:', error);
      return null;
    }
    
    return data as string;
  } catch (error) {
    console.error('Error inesperado al crear duelo:', error);
    return null;
  }
}

/**
 * Registrar un intento en un duelo
 */
export async function registerDuelGuess(
  duelId: string,
  player: 'player1' | 'player2',
  yokai: Yokai
): Promise<boolean> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se registrará el intento en la base de datos');
      return false;
    }
    
    const { data, error } = await supabase.rpc('register_duel_guess', {
      duel_id: duelId,
      player: player,
      yokai_id: yokai.id
    });
    
    if (error) {
      console.error('Error al registrar intento en la base de datos:', error);
      return false;
    }
    
    return data as boolean;
  } catch (error) {
    console.error('Error inesperado al registrar intento:', error);
    return false;
  }
}

/**
 * Obtener un duelo por su ID
 */
export async function getDuelById(duelId: string): Promise<DuelState | null> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se podrá obtener el duelo de la base de datos');
      return null;
    }
    
    // Obtener el duelo
    const { data: duelData, error: duelError } = await supabase
      .from('duels')
      .select('*, target_yokai:target_yokai_id(*)')
      .eq('id', duelId)
      .single();
    
    if (duelError || !duelData) {
      console.error('Error al obtener duelo:', duelError);
      return null;
    }
    
    // Obtener los intentos del jugador 1
    const { data: player1Guesses, error: player1Error } = await supabase
      .from('duel_guesses')
      .select('*, yokai:yokai_id(*)')
      .eq('duel_id', duelId)
      .eq('player', 'player1')
      .order('guess_number', { ascending: true });
    
    if (player1Error) {
      console.error('Error al obtener intentos del jugador 1:', player1Error);
      return null;
    }
    
    // Obtener los intentos del jugador 2
    const { data: player2Guesses, error: player2Error } = await supabase
      .from('duel_guesses')
      .select('*, yokai:yokai_id(*)')
      .eq('duel_id', duelId)
      .eq('player', 'player2')
      .order('guess_number', { ascending: true });
    
    if (player2Error) {
      console.error('Error al obtener intentos del jugador 2:', player2Error);
      return null;
    }
    
    // Mapear los datos al formato de DuelState
    const duelState: DuelState = {
      id: duelData.id,
      createdAt: duelData.created_at,
      targetYokai: duelData.target_yokai,
      opponentType: duelData.opponent_type,
      currentTurn: duelData.game_status === 'playing' 
        ? (duelData.current_turn || 'player1') as DuelTurn 
        : 'player1',
      player1Guesses: player1Guesses.map((guess: any) => guess.yokai),
      player2Guesses: player2Guesses.map((guess: any) => guess.yokai),
      maxGuesses: 6,
      gameStatus: duelData.game_status,
      player1Name: duelData.player1_name,
      player2Name: duelData.player2_name,
      lastAction: duelData.last_action || 'Duelo iniciado'
    };
    
    return duelState;
  } catch (error) {
    console.error('Error inesperado al obtener duelo:', error);
    return null;
  }
}

/**
 * Actualizar el estado de un duelo
 */
export async function updateDuelStatus(
  duelId: string,
  gameStatus: 'playing' | 'player1_won' | 'player2_won' | 'draw',
  currentTurn?: DuelTurn,
  lastAction?: string
): Promise<boolean> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se actualizará el estado del duelo en la base de datos');
      return false;
    }
    
    const updateData: any = { game_status: gameStatus };
    
    if (currentTurn) {
      updateData.current_turn = currentTurn;
    }
    
    if (lastAction) {
      updateData.last_action = lastAction;
    }
    
    const { error } = await supabase
      .from('duels')
      .update(updateData)
      .eq('id', duelId);
    
    if (error) {
      console.error('Error al actualizar estado del duelo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al actualizar estado del duelo:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de duelos para un jugador
 */
export async function getDuelStats(playerName: string): Promise<{
  totalPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
}> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se podrán obtener estadísticas de duelos');
      return { totalPlayed: 0, totalWins: 0, totalLosses: 0, winRate: 0 };
    }
    
    // Obtener total de duelos jugados como jugador 1
    const { data: player1Data, error: player1Error } = await supabase
      .from('duels')
      .select('id, game_status')
      .eq('player1_name', playerName)
      .neq('game_status', 'playing');
    
    if (player1Error) {
      console.error('Error al obtener estadísticas del jugador 1:', player1Error);
      return { totalPlayed: 0, totalWins: 0, totalLosses: 0, winRate: 0 };
    }
    
    // Obtener total de duelos jugados como jugador 2
    const { data: player2Data, error: player2Error } = await supabase
      .from('duels')
      .select('id, game_status')
      .eq('player2_name', playerName)
      .neq('game_status', 'playing');
    
    if (player2Error) {
      console.error('Error al obtener estadísticas del jugador 2:', player2Error);
      return { totalPlayed: 0, totalWins: 0, totalLosses: 0, winRate: 0 };
    }
    
    // Calcular estadísticas
    const player1Wins = player1Data.filter(d => d.game_status === 'player1_won').length;
    const player2Wins = player2Data.filter(d => d.game_status === 'player2_won').length;
    
    const totalWins = player1Wins + player2Wins;
    const totalPlayed = player1Data.length + player2Data.length;
    const totalLosses = totalPlayed - totalWins;
    const winRate = totalPlayed > 0 ? (totalWins / totalPlayed) * 100 : 0;
    
    return {
      totalPlayed,
      totalWins,
      totalLosses,
      winRate
    };
  } catch (error) {
    console.error('Error inesperado al obtener estadísticas de duelos:', error);
    return { totalPlayed: 0, totalWins: 0, totalLosses: 0, winRate: 0 };
  }
}

/**
 * Guardar un resultado de duelo
 */
export async function saveDuelResult(duelResult: DuelResult): Promise<boolean> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se guardará el resultado del duelo');
      return true;
    }
    
    // Generar un ID único para el duelo
    const duelId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Insertar el resultado del duelo
    const { error } = await supabase
      .from('duels')
      .insert({
        id: duelId,
        game_status: duelResult.winner === 'draw' ? 'draw' : `${duelResult.winner}_won`,
        winner: duelResult.winner,
        target_yokai_id: duelResult.targetYokai.id,
        duration_seconds: duelResult.duration,
        completed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error al guardar resultado del duelo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al guardar resultado del duelo:', error);
    return false;
  }
}

/**
 * Crea una nueva sala para duelos online
 */
export async function createDuelRoom(
  roomCode: string,
  hostId: string,
  hostName: string
): Promise<string | null> {
  try {
    // Verificar si supabase está disponible
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se creará la sala');
      return null;
    }
    
    const { data, error } = await supabase.rpc('create_duel_room', {
      room_code: roomCode,
      host_id: hostId,
      host_name: hostName
    });
    
    if (error) {
      console.error('Error al crear sala de duelo:', error);
      return null;
    }
    
    return data as string;
  } catch (error) {
    console.error('Error inesperado al crear sala:', error);
    return null;
  }
}

/**
 * Unirse a una sala existente
 */
export async function joinDuelRoom(
  roomCode: string,
  guestId: string,
  guestName: string
): Promise<string | null> {
  try {
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se podrá unir a la sala');
      return null;
    }
    
    const { data, error } = await supabase.rpc('join_duel_room', {
      room_code: roomCode,
      guest_id: guestId,
      guest_name: guestName
    });
    
    if (error) {
      console.error('Error al unirse a la sala:', error);
      return null;
    }
    
    return data as string;
  } catch (error) {
    console.error('Error inesperado al unirse a la sala:', error);
    return null;
  }
}

/**
 * Inicia un duelo desde una sala
 */
export async function startRoomDuel(
  roomCode: string,
  targetYokaiId: number,
  firstTurn: DuelTurn
): Promise<string | null> {
  try {
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se iniciará el duelo');
      return null;
    }
    
    const { data, error } = await supabase.rpc('start_room_duel', {
      room_code: roomCode,
      target_yokai_id: targetYokaiId,
      first_turn: firstTurn
    });
    
    if (error) {
      console.error('Error al iniciar el duelo en la sala:', error);
      return null;
    }
    
    return data as string;
  } catch (error) {
    console.error('Error inesperado al iniciar el duelo en la sala:', error);
    return null;
  }
}

/**
 * Actualiza la actividad de una sala
 */
export async function updateRoomActivity(
  roomCode: string,
  action: string
): Promise<boolean> {
  try {
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.warn('Supabase no está disponible, no se actualizará la actividad de la sala');
      return false;
    }
    
    const { data, error } = await supabase.rpc('update_room_activity', {
      room_code: roomCode,
      action: action
    });
    
    if (error) {
      console.error('Error al actualizar la actividad de la sala:', error);
      return false;
    }
    
    return data as boolean;
  } catch (error) {
    console.error('Error inesperado al actualizar la actividad de la sala:', error);
    return false;
  }
}

/**
 * Actualiza el estado completo de una partida multijugador
 */
export async function syncOnlineDuelState(
  roomCode: string,
  currentTurn: DuelTurn,
  player1Guesses: Yokai[],
  player2Guesses: Yokai[],
  gameStatus: 'playing' | 'player1_won' | 'player2_won' | 'draw',
  lastAction: string
): Promise<boolean> {
  try {
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se sincronizará el estado del duelo');
      return false;
    }
    
    // Primero actualizamos la actividad de la sala
    await updateRoomActivity(roomCode, lastAction);
    
    // Ahora almacenamos el estado completo de la partida en una tabla temporal
    // Usamos la técnica de upsert (insertar o actualizar si existe)
    const { error } = await supabase
      .from('duel_states')
      .upsert({
        room_code: roomCode,
        current_turn: currentTurn,
        player1_guesses: player1Guesses.map(y => y.id),
        player2_guesses: player2Guesses.map(y => y.id),
        game_status: gameStatus,
        last_action: lastAction,
        updated_at: new Date().toISOString()
      }, { onConflict: 'room_code' });
    
    if (error) {
      console.error('Error al sincronizar el estado del duelo:', error);
      // Si la tabla no existe, podríamos crearla automáticamente
      if (error.code === '42P01') { // Tabla no existe
        console.log('Creando tabla duel_states...');
        await supabase.rpc('create_duel_states_table');
        return syncOnlineDuelState(roomCode, currentTurn, player1Guesses, player2Guesses, gameStatus, lastAction);
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al sincronizar el estado del duelo:', error);
    return false;
  }
}

/**
 * Obtiene el estado completo de una partida multijugador
 */
export async function getOnlineDuelState(roomCode: string): Promise<{
  currentTurn: string;
  player1Guesses: number[];
  player2Guesses: number[];
  gameStatus: string;
  lastAction: string;
} | null> {
  try {
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se obtendrá el estado del duelo');
      return null;
    }
    
    const { data, error } = await supabase
      .from('duel_states')
      .select('*')
      .eq('room_code', roomCode)
      .single();
    
    if (error) {
      console.error('Error al obtener el estado del duelo:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      currentTurn: data.current_turn,
      player1Guesses: data.player1_guesses || [],
      player2Guesses: data.player2_guesses || [],
      gameStatus: data.game_status,
      lastAction: data.last_action
    };
  } catch (error) {
    console.error('Error inesperado al obtener el estado del duelo:', error);
    return null;
  }
}

/**
 * Obtiene información de una sala por su código
 */
export async function getRoomByCode(roomCode: string): Promise<any | null> {
  try {
    if (!supabase || typeof supabase.from !== 'function') {
      console.warn('Supabase no está disponible, no se podrá obtener la sala');
      return null;
    }
    
    const { data, error } = await supabase
      .from('duel_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();
    
    if (error || !data) {
      console.error('Error al obtener la sala:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error inesperado al obtener la sala:', error);
    return null;
  }
}

/**
 * Escucha cambios en una sala específica
 */
export function subscribeToRoom(roomCode: string, callback: (payload: any) => void): (() => void) | null {
  try {
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn('Supabase no está disponible, no se podrá suscribir a la sala');
      return null;
    }
    
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'duel_rooms',
        filter: `room_code=eq.${roomCode}`
      }, callback)
      .subscribe();
    
    // Retorna una función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('Error inesperado al suscribirse a la sala:', error);
    return null;
  }
}

/**
 * Escucha cambios en los intentos de un duelo específico
 */
export function subscribeToDuelGuesses(duelId: string, callback: (payload: any) => void): (() => void) | null {
  try {
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn('Supabase no está disponible, no se podrá suscribir a los intentos del duelo');
      return null;
    }
    
    const channel = supabase
      .channel(`duel:${duelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_guesses',
        filter: `duel_id=eq.${duelId}`
      }, callback)
      .subscribe();
    
    // Retorna una función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('Error inesperado al suscribirse a los intentos del duelo:', error);
    return null;
  }
}

/**
 * Genera un código aleatorio para una sala
 */
export function generateRoomCode(): string {
  // Generar un código de 6 caracteres alfanuméricos
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Implementa la lógica para que la IA haga una adivinanza según su dificultad
 */
export async function getAIGuess(
  difficulty: AIDifficulty,
  targetYokai: Yokai,
  previousGuesses: Yokai[]
): Promise<Yokai> {
  try {
    // Obtener todos los Yo-kai disponibles para adivinanzas
    const { data: allYokai, error } = await supabase
      .from('yokai')
      .select('*')
      .not('id', 'in', previousGuesses.map(y => y.id).join(','));
    
    if (error || !allYokai || allYokai.length === 0) {
      // Si hay un error, obtener un Yo-kai aleatorio
      const fallbackYokai = await getRandomYokai();
      if (!fallbackYokai) {
        throw new Error('No se pudo obtener un Yo-kai para la IA');
      }
      return fallbackYokai;
    }
    
    // Convertir los datos de Supabase a objetos Yokai
    const yokaiList = allYokai as Yokai[];
    
    switch (difficulty) {
      case 'easy':
        // En modo fácil, la IA elige completamente al azar
        return yokaiList[Math.floor(Math.random() * yokaiList.length)];
        
      case 'normal':
        // En modo normal, la IA tiene una pequeña probabilidad de adivinar correctamente
        // después de algunos intentos, y también intenta hacer adivinanzas más inteligentes
        if (previousGuesses.length >= 2 && Math.random() < 0.15) {
          // 15% de probabilidad de acertar después de 2 intentos
          return targetYokai;
        }
        
        // Intenta adivinar Yo-kai con características similares
        const similarYokai = yokaiList.filter(y => 
          y.tribe === targetYokai.tribe || 
          y.rank === targetYokai.rank ||
          y.element === targetYokai.element ||
          y.game === targetYokai.game
        );
        
        if (similarYokai.length > 0 && Math.random() < 0.6) {
          // 60% de probabilidad de elegir un Yo-kai con alguna característica similar
          return similarYokai[Math.floor(Math.random() * similarYokai.length)];
        }
        
        // De lo contrario, elige al azar
        return yokaiList[Math.floor(Math.random() * yokaiList.length)];
        
      case 'hard':
        // En modo difícil, la IA es mucho más inteligente
        if (previousGuesses.length >= 1 && Math.random() < 0.25) {
          // 25% de probabilidad de acertar después de solo 1 intento
          return targetYokai;
        }
        
        // Analizar las adivinanzas anteriores para hacer una elección más informada
        if (previousGuesses.length > 0) {
          // Crear un conjunto de características observadas en intentos anteriores
          const tribes = new Set<string>();
          const ranks = new Set<string>();
          const elements = new Set<string>();
          const games = new Set<string>();
          
          previousGuesses.forEach(guess => {
            tribes.add(guess.tribe);
            ranks.add(guess.rank);
            elements.add(guess.element);
            games.add(guess.game);
          });
          
          // Encontrar Yo-kai que coincidan con alguna característica del objetivo
          // pero que no coincidan con las características incorrectas ya intentadas
          const smartChoices = yokaiList.filter(y => {
            const tribeMatch = y.tribe === targetYokai.tribe && !tribes.has(y.tribe);
            const rankMatch = y.rank === targetYokai.rank && !ranks.has(y.rank);
            const elementMatch = y.element === targetYokai.element && !elements.has(y.element);
            const gameMatch = y.game === targetYokai.game && !games.has(y.game);
            
            return tribeMatch || rankMatch || elementMatch || gameMatch;
          });
          
          if (smartChoices.length > 0) {
            return smartChoices[Math.floor(Math.random() * smartChoices.length)];
          }
          
          // Si no hay opciones inteligentes, intentar con Yo-kai que tengan al menos una coincidencia
          const fallbackChoices = yokaiList.filter(y => 
            y.tribe === targetYokai.tribe || 
            y.rank === targetYokai.rank ||
            y.element === targetYokai.element ||
            y.game === targetYokai.game
          );
          
          if (fallbackChoices.length > 0) {
            return fallbackChoices[Math.floor(Math.random() * fallbackChoices.length)];
          }
        }
        
        // Si todo falla, elegir al azar
        return yokaiList[Math.floor(Math.random() * yokaiList.length)];
        
      default:
        return yokaiList[Math.floor(Math.random() * yokaiList.length)];
    }
  } catch (error) {
    console.error('Error al generar adivinanza de IA:', error);
    // En caso de error, obtener un Yo-kai aleatorio como fallback
    const fallbackYokai = await getRandomYokai();
    if (!fallbackYokai) {
      throw new Error('No se pudo obtener un Yo-kai para la IA');
    }
    return fallbackYokai;
  }
}

// Importamos getRandomYokai desde supabase.ts
import { getRandomYokai } from './supabase';