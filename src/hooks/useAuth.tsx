
import { useAuthContext } from './auth/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export { AuthProvider } from './auth/AuthProvider';
