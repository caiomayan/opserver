'use client';

import { useState, useEffect, useCallback } from 'react';

// Cache para códigos de países e nomes
let countryCodesCache = null;
let countryCodesPromise = null;

async function fetchCountryCodes() {
  if (countryCodesCache) {
    return countryCodesCache;
  }
  
  if (countryCodesPromise) {
    return await countryCodesPromise;
  }
  
  countryCodesPromise = fetch('https://flagcdn.com/pt/codes.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch country codes: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      countryCodesCache = data;
      return data;
    })
    .catch(error => {
      console.error('Error fetching country codes:', error);
      countryCodesPromise = null;
      return {};
    });
  
  return await countryCodesPromise;
}

export default function CountryFlag({ 
  countryCode, 
  size = 'w-6 h-6', 
  showName = false, 
  className = '', 
  flagSize = 20 // tamanho da bandeira (20, 40, 80, etc.)
}) {
  const [countryName, setCountryName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const loadCountryName = useCallback(async (code) => {
    if (!code) {
      setLoading(false);
      return;
    }

    const lowerCode = code.toLowerCase();
    
    try {
      const countryCodes = await fetchCountryCodes();
      const name = countryCodes[lowerCode] || code.toUpperCase();
      setCountryName(name);
    } catch (error) {
      console.error('Error loading country name:', error);
      setCountryName(code.toUpperCase());
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadCountryName(countryCode);
  }, [countryCode, loadCountryName]);
  
  if (!countryCode) {
    return null;
  }
  
  const lowerCode = countryCode.toLowerCase();
  const flagUrl = `https://flagcdn.com/w${flagSize}/${lowerCode}.png`;
  
  if (loading && showName) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`${size} bg-gray-200 animate-pulse rounded`}></div>
        {showName && <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>}
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={flagUrl}
        alt={`Bandeira ${countryName || countryCode}`}
        title={countryName || countryCode.toUpperCase()}
        className={`${size} object-cover border border-black`}
        style={{ aspectRatio: '3/2' }}
        onError={(e) => {
          // Fallback para código do país se a imagem falhar
          e.target.style.display = 'none';
        }}
      />
      {showName && (
        <span className="text-sm font-medium">{countryName || countryCode}</span>
      )}
    </div>
  );
}

// Componente específico para apenas o nome do país
export function CountryName({ countryCode, className = '' }) {
  const [countryName, setCountryName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const loadCountryName = useCallback(async (code) => {
    if (!code) {
      setLoading(false);
      return;
    }
    
    const lowerCode = code.toLowerCase();
    
    try {
      const countryCodes = await fetchCountryCodes();
      const name = countryCodes[lowerCode] || code.toUpperCase();
      setCountryName(name);
    } catch (error) {
      console.error('Error loading country name:', error);
      setCountryName(code.toUpperCase());
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadCountryName(countryCode);
  }, [countryCode, loadCountryName]);
  
  if (loading) {
    return <div className={`w-16 h-4 bg-gray-200 animate-pulse rounded ${className}`}></div>;
  }
  
  return <span className={className}>{countryName || countryCode}</span>;
}
