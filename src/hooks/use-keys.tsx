
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import type { Key } from '@/lib/types';
import { getKeys } from '@/app/keys/actions';
import { useAuth } from './use-auth';

interface KeysContextType {
  keys: Key[];
  filteredKeys: Key[];
  loading: boolean;
  addKey: (key: Key) => void;
  removeKey: (keyId: string) => void;
  editKey: (keyId: string, updatedData: Partial<Key>) => void;
}

const KeysContext = createContext<KeysContextType | undefined>(undefined);

export function KeysProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKeys() {
      // Only fetch keys if auth is done and we have a user.
      if (!authLoading && user) {
        setLoading(true);
        const serverKeys = await getKeys();
        setKeys(serverKeys);
        setLoading(false);
      } else if (!authLoading && !user) {
        // If auth is done and there's no user, stop loading.
        setLoading(false);
      }
    }
    loadKeys();
  }, [user, authLoading]);

  const addKey = useCallback((key: Key) => {
    setKeys((prev) => [key, ...prev]);
  }, []);

  const removeKey = useCallback((keyId: string) => {
    setKeys((prev) => prev.filter((k) => k.id_keys !== keyId));
  }, []);

  const editKey = useCallback((keyId: string, updatedData: Partial<Key>) => {
    setKeys((prev) =>
      prev.map((k) => (k.id_keys === keyId ? { ...k, ...updatedData } : k))
    );
  }, []);

  const filteredKeys = useMemo(() => {
    if (!user) return [];
    if (user.level === 1) {
      return keys; // Main Admins see all keys
    }
    // For Reseller Admins, this will be handled by the server-side logic in actions
    // This client-side filter is a fallback/default behavior
    return keys.filter((k) => k.registrator === user.username);
  }, [keys, user]);

  const value = {
    keys,
    filteredKeys,
    loading,
    addKey,
    removeKey,
    editKey,
  };

  return (
    <KeysContext.Provider value={value}>
      {children}
    </KeysContext.Provider>
  );
}

export const useKeys = (): KeysContextType => {
  const context = useContext(KeysContext);
  if (context === undefined) {
    throw new Error('useKeys must be used within a KeysProvider');
  }
  return context;
};
