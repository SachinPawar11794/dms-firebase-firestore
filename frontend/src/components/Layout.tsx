import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { auth } from '../config/firebase';
import { User } from 'firebase/auth';
import { LogOut, LayoutDashboard, CheckSquare, Factory, Users, Wrench, UserCog, Menu, X, Settings, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import UserProfile from './UserProfile';
import { useWindowSize } from '../hooks/useWindowSize';
import { usePlant } from '../contexts/PlantContext';
import { usePlants } from '../hooks/usePlants';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant, setSelectedPlant } = usePlant();
  const { plants } = usePlants(true); // Get only active plants

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Track auth state reactively
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get current user to check role - only fetch if authenticated
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    enabled: !!firebaseUser,
    retry: false,
  });

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Cancel all ongoing queries first
      queryClient.cancelQueries();
      // Clear React Query cache before logout
      queryClient.clear();
      // Remove all query observers
      queryClient.removeQueries();
      
      // Clear localStorage
      localStorage.removeItem('dms_selected_plant');
      
      // Logout
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error
      navigate('/login');
    }
  };

  // Check if settings menu should be open based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/users') || location.pathname.startsWith('/plants')) {
      setSettingsMenuOpen(true);
    }
  }, [location.pathname]);

  // Invalidate queries when plant changes
  useEffect(() => {
    if (selectedPlant) {
      // This will trigger data refresh in all components using React Query
      // Components will automatically refetch with new plantId in query key
    }
  }, [selectedPlant]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/productions', label: 'Productions', icon: Factory },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  ];

  const settingsItems = currentUser?.role === 'admin' ? [
    { path: '/users', label: 'User Management', icon: UserCog },
    { path: '/plants', label: 'Plant Master', icon: Building2 },
  ] : [];

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
      {/* Top Header with Plant Selector */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? 0 : '250px',
          right: 0,
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          padding: isMobile ? '8px 12px' : '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
          boxShadow: 'var(--shadow)',
          height: isMobile ? '48px' : '56px',
        }}
      >
        {/* Mobile Menu Button - Only on mobile */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Plant Selector */}
        <div style={{ position: 'relative', flex: isMobile ? 1 : 'none', minWidth: isMobile ? '0' : '200px', maxWidth: isMobile ? 'none' : '200px' }}>
          <button
            onClick={() => setPlantDropdownOpen(!plantDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '8px 12px',
              background: selectedPlant ? 'rgba(102, 126, 234, 0.1)' : 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: isMobile ? '13px' : '14px',
              color: selectedPlant ? 'var(--primary)' : 'var(--text)',
              fontWeight: selectedPlant ? 600 : 400,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Building2 size={isMobile ? 16 : 18} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedPlant ? selectedPlant.code : 'Select Plant'}
              </span>
            </div>
            <ChevronDown size={16} style={{ flexShrink: 0 }} />
          </button>

          {/* Plant Dropdown */}
          {plantDropdownOpen && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <button
                  onClick={() => {
                    setSelectedPlant(null);
                    setPlantDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: !selectedPlant ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: !selectedPlant ? 'var(--primary)' : 'var(--text)',
                    fontWeight: !selectedPlant ? 600 : 400,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  All Plants
                </button>
                {plants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      setSelectedPlant(plant);
                      setPlantDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      background: selectedPlant?.id === plant.id ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: selectedPlant?.id === plant.id ? 'var(--primary)' : 'var(--text)',
                      fontWeight: selectedPlant?.id === plant.id ? 600 : 400,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {plant.code}
                  </button>
                ))}
                {plants.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                    No active plants available
                  </div>
                )}
              </div>
              {/* Click outside to close */}
              <div
                onClick={() => setPlantDropdownOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                }}
              />
            </>
          )}
        </div>

        {/* User Profile */}
        <div style={{ flexShrink: 0 }}>
          <UserProfile />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? '280px' : '250px',
          minWidth: isMobile ? '280px' : '250px',
          maxWidth: isMobile ? '280px' : '250px',
          background: 'var(--white)',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          padding: '20px',
          display: isMobile && !mobileMenuOpen ? 'none' : 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? '48px' : '56px', // Account for fixed header
          left: 0,
          height: isMobile ? 'calc(100vh - 48px)' : 'calc(100vh - 56px)',
          maxHeight: isMobile ? 'calc(100vh - 48px)' : 'calc(100vh - 56px)',
          zIndex: 99,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: isMobile ? 'var(--shadow-lg)' : 'none',
          transform: isMobile && mobileMenuOpen ? 'translateX(0)' : isMobile ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out',
          boxSizing: 'border-box',
        }}
      >
        {!isMobile && (
          <h1 style={{ marginBottom: '30px', color: 'var(--primary)', fontSize: '24px' }}>
            DMS System
          </h1>
        )}
        <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: isMobile ? '16px' : '14px',
                }}
              >
                <Icon size={isMobile ? 22 : 20} />
                {item.label}
              </Link>
            );
          })}

          {/* App Settings Menu */}
          {settingsItems.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: settingsMenuOpen ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  color: settingsMenuOpen ? 'var(--primary)' : 'var(--text)',
                  fontWeight: settingsMenuOpen ? 600 : 400,
                  fontSize: isMobile ? '16px' : '14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Settings size={isMobile ? 22 : 20} />
                  <span>App Settings</span>
                </div>
                {settingsMenuOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>

              {/* Settings Submenu */}
              {settingsMenuOpen && (
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>
                  {settingsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          marginBottom: '4px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: isActive ? 'var(--primary)' : 'var(--text)',
                          background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: isMobile ? '15px' : '13px',
                        }}
                      >
                        <Icon size={isMobile ? 20 : 18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
        {/* Logout button - Hidden on desktop since it's in UserProfile, shown on mobile */}
        {isMobile && (
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '20px' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '48px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 98,
          }}
        />
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? '16px' : '30px',
          paddingTop: isMobile ? '64px' : '72px', // Add top padding for fixed header
          background: 'var(--bg)',
          width: '100%',
          minWidth: 0,
          minHeight: isMobile ? 'calc(100vh - 48px)' : '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
