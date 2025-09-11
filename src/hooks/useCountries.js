'use client';

import { useState, useEffect, useCallback } from 'react';

// Cache global para evitar requests duplicados
const countryCache = new Map();
const pendingRequests = new Map();

export function useCountries() {
  const [countries, setCountries] = useState(countryCache);
  
  const getCountryData = useCallback(async (countryCode) => {
    if (!countryCode) return null;
    
    const upperCode = countryCode.toUpperCase();
    
    // Se já está no cache, retorna imediatamente
    if (countryCache.has(upperCode)) {
      return countryCache.get(upperCode);
    }
    
    // Se já existe uma request pendente, aguarda ela
    if (pendingRequests.has(upperCode)) {
      return await pendingRequests.get(upperCode);
    }
    
    // Cria nova request
    const request = fetchCountryData(upperCode);
    pendingRequests.set(upperCode, request);
    
    try {
      const data = await request;
      countryCache.set(upperCode, data);
      setCountries(new Map(countryCache));
      return data;
    } finally {
      pendingRequests.delete(upperCode);
    }
  }, []);
  
  return { countries, getCountryData };
}

async function fetchCountryData(countryCode) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,flags,cca2`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch country data: ${response.status}`);
    }
    
    const data = await response.json();
    const country = Array.isArray(data) ? data[0] : data;
    
    return {
      code: country.cca2,
      name: country.name.common,
      officialName: country.name.official,
      flag: {
        png: country.flags.png,
        svg: country.flags.svg,
        alt: country.flags.alt || `Flag of ${country.name.common}`
      }
    };
  } catch (error) {
    console.error(`Error fetching country data for ${countryCode}:`, error);
    
    // Fallback: retorna dados básicos com emoji flag se disponível
    return {
      code: countryCode,
      name: countryCode,
      officialName: countryCode,
      flag: {
        png: null,
        svg: null,
        alt: `Flag of ${countryCode}`
      }
    };
  }
}

// Hook para buscar múltiplos países de uma vez
export function useCountriesData(countryCodes) {
  const [countriesData, setCountriesData] = useState({});
  const [loading, setLoading] = useState(true);
  const { getCountryData } = useCountries();
  
  useEffect(() => {
    const loadCountries = async () => {
      if (!countryCodes || countryCodes.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const uniqueCodes = [...new Set(countryCodes.filter(Boolean))];
      const results = {};
      
      await Promise.all(
        uniqueCodes.map(async (code) => {
          const data = await getCountryData(code);
          if (data) {
            results[code.toUpperCase()] = data;
          }
        })
      );
      
      setCountriesData(results);
      setLoading(false);
    };
    
    loadCountries();
  }, [JSON.stringify(countryCodes), getCountryData]);
  
  return { countriesData, loading };
}
