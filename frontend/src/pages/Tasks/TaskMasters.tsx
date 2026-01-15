import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { taskMasterService, TaskMaster, CreateTaskMasterDto, TaskFrequency } from '../../services/taskMasterService';
import { taskInstanceService } from '../../services/taskInstanceService';
import { plantService, Plant } from '../../services/plantService';
import { userService, User } from '../../services/userService';
import { Plus, Edit, Trash2, Play, Pause, Filter, Building2, User as UserIcon, Calendar, AlertCircle, Search, X, RefreshCw } from 'lucide-react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { usePlant } from '../../contexts/PlantContext';
import TaskMasterForm from '../../components/tasks/TaskMasterForm';

const TaskMasters = () => {
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<TaskMaster | null>(null);
  const [filters, setFilters] = useState<{
    plantId?: string;
    assignedTo?: string;
    frequency?: TaskFrequency;
    isActive?: boolean;
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant } = usePlant();

  // Auto-apply selected plant filter
  useEffect(() => {
    if (selectedPlant) {
      setFilters(prev => ({ ...prev, plantId: selectedPlant.id }));
    } else {
      setFilters(prev => {
        const { plantId, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedPlant]);

  // Fetch plants and users for filters
  const { data: plants } = useQuery({
    queryKey: ['plants'],
    queryFn: () => plantService.getAllPlants(true),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(1, 100),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['taskMasters', { page, ...filters }],
    queryFn: () => taskMasterService.getTaskMasters({ page, limit: 20, ...filters }),
    retry: 1,
  });

  // Filter data by search query
  const filteredData = data?.data?.filter((master: TaskMaster) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      master.title.toLowerCase().includes(query) ||
      master.description.toLowerCase().includes(query) ||
      getPlantName(master.plantId).toLowerCase().includes(query) ||
      getUserName(master.assignedTo).toLowerCase().includes(query)
    );
  }) || [];

  const deleteMutation = useMutation({
    mutationFn: taskMasterService.deleteTaskMaster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskMasters'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      taskMasterService.updateTaskMaster(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskMasters'] });
    },
  });

  const generateTasksMutation = useMutation({
    mutationFn: () => taskInstanceService.generateTasks(),
    onSuccess: (result: any) => {
      const generated = result?.generated || result?.data?.generated || 0;
      const errors = result?.errors || result?.data?.errors || 0;
      alert(`Successfully generated ${generated} task instance(s). ${errors > 0 ? `${errors} error(s) occurred.` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskMasters'] });
    },
    onError: (error: any) => {
      alert(`Error generating tasks: ${error.response?.data?.error?.message || error.message}`);
    },
  });

  const getFrequencyLabel = (frequency: TaskFrequency, value?: number, unit?: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      case 'custom':
        return `Every ${value} ${unit}`;
      default:
        return frequency;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  const getUserName = (userId: string) => {
    const user = users?.data?.find((u: User) => u.id === userId);
    return user?.displayName || userId;
  };

  const getPlantName = (plantId: string) => {
    const plant = plants?.find((p: Plant) => p.id === plantId);
    return plant?.name || plantId;
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)', marginBottom: '8px' }}>Task Masters</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
            Manage recurring task templates
          </p>
        </div>
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)', marginBottom: '8px' }}>Task Masters</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
            Manage recurring task templates
          </p>
        </div>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>Error Loading Task Masters</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
            {error instanceof Error ? error.message : 'Failed to load task masters. Please try again.'}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleAddTaskMaster = async (taskMasterData: CreateTaskMasterDto) => {
    try {
      await taskMasterService.createTaskMaster(taskMasterData);
      queryClient.invalidateQueries({ queryKey: ['taskMasters'] });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error creating task master:', error);
      // Error is handled by the form component
      throw error;
    }
  };

  const handleUpdateTaskMaster = async (id: string, taskMasterData: Partial<CreateTaskMasterDto>) => {
    try {
      await taskMasterService.updateTaskMaster(id, taskMasterData);
      queryClient.invalidateQueries({ queryKey: ['taskMasters'] });
      setEditingMaster(null);
    } catch (error: any) {
      console.error('Error updating task master:', error);
      // Error is handled by the form component
      throw error;
    }
  };

  if (isLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const hasActiveFilters = filters.plantId || filters.assignedTo || filters.frequency !== undefined || filters.isActive !== undefined;

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>Task Masters</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px', margin: 0 }}>
              Manage recurring task templates. Generate tasks to create instances for employees.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => generateTasksMutation.mutate()}
              disabled={generateTasksMutation.isPending}
              style={{
                minWidth: '160px',
                background: '#10b981',
                color: 'white',
                border: 'none',
              }}
            >
              <RefreshCw size={18} style={{ marginRight: '8px', animation: generateTasksMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
              {generateTasksMutation.isPending ? 'Generating...' : 'Generate Tasks'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ minWidth: '160px' }}>
              <Plus size={18} />
              New Task Master
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 300px', minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search task masters..."
                style={{ paddingLeft: '40px', fontSize: '14px' }}
              />
            </div>

            {/* Filter Toggle */}
            <button
              className="btn"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? 'var(--primary)' : 'transparent',
                color: showFilters ? 'white' : 'var(--text)',
                border: '1px solid var(--border)',
                minWidth: '100px',
              }}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                  {Object.keys(filters).filter(k => filters[k as keyof typeof filters] !== undefined).length}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                className="btn"
                onClick={clearFilters}
                style={{ background: 'transparent', color: 'var(--text-light)', border: '1px solid var(--border)' }}
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="label" style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={14} />
                    Plant
                  </label>
                  <select
                    className="input"
                    value={filters.plantId || ''}
                    onChange={(e) => setFilters({ ...filters, plantId: e.target.value || undefined })}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All Plants</option>
                    {plants?.map((plant: Plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserIcon size={14} />
                    Employee
                  </label>
                  <select
                    className="input"
                    value={filters.assignedTo || ''}
                    onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value || undefined })}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All Employees</option>
                    {users?.data?.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    Frequency
                  </label>
                  <select
                    className="input"
                    value={filters.frequency || ''}
                    onChange={(e) => setFilters({ ...filters, frequency: e.target.value as TaskFrequency || undefined })}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All Frequencies</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} />
                    Status
                  </label>
                  <select
                    className="input"
                    value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value === '' ? undefined : e.target.value === 'true' })}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Master Form Modal */}
      {(showAddForm || editingMaster) && (
        <TaskMasterForm
          taskMaster={editingMaster || undefined}
          plants={plants || []}
          users={users?.data || []}
          onSubmit={editingMaster ? (data) => handleUpdateTaskMaster(editingMaster.id, data) : handleAddTaskMaster}
          onCancel={() => {
            setShowAddForm(false);
            setEditingMaster(null);
          }}
        />
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredData.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div style={{ display: !isMobile ? 'block' : 'none', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plant</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Frequency</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((master: TaskMaster, index: number) => (
                    <tr
                      key={master.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: index % 2 === 0 ? 'var(--white)' : '#f8fafc',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'var(--white)' : '#f8fafc';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>{master.title}</strong>
                          <p style={{ color: 'var(--text-light)', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                            {master.description.length > 80 ? `${master.description.substring(0, 80)}...` : master.description}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)' }}>{getPlantName(master.plantId)}</td>
                      <td style={{ padding: '16px', color: 'var(--text)' }}>{getUserName(master.assignedTo)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>
                          {getFrequencyLabel(master.frequency, master.frequencyValue, master.frequencyUnit)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${getPriorityColor(master.priority)}20`,
                            color: getPriorityColor(master.priority),
                            display: 'inline-block',
                            textTransform: 'capitalize',
                          }}
                        >
                          {master.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: master.isActive ? '#10b98120' : '#ef444420',
                            color: master.isActive ? '#10b981' : '#ef4444',
                            display: 'inline-block',
                          }}
                        >
                          {master.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn"
                            style={{
                              padding: '8px',
                              minWidth: 'auto',
                              background: master.isActive ? '#fef3c7' : '#d1fae5',
                              color: master.isActive ? '#92400e' : '#065f46',
                              border: 'none',
                            }}
                            onClick={() => toggleActiveMutation.mutate({ id: master.id, isActive: !master.isActive })}
                            title={master.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {master.isActive ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button
                            className="btn"
                            style={{
                              padding: '8px',
                              minWidth: 'auto',
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                            }}
                            onClick={() => setEditingMaster(master)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn"
                            style={{
                              padding: '8px',
                              minWidth: 'auto',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                            }}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task master?')) {
                                deleteMutation.mutate(master.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div style={{ display: isMobile ? 'block' : 'none', padding: '16px' }}>
              {filteredData.map((master: TaskMaster) => (
                <div
                  key={master.id}
                  className="card"
                  style={{
                    marginBottom: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--white)',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: 0, flex: 1 }}>
                        {master.title}
                      </h3>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: master.isActive ? '#10b98120' : '#ef444420',
                          color: master.isActive ? '#10b981' : '#ef4444',
                          marginLeft: '12px',
                        }}
                      >
                        {master.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                      {master.description}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Plant
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} />
                        {getPlantName(master.plantId)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Employee
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserIcon size={14} />
                        {getUserName(master.assignedTo)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Frequency
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {getFrequencyLabel(master.frequency, master.frequencyValue, master.frequencyUnit)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Priority
                      </p>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: `${getPriorityColor(master.priority)}20`,
                          color: getPriorityColor(master.priority),
                          display: 'inline-block',
                          textTransform: 'capitalize',
                        }}
                      >
                        {master.priority}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        background: master.isActive ? '#fef3c7' : '#d1fae5',
                        color: master.isActive ? '#92400e' : '#065f46',
                        border: 'none',
                      }}
                      onClick={() => toggleActiveMutation.mutate({ id: master.id, isActive: !master.isActive })}
                    >
                      {master.isActive ? <Pause size={14} /> : <Play size={14} />}
                      {master.isActive ? ' Deactivate' : ' Activate'}
                    </button>
                    <button
                      className="btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        border: 'none',
                      }}
                      onClick={() => setEditingMaster(master)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                      }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task master?')) {
                          deleteMutation.mutate(master.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
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
                <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                  Page {data.pagination.page} of {data.pagination.totalPages}
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
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📋</div>
            <p style={{ color: 'var(--text-light)', fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>
              {searchQuery || hasActiveFilters ? 'No task masters match your filters' : 'No task masters found'}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first task master to get started'}
            </p>
            {!searchQuery && !hasActiveFilters && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
                style={{ marginTop: '20px' }}
              >
                <Plus size={18} />
                Create Task Master
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMasters;
