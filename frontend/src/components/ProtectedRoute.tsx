import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'employee';
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requiredRole, requireAdmin = false }: ProtectedRouteProps) => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    retry: false,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is active
  if (!currentUser.isActive) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Account Inactive</h2>
        <p>Your account has been deactivated. Please contact an administrator.</p>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && currentUser.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page. Admin access required.</p>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy: { admin: number; manager: number; employee: number; guest?: number } = { admin: 3, manager: 2, employee: 1, guest: 0 };
    const userRoleLevel = roleHierarchy[currentUser.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page. {requiredRole} role or higher required.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
