import React from 'react';

interface MotivationalHintProps {
  guessCount: number;
  maxGuesses: number;
}

const MotivationalHint: React.FC<MotivationalHintProps> = ({ guessCount, maxGuesses }) => {
  // Solo mostramos pistas cuando el jugador está en la segunda mitad de sus intentos
  if (guessCount < Math.floor(maxGuesses / 2)) return null;
  
  const remainingGuesses = maxGuesses - guessCount;
  
  // Diferentes mensajes dependiendo de cuántos intentos quedan
  let message = '';
  let icon = '';
  
  if (remainingGuesses === 1) {
    message = '¡Último intento! ¡Piensa bien!';
    icon = '⚠️';
  } else if (remainingGuesses === 2) {
    message = '¡Casi! Solo te quedan 2 intentos';
    icon = '🔍';
  } else {
    message = `Te quedan ${remainingGuesses} intentos, ¡tú puedes!`;
    icon = '💪';
  }
  
  return (
    <div className="border-l-4 p-3 rounded-lg shadow-md mt-3 mb-4 flex items-center animate-fadeIn"
         style={{ 
           background: 'rgba(66, 196, 255, 0.25)', 
           backdropFilter: 'blur(6px)',
           borderColor: 'var(--gold-accent)' 
         }}>
      <span className="text-2xl mr-3">{icon}</span>
      <p className="font-medium" style={{ color: 'white' }}>{message}</p>
    </div>
  );
};

export default MotivationalHint;
