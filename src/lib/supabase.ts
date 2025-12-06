import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Yokai, Game } from '@/types/yokai';

// Variables para Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear el cliente de Supabase con manejo de errores
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback client for build process.');

  // Usamos createClient con URLs placeholder para asegurar compatibilidad de tipos
  supabase = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );

  // En modo de build, podemos hacer un override de ciertos métodos para evitar errores
  if (typeof window === 'undefined') {
    // Durante el build de Next.js, interceptaremos las llamadas relevantes
    // @ts-expect-error - Hacemos override de métodos para el build
    supabase.from = (table: string) => {
      return {
        select: () => {
          const builder = {
            // Implementación básica para que los métodos encadenen correctamente
            eq: () => builder,
            neq: () => builder,
            gt: () => builder,
            lt: () => builder,
            gte: () => builder,
            lte: () => builder,
            like: () => builder,
            ilike: () => builder,
            is: () => builder,
            in: () => builder,
            contains: () => builder,
            containedBy: () => builder,
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => builder,
            limit: () => builder,
            range: () => builder,
          };
          return builder;
        }
      };
    };
  }
} else {
  // Si las variables están disponibles, crear el cliente normal
  if (typeof window === 'undefined') {
    // En el servidor (build time o SSR), no necesitamos opciones de auth persistente
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // En el cliente, habilitamos la persistencia y detección de sesión
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
}

// Función para normalizar datos de Yo-kai (convertir de snake_case a camelCase)
function normalizeYokaiData(rawYokai: any): Yokai {
  if (!rawYokai) return {} as Yokai;

  // Crear un nuevo objeto Yokai con mapeo explícito de propiedades
  const yokai: Yokai = {
    id: rawYokai.id || 0,
    name: rawYokai.name || 'Unknown Yo-kai',
    tribe: rawYokai.tribe || 'Mysterious',
    rank: rawYokai.rank || 'E',
    element: rawYokai.element || 'None',
    game: rawYokai.game || 'Yo-kai Watch 1',
    weight: rawYokai.weight || 0,
    medalNumber: rawYokai.medalnumber || rawYokai.medal_number || 0,
    favoriteFood: rawYokai.favorite_food || 'None',
    imageurl: rawYokai.imageurl || rawYokai.image_url || rawYokai.img || rawYokai.image || ''
  };

  // Si no existe el campo "imageurl", pero sí existe "img", lo copiamos
  if (!yokai.imageurl && rawYokai.img) {
    yokai.imageurl = rawYokai.img;
  }

  // Si la imagen viene de wikia, limpiarla
  if (yokai.imageurl) {
    yokai.imageurl = cleanWikiImageUrl(yokai.imageurl);
  }

  return yokai;
}

export { supabase };

// Funciones para interactuar con los datos de Yo-kai en Supabase
export async function getAllYokai(): Promise<Yokai[]> {
  const { data, error } = await supabase
    .from('yokai')
    .select('*');

  if (error) {
    console.error('Error fetching Yo-kai:', error);
    return [];
  }

  return (data || []).map(normalizeYokaiData);
}

export async function getYokaiById(id: number): Promise<Yokai | null> {
  const { data, error } = await supabase
    .from('yokai')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching Yo-kai by ID:', error);
    return null;
  }

  return normalizeYokaiData(data);
}

export async function getYokaiByName(name: string): Promise<Yokai | null> {
  const { data, error } = await supabase
    .from('yokai')
    .select('*')
    .ilike('name', name)
    .single();

  if (error) {
    console.error('Error fetching Yo-kai by name:', error);
    return null;
  }

  return normalizeYokaiData(data);
}

// Función para limpiar URLs de la Wiki
export function cleanWikiImageUrl(url: string): string {
  if (!url) return '';

  // Si es una URL de wikia.nocookie.net, limpiamos los parámetros y redimensionamientos
  if (url.includes('wikia.nocookie.net') || url.includes('static.wikia.nocookie.net')) {
    // Quitar los parámetros de consulta (?cb=...)
    let cleanUrl = url.split('?')[0];

    // Manejar el formato específico de URLs de Wikia
    if (cleanUrl.includes('/revision/')) {
      // Detectar el formato específico con /youkai-watch/images/X/XX/Nombre.png/revision/latest
      const pathRegex = /\/[\w-]+\/images\/[\w]\/[\w]{2}\/([\w-]+\.(png|jpg|jpeg|gif))\/revision/i;
      const pathMatch = cleanUrl.match(pathRegex);

      if (pathMatch && pathMatch[1]) {
        // Reconstruir la URL sin la parte /revision/latest
        const basePath = cleanUrl.split('/images/')[0];
        const imagePath = cleanUrl.split('/images/')[1];
        const imageFile = pathMatch[1];

        // Reconstruir como: base/images/X/XX/Nombre.png
        const imagePathParts = imagePath.split('/');
        cleanUrl = `${basePath}/images/${imagePathParts[0]}/${imagePathParts[1]}/${imageFile}`;
      } else {
        // Si no coincide con el formato específico, usar el método anterior
        const match = cleanUrl.match(/(.+\.(png|jpg|jpeg|gif))/i);
        if (match) {
          cleanUrl = match[0];
        }
      }
    }

    // Quitar /scale-to-width-down/XX/ si existe
    cleanUrl = cleanUrl.replace(/\/scale-to-width-down\/\d+/g, '');

    return cleanUrl;
  }

  return url;
}

// Función de hash simple pero efectiva para generar números pseudoaleatorios determinísticos
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
}

// Generador de números pseudoaleatorios con semilla (Linear Congruential Generator)
function seededRandom(seed: number): number {
  // Parámetros del LCG (mismos que usa glibc)
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);

  return (a * seed + c) % m;
}

export async function getDailyYokai(date: string): Promise<Yokai | null> {
  try {
    // Algoritmo verdaderamente aleatorio pero determinístico basado en la fecha
    // Crear una semilla única basada en la fecha usando hash
    const dateString = date.replace(/-/g, ''); // Remover guiones: "2024-01-01" -> "20240101"
    const baseSeed = simpleHash(dateString);

    // Aplicar múltiples iteraciones del generador para mejorar la distribución
    let seed = baseSeed;
    for (let i = 0; i < 3; i++) {
      seed = seededRandom(seed);
    }

    // Obtener todos los Yo-kai de la base de datos, excluyendo tribus Boss para modo diario
    const { data, error } = await supabase
      .from('yokai')
      .select('*')
      .neq('tribe', 'Boss') // Excluir yokais de la tribu Boss en modo diario
      .neq('game', 'Yo-kai Watch Busters 2'); // Excluir yokais de Busters 2

    if (error) {
      console.error('Error fetching Yo-kai from Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No Yo-kai found in the database (excluding Boss tribe)');
      return null;
    }

    // Seleccionar el Yo-kai del día usando la semilla pseudoaleatoria
    const index = seed % data.length;
    let rawYokai = data[index]; // Usar let en lugar de const para poder reasignar

    if (!rawYokai) {
      console.error('Failed to select a daily Yo-kai');
      return null;
    }

    // Validar que el Yo-kai tenga los campos requeridos
    if (!rawYokai.name || !rawYokai.tribe || !rawYokai.rank) {
      console.error('Selected Yo-kai is missing required fields:', rawYokai);
      // En caso de error, seleccionar otro Yo-kai como respaldo
      const backupIndex = (index + 1) % data.length;
      rawYokai = data[backupIndex];

      if (!rawYokai || !rawYokai.name) {
        console.error('Backup Yo-kai also invalid');
        return null;
      }
    }

    const yokai = normalizeYokaiData(rawYokai);

    // Registro para depuración (solo en desarrollo)
    console.log(`Daily Yo-kai selected for ${date}: ${yokai.name} (ID: ${yokai.id}, Seed: ${seed}, Index: ${index})`);

    return yokai;
  } catch (error) {
    console.error('Unexpected error in getDailyYokai:', error);
    return null;
  }
}

export async function getRandomYokai(gameSources?: Game[], excludeBossTribes?: boolean, eventFilter?: { games?: string[], yokaiIds?: string[], mode: 'include' | 'exclude' }): Promise<Yokai | null> {
  // Obtiene un Yo-kai aleatorio para el modo infinito, con filtro opcional de juegos, tribus y eventos
  let query = supabase
    .from('yokai')
    .select('*');

  // Si hay filtro de evento con juegos específicos, usar esos en lugar de gameSources
  if (eventFilter?.games && eventFilter.games.length > 0) {
    if (eventFilter.mode === 'include') {
      // Solo incluir Yo-kai de los juegos del evento
      query = query.in('game', eventFilter.games);
    } else {
      // Excluir Yo-kai de los juegos del evento
      query = query.not('game', 'in', `(${eventFilter.games.map(g => `'${g}'`).join(',')})`);
    }
  } else if (gameSources && gameSources.length > 0) {
    // Si no hay filtro de evento, usar el filtro normal de juegos
    query = query.in('game', gameSources);
  }

  // Si se debe excluir tribus Boss, aplicar filtro
  if (excludeBossTribes) {
    query = query.neq('tribe', 'Boss');
  }

  // Aplicar filtro de evento por IDs específicos si está presente (para casos especiales)
  if (eventFilter?.yokaiIds && eventFilter.yokaiIds.length > 0) {
    if (eventFilter.mode === 'include') {
      // Solo incluir Yo-kai específicos del evento
      query = query.in('id', eventFilter.yokaiIds);
    } else {
      // Excluir Yo-kai específicos del evento
      query = query.not('id', 'in', `(${eventFilter.yokaiIds.join(',')})`);
    }
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.error('Error fetching random Yo-kai:', error);
    return null;
  }

  // Seleccionar uno aleatorio
  const randomIndex = Math.floor(Math.random() * data.length);
  const rawYokai = data[randomIndex];

  console.log('Random Yokai raw data:', JSON.stringify(rawYokai));

  const yokai = normalizeYokaiData(rawYokai);

  console.log('Mapped Yokai structure:', JSON.stringify(yokai));

  return yokai;
}
