'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Yokai, Tribe, Element, FavoriteFood } from '@/types/yokai';

export type Language = 'es' | 'en';

interface Translations {
  // App general
  appTitle: string;
  appSubtitle: string;
  appDescription: string;
  
  // Navigation
  play: string;
  medallium: string;
  
  // Search
  searchPlaceholder: string;
  tribe: string;
  rank: string;
  element: string;
  food: string;
  game: string;
  
  // Game Rules
  howToPlay: string;
  gameRules: string;
  rule1: string;
  rule2: string;
  rule3: string;
  colorCorrect: string;
  colorIncorrect: string;
  colorHigher: string;
  colorLower: string;
  clarificationsTitle: string;
  clarification1: string;
  clarification2: string;
  clarification3: string;
  clarification4: string;
  
  // Game Modes
  daily: string;
  infinite: string;
  configuration: string;
  
  // Game Over
  congratulations: string;
  betterLuck: string;
  wonMessage: string;
  lostMessage: string;
  share: string;
  playAgain: string;
  showStats: string;
  shareHeader: string;
  attempts: string;
  yokaiLabel: string;
  tribeLabel: string;
  gameLabel: string;
  shareFooter: string;
  
  // Footer
  copyright: string;
  trademark: string;
  createdBy: string;
  helpedBy: string;

  // Additional UI elements
  close: string;
  loading: string;
  error: string;
  tryAgain: string;
  noResults: string;
  searchResults: string;
  gameOver: string;

  // Timer
  nextYokaiIn: string;
  hours: string;
  minutes: string;
  seconds: string;
  newYokaiAvailable: string;
  dailyChallenge: string;
  comeBackTomorrow: string;

  // Infinite Mode
  newYokai: string;
  selectGames: string;
  all: string;
  none: string;
  tribeRestrictions: string;
  excludeBossYokai: string;
  excludeBossDescription: string;
  dailyModeNote: string;

  // Statistics
  statistics: string;
  yourProgress: string;
  dailyModeStats: string;
  infiniteModeStats: string;
  gamesPlayed: string;
  winRate: string;
  currentStreak: string;
  bestStreak: string;
  totalInfiniteWins: string;
  continuePlaying: string;

  // Medallium
  unlockedYokaiCollection: string;
  collectionProgress: string;
  switchToListView: string;
  switchToGridView: string;
  showAll: string;
  showFavoritesOnly: string;
  advancedFilters: string;
  viewAchievements: string;
  advancedStatistics: string;
  sortBy: string;
  number: string;
  name: string;
  clearFilters: string;
  allTribes: string;
  allElements: string;
  allRanks: string;
  allGames: string;
  backToGame: string;
  backToPlay: string;
  emptyMedallium: string;
  noUnlockedYokai: string;
  unlocked: string;
  clickForDetails: string;
  medalNumber: string;

  // Motivational hints
  lastAttempt: string;
  almostThere: string;
  attemptsRemaining: string;
  swipeToSeeMore: string;

  // Share functionality
  shareAttempts: string;
  shareTitle: string;
  emailSubject: string;
  copied: string;
  copyToClipboard: string;
  dailyMode: string;
  infiniteMode: string;
}

const translations: Record<Language, Translations> = {
  es: {
    appTitle: 'Yo-kaidle',
    appSubtitle: 'Un wordle de Yo-kai Watch.',
    appDescription: 'Wordle inspirado en la franquicia de Yo-kai Watch. ¡Demuestra tus conocimientos sobre los Yo-kai y completa tu Medallium!',
    
    play: 'Jugar',
    medallium: 'Mi Medallium',
    
    searchPlaceholder: 'Buscar un Yo-kai...',
    tribe: 'Tribu',
    rank: 'Rango',
    element: 'Elemento',
    food: 'Comida',
    game: 'Juego',
    
    howToPlay: '¿Cómo jugar?',
    gameRules: 'Reglas del juego',
    rule1: 'Adivina el Yo-kai diario en 6 intentos o menos.',
    rule2: 'Cada intento debe ser un Yo-kai válido de la serie.',
    rule3: 'Después de cada intento, recibirás pistas sobre las características del Yo-kai:',
    colorCorrect: 'Verde: Has acertado la característica.',
    colorIncorrect: 'Gris: Incorrecto.',
    colorHigher: 'Amarillo con ↑: El rango del Yo-kai objetivo es mayor',
    colorLower: 'Amarillo con ↓: El rango del Yo-kai objetivo es menor',
    clarificationsTitle: 'Aclaraciones importantes:',
    clarification1: 'La sección juego se refiere al juego en el que debutó el Yo-kai como obtenible.',
    clarification2: 'Los Yo-kais usan las características del primer juego en el que aparecen. (Salvo los de Sangokushi, que se adaptan al 3)',
    clarification3: 'No se toma en cuenta a la versión obtenible de los bosses y los bosses que no tienen ningún rango oficial son Rango S.',
    clarification4: 'El juego está aún en fase de desarrollo y puede contener errores. Puedes reportarlos en el discord.',
    
    daily: 'Diario',
    infinite: 'Infinito',
    configuration: 'Configuración',
    
    congratulations: '¡Felicidades!',
    betterLuck: '¡Mejor suerte la próxima vez!',
    wonMessage: '¡Has adivinado el Yo-kai!',
    lostMessage: 'No has logrado adivinar el Yo-kai',
    share: 'Compartir',
    playAgain: 'Jugar de nuevo',
    showStats: 'Ver estadísticas',
    shareHeader: '¡He adivinado el Yokaidle en modo {mode}!',
    attempts: 'Intentos: {current}/{max}',
    yokaiLabel: 'Yo-kai',
    tribeLabel: 'Tribu',
    gameLabel: 'Juego',
    shareFooter: 'Pruébalo tu mismo: https://yokaidle.vercel.app',
    
    copyright: '© 2025 Yo-kaidle',
    trademark: 'Yo-kai Watch es una marca registrada de Level-5 y LEVEL-5 Inc.',
    createdBy: 'Creado por',
    helpedBy: 'Ayudado por',

    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    tryAgain: 'Intentar de nuevo',
    noResults: 'No se encontraron resultados',
    searchResults: 'Resultados de la búsqueda',
    gameOver: 'Juego terminado',

    // Timer
    nextYokaiIn: 'Próximo Yo-kaidle en',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    newYokaiAvailable: 'El nuevo Yo-kai estará disponible automáticamente a medianoche.',
    dailyChallenge: '¡Nuevo Yo-kai cada día! Regresa mañana para un nuevo desafío.',
    comeBackTomorrow: 'Vuelve mañana para un nuevo Yo-kai',

    // Infinite Mode
    newYokai: 'Nuevo Yo-kai',
    selectGames: 'Seleccionar juegos',
    all: 'Todos',
    none: 'Ninguno',
    tribeRestrictions: 'Restricciones de Tribus',
    excludeBossYokai: 'Excluir Yokais Boss',
    excludeBossDescription: 'No incluir yokais de la tribu Boss en modo infinito',
    dailyModeNote: '<strong>Nota:</strong> En el modo diario, los yokais Boss están siempre excluidos para mantener un nivel de dificultad equilibrado.',

    // Statistics
    statistics: 'Estadísticas',
    yourProgress: 'Tu progreso en Yo-kaidle',
    dailyModeStats: 'Estadísticas del Modo Diario',
    infiniteModeStats: 'Estadísticas del Modo Infinito',
    gamesPlayed: 'Partidas',
    winRate: 'Victorias',
    currentStreak: 'Racha Actual',
    bestStreak: 'Mejor Racha',
    totalInfiniteWins: 'Total de Victorias en Modo Infinito',
    continuePlaying: 'Continuar jugando',

    // Medallium
    unlockedYokaiCollection: 'Colección de Yo-kai desbloqueados',
    collectionProgress: 'Progreso de Colección',
    switchToListView: 'Cambiar a vista de lista',
    switchToGridView: 'Cambiar a vista de cuadrícula',
    showAll: 'Mostrar todos',
    showFavoritesOnly: 'Mostrar sólo favoritos',
    advancedFilters: 'Filtros avanzados',
    viewAchievements: 'Ver logros',
    advancedStatistics: 'Estadísticas avanzadas',
    sortBy: 'Ordenar por',
    number: 'Número',
    name: 'Nombre',
    clearFilters: 'Limpiar filtros',
    allTribes: 'Todas las tribus',
    allElements: 'Todos los elementos',
    allRanks: 'Todos los rangos',
    allGames: 'Todos los juegos',
    backToGame: 'Volver al juego',
    backToPlay: 'Volver a jugar',
    emptyMedallium: '¡Medallium vacío!',
    noUnlockedYokai: 'Aún no has desbloqueado ningún Yo-kai que coincida con los filtros aplicados.',
    unlocked: 'Desbloqueado',
    clickForDetails: '¡Pulsa para ver detalles!',
    medalNumber: 'No.',

    // Motivational hints
    lastAttempt: '¡Último intento! ¡Piensa bien!',
    almostThere: '¡Casi! Solo te quedan 2 intentos',
    attemptsRemaining: 'Te quedan {count} intentos, ¡tú puedes!',
    swipeToSeeMore: 'Desliza para ver más',

    // Share functionality
    shareAttempts: 'Intentos: {current}/{max}',
    shareTitle: 'Yo-kaidle - Mi resultado',
    emailSubject: 'Yo-kaidle - Mi resultado',
    copied: '¡Copiado!',
    copyToClipboard: 'Copiar al portapapeles',
    dailyMode: 'diario',
    infiniteMode: 'infinito'
  },
  en: {
    appTitle: 'Yo-kaidle',
    appSubtitle: 'A Yo-kai Watch wordle game.',
    appDescription: 'Wordle inspired by the Yo-kai Watch franchise. Show your knowledge about Yo-kai and complete your Medallium!',
    
    play: 'Play',
    medallium: 'My Medallium',
    
    searchPlaceholder: 'Search for a Yo-kai...',
    tribe: 'Tribe',
    rank: 'Rank',
    element: 'Element',
    food: 'Food',
    game: 'Game',
    
    howToPlay: 'How to play?',
    gameRules: 'Game Rules',
    rule1: 'Guess the daily Yo-kai in 6 attempts or less.',
    rule2: 'Each attempt must be a valid Yo-kai from the series.',
    rule3: 'After each attempt, you\'ll receive clues about the Yo-kai\'s characteristics:',
    colorCorrect: 'Green: The characteristic is correct.',
    colorIncorrect: 'Gray: Incorrect.',
    colorHigher: 'Yellow with ↑: The target Yo-kai\'s rank is higher',
    colorLower: 'Yellow with ↓: The target Yo-kai\'s rank is lower',
    clarificationsTitle: 'Important clarifications:',
    clarification1: 'The game section refers to the game where the Yo-kai debuted as obtainable.',
    clarification2: 'Yo-kai use characteristics from the first game they appear in. (Except Sangokushi ones, which adapt to 3)',
    clarification3: 'The obtainable version of bosses is not taken into account and bosses without an official rank are Rank S.',
    clarification4: 'The game is still in development and may contain errors. You can report them on discord.',
    
    daily: 'Daily',
    infinite: 'Infinite',
    configuration: 'Configuration',
    
    congratulations: 'Congratulations!',
    betterLuck: 'Better luck next time!',
    wonMessage: 'You guessed the Yo-kai!',
    lostMessage: 'You failed to guess the Yo-kai',
    share: 'Share',
    playAgain: 'Play again',
    showStats: 'Show statistics',
    shareHeader: 'I guessed the Yokaidle in {mode} mode!',
    attempts: 'Attempts: {current}/{max}',
    yokaiLabel: 'Yo-kai',
    tribeLabel: 'Tribe',
    gameLabel: 'Game',
    shareFooter: 'Try it yourself: https://yokaidle.vercel.app',
    
    copyright: '© 2025 Yo-kaidle',
    trademark: 'Yo-kai Watch is a registered trademark of Level-5 and LEVEL-5 Inc.',
    createdBy: 'Created by',
    helpedBy: 'Helped by',

    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    tryAgain: 'Try again',
    noResults: 'No results found',
    searchResults: 'Search results',
    gameOver: 'Game over',

    // Timer
    nextYokaiIn: 'Next Yo-kaidle in',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    newYokaiAvailable: 'The new Yo-kai will be available automatically at midnight.',
    dailyChallenge: 'New Yo-kai every day! Come back tomorrow for a new challenge.',
    comeBackTomorrow: 'Come back tomorrow for a new Yo-kai',

    // Infinite Mode
    newYokai: 'New Yo-kai',
    selectGames: 'Select games',
    all: 'All',
    none: 'None',
    tribeRestrictions: 'Tribe Restrictions',
    excludeBossYokai: 'Exclude Boss Yo-kai',
    excludeBossDescription: 'Do not include Boss tribe Yo-kai in infinite mode',
    dailyModeNote: '<strong>Note:</strong> In daily mode, Boss Yo-kai are always excluded to maintain a balanced difficulty level.',

    // Statistics
    statistics: 'Statistics',
    yourProgress: 'Your progress in Yo-kaidle',
    dailyModeStats: 'Daily Mode Statistics',
    infiniteModeStats: 'Infinite Mode Statistics',
    gamesPlayed: 'Games',
    winRate: 'Win Rate',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    totalInfiniteWins: 'Total Infinite Mode Wins',
    continuePlaying: 'Continue playing',

    // Medallium
    unlockedYokaiCollection: 'Unlocked Yo-kai Collection',
    collectionProgress: 'Collection Progress',
    switchToListView: 'Switch to list view',
    switchToGridView: 'Switch to grid view',
    showAll: 'Show all',
    showFavoritesOnly: 'Show favorites only',
    advancedFilters: 'Advanced filters',
    viewAchievements: 'View achievements',
    advancedStatistics: 'Advanced statistics',
    sortBy: 'Sort by',
    number: 'Number',
    name: 'Name',
    clearFilters: 'Clear filters',
    allTribes: 'All tribes',
    allElements: 'All elements',
    allRanks: 'All ranks',
    allGames: 'All games',
    backToGame: 'Back to game',
    backToPlay: 'Back to play',
    emptyMedallium: 'Empty Medallium!',
    noUnlockedYokai: 'You haven\'t unlocked any Yo-kai that match the applied filters yet.',
    unlocked: 'Unlocked',
    clickForDetails: 'Click to see details!',
    medalNumber: 'No.',

    // Motivational hints
    lastAttempt: 'Last attempt! Think carefully!',
    almostThere: 'Almost there! Only 2 attempts left',
    attemptsRemaining: 'You have {count} attempts left, you can do it!',
    swipeToSeeMore: 'Swipe to see more',

    // Share functionality
    shareAttempts: 'Attempts: {current}/{max}',
    shareTitle: 'Yo-kaidle - My result',
    emailSubject: 'Yo-kaidle - My result',
    copied: 'Copied!',
    copyToClipboard: 'Copy to clipboard',
    dailyMode: 'daily',
    infiniteMode: 'infinite'
  }
};

// Traducciones de Yo-kai data
const yokaiTranslations = {
  es: {
    tribes: {
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
    },
    elements: {
      'Fire': 'Fuego',
      'Water': 'Agua',
      'Lightning': 'Rayo',
      'Earth': 'Tierra',
      'Wind': 'Viento',
      'Ice': 'Hielo',
      'Drain': 'Drenar',
      'Restoration': 'Curación',
      'None': 'Ninguno'
    },
    foods: {
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
    }
  },
  en: {
    tribes: {
      'Charming': 'Charming',
      'Mysterious': 'Mysterious',
      'Tough': 'Tough',
      'Heartful': 'Heartful',
      'Shady': 'Shady',
      'Eerie': 'Eerie',
      'Slippery': 'Slippery',
      'Wicked': 'Wicked',
      'Boss': 'Boss',
      'Enma': 'Enma',
      'Brave': 'Brave',
      'Wandroid': 'Wandroid'
    },
    elements: {
      'Fire': 'Fire',
      'Water': 'Water',
      'Lightning': 'Lightning',
      'Earth': 'Earth',
      'Wind': 'Wind',
      'Ice': 'Ice',
      'Drain': 'Drain',
      'Restoration': 'Restoration',
      'None': 'None'
    },
    foods: {
      'Rice Balls': 'Rice Balls',
      'Bread': 'Bread',
      'Candy': 'Candy',
      'Milk': 'Milk',
      'Juice': 'Juice',
      'Hamburgers': 'Hamburgers',
      'Chinese Food': 'Chinese Food',
      'Ramen': 'Ramen',
      'Veggies': 'Veggies',
      'Meat': 'Meat',
      'Seafood': 'Seafood',
      'Sushi': 'Sushi',
      'Curry': 'Curry',
      'Sweets': 'Sweets',
      'Doughnuts': 'Doughnuts',
      'Donuts': 'Donuts',
      'Oden': 'Oden',
      'Soba': 'Soba',
      'Snacks': 'Snacks',
      'Chocobars': 'Chocobars',
      'Ice Cream': 'Ice Cream',
      'Pizza': 'Pizza',
      'Hot Dogs': 'Hot Dogs',
      'Pasta': 'Pasta',
      'Tempura': 'Tempura',
      'Sushi-Tempura': 'Sushi-Tempura',
      'Sukiyaki': 'Sukiyaki',
      'Mega Tasty Bars': 'Mega Tasty Bars',
      'None': 'None'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  getYokaiName: (yokai: Yokai) => string;
  getTribeTranslation: (tribe: Tribe) => string;
  getElementTranslation: (element: Element) => string;
  getFoodTranslation: (food: FavoriteFood) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [yokaiNames, setYokaiNames] = useState<Record<string, Record<string, string>>>({
    es: {},
    en: {}
  });

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'es') {
      setLanguage(saved);
    }
  }, []);

  // Load Yo-kai name translations
  useEffect(() => {
    const loadYokaiNames = async () => {
      try {
        const esNames = await import('@/i18n/locales/es/yokai.json');
        const enNames = await import('@/i18n/locales/en/yokai.json');

        setYokaiNames({
          es: esNames.names || {},
          en: enNames.names || {}
        });
      } catch (error) {
        console.error('Error loading Yo-kai name translations:', error);
      }
    };

    loadYokaiNames();
  }, []);

  // Save language to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const getYokaiName = (yokai: Yokai): string => {
    // Buscar el nombre traducido en los nombres cargados
    const translatedName = yokaiNames[language]?.[yokai.name];
    return translatedName || yokai.name;
  };

  const getTribeTranslation = (tribe: Tribe): string => {
    return yokaiTranslations[language].tribes[tribe] || tribe;
  };

  const getElementTranslation = (element: Element): string => {
    return yokaiTranslations[language].elements[element] || element;
  };

  const getFoodTranslation = (food: FavoriteFood): string => {
    return yokaiTranslations[language].foods[food] || food;
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
    getYokaiName,
    getTribeTranslation,
    getElementTranslation,
    getFoodTranslation
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
