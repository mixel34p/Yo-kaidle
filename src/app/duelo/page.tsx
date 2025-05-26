'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Yokai, DuelOpponent, DuelState, DuelTurn, AIDifficulty } from '@/types/yokai';
import { getRandomYokai } from '@/lib/supabase';
import { 
  createDuelRoom, 
  joinDuelRoom, 
  updateRoomActivity, 
  getRoomByCode,
  subscribeToRoom,
  getAIGuess,
  syncOnlineDuelState,
  getOnlineDuelState
} from '@/lib/duelSupabase';
import { supabase } from '@/lib/supabase';
import DuelSetupScreen from '../../components/DuelSetupScreen';
import DuelBoard from '../../components/DuelBoard';
import CoinFlip from '../../components/CoinFlip';
export default function DueloPage() {
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState(false);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [coinResult, setCoinResult] = useState<'player1' | 'player2' | null>(null);
  const [playerChoice, setPlayerChoice] = useState<'cara' | 'cruz' | null>(null);
  
  // Inicializar un nuevo duelo
  const initializeDuel = async (
    opponentType: DuelOpponent, 
    player1Name: string, 
    player2Name: string,
    aiDifficulty?: AIDifficulty,
    roomCode?: string
  ) => {
    setLoading(true);
    
    try {
      // Obtener un Yo-kai aleatorio para el duelo
      const randomYokai = await getRandomYokai();
      
      if (!randomYokai) {
        throw new Error('No se pudo obtener un Yo-kai para el duelo');
      }
      
      // Si es modo online y se proporciona un código de sala
      if (opponentType === 'online' && roomCode) {
        // Crear una sala o unirse a ella según corresponda
        const isCreating = player2Name === 'Esperando...';
        
        if (isCreating) {
          // Generar un ID de sesión temporal para el host
          const sessionId = `host-${Math.random().toString(36).substring(2, 9)}`;
          
          // Crear una sala nueva
          await createDuelRoom(roomCode, sessionId, player1Name);
          
          // Crear el estado inicial con isHost=true
          const newDuelState: DuelState = {
            id: roomCode, // Usamos el código de sala como ID para el estado local
            createdAt: new Date().toISOString(),
            targetYokai: randomYokai,
            opponentType,
            currentTurn: 'player1',
            player1Guesses: [],
            player2Guesses: [],
            maxGuesses: 6,
            gameStatus: 'playing',
            player1Name,
            player2Name,
            lastAction: 'Esperando a que otro jugador se una a la sala',
            roomCode,
            isHost: true,
            lastUpdated: new Date().toISOString()
          };
          
          setDuelState(newDuelState);
          localStorage.setItem('currentDuel', JSON.stringify(newDuelState));
          setSetupComplete(true);
          return;
        }
        
        // Si estamos uniéndonos a una sala
        const sessionId = `guest-${Math.random().toString(36).substring(2, 9)}`;
        
        // Unirse a la sala
        await joinDuelRoom(roomCode, sessionId, player1Name);
        
        // Crear el estado inicial con isHost=false
        const newDuelState: DuelState = {
          id: roomCode,
          createdAt: new Date().toISOString(),
          targetYokai: randomYokai, // Esto se actualizará cuando comience el duelo
          opponentType,
          currentTurn: 'player1',
          player1Guesses: [],
          player2Guesses: [],
          maxGuesses: 6,
          gameStatus: 'playing',
          player1Name: player2Name, // El host es player1
          player2Name: player1Name, // El invitado es player2
          lastAction: 'Te has unido a la sala. Esperando a que el anfitrión inicie el duelo.',
          roomCode,
          isHost: false,
          lastUpdated: new Date().toISOString()
        };
        
        setDuelState(newDuelState);
        localStorage.setItem('currentDuel', JSON.stringify(newDuelState));
        setSetupComplete(true);
        return;
      }
      
      // Para duelos locales (IA o jugador local)
      const newDuelState: DuelState = {
        id: Math.random().toString(36).substring(2, 9), // ID simple para localStorage
        createdAt: new Date().toISOString(),
        targetYokai: randomYokai,
        opponentType,
        currentTurn: 'player1', // Se decidirá con la moneda
        player1Guesses: [],
        player2Guesses: [],
        maxGuesses: 6,
        gameStatus: 'playing',
        player1Name,
        player2Name,
        lastAction: 'Duelo iniciado',
        aiDifficulty: aiDifficulty || 'normal'
      };
      
      setDuelState(newDuelState);
      setShowCoinFlip(true);
      
      // Guardar en localStorage para recuperarlo si se recarga la página
      localStorage.setItem('currentDuel', JSON.stringify(newDuelState));
    } catch (error) {
      console.error('Error al inicializar el duelo:', error);
      alert('Hubo un error al iniciar el duelo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Realizar el lanzamiento de moneda para determinar quién empieza
  const handleCoinFlip = (choice: 'cara' | 'cruz') => {
    setPlayerChoice(choice);
    
    // Simular lanzamiento de moneda (50% de probabilidad)
    const result = Math.random() > 0.5 ? 'cara' : 'cruz';
    const winner = result === choice ? 'player1' : 'player2';
    
    setCoinResult(winner);
    
    // Actualizar el estado del duelo con el jugador que empieza
    if (duelState) {
      const updatedDuelState = {
        ...duelState,
        currentTurn: winner as DuelTurn,
        lastAction: `${winner === 'player1' ? duelState.player1Name : duelState.player2Name} ganó el lanzamiento de moneda y comienza el duelo`
      };
      
      setDuelState(updatedDuelState);
      localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
      
      // Cerrar la animación de la moneda después de 3 segundos
      setTimeout(() => {
        setShowCoinFlip(false);
        setSetupComplete(true);
      }, 3000);
    }
  };
  
  // Hacer una adivinanza en el duelo
  const makeGuess = async (yokai: Yokai) => {
    if (!duelState || duelState.gameStatus !== 'playing') return;
    
    // Para duelos online, verificar si es tu turno
    if (duelState.opponentType === 'online') {
      const isPlayer1 = duelState.isHost;
      const isMyTurn = (isPlayer1 && duelState.currentTurn === 'player1') || 
                      (!isPlayer1 && duelState.currentTurn === 'player2');
      
      if (!isMyTurn) {
        alert('No es tu turno. Espera a que el otro jugador haga su adivinanza.');
        return;
      }
    }
    
    const isPlayer1Turn = duelState.currentTurn === 'player1';
    const currentPlayerGuesses = isPlayer1Turn ? [...duelState.player1Guesses] : [...duelState.player2Guesses];
    
    // Verificar si ya se ha adivinado este Yo-kai
    if (currentPlayerGuesses.some(g => g.id === yokai.id)) {
      alert('Ya has intentado con este Yo-kai');
      return;
    }
    
    // Agregar la adivinanza
    if (isPlayer1Turn) {
      currentPlayerGuesses.push(yokai);
    } else {
      currentPlayerGuesses.push(yokai);
    }
    
    // Verificar si el jugador ha ganado
    let newGameStatus: 'playing' | 'player1_won' | 'player2_won' | 'draw' = duelState.gameStatus;
    if (yokai.id === duelState.targetYokai.id) {
      // El jugador actual ha adivinado correctamente, actualizamos el estado del juego
      newGameStatus = isPlayer1Turn ? 'player1_won' : 'player2_won';
    }
    
    // Cambiar el turno si el juego sigue en curso
    const newTurn = isPlayer1Turn ? 'player2' : 'player1';
    
    // Actualizar el estado del duelo
    const updatedDuelState: DuelState = {
      ...duelState,
      player1Guesses: isPlayer1Turn ? currentPlayerGuesses : duelState.player1Guesses,
      player2Guesses: !isPlayer1Turn ? currentPlayerGuesses : duelState.player2Guesses,
      currentTurn: newGameStatus === 'playing' ? newTurn : duelState.currentTurn,
      gameStatus: newGameStatus,
      lastAction: `${isPlayer1Turn ? duelState.player1Name : duelState.player2Name} adivinó con ${yokai.name}`,
      lastUpdated: new Date().toISOString()
    };
    
    // Si es un duelo online, sincronizar el estado completo
    if (duelState.opponentType === 'online' && duelState.roomCode) {
      try {
        await syncOnlineDuelState(
          duelState.roomCode,
          updatedDuelState.currentTurn,
          updatedDuelState.player1Guesses,
          updatedDuelState.player2Guesses,
          updatedDuelState.gameStatus,
          updatedDuelState.lastAction
        );
        console.log('Estado del duelo sincronizado correctamente');
      } catch (error) {
        console.error('Error al sincronizar estado del duelo:', error);
      }
    }
    
    setDuelState(updatedDuelState);
    localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
    
    // Si es contra la IA y ahora es el turno de la IA, hacer la adivinanza de la IA
    if (updatedDuelState.opponentType === 'ai' && updatedDuelState.currentTurn === 'player2' && updatedDuelState.gameStatus === 'playing') {
      // Simular "pensamiento" de la IA
      setTimeout(() => {
        makeAIGuess(updatedDuelState);
      }, 1500);
    }
  };
  
  // Lógica para la adivinanza de la IA
  const makeAIGuess = async (currentDuelState: DuelState) => {
    try {
      // Obtener una adivinanza de la IA según su dificultad
      const difficulty = currentDuelState.aiDifficulty || 'normal';
      const aiYokai = await getAIGuess(
        difficulty,
        currentDuelState.targetYokai,
        currentDuelState.player2Guesses
      );
      
      // Hacer la adivinanza de la IA
      const aiGuesses = [...currentDuelState.player2Guesses, aiYokai];
      
      // Verificar si la IA ha ganado
      let newGameStatus: 'playing' | 'player1_won' | 'player2_won' | 'draw' = currentDuelState.gameStatus;
      if (aiYokai.id === currentDuelState.targetYokai.id) {
        newGameStatus = 'player2_won';
      }
      
      // Actualizar el estado del duelo
      const updatedDuelState: DuelState = {
        ...currentDuelState,
        player2Guesses: aiGuesses,
        currentTurn: 'player1', // Devolver el turno al jugador
        gameStatus: newGameStatus,
        lastAction: `${currentDuelState.player2Name} adivinó con ${aiYokai.name}`
      };
      
      setDuelState(updatedDuelState);
      localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
    } catch (error) {
      console.error('Error en la adivinanza de la IA:', error);
    }
  };
  
  // Reiniciar el duelo
  const resetDuel = () => {
    localStorage.removeItem('currentDuel');
    setDuelState(null);
    setSetupComplete(false);
    setShowCoinFlip(false);
    setCoinResult(null);
    setPlayerChoice(null);
  };
  
  // Función para manejar actualizaciones en tiempo real de la sala
  const handleRoomUpdate = async (duelState: DuelState) => {
    if (!duelState || !duelState.roomCode) return;
    
    try {
      // Obtener el estado actual de la sala
      const room = await getRoomByCode(duelState.roomCode);
      
      if (!room) {
        console.error('No se pudo obtener información de la sala');
        return;
      }
      
      // Si eres el anfitrión y hay un invitado, actualizar el nombre del invitado
      if (duelState.isHost && room.guest_name && duelState.player2Name === 'Esperando...') {
        const updatedDuelState = {
          ...duelState,
          player2Name: room.guest_name,
          lastAction: `${room.guest_name} se ha unido a la sala`,
          lastUpdated: new Date().toISOString()
        };
        
        setDuelState(updatedDuelState);
        localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
      }
      
      // Obtener el estado sincronizado del duelo
      const onlineState = await getOnlineDuelState(duelState.roomCode);
      
      if (onlineState) {
        console.log('Estado recibido:', onlineState);
        
        // Necesitamos convertir los IDs de Yo-kai en objetos completos
        let player1Guesses = [...duelState.player1Guesses];
        let player2Guesses = [...duelState.player2Guesses];
        
        // Solo actualizamos si hay cambios en las adivinanzas
        if (onlineState.player1Guesses.length !== player1Guesses.length) {
          // Necesitamos cargar los nuevos Yo-kai
          const newGuessIds = onlineState.player1Guesses.filter(
            id => !player1Guesses.some(y => y.id === id)
          );
          
          // Para cada nuevo ID, necesitamos obtener el Yo-kai completo
          for (const id of newGuessIds) {
            try {
              // Obtener detalles del Yo-kai por su ID (simulado con una búsqueda)
              const { data } = await supabase
                .from('yokai')
                .select('*')
                .eq('id', id)
                .single();
              
              if (data) {
                player1Guesses.push(data as Yokai);
              }
            } catch (err) {
              console.error('Error al cargar Yo-kai:', err);
            }
          }
        }
        
        if (onlineState.player2Guesses.length !== player2Guesses.length) {
          // Necesitamos cargar los nuevos Yo-kai
          const newGuessIds = onlineState.player2Guesses.filter(
            id => !player2Guesses.some(y => y.id === id)
          );
          
          // Para cada nuevo ID, necesitamos obtener el Yo-kai completo
          for (const id of newGuessIds) {
            try {
              // Obtener detalles del Yo-kai por su ID
              const { data } = await supabase
                .from('yokai')
                .select('*')
                .eq('id', id)
                .single();
              
              if (data) {
                player2Guesses.push(data as Yokai);
              }
            } catch (err) {
              console.error('Error al cargar Yo-kai:', err);
            }
          }
        }
        
        // Actualizar el estado con la información sincronizada
        const updatedDuelState = {
          ...duelState,
          currentTurn: onlineState.currentTurn as DuelTurn,
          player1Guesses: player1Guesses,
          player2Guesses: player2Guesses,
          gameStatus: onlineState.gameStatus as 'playing' | 'player1_won' | 'player2_won' | 'draw',
          lastAction: onlineState.lastAction,
          lastUpdated: new Date().toISOString()
        };
        
        setDuelState(updatedDuelState);
        localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
        return;
      }
      
      // Si no hay estado online, al menos actualizamos la última acción
      if (room.last_action && room.last_action !== duelState.lastAction) {
        const updatedDuelState = {
          ...duelState,
          lastAction: room.last_action,
          lastUpdated: new Date().toISOString()
        };
        
        setDuelState(updatedDuelState);
        localStorage.setItem('currentDuel', JSON.stringify(updatedDuelState));
      }
    } catch (error) {
      console.error('Error al manejar actualización de la sala:', error);
    }
  };
  
  // Cargar el duelo guardado al iniciar
  useEffect(() => {
    const savedDuel = localStorage.getItem('currentDuel');
    
    if (savedDuel) {
      try {
        const parsedDuel = JSON.parse(savedDuel) as DuelState;
        setDuelState(parsedDuel);
        setSetupComplete(true);
        
        // Si es un duelo online, configurar la suscripción en tiempo real
        if (parsedDuel.opponentType === 'online' && parsedDuel.roomCode) {
          handleRoomUpdate(parsedDuel);
        }
      } catch (error) {
        console.error('Error al cargar el duelo guardado:', error);
        localStorage.removeItem('currentDuel');
      }
    }
    
    setLoading(false);
  }, []);
  
  // Configurar la suscripción en tiempo real para salas online
  useEffect(() => {
    if (!duelState || duelState.opponentType !== 'online' || !duelState.roomCode) return;
    
    // Configurar la suscripción a cambios en la sala
    const unsubscribe = subscribeToRoom(duelState.roomCode, (payload) => {
      console.log('Actualización de la sala:', payload);
      handleRoomUpdate(duelState);
    });
    
    // Limpiar la suscripción al desmontar
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [duelState?.roomCode, duelState?.opponentType]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {!setupComplete && !showCoinFlip && (
        <div>
          <h1 className="text-3xl font-bold text-center mb-6">Duelo de Yo-kai</h1>
          <DuelSetupScreen onStartDuel={initializeDuel} />
        </div>
      )}
      
      {showCoinFlip && duelState && (
        <CoinFlip 
          onChoice={handleCoinFlip} 
          result={coinResult} 
          playerChoice={playerChoice} 
          player1Name={duelState.player1Name}
          player2Name={duelState.player2Name}
        />
      )}
      
      {setupComplete && duelState && (
        <>
          {duelState.opponentType === 'online' && (
            <div className="mb-4 p-3 bg-blue-100 rounded-lg text-center">
              <p className="font-semibold">
                Código de sala: <span className="font-mono bg-white px-2 py-1 rounded">{duelState.roomCode}</span>
              </p>
              <p className="text-sm mt-1">
                {duelState.isHost ? 'Eres el anfitrión de esta sala' : 'Te has unido a esta sala'}
              </p>
              <p className="text-sm mt-1">
                {duelState.currentTurn === 'player1' ? 
                  `Turno de ${duelState.player1Name}` : 
                  `Turno de ${duelState.player2Name}`
                }
                {((duelState.isHost && duelState.currentTurn === 'player1') || 
                 (!duelState.isHost && duelState.currentTurn === 'player2')) ? 
                  ' (tu turno)' : ''
                }
              </p>
            </div>
          )}
          <DuelBoard 
            duelState={duelState} 
            onMakeGuess={makeGuess} 
            onReset={resetDuel}
          />
        </>
      )}
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}