import type { SearchParams, SearchResult } from '../types';
import { MOCK_FLIGHTS } from '../data/constants';

export const flightService = {
  search: async (params: SearchParams): Promise<SearchResult> => {
    await new Promise((r) => setTimeout(r, 800));

    const results = MOCK_FLIGHTS.filter((f) => {
      const matchOrigin = !params.origin || f.origin.toUpperCase() === params.origin.toUpperCase();
      const matchDest =
        !params.destination ||
        f.destination.toUpperCase() === params.destination.toUpperCase() ||
        (params.destination.toUpperCase() === 'IST' && f.destination === 'SAW');
      const matchCabin =
        !params.cabinClass || params.cabinClass === 'economy' || f.cabinClass === params.cabinClass;
      return matchOrigin && matchDest && matchCabin;
    });

    return {
      success: true,
      date: params.date || '2026-03-01',
      resultCount: results.length,
      flights: results,
      passengers: params.passengers || 1,
    };
  },
};
