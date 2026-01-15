import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useWindowSize } from '../hooks/useWindowSize';

const UserProfile = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    retry: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Admin' };
      case 'manager':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Manager' };
      case 'employee':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Employee' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'Guest' };
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            borderRadius: '50%',
            background: 'var(--border)',
          }}
        />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const roleBadge = getRoleBadgeColor(currentUser.role);
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: dropdownOpen ? 'rgba(102, 126, 234, 0.1)' : 'var(--white)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: isMobile ? '13px' : '14px',
        }}
        onMouseEnter={(e) => {
          if (!dropdownOpen) {
            e.currentTarget.style.background = 'var(--bg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!dropdownOpen) {
            e.currentTarget.style.background = 'var(--white)';
          }
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #667eea 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: isMobile ? '11px' : '12px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* User Info - Hidden on mobile */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '150px',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: roleBadge.color,
                fontWeight: 500,
              }}
            >
              {roleBadge.label}
            </div>
          </div>
        )}

        <ChevronDown
          size={16}
          style={{
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            minWidth: isMobile ? '200px' : '280px',
            overflow: 'hidden',
          }}
        >
          {/* User Info Section */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #667eea 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-light)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                background: roleBadge.bg,
                color: roleBadge.color,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {roleBadge.label}
            </div>

            {/* Additional Info */}
            {(currentUser.department || currentUser.designation) && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-light)' }}>
                {currentUser.department && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Department:</strong> {currentUser.department}
                  </div>
                )}
                {currentUser.designation && (
                  <div>
                    <strong>Designation:</strong> {currentUser.designation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
