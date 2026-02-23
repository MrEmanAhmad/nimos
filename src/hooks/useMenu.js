/**
 * useMenu -- fetches the live menu from the API with automatic
 * fallback to the static menu data when the API is unavailable.
 *
 * Returns:
 *   categories  - array of category objects
 *   items       - flat array of menu items (each with category_id)
 *   options     - array of item option groups
 *   status      - restaurant status { open, busy, paused }
 *   loading     - true while the initial fetch is in progress
 *   error       - error message string, or null
 *   refetch     - call to re-fetch the menu
 *   searchMenu  - async function to search menu items via API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { menu as menuApi } from '../utils/api';
import { menuData as staticMenu } from '../data/menu';

// Transform the static menu data into the same shape returned by the API
// so consumers never have to care where the data came from.
function normaliseStaticMenu() {
  const categories = staticMenu.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
  }));

  const items = staticMenu.flatMap((cat) =>
    cat.items.map((item, idx) => ({
      id: `${cat.id}-${idx}`,
      name: item.name,
      description: item.description,
      price: item.price,
      popular: item.popular,
      category_id: cat.id,
    }))
  );

  return {
    categories,
    items,
    options: [],
    status: { open: true, busy: false, paused: false },
  };
}

export function useMenu() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const mountedRef = useRef(true);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const result = await menuApi.getMenu();
      if (!mountedRef.current) return;

      setData(result);
    } catch (err) {
      if (!mountedRef.current) return;

      // Fall back to static data so the site still works offline / pre-API
      console.warn('Menu API unavailable, using static fallback:', err.message);
      setData(normaliseStaticMenu());
      setUsingFallback(true);
      setError(err.message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchMenu();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchMenu]);

  const searchMenu = useCallback(async (query) => {
    if (!query || query.trim().length === 0) return [];

    try {
      return await menuApi.searchMenu(query);
    } catch (err) {
      // Fallback: local search over static data
      const q = query.toLowerCase();
      const fallback = normaliseStaticMenu();
      return fallback.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }
  }, []);

  return {
    categories: data?.categories ?? [],
    items: data?.items ?? [],
    options: data?.options ?? [],
    status: data?.status ?? { open: true, busy: false, paused: false },
    loading,
    error,
    usingFallback,
    refetch: fetchMenu,
    searchMenu,
  };
}
