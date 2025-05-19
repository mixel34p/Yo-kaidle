import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#E63946', '#457B9D', '#A8DADC', '#FFD700', '#00FF7F'];
      const newPieces = [];
      
      for (let i = 0; i < 100; i++) {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${5 + Math.random() * 10}px`,
          height: `${5 + Math.random() * 10}px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          transform: `rotate(${Math.random() * 360}deg)`,
          opacity: Math.random(),
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${3 + Math.random() * 5}s`
        };
        
        newPieces.push(
          <div 
            key={i} 
            className="absolute rounded-sm animate-confetti"
            style={style}
          />
        );
      }
      
      setPieces(newPieces);
    } else {
      setPieces([]);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces}
    </div>
  );
};

export default Confetti;
