import {
   Menu as MenuIcon, Bell,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSocket, connectSocket } from '../lib/socket';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import {
  ChefHat,
  Carrot,
  Users,
  ClipboardList,
  Package,
  Trash2,
  UtensilsCrossed,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const ICONS: Record<string, any> = {
  '/dashboard/menus': UtensilsCrossed,
  '/dashboard/ingredients': Carrot,
  '/dashboard/cohorts': Users,
  '/dashboard/dietary-profiles': ClipboardList,
  '/dashboard/procurement': Package,
  '/dashboard/waste': Trash2,
  '/dashboard/meal-orders': ChefHat,
};

const NAV_ITEMS: Record<string, { label: string; path: string }[]> = {
  chef: [
    { label: 'Menus', path: '/dashboard/menus' },
    { label: 'Ingredients', path: '/dashboard/ingredients' },
    { label: 'Meal Orders', path: '/dashboard/meal-orders' },
    { label: 'Waste Log', path: '/dashboard/waste' },
  ],
  dietitian: [
    { label: 'Menus', path: '/dashboard/menus' },
    { label: 'Dietary Profiles', path: '/dashboard/dietary-profiles' },
    { label: 'Cohorts', path: '/dashboard/cohorts' },
  ],
  procurement_officer: [
    { label: 'Ingredients', path: '/dashboard/ingredients' },
    { label: 'Orders', path: '/dashboard/procurement' },
  ],
  admin: [
    { label: 'Menus', path: '/dashboard/menus' },
    { label: 'Ingredients', path: '/dashboard/ingredients' },
    { label: 'Cohorts', path: '/dashboard/cohorts' },
    { label: 'Dietary Profiles', path: '/dashboard/dietary-profiles' },
    { label: 'Procurement', path: '/dashboard/procurement' },
    { label: 'Meal Orders', path: '/dashboard/meal-orders' },
    { label: 'Waste Log', path: '/dashboard/waste' },
  ],
  nurse: [{ label: 'Ward Orders', path: '/dashboard/meal-orders' }],
  student: [{ label: 'My Orders', path: '/dashboard/meal-orders' }],
};

const MOBILE_BREAKPOINT = 768;

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // reset on desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addNotification = useNotificationStore((state) => state.addNotification);

useEffect(() => {
  if (!user?.tenantId) return;
  const socket = connectSocket(user.tenantId); // idempotent — reuses existing connection if present

  const handleLowStock = (data: any) => {
    addNotification({ message: data.message, type: 'low-stock' });
  };

  const handleOrderFinal = (data: any) => {
    addNotification({
      message: `Orders finalized for ${data.serviceDate}`,
      type: 'order-final',
    });
  };

  const handleNewOrder = (data: any) => {
    addNotification({ message: data.message, type: 'new-order' });
  };

  socket.on('low-stock-alert', handleLowStock);
  socket.on('order-count-final', handleOrderFinal);
  socket.on('new-meal-order', handleNewOrder);

  return () => {
    socket.off('low-stock-alert', handleLowStock);
    socket.off('order-count-final', handleOrderFinal);
    socket.off('new-meal-order', handleNewOrder);
  };
}, [addNotification, user?.tenantId]);
  // close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = useNotificationStore((state) => state.notifications);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const [showNotifications, setShowNotifications] = useState(false);

  const items = user ? NAV_ITEMS[user.role] || [] : [];
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
      {/* Overlay (mobile only, shown when sidebar open) */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: 250,
          flexShrink: 0,
          background: 'var(--sidebar-bg)',
          color: 'white',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
              }}
            >
              🥗
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MealSync</span>
          </div>

          {/* Close button - mobile only */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative', marginTop: 18 }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <Bell size={16} />
            Notifications
            {notifications.length > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: 'var(--danger)',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="card-glass"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: 260,
                maxHeight: 300,
                overflowY: 'auto',
                zIndex: 100,
                padding: 10,
              }}
            >
              {notifications.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 8 }}>No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: 8,
                      fontSize: 12,
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 6,
                      color: 'var(--text)',
                    }}
                  >
                    <span>{n.message}</span>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 8px',
            margin: '12px 0 22px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'capitalize' }}>
              {user?.role.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={17} />
            Overview
          </Link>
          {items.map((item) => {
            const Icon = ICONS[item.path] || LayoutDashboard;
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            background: 'rgb(0, 95, 82)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(2, 0, 0, 0.28)',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgb(255, 0, 0)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgb(0, 95, 82)')}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        className="page-enter"
        style={{
          flex: 1,
          padding: isMobile ? '16px' : '32px 40px',
          maxWidth: 1280,
          width: '100%',
        }}
      >
        {/* Mobile top bar with hamburger */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Menu size={18} />
            </button>
           
           <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MealSync</span>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}