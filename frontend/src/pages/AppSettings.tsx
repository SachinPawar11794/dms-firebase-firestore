import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appSettingsService, AppSettings as AppSettingsType, UpdateAppSettingsDto } from '../services/appSettingsService';
import { useWindowSize } from '../hooks/useWindowSize';
import { useQuery as useUserQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { Upload, Trash2, Image as ImageIcon, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

const AppSettings = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [appNameShort, setAppNameShort] = useState('');
  const [appNameLong, setAppNameLong] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: currentUser } = useUserQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['appSettings'],
    queryFn: appSettingsService.getAppSettings,
  });

  // Initialize company name, app names, and logo from settings
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setAppNameShort(settings.appNameShort || '');
      setAppNameLong(settings.appNameLong || '');
      if (settings.companyLogoUrl) {
        setPreviewUrl(settings.companyLogoUrl);
      }
    }
  }, [settings]);

  const uploadLogoMutation = useMutation({
    mutationFn: appSettingsService.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      setSelectedFile(null);
      setSuccess('Logo uploaded successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to upload logo');
      setSuccess('');
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: appSettingsService.deleteLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      setPreviewUrl(null);
      setSuccess('Logo deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete logo');
      setSuccess('');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: appSettingsService.updateAppSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      setSuccess('Settings updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update settings');
      setSuccess('');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    uploadLogoMutation.mutate(selectedFile);
  };

  const handleDeleteLogo = () => {
    if (confirm('Are you sure you want to delete the company logo?')) {
      deleteLogoMutation.mutate();
    }
  };

  const handleSaveCompanyName = () => {
    const updateData: UpdateAppSettingsDto = {
      companyName: companyName.trim() || undefined,
    };
    updateSettingsMutation.mutate(updateData);
  };

  const handleSaveAppNames = () => {
    const updateData: UpdateAppSettingsDto = {
      appNameShort: appNameShort.trim() || undefined,
      appNameLong: appNameLong.trim() || undefined,
    };
    updateSettingsMutation.mutate(updateData);
  };

  // Additional protection: redirect if not admin
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page. Admin access required.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const currentLogoUrl = settings?.companyLogoUrl || previewUrl;

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
        <div>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', margin: 0 }}>App Settings</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px' }}>
            Manage company branding and app configuration
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div
          style={{
            padding: '12px 16px',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #6ee7b7',
          }}
        >
          <CheckCircle size={18} />
          <span style={{ fontSize: '14px' }}>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #fca5a5',
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {/* Company Logo Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon size={20} />
          Company Logo
        </h2>

        <div style={{ marginBottom: '20px' }}>
          {currentLogoUrl ? (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-light)' }}>
                Current Logo:
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  marginBottom: '16px',
                }}
              >
                <img
                  src={currentLogoUrl}
                  alt="Company Logo"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '100px',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteLogo}
                  disabled={deleteLogoMutation.isPending}
                  style={{ fontSize: '14px' }}
                >
                  <Trash2 size={16} />
                  {deleteLogoMutation.isPending ? 'Deleting...' : 'Delete Logo'}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-light)' }}>
              No logo uploaded. Upload a logo to display it in the app.
            </p>
          )}

          <div>
            <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
              Upload New Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ marginBottom: '12px' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
            {selectedFile && (
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploadLogoMutation.isPending}
                style={{ fontSize: '14px' }}
              >
                <Upload size={16} />
                {uploadLogoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* App Name Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>App Name</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label className="label">Short Name <span style={{ color: 'var(--text-light)', fontWeight: 'normal' }}>(e.g., DMS)</span></label>
            <input
              type="text"
              className="input"
              value={appNameShort}
              onChange={(e) => setAppNameShort(e.target.value)}
              placeholder="Enter short app name"
              style={{ fontSize: '15px' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              Displayed in sidebar and compact spaces
            </p>
          </div>
          <div>
            <label className="label">Long Name <span style={{ color: 'var(--text-light)', fontWeight: 'normal' }}>(e.g., Dhananjay Manufacturing System)</span></label>
            <input
              type="text"
              className="input"
              value={appNameLong}
              onChange={(e) => setAppNameLong(e.target.value)}
              placeholder="Enter full app name"
              style={{ fontSize: '15px' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              Displayed in headers and full titles
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSaveAppNames}
          disabled={updateSettingsMutation.isPending}
          style={{ fontSize: '14px' }}
        >
          <Save size={16} />
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save App Names'}
        </button>
      </div>

      {/* Company Name Section */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Company Name</h2>
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Company Name</label>
          <input
            type="text"
            className="input"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            style={{ fontSize: '15px', marginBottom: '12px' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px' }}>
            This name will be displayed throughout the application
          </p>
          <button
            className="btn btn-primary"
            onClick={handleSaveCompanyName}
            disabled={updateSettingsMutation.isPending}
            style={{ fontSize: '14px' }}
          >
            <Save size={16} />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Company Name'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
