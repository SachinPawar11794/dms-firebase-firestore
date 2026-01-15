import { useState } from 'react';
import { User, UserPermissionUpdateDto } from '../services/userService';
import { userService } from '../services/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWindowSize } from '../hooks/useWindowSize';

interface PermissionManagerProps {
  user: User;
  onSave: () => void;
  onCancel: () => void;
}

const modules = [
  { key: 'employeeTaskManager', label: 'Employee Task Manager' },
  { key: 'pms', label: 'Production Management System' },
  { key: 'humanResource', label: 'Human Resource' },
  { key: 'maintenance', label: 'Maintenance' },
];

const permissions = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
  { key: 'delete', label: 'Delete' },
  { key: 'admin', label: 'Admin' },
];

const PermissionManager = ({ user, onSave, onCancel }: PermissionManagerProps) => {
  const [modulePermissions, setModulePermissions] = useState(user.modulePermissions || {});
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const isMobile = width <= 480;

  const updateMutation = useMutation({
    mutationFn: ({ module, permissions }: UserPermissionUpdateDto) =>
      userService.updateUserPermissions(user.id, { module, permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSave();
    },
  });

  const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
    const current = modulePermissions[module] || [];
    const updated = checked
      ? [...current, permission]
      : current.filter((p) => p !== permission);

    setModulePermissions({
      ...modulePermissions,
      [module]: updated,
    });
  };

  const handleSaveModule = (module: string) => {
    updateMutation.mutate({
      module,
      permissions: modulePermissions[module] || [],
    });
  };

  const setDefaultPermissions = (role: string) => {
    let defaults: { [key: string]: string[] } = {};
    
    switch (role) {
      case 'admin':
        defaults = {
          employeeTaskManager: ['read', 'write', 'delete', 'admin'],
          pms: ['read', 'write', 'delete', 'admin'],
          humanResource: ['read', 'write', 'delete', 'admin'],
          maintenance: ['read', 'write', 'delete', 'admin'],
        };
        break;
      case 'manager':
        defaults = {
          employeeTaskManager: ['read', 'write'],
          pms: ['read', 'write'],
          humanResource: ['read', 'write'],
          maintenance: ['read', 'write'],
        };
        break;
      case 'employee':
        defaults = {
          employeeTaskManager: ['read'],
          pms: ['read'],
          humanResource: ['read'],
          maintenance: ['read'],
        };
        break;
      default:
        defaults = {
          employeeTaskManager: [],
          pms: [],
          humanResource: [],
          maintenance: [],
        };
    }

    setModulePermissions(defaults);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px',
          alignItems: isMobile ? 'flex-start' : 'center',
        }}
      >
        <button
          className="btn"
          onClick={() => setDefaultPermissions(user.role)}
          style={{ fontSize: '14px', width: isMobile ? '100%' : 'auto', minHeight: '44px' }}
        >
          Set Default for {user.role}
        </button>
        <span style={{ color: 'var(--text-light)', fontSize: '14px', alignSelf: isMobile ? 'flex-start' : 'center' }}>
          Role: <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>
        </span>
      </div>

      {modules.map((module) => (
        <div
          key={module.key}
          style={{
            marginBottom: '20px',
            padding: '16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{module.label}</h3>
            <button
              className="btn btn-primary"
              onClick={() => handleSaveModule(module.key)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                width: isMobile ? '100%' : 'auto',
                minHeight: '44px',
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {permissions.map((permission) => {
              const isChecked = (modulePermissions[module.key] || []).includes(permission.key);
              return (
                <label
                  key={permission.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: isChecked ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                    minHeight: '44px', // Touch-friendly size
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handlePermissionChange(module.key, permission.key, e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{permission.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PermissionManager;
