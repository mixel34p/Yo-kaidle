import React, { useState, useEffect } from 'react';
import { Yokai, tribeTranslations } from '@/types/yokai';
import { cleanWikiImageUrl } from '@/lib/supabase';
import { getAllYokai } from '@/lib/supabase';

interface YokaiSearchProps {
  onSelect: (yokai: Yokai) => void;
  disabled: boolean;
}

function getYokaiImageUrl(yokai: Yokai): string {
  const url = yokai.image_url || yokai.imageurl || yokai.img || yokai.image || '';
  return cleanWikiImageUrl(url);
}

const YokaiSearch: React.FC<YokaiSearchProps> = ({ onSelect, disabled }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yokaiList, setYokaiList] = useState<Yokai[]>([]);
  const [filteredYokai, setFilteredYokai] = useState<Yokai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchYokai = async () => {
      try {
        const data = await getAllYokai();
        setYokaiList(data);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar la lista de Yo-kai');
        setIsLoading(false);
      }
    };

    fetchYokai();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredYokai([]);
      return;
    }

    const filtered = yokaiList.filter(yokai => 
      yokai.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredYokai(filtered.slice(0, 5)); // Limitar a 5 resultados
    setIsDropdownOpen(filtered.length > 0);
  }, [searchQuery, yokaiList]);

  const handleSelect = (yokai: Yokai) => {
    onSelect(yokai);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="flex shadow-md rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Buscar un Yo-kai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() !== '' && setIsDropdownOpen(true)}
            className="w-full px-4 py-3 border-2 rounded-l-lg focus:outline-none focus:ring-2 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(234, 242, 255, 0.85)',
              borderColor: 'var(--accent-color)',
              color: 'var(--dark-blue)',
              caretColor: 'var(--secondary-color)',
            }}
            disabled={disabled}
          />
          <button 
            className="text-white px-5 py-2 transition-all duration-300 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--dark-blue))' }}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            disabled={disabled}
          >
            <img 
              src="/icons/search/yokai-search.png" 
              alt="Buscar" 
              className="w-8 h-8 object-contain" 
              onError={(e) => {
                // Fallback al emoji si la imagen no se encuentra
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span className="text-xl">🔍</span>';
              }}
            />
          </button>
        </div>
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-25 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="px-3 py-1 rounded-full text-sm font-medium" 
                  style={{ background: 'rgba(15, 82, 152, 0.8)', color: 'white' }}>
              Juego terminado
            </span>
          </div>
        )}
      </div>
      
      {isLoading && <div className="mt-2">Cargando...</div>}
      {error && <div className="mt-2 text-red-500">{error}</div>}
      
      {isDropdownOpen && filteredYokai.length > 0 && (
        <div className="absolute z-10 w-full bottom-full mb-2 rounded-lg shadow-xl overflow-hidden animate-fadeIn" 
             style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--accent-color)' }}>
          <div className="p-2 text-white text-sm font-medium" 
               style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--dark-blue))' }}>
            Resultados de la búsqueda
          </div>
          <ul className="max-h-64 overflow-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--accent-color) transparent' }}>
            {filteredYokai.map(yokai => (
              <li 
                key={yokai.id}
                className="px-4 py-3 cursor-pointer flex items-center border-b transition-all duration-300"
                style={{ 
                  borderColor: 'rgba(66, 196, 255, 0.2)', 
                  color: 'white' 
                }}
                onClick={() => handleSelect(yokai)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-10 h-10 mr-3 overflow-hidden">
                  <img 
                    src={getYokaiImageUrl(yokai)}
                    alt={yokai.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Si la imagen falla, mostrar las iniciales
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center', 'text-xs');
                      e.currentTarget.parentElement!.innerHTML = yokai.name.substring(0, 2).toUpperCase();
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-bold" style={{ color: 'var(--gold-accent)', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{yokai.name}</div>
                  <div className="text-xs flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>Tribu: {tribeTranslations[yokai.tribe]}</span>
                    <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>Rango: {yokai.rank}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isDropdownOpen && searchQuery.trim() !== '' && filteredYokai.length === 0 && (
        <div className="absolute z-10 w-full bottom-full mb-1 rounded shadow-lg p-4 text-center animate-fadeIn" 
             style={{ background: 'rgba(15, 82, 152, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--accent-color)', color: 'white' }}>
          No se encontraron Yo-kai con ese nombre.
        </div>
      )}
    </div>
  );
};

export default YokaiSearch;
