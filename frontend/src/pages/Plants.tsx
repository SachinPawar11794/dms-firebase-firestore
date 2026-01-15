import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantService, Plant, CreatePlantDto, UpdatePlantDto } from '../services/plantService';
import { useWindowSize } from '../hooks/useWindowSize';
import { usePlant } from '../contexts/PlantContext';
import { Plus, Edit, Trash2, Building2, X, Check } from 'lucide-react';

const Plants = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const queryClient = useQueryClient();
  const { selectedPlant } = usePlant();

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ['plants', showActiveOnly],
    queryFn: () => plantService.getAllPlants(showActiveOnly),
  });

  const createMutation = useMutation({
    mutationFn: plantService.createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setShowAddForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlantDto }) =>
      plantService.updatePlant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setEditingPlant(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: plantService.deletePlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      plantService.updatePlant(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });

  const handleAddPlant = async (data: CreatePlantDto | UpdatePlantDto) => {
    try {
      await createMutation.mutateAsync(data as CreatePlantDto);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to create plant'}`);
    }
  };

  const handleUpdatePlant = async (data: UpdatePlantDto) => {
    if (!editingPlant) return;
    try {
      await updateMutation.mutateAsync({ id: editingPlant.id, data });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to update plant'}`);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading plants...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Plant Master</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
            Manage manufacturing plants and facilities
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>Active Only</span>
          </label>
          {!showAddForm && !editingPlant && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} />
              Add Plant
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Add New Plant</h2>
          <PlantForm
            onSubmit={handleAddPlant}
            onCancel={() => setShowAddForm(false)}
            isMobile={isMobile}
          />
        </div>
      )}

      {editingPlant && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Edit Plant</h2>
          <PlantForm
            plant={editingPlant}
            onSubmit={handleUpdatePlant}
            onCancel={() => setEditingPlant(null)}
            isMobile={isMobile}
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
            <strong style={{ color: 'var(--primary)' }}>
              ℹ️ Plant Master shows all plants. Currently selected: {selectedPlant.name} ({selectedPlant.code})
            </strong>
            <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-light)' }}>
              Plant selection filters data in other modules (Tasks, Dashboard, etc.)
            </p>
          </div>
        )}

        {plants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No plants found</p>
            {!showAddForm && (
              <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ marginTop: '16px' }}>
                <Plus size={18} />
                Add First Plant
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div style={{ display: !isMobile ? 'block' : 'none', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Plant Code</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Plant Name</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-light)', fontSize: '13px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => (
                    <tr key={plant.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                        {plant.code}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        <strong>{plant.name}</strong>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: plant.isActive ? '#d1fae5' : '#fee2e2',
                            color: plant.isActive ? '#065f46' : '#991b1b',
                          }}
                        >
                          {plant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setEditingPlant(plant)}
                            title="Edit Plant"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => toggleActiveMutation.mutate({ id: plant.id, isActive: !plant.isActive })}
                            title={plant.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {plant.isActive ? <X size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${plant.name}?`)) {
                                deleteMutation.mutate(plant.id);
                              }
                            }}
                            title="Delete Plant"
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
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--white)',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ marginBottom: '4px', fontSize: '16px', fontWeight: '600' }}>
                          {plant.name}
                        </h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                          Code: {plant.code}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: plant.isActive ? '#d1fae5' : '#fee2e2',
                          color: plant.isActive ? '#065f46' : '#991b1b',
                        }}
                      >
                        {plant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => setEditingPlant(plant)}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => toggleActiveMutation.mutate({ id: plant.id, isActive: !plant.isActive })}
                    >
                      {plant.isActive ? <X size={14} /> : <Check size={14} />} {plant.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 12px', fontSize: '12px', flex: '1', minWidth: '80px' }}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${plant.name}?`)) {
                          deleteMutation.mutate(plant.id);
                        }
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface PlantFormProps {
  plant?: Plant;
  onSubmit: (data: CreatePlantDto | UpdatePlantDto) => void;
  onCancel: () => void;
  isMobile: boolean;
}

const PlantForm = ({ plant, onSubmit, onCancel, isMobile }: PlantFormProps) => {
  const [name, setName] = useState(plant?.name || '');
  const [code, setCode] = useState(plant?.code || '');
  const [isActive, setIsActive] = useState(plant?.isActive ?? true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !code) {
      setError('Plant name and code are required');
      setLoading(false);
      return;
    }

    try {
      if (plant) {
        onSubmit({
          name,
          code,
          isActive,
        });
      } else {
        onSubmit({
          name,
          code,
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="label">Plant Name *</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter plant name"
          />
        </div>
        <div>
          <label className="label">Plant Code *</label>
          <input
            type="text"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            placeholder="Enter unique plant code"
            disabled={!!plant}
          />
          {plant && (
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              Plant code cannot be changed
            </p>
          )}
        </div>
      </div>

      {plant && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Active Plant</span>
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
          {loading ? 'Saving...' : plant ? 'Update Plant' : 'Create Plant'}
        </button>
      </div>
    </form>
  );
};

export default Plants;
