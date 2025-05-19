'use client';

import React from 'react';
import { cleanWikiImageUrl } from '@/lib/supabase';
import YokaiCell from './YokaiCell';
import { Yokai, GuessResult, tribeTranslations, tribeIcons, elementTranslations, elementColors, elementIcons, gameLogos, rankIcons, rankColors, foodTranslations, foodIcons } from '@/types/yokai';

interface YokaiRowProps {
  yokai: Yokai;
  result?: GuessResult;
  guessIndex?: number;
  foodIconTimestamp?: number;
}

// Normaliza y valida la clave de comida favorita para acceder a los iconos y traducciones de forma type-safe
import type { FavoriteFood } from '@/types/yokai';

const VALID_FOODS: FavoriteFood[] = [
  'Rice Balls','Bread','Candy','Milk','Juice','Hamburgers','Chinese Food','Ramen','Veggies','Meat','Seafood','Sushi','Curry','Sweets','Doughnuts','Donuts','Oden','Soba','Snacks','Chocobars','Ice Cream','Pizza','Hot Dogs','Pasta','Tempura','Sushi-Tempura','Sukiyaki','None'
];

function normalizeFoodKey(food: string): FavoriteFood {
  if (!food) return 'None';
  // Normalizar espacios, mayúsculas y guiones
  const normalized = food
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^| )\w/g, s => s.toUpperCase());
  // Buscar coincidencia exacta en el array de claves válidas
  const match = VALID_FOODS.find(f => f.toLowerCase() === normalized.toLowerCase());
  return match || 'None';
}

function getYokaiImageUrl(yokai: Yokai): string {
  const url = yokai.image_url || yokai.imageurl || yokai.img || yokai.image || '';
  return cleanWikiImageUrl(url);
}

const YokaiRow: React.FC<YokaiRowProps> = ({ yokai, result, guessIndex, foodIconTimestamp = Date.now() }) => {
  // Imprimir valores para diagnosticar el problema con la comida favorita
  // Mostrar esta información cuando sea una fila del Wordle (con resultado)
  if (result) {
    // Soporta tanto favoriteFood (camelCase) como favorite_food (snake_case)
    const original = (yokai.favoriteFood || (yokai as any).favorite_food) as string;
    const normalized = normalizeFoodKey(original);
    const exactMatch = VALID_FOODS.includes(normalized);
    // Buscar sugerencia solo si original es string válido
    let suggestion = 'Ninguna';
    if (typeof original === 'string' && original.trim().length > 0) {
      suggestion = VALID_FOODS.find(f => f.toLowerCase().includes(original.toLowerCase().replace(/[-_]/g, ' ').trim())) || 'Ninguna';
    }
    console.log('DATOS DE FILA EN WORDLE:', {
      nombreYokai: yokai.name,
      comidaFavoritaOriginal: original,
      comidaFavoritaNormalizada: normalized,
      matchExacto: exactMatch,
      sugerencia: suggestion || 'Ninguna',
      tieneIcono: Boolean(foodIcons[normalized]),
      rutaIcono: foodIcons[normalized] || 'No hay ruta',
      resultadoComida: result.favoriteFood,  // debería ser 'correct' o 'incorrect'
      traduccionComida: foodTranslations[normalized] || 'Sin traducción',
      validFoods: VALID_FOODS
    });
  }
  
  if (!result) {
    // Si no hay resultado, mostrar todas las celdas con estado 'default'
    return (
      <div className="yokai-row">
        <YokaiCell 
          value={yokai.name} 
          status="default" 
          iconUrl={getYokaiImageUrl(yokai)} 
          isYokai={true} // Añadimos esta propiedad para indicar que es una imagen de Yo-kai
        />
        <YokaiCell 
          value={tribeTranslations[yokai.tribe]} 
          status="default" 
          iconUrl={tribeIcons[yokai.tribe]}
          isTribe={true}
        />
        <YokaiCell 
          value={yokai.rank} 
          status="default"
          iconUrl={rankIcons[yokai.rank]}
          isRank={true}
        />
        <YokaiCell 
          value={elementTranslations[yokai.element]} 
          status="default" 
          iconUrl={elementIcons[yokai.element]}
        />
        {/* Renderizar directamente el icono de comida sin usar YokaiCell */}
        <div className="yokai-cell" title={foodTranslations[normalizeFoodKey(yokai.favoriteFood)] || "Comida Favorita"}>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={`${foodIcons[normalizeFoodKey(yokai.favoriteFood)]}?t=${foodIconTimestamp}`}
              alt={`${foodTranslations[normalizeFoodKey(yokai.favoriteFood)]} icon`}
              width={32}
              height={32}
              className="object-contain"
              style={{ width: '32px', height: '32px' }}
            />
          </div>
        </div>
        <YokaiCell 
          value={yokai.game} 
          status="default" 
          iconUrl={gameLogos[yokai.game]}
          isGame={true}
        />
      </div>
    );
  }

  return (
    <div className="yokai-row">
      {/* Nombre del Yo-kai - correcto si acertó completamente */}
      <YokaiCell 
        value={yokai.name} 
        status={result.isCorrect ? 'correct' : 'incorrect'} 
        iconUrl={getYokaiImageUrl(yokai)} 
        isYokai={true}
      />
      
      {/* Tribu del Yo-kai */}
      <YokaiCell 
        value={tribeTranslations[yokai.tribe]} 
        status={result.tribe === 'correct' ? 'correct' : 'incorrect'} 
        iconUrl={tribeIcons[yokai.tribe]}
        isTribe={true}
      />
      
      {/* Rango del Yo-kai */}
      <YokaiCell 
        value={yokai.rank} 
        status={result.rank === 'correct' ? 'correct' : result.rank} 
        hint={result.rank}
        iconUrl={rankIcons[yokai.rank]}
        isRank={true}
      />
      
      {/* Elemento del Yo-kai */}
      <YokaiCell 
        value={elementTranslations[yokai.element]} 
        status={result.element === 'correct' ? 'correct' : 'incorrect'}
        iconUrl={elementIcons[yokai.element]}
      />

      {/* Comida Favorita del Yo-kai */}
      {(() => {
        const foodValue = yokai.favoriteFood || (yokai as any).favorite_food || 'None';
        const normalizedFood = normalizeFoodKey(foodValue);
        return (
          <YokaiCell
            value={foodTranslations[normalizedFood] || foodValue}
            status={result.favoriteFood === 'correct' ? 'correct' : 'incorrect'}
            iconUrl={foodIcons[normalizedFood] ? `${foodIcons[normalizedFood]}?t=${foodIconTimestamp}` : undefined}
            isFood={true}
          />
        );
      })()}

      
      {/* Juego del Yo-kai */}
      <YokaiCell 
        value={yokai.game} 
        status={result.game === 'correct' ? 'correct' : 'incorrect'}
        iconUrl={gameLogos[yokai.game]}
        isGame={true}
      />
    </div>
  );
};

export default YokaiRow;
