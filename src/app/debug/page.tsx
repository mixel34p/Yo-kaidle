'use client';

import React, { useEffect, useState } from 'react';
import { getDailyYokai, getAllYokai } from '@/lib/supabase';
import { Yokai } from '@/types/yokai';

export default function DebugPage() {
  const [dailyYokai, setDailyYokai] = useState<Yokai | null>(null);
  const [allYokai, setAllYokai] = useState<Yokai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const daily = await getDailyYokai(today);
        const all = await getAllYokai();
        
        setDailyYokai(daily);
        setAllYokai(all);
        
        console.log('Daily Yo-kai:', daily);
        console.log('All Yo-kai:', all);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <h2 className="text-xl font-bold mt-4 mb-2">Daily Yo-kai</h2>
      {dailyYokai ? (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-bold text-lg">{dailyYokai.name}</h3>
          <p>Tribe: {dailyYokai.tribe}</p>
          <p>Rank: {dailyYokai.rank}</p>
          <p>Element: {dailyYokai.element}</p>
          <p>Game: {dailyYokai.game}</p>
          <p>Image URL: {dailyYokai.imageurl || 'No image URL'}</p>
          <p>Favorite Food: {dailyYokai.favoriteFood || 'No favorite food'}</p>
          {/* Accedemos a la propiedad raw para diagnóstico */}
          <p>Raw Yokai Data: {Object.keys(dailyYokai).join(', ')}</p>
          <p>Raw data: {JSON.stringify(dailyYokai)}</p>
          
          {dailyYokai.imageurl && (
            <div className="mt-2">
              <p>Image Preview:</p>
              <img 
                src={dailyYokai.imageurl} 
                alt={dailyYokai.name} 
                className="border mt-1 max-w-xs"
              />
            </div>
          )}
          
          <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(dailyYokai, null, 2)}
          </pre>
        </div>
      ) : (
        <p>No daily Yo-kai found</p>
      )}
      
      <h2 className="text-xl font-bold mt-6 mb-2">All Yo-kai ({allYokai.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allYokai.slice(0, 6).map((yokai, index) => (
          <div key={index} className="bg-white p-3 rounded shadow">
            <h3 className="font-bold">{yokai.name}</h3>
            <p className="text-sm">Image URL: {yokai.imageurl || 'No image URL'}</p>
            
            {yokai.imageurl && (
              <img 
                src={yokai.imageurl} 
                alt={yokai.name} 
                className="border mt-1 h-20 object-contain"
              />
            )}
          </div>
        ))}
      </div>
      
      {allYokai.length > 6 && (
        <p className="text-center mt-4 text-gray-500">
          Showing 6 of {allYokai.length} Yo-kai
        </p>
      )}
    </div>
  );
}
