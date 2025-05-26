export type Tribe = 
  | 'Charming' 
  | 'Mysterious' 
  | 'Tough' 
  | 'Heartful' 
  | 'Shady' 
  | 'Eerie' 
  | 'Slippery' 
  | 'Wicked' 
  | 'Boss' 
  | 'Enma'
  | 'Brave'
  | 'Wandroid';

export const tribeTranslations: Record<Tribe, string> = {
  'Charming': 'Guapo',
  'Mysterious': 'Misterioso',
  'Tough': 'Robusto',
  'Heartful': 'Amable',
  'Shady': 'Oscuro',
  'Eerie': 'Siniestro',
  'Slippery': 'Escurridizo',
  'Wicked': 'Maléfico',
  'Boss': 'Jefe',
  'Enma': 'Enma',
  'Brave': 'Valiente',
  'Wandroid': 'Androide'
};

export const tribeIcons: Record<Tribe, string> = {
  'Charming': '/images/tribes/charming.png',
  'Mysterious': '/images/tribes/mysterious.png',
  'Tough': '/images/tribes/tough.png',
  'Heartful': '/images/tribes/heartful.png',
  'Shady': '/images/tribes/shady.png',
  'Eerie': '/images/tribes/eerie.png',
  'Slippery': '/images/tribes/slippery.png',
  'Wicked': '/images/tribes/wicked.png',
  'Boss': '/images/tribes/boss.png',
  'Enma': '/images/tribes/enma.png',
  'Brave': '/images/tribes/Brave.PNG',
  'Wandroid': '/images/tribes/Wandroid.png'
};

export type Game = 
  | 'Yo-kai Watch 1' 
  | 'Yo-kai Watch 2' 
  | 'Yo-kai Watch 3' 
  | 'Yo-kai Watch 4' 
  | 'Yo-kai Watch Blasters' 
  | 'Yo-kai Watch Busters 2'
  | 'Yo-kai Watch Sangokushi';

export const gameLogos: Record<Game, string> = {
  'Yo-kai Watch 1': '/images/games/yw1.png',
  'Yo-kai Watch 2': '/images/games/yw2.png',
  'Yo-kai Watch 3': '/images/games/yw3.png',
  'Yo-kai Watch 4': '/images/games/yw4.png',
  'Yo-kai Watch Blasters': '/images/games/ywb.png',
  'Yo-kai Watch Busters 2': '/images/games/ywb2.png',
  'Yo-kai Watch Sangokushi': '/images/games/ykws.png'
};

export type Rank = 
  | 'E' 
  | 'D' 
  | 'C' 
  | 'B' 
  | 'A' 
  | 'S' 
  | 'SS' 
  | 'SSS';

export const rankIcons: Record<Rank, string> = {
  'E': '/images/ranks/rank-e.png',
  'D': '/images/ranks/rank-d.png',
  'C': '/images/ranks/rank-c.png',
  'B': '/images/ranks/rank-b.png',
  'A': '/images/ranks/rank-a.png',
  'S': '/images/ranks/rank-s.png',
  'SS': '/images/ranks/rank-ss.png',
  'SSS': '/images/ranks/rank-sss.png'
};

export const rankColors: Record<Rank, string> = {
  'E': '#8E8E8E', // Gris
  'D': '#CD7F32', // Bronce
  'C': '#C0C0C0', // Plata
  'B': '#FFD700', // Oro
  'A': '#00FFFF', // Cian
  'S': '#FF00FF', // Magenta
  'SS': '#FF0000', // Rojo
  'SSS': '#9932CC'  // Púrpura
};

export type Element = 
  | 'Fire' 
  | 'Water' 
  | 'Lightning' 
  | 'Earth' 
  | 'Wind' 
  | 'Ice' 
  | 'Drain' 
  | 'Restoration' 
  | 'None';

export type FavoriteFood = 
  | 'Rice Balls' 
  | 'Bread' 
  | 'Candy' 
  | 'Milk' 
  | 'Juice' 
  | 'Hamburgers' 
  | 'Chinese Food' 
  | 'Ramen' 
  | 'Veggies' 
  | 'Meat' 
  | 'Seafood' 
  | 'Sushi' 
  | 'Curry' 
  | 'Sweets' 
  | 'Doughnuts' 
  | 'Donuts' 
  | 'Oden' 
  | 'Soba' 
  | 'Snacks' 
  | 'Chocobars' 
  | 'Ice Cream' 
  | 'Pizza' 
  | 'Hot Dogs' 
  | 'Pasta' 
  | 'Tempura' 
  | 'Sushi-Tempura' 
  | 'Sukiyaki'
  | 'Mega Tasty Bars' 
  | 'None';

export const elementTranslations: Record<Element, string> = {
  'Fire': 'Fuego',
  'Water': 'Agua',
  'Lightning': 'Rayo',
  'Earth': 'Tierra',
  'Wind': 'Viento',
  'Ice': 'Hielo',
  'Drain': 'Drenar',
  'Restoration': 'Curación',
  'None': 'Ninguno'
};

export const foodTranslations: Record<FavoriteFood, string> = {
  'Rice Balls': 'Bolas de arroz',
  'Bread': 'Pan',
  'Candy': 'Dulces',
  'Milk': 'Leche',
  'Juice': 'Refresco',
  'Hamburgers': 'Hamburguesas',
  'Chinese Food': 'Comida China',
  'Ramen': 'Ramen',
  'Veggies': 'Vegetales',
  'Meat': 'Carne',
  'Seafood': 'Pescado',
  'Sushi': 'Sushi',
  'Curry': 'Curry',
  'Sweets': 'Postre',
  'Doughnuts': 'Bollos',
  'Donuts': 'Donuts',
  'Oden': 'Oden',
  'Soba': 'Soba',
  'Snacks': 'Snacks',
  'Chocobars': 'Chocobarritas',
  'Ice Cream': 'Helado',
  'Pizza': 'Pizza',
  'Hot Dogs': 'Hotdogs',
  'Pasta': 'Pasta',
  'Tempura': 'Tempura',
  'Sushi-Tempura': 'Sushi-Tempura',
  'Sukiyaki': 'Sukiyaki',
  'Mega Tasty Bars': 'Chocodelicias',
  'None': 'Ninguno'
};

export const foodIcons: Record<FavoriteFood, string> = {
  'Rice Balls': '/images/foods/rice-balls.png',
  'Bread': '/images/foods/bread.png',
  'Candy': '/images/foods/candy.png',
  'Milk': '/images/foods/milk.png',
  'Juice': '/images/foods/juice.png',
  'Hamburgers': '/images/foods/hamburgers.png',
  'Chinese Food': '/images/foods/chinese-food.png',
  'Ramen': '/images/foods/ramen.png',
  'Veggies': '/images/foods/veggies.png',
  'Meat': '/images/foods/meat.png',
  'Seafood': '/images/foods/seafood.png',
  'Sushi': '/images/foods/sushi.png',
  'Curry': '/images/foods/curry.png',
  'Sweets': '/images/foods/sweets.png',
  'Doughnuts': '/images/foods/doughnuts.png',
  'Donuts': '/images/foods/donuts.png',
  'Oden': '/images/foods/oden.png',
  'Soba': '/images/foods/soba.png',
  'Snacks': '/images/foods/snacks.png',
  'Chocobars': '/images/foods/chocobars.png',
  'Ice Cream': '/images/foods/ice-cream.png',
  'Pizza': '/images/foods/pizza.png',
  'Hot Dogs': '/images/foods/hot-dogs.png',
  'Pasta': '/images/foods/pasta.png',
  'Tempura': '/images/foods/tempura.png',
  'Sushi-Tempura': '/images/foods/sushi-tempura.png',
  'Sukiyaki': '/images/foods/sukiyaki.png',
  'Mega Tasty Bars': '/images/foods/megatastybars.png',
  'None': '/images/foods/none.png'
};

export const elementColors: Record<Element, string> = {
  'Fire': '#FF5733',
  'Water': '#33A1FF',
  'Lightning': '#FFD700',
  'Earth': '#8B4513',
  'Wind': '#00FF7F',
  'Ice': '#ADD8E6',
  'Drain': '#800080',
  'Restoration': '#FF69B4',
  'None': '#888888'
};

export const elementIcons: Record<Element, string> = {
  'Fire': '/images/elements/fire.png',
  'Water': '/images/elements/water.png',
  'Lightning': '/images/elements/lightning.png',
  'Earth': '/images/elements/earth.png',
  'Wind': '/images/elements/wind.png',
  'Ice': '/images/elements/ice.png',
  'Drain': '/images/elements/drain.png',
  'Restoration': '/images/elements/restoration.png',
  'None': '/images/elements/none.png'
};

export interface Yokai {
  id: number;
  name: string;
  tribe: Tribe;
  rank: Rank;
  element: Element;
  game: Game; // Game where the Yo-kai appears
  weight: number; // In kilograms
  medalNumber: number; // Number in the Medallium
  favoriteFood: FavoriteFood; // Comida favorita del Yo-kai
  imageurl?: string; // URL de la imagen en Supabase (con u minúscula)
  image_url?: string; // Alternativa para URL de imagen
  img?: string; // Otra alternativa para URL de imagen
  image?: string; // Otra alternativa para URL de imagen
}

export type GameMode = 'daily' | 'infinite' | 'duel';

export interface GameState {
  currentDate: string;
  dailyYokai: Yokai | null;
  infiniteYokai: Yokai | null; // Campo para el Yo-kai del modo infinito
  duelYokai: Yokai | null; // Campo para el Yo-kai del modo duelo
  guesses: Yokai[];
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  lastPlayedDate: string | null;
  gameMode: GameMode;
  streak: number;
  maxStreak: number;
  totalPlayed: number;
  totalWins: number;
  // Estadísticas separadas para cada modo
  dailyStats: {
    streak: number;
    maxStreak: number;
    totalPlayed: number;
    totalWins: number;
  };
  infiniteStats: {
    totalPlayed: number;
    totalWins: number;
  };
  duelStats: {
    totalPlayed: number;
    totalWins: number;
    totalLosses: number;
  };
}

// Tipos para el sistema de duelos
export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type DuelOpponent = 'ai' | 'player' | 'online';

export type DuelTurn = 'player1' | 'player2';

export interface DuelState {
  id: string;
  createdAt: string;
  targetYokai: Yokai;
  opponentType: DuelOpponent;
  currentTurn: DuelTurn;
  player1Guesses: Yokai[];
  player2Guesses: Yokai[];
  maxGuesses: number;
  gameStatus: 'playing' | 'player1_won' | 'player2_won' | 'draw';
  player1Name: string;
  player2Name: string;
  lastAction: string;
  aiDifficulty?: AIDifficulty;
  roomCode?: string;
  isHost?: boolean;
  lastUpdated?: string;
}

export interface DuelResult {
  winner: 'player1' | 'player2' | 'draw';
  guessCount: number;
  duration: number; // en segundos
  targetYokai: Yokai;
}

// Resultado de una adivinanza en Wordle
export type GuessResult = {
  isCorrect: boolean;
  tribe: 'correct' | 'incorrect';
  rank: 'correct' | 'higher' | 'lower' | 'incorrect';
  element: 'correct' | 'incorrect';
  game: 'correct' | 'incorrect';
  weight: 'correct' | 'higher' | 'lower';
  medalNumber: 'correct' | 'higher' | 'lower';
  favoriteFood: 'correct' | 'incorrect';
};
