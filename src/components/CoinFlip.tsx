import React, { useState, useEffect } from 'react';

interface CoinFlipProps {
  onChoice: (choice: 'cara' | 'cruz') => void;
  result: 'player1' | 'player2' | null;
  playerChoice: 'cara' | 'cruz' | null;
  player1Name: string;
  player2Name: string;
}

export default function CoinFlip({ 
  onChoice, 
  result,
  playerChoice,
  player1Name,
  player2Name
}: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [choiceSelected, setChoiceSelected] = useState(false);
  
  // Iniciar la animación de la moneda cuando se selecciona cara o cruz
  useEffect(() => {
    if (playerChoice && !result) {
      setIsFlipping(true);
      
      // Simular el tiempo de la animación
      const flipTimer = setTimeout(() => {
        setIsFlipping(false);
      }, 2000);
      
      return () => clearTimeout(flipTimer);
    }
  }, [playerChoice, result]);
  
  const handleChoice = (choice: 'cara' | 'cruz') => {
    setChoiceSelected(true);
    onChoice(choice);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">¿Quién empieza?</h2>
      
      {!choiceSelected ? (
        <>
          <p className="mb-4">Elige cara o cruz para decidir quién comienza:</p>
          
          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => handleChoice('cara')}
              className="py-3 px-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Cara
            </button>
            <button
              onClick={() => handleChoice('cruz')}
              className="py-3 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cruz
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4">
            {player1Name} eligió: <span className="font-semibold">{playerChoice === 'cara' ? 'Cara' : 'Cruz'}</span>
          </p>
          
          <div className="my-8 flex justify-center">
            <div 
              className={`coin ${isFlipping ? 'flipping' : ''} ${result && playerChoice === 'cara' === (result === 'player1') ? 'heads' : 'tails'}`}
              style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 2s ease-out',
                transform: isFlipping ? 'rotateY(720deg)' : 'rotateY(0deg)'
              }}
            >
              <div 
                className="coin-side heads"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#f9d71c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  color: '#8B6E00',
                  border: '4px solid #FFB700',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                }}
              >
                CARA
              </div>
              <div 
                className="coin-side tails"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: '#c0c0c0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  color: '#444',
                  transform: 'rotateY(180deg)',
                  border: '4px solid #A0A0A0',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                }}
              >
                CRUZ
              </div>
            </div>
          </div>
          
          {result && (
            <div className="mt-6">
              <p className="text-xl font-semibold">
                {result === 'player1' ? (
                  <>Salió {playerChoice}. <span className="text-green-600">{player1Name} comienza</span></>
                ) : (
                  <>Salió {playerChoice === 'cara' ? 'cruz' : 'cara'}. <span className="text-green-600">{player2Name} comienza</span></>
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}