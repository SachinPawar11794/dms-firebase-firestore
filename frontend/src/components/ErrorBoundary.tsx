import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--white)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            margin: '20px',
          }}
        >
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>
            {this.props.moduleName ? `${this.props.moduleName} Error` : 'Something went wrong'}
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                textAlign: 'left',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: '600' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
