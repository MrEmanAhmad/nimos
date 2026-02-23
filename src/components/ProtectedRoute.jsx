import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
          <p className="text-[#a0a0a0] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role-based access control
  if (roles && roles.length > 0) {
    const userRole = user?.role || 'customer';
    if (!roles.includes(userRole)) {
      return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-10 border border-white/5 text-center max-w-md">
            <div className="w-16 h-16 bg-[#e94560]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-[#a0a0a0] mb-6">
              You don't have permission to view this page.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#e94560] hover:bg-[#d13350] text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
}
