import React, { useState } from 'react';
import { Yokai, DuelState } from '@/types/yokai';
import YokaiSearch from './YokaiSearch';
import YokaiRow from './YokaiRow';
import { compareYokai } from '@/utils/gameLogic';
import Confetti from './Confetti';

interface DuelBoardProps {
  duelState: DuelState;
  onMakeGuess: (yokai: Yokai) => void;
  onReset: () => void;
}

export default function DuelBoard({ duelState, onMakeGuess, onReset }: DuelBoardProps) {
  const [showTargetYokai, setShowTargetYokai] = useState(false);
  
  const isPlayer1Turn = duelState.currentTurn === 'player1';
  const isGameOver = duelState.gameStatus !== 'playing';
  const player1Won = duelState.gameStatus === 'player1_won';
  const player2Won = duelState.gameStatus === 'player2_won';
  
  const getGuessResults = (playerGuesses: Yokai[]) => {
    return playerGuesses.map(yokai => ({
      yokai,
      result: compareYokai(duelState.targetYokai, yokai)
    }));
  };
  
  const player1Results = getGuessResults(duelState.player1Guesses);
  const player2Results = getGuessResults(duelState.player2Guesses);
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Mensaje de estado */}
      <div className="mb-6 text-center">
        <div className="bg-blue-100 rounded-lg p-3 text-blue-800 inline-block">
          {isGameOver ? (
            player1Won ? (
              <span className="font-bold">{duelState.player1Name} ha ganado el duelo!</span>
            ) : player2Won ? (
              <span className="font-bold">{duelState.player2Name} ha ganado el duelo!</span>
            ) : (
              <span className="font-bold">¡Empate!</span>
            )
          ) : (
            <span>
              Turno de <span className="font-bold">{isPlayer1Turn ? duelState.player1Name : duelState.player2Name}</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Última acción */}
      <div className="mb-6 text-center text-sm text-gray-500">
        {duelState.lastAction}
      </div>
      
      {/* Tableros de juego */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tablero del Jugador 1 */}
        <div className={`bg-white rounded-xl shadow-md overflow-hidden p-4 ${isPlayer1Turn && !isGameOver ? 'ring-2 ring-blue-500' : ''}`}>
          <h3 className="text-lg font-semibold mb-3 text-center">{duelState.player1Name}</h3>
          
          <div className="mb-4 max-h-96 overflow-y-auto">
            {player1Results.length > 0 ? (
              player1Results.map((result, index) => (
                <div key={index} className="mb-2">
                  <YokaiRow yokai={result.yokai} result={result.result} />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">
                Aún no hay intentos
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {duelState.maxGuesses - duelState.player1Guesses.length} intentos restantes
          </div>
        </div>
        
        {/* Tablero del Jugador 2 */}
        <div className={`bg-white rounded-xl shadow-md overflow-hidden p-4 ${!isPlayer1Turn && !isGameOver ? 'ring-2 ring-blue-500' : ''}`}>
          <h3 className="text-lg font-semibold mb-3 text-center">{duelState.player2Name}</h3>
          
          <div className="mb-4 max-h-96 overflow-y-auto">
            {player2Results.length > 0 ? (
              player2Results.map((result, index) => (
                <div key={index} className="mb-2">
                  <YokaiRow yokai={result.yokai} result={result.result} />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">
                Aún no hay intentos
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {duelState.maxGuesses - duelState.player2Guesses.length} intentos restantes
          </div>
        </div>
      </div>
      
      {/* Buscador de Yo-kai */}
      {!isGameOver && (
        <div className="mb-8">
          <YokaiSearch 
            onSelect={onMakeGuess} 
            disabled={
              isGameOver || 
              (duelState.opponentType === 'ai' && !isPlayer1Turn) ||
              (isPlayer1Turn && duelState.player1Guesses.length >= duelState.maxGuesses) ||
              (!isPlayer1Turn && duelState.player2Guesses.length >= duelState.maxGuesses)
            } 
          />
        </div>
      )}
      
      {/* Acciones finales */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        {isGameOver && (
          <button
            onClick={() => setShowTargetYokai(!showTargetYokai)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showTargetYokai ? 'Ocultar Yo-kai objetivo' : 'Mostrar Yo-kai objetivo'}
          </button>
        )}
        
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          {isGameOver ? 'Nuevo duelo' : 'Abandonar duelo'}
        </button>
      </div>
      
      {/* Mostrar el Yo-kai objetivo */}
      {showTargetYokai && (
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold mb-3">El Yo-kai objetivo era:</h3>
          <div className="bg-white rounded-xl shadow-md p-4 inline-block">
            <div className="flex flex-col items-center">
              <img 
                src={duelState.targetYokai.imageurl || '/images/yokai-placeholder.png'} 
                alt={duelState.targetYokai.name}
                className="w-32 h-32 object-contain mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/yokai-placeholder.png';
                }}
              />
              <span className="text-lg font-semibold">{duelState.targetYokai.name}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Confetti cuando gana el jugador 1 */}
      {player1Won && <Confetti active={true} />}
    </div>
  );
}