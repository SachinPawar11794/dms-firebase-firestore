import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Suppress console errors from browser extensions/password managers
  // These errors are harmless and occur when extensions try to auto-login
  useEffect(() => {
    const originalError = console.error;
    const errorFilter = (message: any, ...args: any[]) => {
      // Filter out Firebase auth errors from browser extensions
      if (
        typeof message === 'string' &&
        (message.includes('signInWithPassword') ||
         message.includes('identitytoolkit.googleapis.com') ||
         message.includes('Failed to load resource: the server responded with a status of 400'))
      ) {
        // Suppress these specific errors - they're from browser extensions
        return;
      }
      originalError(message, ...args);
    };
    console.error = errorFilter;

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await authService.sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err: any) {
      // Show user-friendly error messages
      if (err.message) {
        setError(err.message);
      } else if (err.code === 'auth/user-not-found') {
        // For security, don't reveal if user exists
        // But still show success message
        setSuccess(true);
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--text)' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-light)' }}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {success ? (
          <div>
            <div
              style={{
                padding: '20px',
                background: '#d1fae5',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <Mail size={48} color="#10b981" style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#065f46', marginBottom: '8px' }}>Check Your Email</h3>
              <p style={{ color: '#065f46', fontSize: '14px' }}>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p style={{ color: '#065f46', fontSize: '14px', marginTop: '8px' }}>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div style={{ marginBottom: '20px' }}>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              <Mail size={18} />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-light)',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
