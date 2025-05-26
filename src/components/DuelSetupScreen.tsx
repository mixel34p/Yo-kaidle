import React, { useState, useEffect } from 'react';
import { DuelOpponent, AIDifficulty } from '@/types/yokai';
import { generateRoomCode, joinDuelRoom, getRoomByCode } from '@/lib/duelSupabase';

interface DuelSetupScreenProps {
  onStartDuel: (
    opponentType: DuelOpponent, 
    player1Name: string, 
    player2Name: string,
    aiDifficulty?: AIDifficulty,
    roomCode?: string
  ) => void;
}

export default function DuelSetupScreen({ onStartDuel }: DuelSetupScreenProps) {
  const [opponentType, setOpponentType] = useState<DuelOpponent>('ai');
  const [player1Name, setPlayer1Name] = useState('Jugador 1');
  const [player2Name, setPlayer2Name] = useState('Jugador 2');
  const [aiName, setAiName] = useState('Yo-kAI');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  
  // Estados para el modo online
  const [onlineMode, setOnlineMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  
  // Generar un código de sala al cargar el componente
  useEffect(() => {
    if (opponentType === 'online' && onlineMode === 'create' && !generatedCode) {
      setGeneratedCode(generateRoomCode());
    }
  }, [opponentType, onlineMode, generatedCode]);
  
  // Manejar la verificación y unión a una sala
  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setJoinError('Por favor, introduce un código de sala');
      return;
    }
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      // Verificar si la sala existe
      const room = await getRoomByCode(roomCode.trim().toUpperCase());
      
      if (!room) {
        setJoinError('La sala no existe o ya no está disponible');
        setIsJoining(false);
        return;
      }
      
      if (room.status !== 'waiting') {
        setJoinError('La sala ya no está disponible para unirse');
        setIsJoining(false);
        return;
      }
      
      // Todo correcto, continuar con el duelo
      setIsJoining(false);
      onStartDuel('online', player1Name.trim(), room.host_name, undefined, roomCode.trim().toUpperCase());
      
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      setJoinError('Error al intentar unirse a la sala');
      setIsJoining(false);
    }
  };
  
  const handleStartDuel = () => {
    // Validar nombres
    if (!player1Name.trim()) {
      alert('Por favor, introduce tu nombre');
      return;
    }
    
    if (opponentType === 'player' && !player2Name.trim()) {
      alert('Por favor, introduce el nombre del segundo jugador');
      return;
    }
    
    // Para el modo online con unión a sala
    if (opponentType === 'online') {
      if (onlineMode === 'join') {
        handleJoinRoom();
        return;
      } else {
        // Crear sala y comenzar
        onStartDuel('online', player1Name.trim(), 'Esperando...', undefined, generatedCode);
        return;
      }
    }
    
    // Iniciar duelo con la configuración seleccionada (local o IA)
    onStartDuel(
      opponentType, 
      player1Name.trim(), 
      opponentType === 'ai' ? aiName : player2Name.trim(),
      opponentType === 'ai' ? aiDifficulty : undefined
    );
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Configuración del Duelo</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Tu nombre:</label>
        <input
          type="text"
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tu nombre"
          maxLength={15}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Oponente:</label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setOpponentType('ai')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              opponentType === 'ai' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            IA
          </button>
          <button
            onClick={() => setOpponentType('player')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              opponentType === 'player' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Jugador
          </button>
          <button
            onClick={() => setOpponentType('online')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              opponentType === 'online' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Online
          </button>
        </div>
      </div>
      
      {opponentType === 'ai' && (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Nombre de la IA:</label>
            <input
              type="text"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la IA"
              maxLength={15}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Dificultad:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAiDifficulty('easy')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  aiDifficulty === 'easy' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fácil
              </button>
              <button
                onClick={() => setAiDifficulty('normal')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  aiDifficulty === 'normal' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setAiDifficulty('hard')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  aiDifficulty === 'hard' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Difícil
              </button>
            </div>
          </div>
        </>
      )}
      
      {opponentType === 'player' && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Nombre del segundo jugador:</label>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del jugador 2"
            maxLength={15}
          />
        </div>
      )}
      
      {opponentType === 'online' && (
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setOnlineMode('create')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                onlineMode === 'create' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Crear sala
            </button>
            <button
              onClick={() => setOnlineMode('join')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                onlineMode === 'join' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unirse
            </button>
          </div>
          
          {onlineMode === 'create' ? (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Código de sala:</label>
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <span className="font-mono text-lg font-bold text-blue-700">{generatedCode}</span>
                <span className="text-sm text-gray-500">Comparte este código</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Introduce el código de sala:</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABCDEF"
                maxLength={6}
              />
              {joinError && (
                <p className="mt-2 text-sm text-red-600">{joinError}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <button
          onClick={handleStartDuel}
          disabled={opponentType === 'online' && onlineMode === 'join' && isJoining}
          className={`w-full py-3 ${opponentType === 'online' && onlineMode === 'join' && isJoining ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors`}
        >
          {opponentType === 'online' && onlineMode === 'join' && isJoining 
            ? 'Uniéndose...' 
            : opponentType === 'online' && onlineMode === 'create' 
              ? 'Crear sala de duelo' 
              : opponentType === 'online' && onlineMode === 'join' 
                ? 'Unirse a la sala' 
                : 'Comenzar Duelo'
          }
        </button>
      </div>
    </div>
  );
}