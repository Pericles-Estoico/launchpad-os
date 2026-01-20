import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/common/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWorkspace?: boolean;
}

export function ProtectedRoute({ children, requireWorkspace = true }: ProtectedRouteProps) {
  const { session, isLoading, workspaceId } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingState message="Carregando..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If workspace is required and user doesn't have one, redirect to onboarding
  if (requireWorkspace && !workspaceId && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
