/* eslint-disable @typescript-eslint/no-explicit-any */
// useIndexedDBModel.ts - Hook personalizado para usar modelos de IndexedDB

import { useState, useEffect, useCallback } from 'react';

// Tipo genérico para representar el estado del hook
interface ModelState<T> {
  data: T[] | null;
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
}

// Tipo genérico para las opciones de inicialización
interface UseModelOptions {
  loadOnInit?: boolean;
  onError?: (error: Error) => void;
}

// Hook principal para usar cualquier modelo


export function useIndexedDB<T, M extends ModelWithMethods<T>>(
  model: M,
  options: UseModelOptions = { loadOnInit: true }
) {
  // Estado inicial
  const [state, setState] = useState<ModelState<T>>({
    data: null,
    selectedItem: null,
    loading: false,
    error: null
  });

  // Cargar todos los datos
  const loadAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await model.getAll();
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
    }
  }, [model, options]);

  // Obtener un elemento por su ID
  const getById = useCallback(async (id: number | string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const item = await model.getById(id);
      setState(prev => ({ ...prev, selectedItem: item, loading: false }));
      return item;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      return null;
    }
  }, [model, options]);

  // Crear un nuevo elemento
  const create = useCallback(async (item: T) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const id = await model.add(item);
      await loadAll(); // Recargar datos después de crear
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    }
  }, [model, loadAll, options]);

  // Actualizar un elemento existente
  const update = useCallback(async (item: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await model.update(item);
      await loadAll(); // Recargar datos después de actualizar
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    }
  }, [model, loadAll, options]);

  // Eliminar un elemento
  const remove = useCallback(async (id: number | string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await model.delete(id);
      await loadAll(); // Recargar datos después de eliminar
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    }
  }, [model, loadAll, options]);

  // Buscar elementos
  const search = useCallback(async (query: string) => {
    try {
      if (!query) {
        await loadAll();
        return;
      }
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      // Asumimos que los modelos tienen un método search, pero verificamos primero
      if (typeof model.search === 'function') {
        const results = await model.search(query);
        setState(prev => ({ ...prev, data: results, loading: false }));
      } else {
        throw new Error('El modelo no soporta la función de búsqueda');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
    }
  }, [model, loadAll, options]);

  // Limpiar el error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Limpiar el estado completo
  const clearState = useCallback(() => {
    setState({
      data: null,
      selectedItem: null,
      loading: false,
      error: null
    });
  }, []);

  // Cargar datos automáticamente al iniciar si la opción está activa
  useEffect(() => {
    if (options.loadOnInit) {
      loadAll();
    }
  }, [loadAll, options.loadOnInit]);

  // Devolver estado y métodos
  return {
    // Estado
    data: state.data,
    selectedItem: state.selectedItem,
    loading: state.loading,
    error: state.error,
    
    // Métodos
    loadAll,
    getById,
    create,
    update,
    remove,
    search,
    clearError,
    clearState,
    
    // Métodos adicionales si existen en el modelo
    ...(typeof model.login === 'function' ? { 
      login: async (username: string, password: string) => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          const result = await model.login!(username, password);
          setState(prev => ({ ...prev, loading: false }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
          if (options.onError && error instanceof Error) {
            options.onError(error);
          }
          return null;
        }
      } 
    } : {}),
    
    // Si el modelo tiene getByUsername, lo incluimos
    ...(typeof model.getByUsername === 'function' ? { 
      getByUsername: async (username: string) => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          const result = await model.getByUsername!(username);
          setState(prev => ({ ...prev, selectedItem: result, loading: false }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
          if (options.onError && error instanceof Error) {
            options.onError(error);
          }
          return null;
        }
      } 
    } : {})
  };
}

// Interfaz básica que todos los modelos deben cumplir
interface ModelWithMethods<T> {
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T | null>;
  add(item: any): Promise<number | string>;
  update(item: any): Promise<void>;
  delete(id: number | string): Promise<void>;
  search?(query: string): Promise<T[]>;
  login?(username: string, password: string): Promise<T | null>;
  getByUsername?(username: string): Promise<T | null>;
}

export default useIndexedDB;