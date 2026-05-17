import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../auth/permissions';

type RoleRouteProps = {
  children: React.ReactNode;
  allow: (user: AuthUser) => boolean;
  redirectTo?: string;
};

const RoleRoute = ({
  children,
  allow,
  redirectTo = '/dashboard',
}: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="app-card rounded-2xl p-8 text-center text-slate-400">
        Loading...
      </p>
    );
  }

  if (!user || !allow(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRoute;
