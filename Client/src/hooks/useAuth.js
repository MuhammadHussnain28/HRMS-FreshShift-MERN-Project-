import { useSelector } from 'react-redux';

export default function useAuth() {
  const { user, accessToken, isAuthenticated, isBootstrapping, status, error } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    accessToken,
    isAuthenticated,
    isBootstrapping,
    status,
    error,
    role: user?.role || null,
    isEmployee: user?.role === 'employee',
    isAdmin: user?.role === 'hr_admin',
  };
}
