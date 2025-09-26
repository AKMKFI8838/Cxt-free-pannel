
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getPermissions } from '@/app/permissions/actions';
import { Loader2 } from 'lucide-react';
import type { Permissions, User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    permissions: Permissions;
    updateUser: (newUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// List of routes that do not require authentication
const UNPROTECTED_ROUTES = ['/login', '/register', 'setup', '/free-trial'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const router = useRouter();
  const pathname = usePathname();

  const isProtected = !UNPROTECTED_ROUTES.some(route => pathname.startsWith(`/${route}`));


  useEffect(() => {
    const checkAuthStatus = async () => {
      // If we are on a protected route, check everything
      if (isProtected) {
        // Check for user session
        setStatus('Checking session...');
        const userJson = sessionStorage.getItem('user');
        if (userJson) {
          try {
            const userData = JSON.parse(userJson);
            setUser(userData);
            // If user is Reseller Admin, fetch their permissions
            if (userData.level === 2) {
                setStatus('Fetching permissions...');
                const fetchedPermissions = await getPermissions();
                setPermissions(fetchedPermissions || {});
            }
          } catch (e) {
            console.error("Failed to parse user data, redirecting to login.", e);
            sessionStorage.removeItem('user');
            router.push('/login');
          }
        } else {
          // No user session, redirect to login
          router.push('/login');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [router, isProtected, pathname]);

  const updateUser = useCallback((newUserData: Partial<User>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {...prevUser, ...newUserData};
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    });
  }, []);


  const value = { user, loading, permissions, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {(isProtected && loading) ? (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold">{status}</p>
            <p className="mt-2 text-sm text-muted-foreground">Please wait...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
