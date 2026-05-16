import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
        Loading session...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
