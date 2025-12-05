'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Yokai, Tribe, Element, FavoriteFood } from '@/types/yokai';

export type Language = 'es' | 'en' | 'it';

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

  // Event Page
  exploring: string;
  searchingYokai: string;
  yokaiFound: string;
  wildYokaiAppears: string;
  whatYokaiFound: string;
  identifyYokai: string;
  discoverySuccessful: string;
  yokaiFoundProgress: string;
  incorrectIdentification: string;
  tryAgainExplorer: string;
  explorerData: string;
  explorerName: string;
  continueExploration: string;
  treasureMap: string;
  yokaiToFind: string;
  treasuresToUnlock: string;
  islandTreasure: string;
  discoverSecrets: string;
  chest: string;
  treasure: string;
  opened: string;
  next: string;
  alreadyGuessed: string;
  chestUnlocked: string;
  claimRewards: string;
  rewardsReceived: string;
  openChest: string;

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

  // Circles
  circles: string;
  circlesProgress: string;
  viewCircles: string;
  circleCompleted: string;
  circlesCompleted: string;
  circleProgress: string;
  missingYokai: string;
  completedCircles: string;

  // Circle categories
  storyCircles: string;
  tribeCircles: string;
  elementCircles: string;
  specialCircles: string;
  legendaryCircles: string;
  friendshipCircles: string;

  // Circle difficulties
  easyDifficulty: string;
  mediumDifficulty: string;
  hardDifficulty: string;
  legendaryDifficulty: string;

  // Advanced Statistics (solo las nuevas)
  overview: string;
  tribes: string;
  games: string;
  activity: string;
  totalYokaiUnlocked: string;
  completionRate: string;
  averageGuessesPerGame: string;
  favoriteTribes: string;
  rareYokaiUnlocked: string;
  gameProgress: string;
  recentActivity: string;
  yokaiUnlockedToday: string;
  gamesPlayedToday: string;
  lastGamePlayed: string;
  mostActiveDay: string;
  averageSessionTime: string;
  tribeDistribution: string;
  rankDistribution: string;
  gameCompletion: string;
  performanceMetrics: string;
  timeSpentPlaying: string;
  achievementsUnlocked: string;
  unlockedStats: string;
  completedStats: string;
  perDay: string;
  noRecentActivity: string;
  remainingToComplete: string;

  // Social/Auth System
  // Authentication
  connect: string;
  connecting: string;
  signOut: string;
  connectedWithDiscord: string;
  connectForSocialFeatures: string;

  // Profile
  viewMyProfile: string;
  yourProfile: string;
  memberSince: string;
  profileBackToGame: string;
  userNotFound: string;
  profileNotFound: string;
  userNotSpecified: string;
  pleaseSpecifyUser: string;
  exampleUrl: string;
  loadingProfile: string;
  errorLoadingProfile: string;
  unexpectedError: string;
  goBack: string;

  // Stats (Profile specific)
  profileBestStreak: string;
  profileCurrentStreak: string;
  profileYokaiUnlocked: string;
  consecutiveDays: string;
  ofTotal: string;

  // Friends
  addFriend: string;
  requestSent: string;
  friends: string;
  processing: string;
  waitingForResponse: string;
  youAreFriends: string;

  // Friends System
  friendsSystem: string;
  myFriends: string;
  friendRequests: string;
  searchFriends: string;
  searchByUsername: string;
  sendRequest: string;
  acceptRequest: string;
  rejectRequest: string;
  removeFriend: string;
  noFriendsYet: string;
  noRequestsYet: string;
  userNotFoundSearch: string;
  alreadyFriends: string;
  requestAlreadySent: string;
  cannotAddYourself: string;
  friendRequestSent: string;
  friendRequestAccepted: string;
  friendRequestRejected: string;
  friendRemoved: string;
  pendingRequests: string;
  incomingRequests: string;
  outgoingRequests: string;

  // Profile Customization
  customizeProfile: string;
  profileCustomization: string;
  favoriteYokai: string;
  selectFavoriteYokai: string;
  profileTitle: string;
  selectTitle: string;

  avatarFrame: string;
  selectFrame: string;
  badges: string;
  selectBadges: string;
  noBadgesSelected: string;
  saveChanges: string;
  changesUnsaved: string;
  changesSaved: string;
  noYokaiUnlocked: string;
  unlockMoreYokai: string;
  defaultTitle: string;
  defaultTheme: string;
  defaultFrame: string;
  previewProfile: string;

  // Navigation
  leaderboards: string;
  rankings: string;

  // Leaderboard
  globalLeaderboards: string;
  bestStreakRanking: string;
  yokaiUnlockedRanking: string;
  leaderboardRank: string;
  leaderboardPlayer: string;
  leaderboardScore: string;
  noDataAvailable: string;
  loadingLeaderboards: string;
  errorLoadingLeaderboards: string;
  topPlayers: string;
  yourRank: string;
  notRanked: string;
  firstYokai: string;
  lastYokai: string;

  // Achievements Panel UI
  uncompletedAchievements: string;
  completedAchievements: string;
  allCategories: string;
  collectionCategory: string;
  tribesCategory: string;
  gamesCategory: string;
  ranksCategory: string;
  specialCategory: string;
  achievementUncompleted: string;
  achievementCompleted: string;
  noAchievementsUncompleted: string;
  noAchievementsCompleted: string;
  reward: string;
  achievementProgress: string;
  totalPoints: string;
  achievementStats: string;
  keepPlayingToUnlock: string;
  allAchievementsUnlocked: string;
  noLockedAchievements: string;
  achievements: string;
  completed: string;
  earned: string;
  total: string;
  points: string;
  claimReward: string;
  claimed: string;
  hints: string;
  usePointsToGetHints: string;
  insufficientPoints: string;
  used: string;


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

    // Event Page
    exploring: 'Explorando la isla...',
    searchingYokai: 'Buscando Yo-kai ocultos...',
    yokaiFound: '¡Yo-kai Encontrado!',
    wildYokaiAppears: 'Un Yo-kai salvaje aparece en la isla...',
    whatYokaiFound: '¿Qué Yo-kai has encontrado en la isla?',
    identifyYokai: '¡Identificar Yo-kai!',
    discoverySuccessful: '¡DESCUBRIMIENTO EXITOSO!',
    yokaiFoundProgress: '+1 Yo-kai encontrado',
    incorrectIdentification: '¡Identificación Incorrecta!',
    tryAgainExplorer: 'Inténtalo de nuevo, explorador',
    explorerData: 'Datos del Explorador',
    explorerName: 'Nombre',
    continueExploration: 'Continuar Exploración',
    treasureMap: 'Mapa del Tesoro',
    yokaiToFind: 'Yo-kai por encontrar',
    treasuresToUnlock: 'Tesoros por desbloquear',
    islandTreasure: 'ISLA DEL TESORO',
    discoverSecrets: 'Descubre los secretos ocultos en la isla desierta',
    chest: 'Cofre',
    treasure: 'Tesoro',
    opened: '¡ABIERTO!',
    next: '¡PRÓXIMO!',
    alreadyGuessed: 'Ya has adivinado este Yo-kai',
    chestUnlocked: '¡Cofre Desbloqueado!',
    claimRewards: 'Reclamar Recompensas',
    rewardsReceived: '¡Recompensas reclamadas con éxito!',
    openChest: 'Abrir Cofre',

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
    infiniteMode: 'infinito',

    // Circles
    circles: 'Círculos',
    circlesProgress: 'Progreso de Círculos',
    viewCircles: 'Ver Círculos',
    circleCompleted: '¡Círculo Completado!',
    circlesCompleted: 'Círculos Completados',
    circleProgress: 'Progreso del Círculo',
    missingYokai: 'Yo-kai Faltantes',
    completedCircles: 'Círculos Completados',

    // Circle categories
    storyCircles: 'Historia',
    tribeCircles: 'Tribus',
    elementCircles: 'Elementos',
    specialCircles: 'Especiales',
    legendaryCircles: 'Legendarios',
    friendshipCircles: 'Amistad',

    // Circle difficulties
    easyDifficulty: 'Fácil',
    mediumDifficulty: 'Medio',
    hardDifficulty: 'Difícil',
    legendaryDifficulty: 'Legendario',

    // Advanced Statistics
    overview: 'Rangos',
    tribes: 'Tribus',
    games: 'Juegos',
    activity: 'Actividad',
    totalYokaiUnlocked: 'Yo-kai Desbloqueados',
    completionRate: 'Tasa de Completado',
    averageGuessesPerGame: 'Promedio de Intentos',
    favoriteTribes: 'Tribus Favoritas',
    rareYokaiUnlocked: 'Yo-kai Raros Desbloqueados',
    gameProgress: 'Progreso por Juego',
    recentActivity: 'Actividad Reciente',
    yokaiUnlockedToday: 'Yo-kai Desbloqueados Hoy',
    gamesPlayedToday: 'Partidas Jugadas Hoy',
    lastGamePlayed: 'Última Partida',
    mostActiveDay: 'Día Más Activo',
    averageSessionTime: 'Tiempo Promedio de Sesión',
    tribeDistribution: 'Distribución por Tribu',
    rankDistribution: 'Distribución por Rango',
    gameCompletion: 'Completado por Juego',
    performanceMetrics: 'Métricas de Rendimiento',
    timeSpentPlaying: 'Tiempo Jugado',
    achievementsUnlocked: 'Logros Desbloqueados',
    unlockedStats: 'Desbloqueados',
    completedStats: 'Completados',
    perDay: 'por día',
    noRecentActivity: 'No hay actividad reciente',
    remainingToComplete: 'Faltan',
    firstYokai: 'Primer Yo-kai',
    lastYokai: 'Último Yo-kai',

    // Achievements Panel UI
    uncompletedAchievements: 'Sin Completar',
    completedAchievements: 'Completados',
    allCategories: 'Todos',
    collectionCategory: 'Colección',
    tribesCategory: 'Tribus',
    gamesCategory: 'Juegos',
    ranksCategory: 'Rangos',
    specialCategory: 'Especiales',
    achievementUncompleted: 'Sin Completar',
    achievementCompleted: 'Completado',
    noAchievementsUncompleted: 'No tienes logros sin completar',
    noAchievementsCompleted: 'No tienes logros completados aún',
    reward: 'Recompensa',
    achievementProgress: 'Progreso de Logros',
    totalPoints: 'Puntos Totales',
    achievementStats: 'Estadísticas de Logros',
    keepPlayingToUnlock: '¡Sigue jugando para desbloquear logros!',
    allAchievementsUnlocked: '¡Has desbloqueado todos los logros de esta categoría!',
    noLockedAchievements: 'No hay más logros por desbloquear en esta categoría',
    achievements: 'Logros',
    completed: 'Completado',
    earned: 'Ganados',
    total: 'Total',
    points: 'Puntos',
    claimReward: 'Reclamar',
    claimed: 'Reclamado',
    hints: 'Ayudas',
    usePointsToGetHints: 'Usa puntos para obtener pistas',
    insufficientPoints: 'Puntos insuficientes',
    used: 'Usado',

    // Social/Auth System
    // Authentication
    connect: 'Conectar',
    connecting: 'Conectando...',
    signOut: 'Cerrar sesión',
    connectedWithDiscord: 'Conectado con Discord',
    connectForSocialFeatures: 'Conectar para funciones sociales',

    // Profile
    viewMyProfile: 'Ver mi perfil',
    yourProfile: 'Tu perfil',
    memberSince: 'Miembro desde',
    profileBackToGame: 'Volver al juego',
    userNotFound: 'Usuario no encontrado',
    profileNotFound: 'Perfil no encontrado',
    userNotSpecified: 'Usuario no especificado',
    pleaseSpecifyUser: 'Por favor, especifica un usuario en la URL',
    exampleUrl: 'Ejemplo: /profile?u=username',
    loadingProfile: 'Cargando perfil...',
    errorLoadingProfile: 'Error cargando perfil',
    unexpectedError: 'Error inesperado',
    goBack: 'Volver',

    // Stats (Profile specific)
    profileBestStreak: 'Mejor Racha',
    profileCurrentStreak: 'Racha Actual',
    profileYokaiUnlocked: 'Yo-kais Desbloqueados',
    consecutiveDays: 'días consecutivos',
    ofTotal: 'de',

    // Friends
    addFriend: 'Añadir Amigo',
    requestSent: 'Solicitud Enviada',
    friends: 'Amigos',
    processing: 'Procesando...',
    waitingForResponse: 'Esperando respuesta...',
    youAreFriends: '¡Ya sois amigos!',

    // Navigation
    leaderboards: 'Rankings',
    rankings: 'Rankings',

    // Leaderboard
    globalLeaderboards: 'Rankings Globales',
    bestStreakRanking: 'Ranking de Mejor Racha',
    yokaiUnlockedRanking: 'Ranking de Yo-kais Desbloqueados',
    leaderboardRank: 'Puesto',
    leaderboardPlayer: 'Jugador',
    leaderboardScore: 'Puntuación',
    noDataAvailable: 'No hay datos disponibles',
    loadingLeaderboards: 'Cargando rankings...',
    errorLoadingLeaderboards: 'Error cargando rankings',
    topPlayers: 'Mejores Jugadores',
    yourRank: 'Tu Puesto',
    notRanked: 'Sin clasificar',

    // Friends System
    friendsSystem: 'Sistema de Amigos',
    myFriends: 'Mis Amigos',
    friendRequests: 'Solicitudes de Amistad',
    searchFriends: 'Buscar Amigos',
    searchByUsername: 'Buscar por nombre de usuario',
    sendRequest: 'Enviar Solicitud',
    acceptRequest: 'Aceptar',
    rejectRequest: 'Rechazar',
    removeFriend: 'Eliminar Amigo',
    noFriendsYet: 'Aún no tienes amigos',
    noRequestsYet: 'No hay solicitudes pendientes',
    userNotFoundSearch: 'Usuario no encontrado',
    alreadyFriends: 'Ya sois amigos',
    requestAlreadySent: 'Solicitud ya enviada',
    cannotAddYourself: 'No puedes añadirte a ti mismo',
    friendRequestSent: 'Solicitud de amistad enviada',
    friendRequestAccepted: 'Solicitud de amistad aceptada',
    friendRequestRejected: 'Solicitud de amistad rechazada',
    friendRemoved: 'Amigo eliminado',
    pendingRequests: 'Solicitudes Pendientes',
    incomingRequests: 'Solicitudes Recibidas',
    outgoingRequests: 'Solicitudes Enviadas',

    // Profile Customization
    customizeProfile: 'Personalizar Perfil',
    profileCustomization: 'Personalización del Perfil',
    favoriteYokai: 'Yo-kai Favorito',
    selectFavoriteYokai: 'Seleccionar Yo-kai Favorito',
    profileTitle: 'Título del Perfil',
    selectTitle: 'Seleccionar Título',

    avatarFrame: 'Marco del Avatar',
    selectFrame: 'Seleccionar Marco',
    saveChanges: 'Guardar Cambios',
    changesUnsaved: 'Cambios sin guardar',
    changesSaved: 'Cambios guardados',
    noYokaiUnlocked: 'No tienes Yo-kais desbloqueados',
    unlockMoreYokai: 'Desbloquea más Yo-kais jugando',
    defaultTitle: 'Entrenador Yo-kai',
    defaultTheme: 'Tema por Defecto',
    defaultFrame: 'Marco por Defecto',
    previewProfile: 'Vista Previa del Perfil',
    badges: 'Insignias',
    selectBadges: 'Seleccionar Insignias',
    noBadgesSelected: 'Sin insignias seleccionadas'
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

    // Event Page
    exploring: 'Exploring the island...',
    searchingYokai: 'Searching for hidden Yo-kai...',
    yokaiFound: 'Yo-kai Found!',
    wildYokaiAppears: 'A wild Yo-kai appears on the island...',
    whatYokaiFound: 'What Yo-kai have you found on the island?',
    identifyYokai: 'Identify Yo-kai!',
    discoverySuccessful: 'DISCOVERY SUCCESSFUL!',
    yokaiFoundProgress: '+1 Yo-kai found',
    incorrectIdentification: 'Incorrect Identification!',
    tryAgainExplorer: 'Try again, explorer',
    explorerData: 'Explorer Data',
    explorerName: 'Name',
    continueExploration: 'Continue Exploration',
    treasureMap: 'Treasure Map',
    yokaiToFind: 'Yo-kai to find',
    treasuresToUnlock: 'Treasures to unlock',
    islandTreasure: 'TREASURE ISLAND',
    discoverSecrets: 'Discover the hidden secrets on the desert island',
    chest: 'Chest',
    treasure: 'Treasure',
    opened: 'OPENED!',
    next: 'NEXT!',
    alreadyGuessed: 'You have already guessed this Yo-kai',
    chestUnlocked: 'Chest Unlocked!',
    claimRewards: 'Claim Rewards',
    rewardsReceived: 'Rewards claimed successfully!',
    openChest: 'Open Chest',

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
    infiniteMode: 'infinite',

    // Circles
    circles: 'Circles',
    circlesProgress: 'Circles Progress',
    viewCircles: 'View Circles',
    circleCompleted: 'Circle Completed!',
    circlesCompleted: 'Circles Completed',
    circleProgress: 'Circle Progress',
    missingYokai: 'Missing Yo-kai',
    completedCircles: 'Completed Circles',

    // Circle categories
    storyCircles: 'Story',
    tribeCircles: 'Tribes',
    elementCircles: 'Elements',
    specialCircles: 'Special',
    legendaryCircles: 'Legendary',
    friendshipCircles: 'Friendship',

    // Circle difficulties
    easyDifficulty: 'Easy',
    mediumDifficulty: 'Medium',
    hardDifficulty: 'Hard',
    legendaryDifficulty: 'Legendary',

    // Advanced Statistics
    overview: 'Ranks',
    tribes: 'Tribes',
    games: 'Games',
    activity: 'Activity',
    totalYokaiUnlocked: 'Yo-kai Unlocked',
    completionRate: 'Completion Rate',
    averageGuessesPerGame: 'Average Guesses',
    favoriteTribes: 'Favorite Tribes',
    rareYokaiUnlocked: 'Rare Yo-kai Unlocked',
    gameProgress: 'Game Progress',
    recentActivity: 'Recent Activity',
    yokaiUnlockedToday: 'Yo-kai Unlocked Today',
    gamesPlayedToday: 'Games Played Today',
    lastGamePlayed: 'Last Game Played',
    mostActiveDay: 'Most Active Day',
    averageSessionTime: 'Average Session Time',
    tribeDistribution: 'Tribe Distribution',
    rankDistribution: 'Rank Distribution',
    gameCompletion: 'Game Completion',
    performanceMetrics: 'Performance Metrics',
    timeSpentPlaying: 'Time Spent Playing',
    achievementsUnlocked: 'Achievements Unlocked',
    unlockedStats: 'Unlocked',
    completedStats: 'Completed',
    perDay: 'per day',
    noRecentActivity: 'No recent activity',
    remainingToComplete: 'Remaining',
    firstYokai: 'First Yo-kai',
    lastYokai: 'Last Yo-kai',

    // Achievements Panel UI
    uncompletedAchievements: 'Uncompleted',
    completedAchievements: 'Completed',
    allCategories: 'All',
    collectionCategory: 'Collection',
    tribesCategory: 'Tribes',
    gamesCategory: 'Games',
    ranksCategory: 'Ranks',
    specialCategory: 'Special',
    achievementUncompleted: 'Uncompleted',
    achievementCompleted: 'Completed',
    noAchievementsUncompleted: 'No uncompleted achievements',
    noAchievementsCompleted: 'No completed achievements yet',
    reward: 'Reward',
    achievementProgress: 'Achievement Progress',
    totalPoints: 'Total Points',
    achievementStats: 'Achievement Stats',
    keepPlayingToUnlock: 'Keep playing to unlock achievements!',
    allAchievementsUnlocked: 'You have unlocked all achievements in this category!',
    noLockedAchievements: 'No more achievements to unlock in this category',
    achievements: 'Achievements',
    completed: 'Completed',
    earned: 'Earned',
    total: 'Total',
    points: 'Points',
    claimReward: 'Claim',
    claimed: 'Claimed',
    hints: 'Hints',
    usePointsToGetHints: 'Use points to get hints',
    insufficientPoints: 'Insufficient points',
    used: 'Used',

    // Social/Auth System
    // Authentication
    connect: 'Connect',
    connecting: 'Connecting...',
    signOut: 'Sign out',
    connectedWithDiscord: 'Connected with Discord',
    connectForSocialFeatures: 'Connect for social features',

    // Profile
    viewMyProfile: 'View my profile',
    yourProfile: 'Your profile',
    memberSince: 'Member since',
    profileBackToGame: 'Back to game',
    userNotFound: 'User not found',
    profileNotFound: 'Profile not found',
    userNotSpecified: 'User not specified',
    pleaseSpecifyUser: 'Please specify a user in the URL',
    exampleUrl: 'Example: /profile?u=username',
    loadingProfile: 'Loading profile...',
    errorLoadingProfile: 'Error loading profile',
    unexpectedError: 'Unexpected error',
    goBack: 'Go back',

    // Stats (Profile specific)
    profileBestStreak: 'Best Streak',
    profileCurrentStreak: 'Current Streak',
    profileYokaiUnlocked: 'Yo-kai Unlocked',
    consecutiveDays: 'consecutive days',
    ofTotal: 'of',

    // Friends
    addFriend: 'Add Friend',
    requestSent: 'Request Sent',
    friends: 'Friends',
    processing: 'Processing...',
    waitingForResponse: 'Waiting for response...',
    youAreFriends: 'You are friends!',

    // Navigation
    leaderboards: 'Leaderboards',
    rankings: 'Leaderboards',

    // Leaderboard
    globalLeaderboards: 'Global Leaderboards',
    bestStreakRanking: 'Best Streak Ranking',
    yokaiUnlockedRanking: 'Yo-kai Unlocked Ranking',
    leaderboardRank: 'Rank',
    leaderboardPlayer: 'Player',
    leaderboardScore: 'Score',
    noDataAvailable: 'No data available',
    loadingLeaderboards: 'Loading leaderboards...',
    errorLoadingLeaderboards: 'Error loading leaderboards',
    topPlayers: 'Top Players',
    yourRank: 'Your Rank',
    notRanked: 'Not ranked',

    // Friends System
    friendsSystem: 'Friends System',
    myFriends: 'My Friends',
    friendRequests: 'Friend Requests',
    searchFriends: 'Search Friends',
    searchByUsername: 'Search by username',
    sendRequest: 'Send Request',
    acceptRequest: 'Accept',
    rejectRequest: 'Reject',
    removeFriend: 'Remove Friend',
    noFriendsYet: 'No friends yet',
    noRequestsYet: 'No pending requests',
    userNotFoundSearch: 'User not found',
    alreadyFriends: 'Already friends',
    requestAlreadySent: 'Request already sent',
    cannotAddYourself: 'Cannot add yourself',
    friendRequestSent: 'Friend request sent',
    friendRequestAccepted: 'Friend request accepted',
    friendRequestRejected: 'Friend request rejected',
    friendRemoved: 'Friend removed',
    pendingRequests: 'Pending Requests',
    incomingRequests: 'Incoming Requests',
    outgoingRequests: 'Outgoing Requests',

    // Profile Customization
    customizeProfile: 'Customize Profile',
    profileCustomization: 'Profile Customization',
    favoriteYokai: 'Favorite Yo-kai',
    selectFavoriteYokai: 'Select Favorite Yo-kai',
    profileTitle: 'Profile Title',
    selectTitle: 'Select Title',

    avatarFrame: 'Avatar Frame',
    selectFrame: 'Select Frame',
    saveChanges: 'Save Changes',
    changesUnsaved: 'Unsaved changes',
    changesSaved: 'Changes saved',
    noYokaiUnlocked: 'No Yo-kai unlocked',
    unlockMoreYokai: 'Unlock more Yo-kai by playing',
    defaultTitle: 'Yo-kai Trainer',
    defaultTheme: 'Default Theme',
    defaultFrame: 'Default Frame',
    previewProfile: 'Profile Preview',
    badges: 'Badges',
    selectBadges: 'Select Badges',
    noBadgesSelected: 'No badges selected'
  },
  it: {
    appTitle: 'Yo-kaidle',
    appSubtitle: 'Un gioco wordle di Yo-kai Watch.',
    appDescription: 'Wordle ispirato al franchise di Yo-kai Watch. Mostra la tua conoscenza sui Yo-kai e completa il tuo Medallium!',

    play: 'Gioca',
    medallium: 'Il mio Medallium',

    searchPlaceholder: 'Cerca uno Yo-kai...',
    tribe: 'Tribù',
    rank: 'Rango',
    element: 'Elemento',
    food: 'Cibo',
    game: 'Gioco',

    // Game Rules
    howToPlay: 'Come giocare?',
    gameRules: 'Regole del gioco',
    rule1: 'Indovina lo Yo-kai giornaliero in 6 tentativi o meno.',
    rule2: 'Ogni tentativo deve essere uno Yo-kai valido della serie.',
    rule3: 'Dopo ogni tentativo, riceverai indizi sulle caratteristiche dello Yo-kai:',
    colorCorrect: 'Verde: La caratteristica è corretta',
    colorIncorrect: 'Rosso: La caratteristica è sbagliata',
    colorHigher: 'Giallo con ↑: Il rango dello Yo-kai obiettivo è più alto',
    colorLower: 'Giallo con ↓: Il rango dello Yo-kai obiettivo è più basso',
    clarificationsTitle: 'Chiarimenti importanti:',
    clarification1: 'La sezione gioco si riferisce al gioco in cui lo Yo-kai ha debuttato come ottenibile.',
    clarification2: 'Gli Yo-kai usano le caratteristiche del primo gioco in cui appaiono. (Tranne quelli di Sangokushi, che si adattano al 3)',
    clarification3: 'Non si tiene conto della versione ottenibile dei boss e i boss senza rango ufficiale sono Rango S.',
    clarification4: 'Il gioco è ancora in fase di sviluppo e può contenere errori. Puoi segnalarli su discord.',

    // Game Modes
    daily: 'Giornaliero',
    infinite: 'Infinito',
    configuration: 'Configurazione',

    // Game Over
    congratulations: 'Congratulazioni!',
    betterLuck: 'Più fortuna la prossima volta!',
    wonMessage: 'Hai indovinato lo Yo-kai!',
    lostMessage: 'Non sei riuscito a indovinare lo Yo-kai',
    share: 'Condividi',
    playAgain: 'Gioca di nuovo',
    showStats: 'Mostra statistiche',
    shareHeader: 'Ho indovinato il Yokaidle in modalità {mode}!',
    attempts: 'Tentativi: {current}/{max}',
    yokaiLabel: 'Yo-kai',
    tribeLabel: 'Tribù',
    gameLabel: 'Gioco',
    shareFooter: 'Provalo anche tu: https://yokaidle.vercel.app',

    // Footer
    copyright: '© 2025 Yo-kaidle',
    trademark: 'Yo-kai Watch è un marchio registrato di Level-5 e LEVEL-5 Inc.',
    createdBy: 'Creato da',
    helpedBy: 'Aiutato da',

    // Additional UI elements
    close: 'Chiudi',
    loading: 'Caricamento...',
    error: 'Errore',
    tryAgain: 'Riprova',
    noResults: 'Nessun risultato trovato',
    searchResults: 'Risultati di ricerca',
    gameOver: 'Fine del gioco',

    // Timer
    nextYokaiIn: 'Prossimo Yo-kai tra',
    hours: 'ore',
    minutes: 'minuti',
    seconds: 'secondi',
    newYokaiAvailable: 'Si aggiornerà automaticamente a mezzanotte',
    dailyChallenge: 'Sfida giornaliera',
    comeBackTomorrow: 'Torna domani per una nuova sfida!',

    // Event Page
    exploring: 'Esplorando l\'isola...',
    searchingYokai: 'Cercando Yo-kai nascosti...',
    yokaiFound: 'Yo-kai Trovato!',
    wildYokaiAppears: 'Uno Yo-kai selvaggio appare sull\'isola...',
    whatYokaiFound: 'Che Yo-kai hai trovato sull\'isola?',
    identifyYokai: 'Identifica Yo-kai!',
    discoverySuccessful: 'SCOPERTA RIUSCITA!',
    yokaiFoundProgress: '+1 Yo-kai trovato',
    incorrectIdentification: 'Identificazione Sbagliata!',
    tryAgainExplorer: 'Riprova, esploratore',
    explorerData: 'Dati dell\'Esploratore',
    explorerName: 'Nome',
    continueExploration: 'Continua Esplorazione',
    treasureMap: 'Mappa del Tesoro',
    yokaiToFind: 'Yo-kai da trovare',
    treasuresToUnlock: 'Tesori da sbloccare',
    islandTreasure: 'ISOLA DEL TESORO',
    discoverSecrets: 'Scopri i segreti nascosti sull\'isola deserta',
    chest: 'Forziere',
    treasure: 'Tesoro',
    opened: 'APERTO!',
    next: 'PROSSIMO!',
    alreadyGuessed: 'Hai già indovinato questo Yo-kai',
    chestUnlocked: 'Forziere Sbloccato!',
    claimRewards: 'Reclama Ricompense',
    rewardsReceived: 'Ricompense reclamate con successo!',
    openChest: 'Apri Forziere',

    // Statistics
    statistics: 'Statistiche',
    yourProgress: 'I tuoi progressi in Yo-kaidle',
    dailyModeStats: 'Statistiche Modalità Giornaliera',
    infiniteModeStats: 'Statistiche Modalità Infinita',
    gamesPlayed: 'Partite',
    winRate: '% Vittorie',
    currentStreak: 'Serie Attuale',
    bestStreak: 'Migliore Serie',
    totalInfiniteWins: 'Vittorie Totali Modalità Infinita',
    continuePlaying: 'Continua a giocare',

    // Medallium
    unlockedYokaiCollection: 'Collezione Yo-kai Sbloccati',
    collectionProgress: 'Progresso Collezione',
    switchToListView: 'Passa alla vista elenco',
    switchToGridView: 'Passa alla vista griglia',
    showAll: 'Mostra tutti',
    showFavoritesOnly: 'Mostra solo preferiti',
    advancedFilters: 'Filtri avanzati',
    viewAchievements: 'Visualizza obiettivi',
    advancedStatistics: 'Statistiche avanzate',
    sortBy: 'Ordina per',
    number: 'Numero',
    name: 'Nome',
    clearFilters: 'Cancella filtri',
    allTribes: 'Tutte le tribù',
    allElements: 'Tutti gli elementi',
    allRanks: 'Tutti i ranghi',
    allGames: 'Tutti i giochi',
    backToGame: 'Torna al gioco',
    backToPlay: 'Torna a giocare',
    emptyMedallium: 'Medallium vuoto',
    noUnlockedYokai: 'Nessuno Yo-kai sbloccato ancora',
    unlocked: 'Sbloccato',
    clickForDetails: 'Clicca per i dettagli',
    medalNumber: 'Numero Medaglia',

    // Motivational hints
    lastAttempt: 'Ultimo tentativo!',
    almostThere: 'Ci sei quasi!',
    attemptsRemaining: 'tentativi rimanenti',
    swipeToSeeMore: 'Scorri per vedere di più',

    // Infinite Mode
    newYokai: 'Nuovo Yo-kai',
    selectGames: 'Seleziona giochi',
    all: 'Tutti',
    none: 'Nessuno',
    tribeRestrictions: 'Restrizioni Tribù',
    excludeBossYokai: 'Escludi Yo-kai Boss',
    excludeBossDescription: 'Non includere Yo-kai della tribù Boss nella modalità infinita',
    dailyModeNote: '<strong>Nota:</strong> Nella modalità giornaliera, gli Yo-kai Boss sono sempre esclusi per mantenere un livello di difficoltà equilibrato.',

    // Share functionality
    shareAttempts: 'Condividi tentativi',
    shareTitle: 'Yo-kaidle - Il mio risultato',
    emailSubject: 'Yo-kaidle - Il mio risultato',
    copied: 'Copiato!',
    copyToClipboard: 'Copia negli appunti',
    dailyMode: 'giornaliero',
    infiniteMode: 'infinito',

    // Circles
    circles: 'Cerchi',
    circlesProgress: 'Progresso Cerchi',
    viewCircles: 'Visualizza Cerchi',
    circleCompleted: 'Cerchio Completato!',
    circlesCompleted: 'Cerchi Completati',
    circleProgress: 'Progresso del Cerchio',
    missingYokai: 'Yo-kai Mancanti',
    completedCircles: 'Cerchi Completati',

    // Circle categories
    storyCircles: 'Storia',
    tribeCircles: 'Tribù',
    elementCircles: 'Elementi',
    specialCircles: 'Speciali',
    legendaryCircles: 'Leggendari',
    friendshipCircles: 'Amicizia',

    // Circle difficulties
    easyDifficulty: 'Facile',
    mediumDifficulty: 'Medio',
    hardDifficulty: 'Difficile',
    legendaryDifficulty: 'Leggendario',

    // Advanced Statistics
    overview: 'Ranghi',
    tribes: 'Tribù',
    games: 'Giochi',
    activity: 'Attività',
    totalYokaiUnlocked: 'Yo-kai Sbloccati',
    completionRate: 'Tasso di Completamento',
    averageGuessesPerGame: 'Media Tentativi',
    favoriteTribes: 'Tribù Preferite',
    rareYokaiUnlocked: 'Yo-kai Rari Sbloccati',
    gameProgress: 'Progresso per Gioco',
    recentActivity: 'Attività Recente',
    yokaiUnlockedToday: 'Yo-kai Sbloccati Oggi',
    gamesPlayedToday: 'Partite Giocate Oggi',
    lastGamePlayed: 'Ultima Partita',
    mostActiveDay: 'Giorno Più Attivo',
    averageSessionTime: 'Tempo Medio di Sessione',
    tribeDistribution: 'Distribuzione per Tribù',
    rankDistribution: 'Distribuzione per Rango',
    gameCompletion: 'Completamento per Gioco',
    performanceMetrics: 'Metriche di Prestazione',
    timeSpentPlaying: 'Tempo Trascorso Giocando',
    achievementsUnlocked: 'Obiettivi Sbloccati',
    unlockedStats: 'Sbloccati',
    completedStats: 'Completati',
    perDay: 'al giorno',
    noRecentActivity: 'Nessuna attività recente',
    remainingToComplete: 'Rimanenti',
    firstYokai: 'Primo Yo-kai',
    lastYokai: 'Ultimo Yo-kai',

    // Achievements Panel UI
    uncompletedAchievements: 'Non Completati',
    completedAchievements: 'Completati',
    allCategories: 'Tutti',
    collectionCategory: 'Collezione',
    tribesCategory: 'Tribù',
    gamesCategory: 'Giochi',
    ranksCategory: 'Ranghi',
    specialCategory: 'Speciali',
    achievementUncompleted: 'Non Completato',
    achievementCompleted: 'Completato',
    noAchievementsUncompleted: 'Nessun obiettivo non completato',
    noAchievementsCompleted: 'Nessun obiettivo completato ancora',
    reward: 'Ricompensa',
    achievementProgress: 'Progresso Obiettivi',
    totalPoints: 'Punti Totali',
    achievementStats: 'Statistiche Obiettivi',
    keepPlayingToUnlock: 'Continua a giocare per sbloccare obiettivi!',
    allAchievementsUnlocked: 'Hai sbloccato tutti gli obiettivi in questa categoria!',
    noLockedAchievements: 'Nessun altro obiettivo da sbloccare in questa categoria',
    achievements: 'Obiettivi',
    completed: 'Completato',
    earned: 'Guadagnati',
    total: 'Totale',
    points: 'Punti',
    claimReward: 'Reclama',
    claimed: 'Reclamato',
    hints: 'Suggerimenti',
    usePointsToGetHints: 'Usa punti per ottenere suggerimenti',
    insufficientPoints: 'Punti insufficienti',
    used: 'Usato',

    // Social/Auth System
    // Authentication
    connect: 'Connetti',
    connecting: 'Connessione...',
    signOut: 'Disconnetti',
    connectedWithDiscord: 'Connesso con Discord',
    connectForSocialFeatures: 'Connetti per funzioni sociali',

    // Profile
    viewMyProfile: 'Vedi il mio profilo',
    yourProfile: 'Il tuo profilo',
    memberSince: 'Membro dal',
    profileBackToGame: 'Torna al gioco',
    userNotFound: 'Utente non trovato',
    profileNotFound: 'Profilo non trovato',
    userNotSpecified: 'Utente non specificato',
    pleaseSpecifyUser: 'Per favore, specifica un utente nell\'URL',
    exampleUrl: 'Esempio: /profile?u=username',
    loadingProfile: 'Caricamento profilo...',
    errorLoadingProfile: 'Errore nel caricamento del profilo',
    unexpectedError: 'Errore inaspettato',
    goBack: 'Torna indietro',

    // Stats (Profile specific)
    profileBestStreak: 'Migliore Serie',
    profileCurrentStreak: 'Serie Attuale',
    profileYokaiUnlocked: 'Yo-kai Sbloccati',
    consecutiveDays: 'giorni consecutivi',
    ofTotal: 'di',

    // Friends
    addFriend: 'Aggiungi Amico',
    requestSent: 'Richiesta Inviata',
    friends: 'Amici',
    processing: 'Elaborazione...',
    waitingForResponse: 'In attesa di risposta...',
    youAreFriends: 'Siete amici!',

    // Navigation
    leaderboards: 'Classifiche',
    rankings: 'Classifiche',

    // Leaderboard
    globalLeaderboards: 'Classifiche Globali',
    bestStreakRanking: 'Classifica Migliore Serie',
    yokaiUnlockedRanking: 'Classifica Yo-kai Sbloccati',
    leaderboardRank: 'Posizione',
    leaderboardPlayer: 'Giocatore',
    leaderboardScore: 'Punteggio',
    noDataAvailable: 'Nessun dato disponibile',
    loadingLeaderboards: 'Caricamento classifiche...',
    errorLoadingLeaderboards: 'Errore nel caricamento delle classifiche',
    topPlayers: 'Migliori Giocatori',
    yourRank: 'La Tua Posizione',
    notRanked: 'Non classificato',

    // Friends System
    friendsSystem: 'Sistema Amici',
    myFriends: 'I Miei Amici',
    friendRequests: 'Richieste di Amicizia',
    searchFriends: 'Cerca Amici',
    searchByUsername: 'Cerca per nome utente',
    sendRequest: 'Invia Richiesta',
    acceptRequest: 'Accetta',
    rejectRequest: 'Rifiuta',
    removeFriend: 'Rimuovi Amico',
    noFriendsYet: 'Nessun amico ancora',
    noRequestsYet: 'Nessuna richiesta in sospeso',
    userNotFoundSearch: 'Utente non trovato',
    alreadyFriends: 'Già amici',
    requestAlreadySent: 'Richiesta già inviata',
    cannotAddYourself: 'Non puoi aggiungere te stesso',
    friendRequestSent: 'Richiesta di amicizia inviata',
    friendRequestAccepted: 'Richiesta di amicizia accettata',
    friendRequestRejected: 'Richiesta di amicizia rifiutata',
    friendRemoved: 'Amico rimosso',
    pendingRequests: 'Richieste in Sospeso',
    incomingRequests: 'Richieste Ricevute',
    outgoingRequests: 'Richieste Inviate',

    // Profile Customization
    customizeProfile: 'Personalizza Profilo',
    profileCustomization: 'Personalizzazione del Profilo',
    favoriteYokai: 'Yo-kai Preferito',
    selectFavoriteYokai: 'Seleziona Yo-kai Preferito',
    profileTitle: 'Titolo del Profilo',
    selectTitle: 'Seleziona Titolo',

    avatarFrame: 'Cornice Avatar',
    selectFrame: 'Seleziona Cornice',
    saveChanges: 'Salva Modifiche',
    changesUnsaved: 'Modifiche non salvate',
    changesSaved: 'Modifiche salvate',
    noYokaiUnlocked: 'Nessun Yo-kai sbloccato',
    unlockMoreYokai: 'Sblocca più Yo-kai giocando',
    defaultTitle: 'Allenatore Yo-kai',
    defaultTheme: 'Tema Predefinito',
    defaultFrame: 'Cornice Predefinita',
    previewProfile: 'Anteprima Profilo',
    badges: 'Distintivi',
    selectBadges: 'Seleziona Distintivi',
    noBadgesSelected: 'Nessun distintivo selezionato'
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
  },
  it: {
    tribes: {
      'Charming': 'Affascinante',
      'Mysterious': 'Misterioso',
      'Tough': 'Robusto',
      'Heartful': 'Cordiale',
      'Shady': 'Ombroso',
      'Eerie': 'Inquietante',
      'Slippery': 'Scivoloso',
      'Wicked': 'Malvagio',
      'Boss': 'Boss',
      'Enma': 'Enma',
      'Brave': 'Coraggioso',
      'Wandroid': 'Wandroide'
    },
    elements: {
      'Fire': 'Fuoco',
      'Water': 'Acqua',
      'Lightning': 'Fulmine',
      'Earth': 'Terra',
      'Wind': 'Vento',
      'Ice': 'Ghiaccio',
      'Drain': 'Assorbimento',
      'Restoration': 'Ripristino',
      'None': 'Nessuno'
    },
    foods: {
      'Rice Balls': 'Polpette di Riso',
      'Bread': 'Pane',
      'Candy': 'Caramelle',
      'Milk': 'Latte',
      'Juice': 'Succo',
      'Hamburgers': 'Hamburger',
      'Chinese Food': 'Cibo Cinese',
      'Ramen': 'Ramen',
      'Veggies': 'Verdure',
      'Meat': 'Carne',
      'Seafood': 'Frutti di Mare',
      'Sushi': 'Sushi',
      'Curry': 'Curry',
      'Sweets': 'Dolci',
      'Doughnuts': 'Ciambelle',
      'Donuts': 'Donuts',
      'Oden': 'Oden',
      'Soba': 'Soba',
      'Snacks': 'Snack',
      'Chocobars': 'Barrette al Cioccolato',
      'Ice Cream': 'Gelato',
      'Pizza': 'Pizza',
      'Hot Dogs': 'Hot Dog',
      'Pasta': 'Pasta',
      'Tempura': 'Tempura',
      'Sushi-Tempura': 'Sushi-Tempura',
      'Sukiyaki': 'Sukiyaki',
      'Mega Tasty Bars': 'Mega Barrette Gustose',
      'None': 'Nessuno'
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
    en: {},
    it: {}
  });

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'es' || saved === 'it') {
      setLanguage(saved);
    }
  }, []);

  // Load Yo-kai name translations
  useEffect(() => {
    const loadYokaiNames = async () => {
      try {
        const esNames = await import('@/i18n/locales/es/yokai.json');
        const enNames = await import('@/i18n/locales/en/yokai.json');
        const itNames = await import('@/i18n/locales/it/yokai.json');

        setYokaiNames({
          es: esNames.names || {},
          en: enNames.names || {},
          it: itNames.names || {}
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
