import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { userService, User, CreateUserDto } from '../services/userService';
import { Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';
import UserForm from '../components/UserForm';
import PermissionManager from '../components/PermissionManager';
import { useWindowSize } from '../hooks/useWindowSize';
import { usePlant } from '../contexts/PlantContext';

const Users = () => {
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissionUser, setPermissionUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant } = usePlant();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, plantId: selectedPlant?.id }],
    queryFn: () => userService.getAllUsers(page, 100), // Get more users to filter client-side
  });

  // Filter users by selected plant (client-side filtering)
  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    
    if (!selectedPlant) {
      return data.data; // Show all users if no plant selected
    }

    // Filter by plant name (users have plant as string name)
    return data.data.filter((user: User) => 
      user.plant === selectedPlant.name || user.plant === selectedPlant.code
    );
  }, [data?.data, selectedPlant]);

  // Additional protection: redirect if not admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page. Admin access required.</p>
      </div>
    );
  }

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUser(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'manager':
        return '#3b82f6';
      case 'employee':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          employeeTaskManager: ['read', 'write', 'delete', 'admin'],
          pms: ['read', 'write', 'delete', 'admin'],
          humanResource: ['read', 'write', 'delete', 'admin'],
          maintenance: ['read', 'write', 'delete', 'admin'],
        };
      case 'manager':
        return {
          employeeTaskManager: ['read', 'write'],
          pms: ['read', 'write'],
          humanResource: ['read', 'write'],
          maintenance: ['read', 'write'],
        };
      case 'employee':
        return {
          employeeTaskManager: ['read'],
          pms: ['read'],
          humanResource: ['read'],
          maintenance: ['read'],
        };
      default:
        return {
          employeeTaskManager: [],
          pms: [],
          humanResource: [],
          maintenance: [],
        };
    }
  };

  const handleAddUser = async (userData: CreateUserDto & { password?: string }) => {
    try {
      const permissions = getDefaultPermissions(userData.role);
      
      // Ensure password is included for new users
      if (!userData.password) {
        alert('Error: Password is required for new users');
        return;
      }
      
      await userService.createUser({ 
        ...userData, 
        modulePermissions: permissions,
        password: userData.password // Explicitly include password
      });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('User created successfully! They can now login with their email and password.');
    } catch (error: any) {
      console.error('User creation error:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to create user';
      let errorDetails = '';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error?.message || errorMessage;
        errorDetails = error.response.data.error?.details || '';
        
        // Check for validation errors
        if (error.response.data.error?.code === 'VALIDATION_ERROR') {
          const validationErrors = error.response.data.error?.details || error.response.data.data || [];
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            errorMessage = 'Validation Error:\n' + validationErrors.map((e: any) => `- ${e.msg || e.message || e}`).join('\n');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error message
      if (errorMessage.includes('Service account lacks permissions') || errorMessage.includes('PERMISSION_DENIED')) {
        alert(
          '⚠️ Permission Error\n\n' +
          'Your Firebase service account needs additional permissions to create users.\n\n' +
          'Option 1: Fix Permissions (Recommended)\n' +
          '1. Go to: https://console.cloud.google.com/iam-admin/iam?project=dhananjaygroup-dms\n' +
          '2. Find your service account (ends with @dhananjaygroup-dms.iam.gserviceaccount.com)\n' +
          '3. Click Edit → Add Role → Add:\n' +
          '   - Service Usage Consumer\n' +
          '   - Firebase Admin SDK Administrator Service Agent\n' +
          '4. Save and wait 2-3 minutes for permissions to propagate\n\n' +
          'Option 2: Manual Creation\n' +
          'Use Firebase Console to create users manually (see USER_MANAGEMENT.md)'
        );
      } else if (errorMessage.includes('email-already-exists') || errorMessage.includes('already exists')) {
        alert(`Error: A user with this email address already exists. Please use a different email.`);
      } else {
        alert(`Error: ${errorMessage}${errorDetails ? '\n\nDetails: ' + errorDetails : ''}`);
      }
    }
  };

  if (isLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '16px',
          marginBottom: '30px',
        }}
      >
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', margin: 0 }}>User Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Add New User</h2>
          <UserForm
            onSubmit={(data) => handleAddUser(data as CreateUserDto)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingUser && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Edit User</h2>
          <UserForm
            user={editingUser}
            onSubmit={async (data) => {
              try {
                await userService.updateUser(editingUser.id, data);
                setEditingUser(null);
                queryClient.invalidateQueries({ queryKey: ['users'] });
              } catch (error: any) {
                alert(`Error: ${error.message || 'Failed to update user'}`);
              }
            }}
            onCancel={() => setEditingUser(null)}
          />
        </div>
      )}

      {permissionUser && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Manage Permissions: {permissionUser.displayName}</h2>
          <PermissionManager
            user={permissionUser}
            onSave={() => {
              setPermissionUser(null);
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
            onCancel={() => setPermissionUser(null)}
          />
        </div>
      )}

      <div className="card">
        {selectedPlant && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            background: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong style={{ color: 'var(--primary)' }}>
                  🔍 Filtering by: {selectedPlant.name} ({selectedPlant.code})
                </strong>
                <span style={{ marginLeft: '12px', color: 'var(--text-light)', fontSize: '14px' }}>
                  Showing {filteredUsers.length} of {data?.data?.length || 0} users
                </span>
              </div>
              {filteredUsers.length === 0 && data?.data && data.data.length > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                  💡 Tip: Make sure users have "Plant" field set to "{selectedPlant.name}" or "{selectedPlant.code}"
                </div>
              )}
            </div>
          </div>
        )}

        {filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div style={{ display: !isMobile ? 'block' : 'none', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Employee ID</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Employee Name</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Plant</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Designation</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Contact No.</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Mail ID</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.employeeId || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        <strong>{user.displayName}</strong>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.plant || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.department || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.designation || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.contactNo || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            textTransform: 'capitalize',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: user.isActive ? '#d1fae5' : '#fee2e2',
                            color: user.isActive ? '#065f46' : '#991b1b',
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setEditingUser(user)}
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setPermissionUser(user)}
                            title="Manage Permissions"
                          >
                            <Shield size={14} />
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.displayName}?`)) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div style={{ display: isMobile ? 'block' : 'none' }}>
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--white)',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ marginBottom: '4px', fontSize: '16px', fontWeight: '600' }}>
                      {user.displayName}
                    </h3>
                    {user.employeeId && (
                      <p style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '4px' }}>
                        ID: {user.employeeId}
                      </p>
                    )}
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '8px' }}>
                      {user.email}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-light)' }}>
                      {user.plant && <span>Plant: {user.plant}</span>}
                      {user.department && <span>Dept: {user.department}</span>}
                      {user.designation && <span>Designation: {user.designation}</span>}
                      {user.contactNo && <span>Contact: {user.contactNo}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role),
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.role}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.isActive ? '#d1fae5' : '#fee2e2',
                        color: user.isActive ? '#065f46' : '#991b1b',
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => setPermissionUser(user)}
                    >
                      <Shield size={14} /> Permissions
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                    >
                      {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />} {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${user.displayName}?`)) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {data.pagination && (
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: isMobile ? 'center' : 'left' }}>
                  {selectedPlant ? (
                    <>Showing {filteredUsers.length} of {data.pagination.total} users for {selectedPlant.name}</>
                  ) : (
                    <>Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total users)</>
                  )}
                </p>
                <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    className="btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{ flex: isMobile ? 1 : 'auto' }}
                  >
                    Previous
                  </button>
                  <button
                    className="btn"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{ flex: isMobile ? 1 : 'auto' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            <p>
              {selectedPlant 
                ? `No users found for ${selectedPlant.name} (${selectedPlant.code})`
                : 'No users found'
              }
            </p>
            {selectedPlant && data?.data && data.data.length > 0 && (
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                Try selecting "All Plants" to see all users
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
