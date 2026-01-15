import { useState } from 'react';
import { User, CreateUserDto, UpdateUserDto } from '../services/userService';
import { useWindowSize } from '../hooks/useWindowSize';
import { usePlants } from '../hooks/usePlants';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  onCancel: () => void;
}

const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<User['role']>(user?.role || 'employee');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const [plant, setPlant] = useState(user?.plant || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [contactNo, setContactNo] = useState(user?.contactNo || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width <= 480;
  const { plants } = usePlants(true); // Get only active plants

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !displayName) {
      setError('Email and display name are required');
      setLoading(false);
      return;
    }

    // For new users, password is required
    if (!user && !password) {
      setError('Password is required for new users');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!user && password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Confirm password match
    if (!user && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (user) {
        // Update existing user
        onSubmit({ 
          displayName, 
          role, 
          isActive,
          employeeId: employeeId || undefined,
          plant: plant || undefined,
          department: department || undefined,
          designation: designation || undefined,
          contactNo: contactNo || undefined,
        });
      } else {
        // Create new user with password
        onSubmit({ 
          email, 
          displayName, 
          role, 
          password, 
          isActive,
          employeeId: employeeId || undefined,
          plant: plant || undefined,
          department: department || undefined,
          designation: designation || undefined,
          contactNo: contactNo || undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      {!user && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">Password *</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              Password must be at least 8 characters long
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">Confirm Password *</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter password"
            />
          </div>
        </>
      )}

      {user && (
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            disabled
            style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
            Email cannot be changed
          </p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Employee Name *</label>
        <input
          type="text"
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder="Enter full name"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Employee ID</label>
        <input
          type="text"
          className="input"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Enter employee ID"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Plant</label>
        <select
          className="input"
          value={plant}
          onChange={(e) => setPlant(e.target.value)}
        >
          <option value="">Select Plant</option>
          {plants.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
        {plants.length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
            No active plants available. Please add plants in App Settings → Plant Master.
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Department</label>
        <input
          type="text"
          className="input"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Enter department"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Designation</label>
        <input
          type="text"
          className="input"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Enter designation"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Contact No.</label>
        <input
          type="tel"
          className="input"
          value={contactNo}
          onChange={(e) => setContactNo(e.target.value)}
          placeholder="Enter contact number"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="label">Role</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value as User['role'])}
          required
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
          Role determines default permissions
        </p>
      </div>

      {user && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Active User</span>
          </label>
        </div>
      )}

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
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: isMobile ? '100%' : 'auto' }}
          disabled={loading}
        >
          {loading ? 'Creating...' : user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
