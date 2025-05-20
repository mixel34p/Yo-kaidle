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
  supabase = createClient(supabaseUrl, supabaseAnonKey);
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
  
  return data as Yokai[];
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
  
  return data as Yokai;
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
  
  return data as Yokai;
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

export async function getDailyYokai(date: string): Promise<Yokai | null> {
  try {
    // Algoritmo mejorado para seleccionar un Yo-kai determinístico basado en la fecha
    const dateObj = new Date(date);
    // Crear un número único para cada día del año usando la fecha, mes y año
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Los meses en JS son 0-11
    const year = dateObj.getFullYear();
    
    // Crear un número hash único para cada día
    // Multiplicamos por números primos para mejorar la distribución
    const dailyHash = day + (month * 31) + (year * 372);
    
    // Obtener todos los Yo-kai de la base de datos
    const { data, error } = await supabase
      .from('yokai')
      .select('*');
    
    if (error) {
      console.error('Error fetching Yo-kai from Supabase:', error.message);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No Yo-kai found in the database');
      return null;
    }
    
    // Seleccionar el Yo-kai del día usando el hash
    const index = Math.abs(dailyHash % data.length);
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
    
    // Crear un nuevo objeto Yokai con mapeo explícito de propiedades
    // y validación para cada campo
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
    
    // Si la imagen viene de wikia, limpiarla
    if (yokai.imageurl) {
      yokai.imageurl = cleanWikiImageUrl(yokai.imageurl);
    }
    if (yokai.image_url) {
      yokai.image_url = cleanWikiImageUrl(yokai.image_url);
    }
    if (yokai.img) {
      yokai.img = cleanWikiImageUrl(yokai.img);
    }
    if (yokai.image) {
      yokai.image = cleanWikiImageUrl(yokai.image);
    }
    
    // Registro para depuración (solo en desarrollo)
    console.log(`Daily Yo-kai selected for ${date}: ${yokai.name} (ID: ${yokai.id})`);
    
    return yokai as Yokai;
  } catch (error) {
    console.error('Unexpected error in getDailyYokai:', error);
    return null;
  }
}

export async function getRandomYokai(): Promise<Yokai | null> {
  // Obtiene un Yo-kai completamente aleatorio para el modo infinito
  const { data, error } = await supabase
    .from('yokai')
    .select('*');
  
  if (error || !data || data.length === 0) {
    console.error('Error fetching random Yo-kai:', error);
    return null;
  }
  
  // Seleccionar uno aleatorio
  const randomIndex = Math.floor(Math.random() * data.length);
  const rawYokai = data[randomIndex];
  
  console.log('Random Yokai raw data:', JSON.stringify(rawYokai));
  console.log('Raw favorite_food value:', rawYokai.favorite_food);
  
  // Crear un nuevo objeto Yokai con mapeo explícito de propiedades
  const yokai: Yokai = {
    id: rawYokai.id,
    name: rawYokai.name,
    tribe: rawYokai.tribe,
    rank: rawYokai.rank,
    element: rawYokai.element,
    game: rawYokai.game,
    weight: rawYokai.weight,
    medalNumber: rawYokai.medalnumber || rawYokai.medal_number,
    favoriteFood: rawYokai.favorite_food, // Mapeo explícito de favorite_food a favoriteFood
    imageurl: rawYokai.imageurl || rawYokai.image_url || rawYokai.img || rawYokai.image
  };
  
  console.log('Mapped Yokai structure:', JSON.stringify(yokai));
  
  // Si no existe el campo "imageurl", pero sí existe "img", lo copiamos
  if (!yokai.imageurl && yokai.img) {
    yokai.imageurl = yokai.img;
  }
  
  // Si la imagen viene de wikia, limpiarla
  if (yokai.imageurl) {
    yokai.imageurl = cleanWikiImageUrl(yokai.imageurl);
  }
  if (yokai.image_url) {
    yokai.image_url = cleanWikiImageUrl(yokai.image_url);
  }
  if (yokai.img) {
    yokai.img = cleanWikiImageUrl(yokai.img);
  }
  if (yokai.image) {
    yokai.image = cleanWikiImageUrl(yokai.image);
  }
  
  return yokai as Yokai;
}
