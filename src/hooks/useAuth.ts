import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Access the current session (user, login, logout).
 *
 * The state itself lives in `context/AuthContext.tsx`; this hook is the
 * entry point that components use.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
