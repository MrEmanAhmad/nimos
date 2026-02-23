import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  Tag,
  Users,
  BarChart3,
  Settings,
  ChefHat,
  ExternalLink,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { admin as adminApi } from '../../utils/api';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: Package, label: 'Orders' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Manager' },
  { to: '/admin/promos', icon: Tag, label: 'Promos' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const EXTERNAL_LINKS = [
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen View' },
  { href: '/', icon: ExternalLink, label: 'Back to Website' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [restaurantOpen, setRestaurantOpen] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch restaurant open status
  useEffect(() => {
    let mounted = true;
    adminApi
      .getSettings()
      .then((data) => {
        if (mounted) {
          setRestaurantOpen(
            data.restaurant_open !== undefined ? data.restaurant_open : true
          );
        }
      })
      .catch(() => {
        if (mounted) setRestaurantOpen(null);
      })
      .finally(() => {
        if (mounted) setLoadingStatus(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleOpen = async () => {
    try {
      const result = await adminApi.toggleOpen();
      setRestaurantOpen(result.open);
    } catch (err) {
      console.error('Failed to toggle restaurant status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[#e94560]/15 text-[#e94560] shadow-sm shadow-[#e94560]/10'
        : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#0f0f0f] border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-[#e94560]" />
              <span className="text-white font-bold text-lg tracking-tight">
                Nimo's <span className="text-[#a0a0a0] font-normal text-sm">Admin</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to="/admin" className="mx-auto">
              <Store className="w-6 h-6 text-[#e94560]" />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#a0a0a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          <div className="my-4 border-t border-white/5" />

          {EXTERNAL_LINKS.map((item) =>
            item.to ? (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all duration-200"
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </a>
            )
          )}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-3 rounded-lg border border-white/5 text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* User section */}
        <div className="border-t border-white/5 p-3 shrink-0">
          {collapsed ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-[#a0a0a0] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e94560]/20 flex items-center justify-center text-[#e94560] font-bold text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-[#a0a0a0] truncate">
                  {user?.email || 'admin@nimos.ie'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#a0a0a0] hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#a0a0a0] hover:text-white transition-colors p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-white font-semibold text-lg hidden sm:block">
              Nimo's Admin
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Restaurant status */}
            {loadingStatus ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
                <Loader2 className="w-3.5 h-3.5 text-[#a0a0a0] animate-spin" />
                <span className="text-xs text-[#a0a0a0] hidden sm:inline">Loading...</span>
              </div>
            ) : restaurantOpen !== null ? (
              <button
                onClick={handleToggleOpen}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  restaurantOpen
                    ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    restaurantOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {restaurantOpen ? 'Open' : 'Closed'}
                </span>
              </button>
            ) : null}

            {/* Notifications */}
            <button className="relative text-[#a0a0a0] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e94560] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* User avatar (mobile) */}
            <div className="w-8 h-8 rounded-full bg-[#e94560]/20 flex items-center justify-center text-[#e94560] font-bold text-xs sm:hidden">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-white/5 lg:hidden z-30 safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#e94560]' : 'text-[#a0a0a0]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
