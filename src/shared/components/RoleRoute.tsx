import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type RoleRouteProps = {
  children: React.ReactNode;
  allow: (roles: string[]) => boolean;
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

  if (!user || !allow(user.roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRoute;
