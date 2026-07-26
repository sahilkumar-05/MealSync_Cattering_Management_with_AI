import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { connectSocket } from '../lib/socket';
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
            background: 'rgba(28, 28, 28, 0.5)',
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
          color: '#f7f6f2',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          borderRight: '1px solid rgba(247,246,242,0.1)',
          zIndex: 50,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 2,
                border: '1px solid var(--primary)',
                background: 'rgba(61, 112, 104, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
              }}
            >
              🥗
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, letterSpacing: '-0.01em' }}>MealSync</span>
          </div>

          {/* Close button - mobile only */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(247,246,242,0.08)',
                border: '1px solid rgba(247,246,242,0.15)',
                borderRadius: 2,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f7f6f2',
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
              background: 'transparent',
              border: '1px solid rgba(247,246,242,0.15)',
              borderRadius: 2,
              color: '#f7f6f2',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
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
                  fontFamily: 'var(--font-mono)',
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
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(247,246,242,0.6)', margin: 8 }}>No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: 8,
                      fontSize: 12,
                      borderBottom: '1px solid rgba(247,246,242,0.12)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 6,
                      color: '#f7f6f2',
                    }}
                  >
                    <span>{n.message}</span>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(247,246,242,0.6)' }}
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
            borderRadius: 2,
            border: '1px solid rgba(247,246,242,0.12)',
            background: 'rgba(247,246,242,0.04)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f7f6f2',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
            background: 'transparent',
            color: '#f7f6f2',
            border: '1px solid rgba(247,246,242,0.2)',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger)';
            e.currentTarget.style.borderColor = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(247,246,242,0.2)';
          }}
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
                borderRadius: 2,
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

           <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--text)' }}>MealSync</span>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}
