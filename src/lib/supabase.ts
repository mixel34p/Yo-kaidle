import { createClient } from '@supabase/supabase-js';
import { Yokai, Game } from '@/types/yokai';

// Normalmente, estas variables de entorno estarían en un archivo .env.local
// Por ahora, vamos a dejarlas vacías para que el usuario las configure más tarde
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    
    // Si tiene /revision/ en la URL, quedarnos solo con la parte principal
    if (cleanUrl.includes('/revision/')) {
      // Obtener solo la parte hasta .png o .jpg
      const match = cleanUrl.match(/(.+\.(png|jpg|jpeg|gif))/i);
      if (match) {
        cleanUrl = match[0];
      }
    }
    
    // Quitar /scale-to-width-down/XX/ si existe
    cleanUrl = cleanUrl.replace(/\/scale-to-width-down\/\d+/g, '');
    
    return cleanUrl;
  }
  
  return url;
}

export async function getDailyYokai(date: string): Promise<Yokai | null> {
  // Selecciona un Yo-kai determinístico basado en la fecha
  const dateObj = new Date(date);
  const dateNumber = dateObj.getDate() + dateObj.getMonth() * 31;
  
  const { data, error } = await supabase
    .from('yokai')
    .select('*');
  
  if (error || !data || data.length === 0) {
    console.error('Error fetching daily Yo-kai:', error);
    return null;
  }
  
  // Diagnosticar la estructura exacta que viene de Supabase
  console.log('CAMPOS DISPONIBLES EN YOKAI:', Object.keys(data[0]));
  console.log('VALOR DE IMAGEN:', data[0].image_url || data[0].imageurl || data[0].img || data[0].image);
  
  // Diagnóstico detallado de la comida favorita
  console.log('ANALISIS DE COLUMNA DE COMIDA FAVORITA:');
  console.log('- favorite_food:', data[0].favorite_food);
  console.log('- favoriteFood:', data[0].favoriteFood);
  console.log('- favorite food:', data[0]['favorite food']);
  
  // Mostrar el objeto completo para buscar pistas
  console.log('OBJETO COMPLETO DE SUPABASE:', data[0]);
  
  // Usar la fecha para seleccionar un Yo-kai determinístico para ese día
  const index = dateNumber % data.length;
  
  // IMPORTANTE: En lugar de usar directamente el objeto devuelto por Supabase,
  // creamos un nuevo objeto conformando estrictamente a la interfaz Yokai
  const rawYokai = data[index];
  
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
