import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TaskMaster, CreateTaskMasterDto, TaskFrequency, taskMasterService } from '../../services/taskMasterService';
import { Plant } from '../../services/plantService';
import { User, userService } from '../../services/userService';
import { taskInstanceService, CreateTaskInstanceDto } from '../../services/taskInstanceService';
import { useWindowSize } from '../../hooks/useWindowSize';
import { X, Building2, User as UserIcon, AlertCircle, Calendar, Clock, FileText, Info, Lock, Repeat, CalendarCheck } from 'lucide-react';

interface TaskMasterFormProps {
  taskMaster?: TaskMaster;
  plants: Plant[];
  users: User[];
  onSubmit: (data: CreateTaskMasterDto) => void | Promise<void>;
  onCancel: () => void;
}

const TaskMasterForm = ({ taskMaster, plants, users, onSubmit, onCancel }: TaskMasterFormProps) => {
  // Determine if this is a one-time task (if taskMaster exists and is inactive, it might be one-time)
  const [taskType, setTaskType] = useState<'recurring' | 'one-time'>(taskMaster && !taskMaster.isActive ? 'one-time' : 'recurring');
  const [title, setTitle] = useState(taskMaster?.title || '');
  const [description, setDescription] = useState(taskMaster?.description || '');
  const [plantId, setPlantId] = useState(taskMaster?.plantId || '');
  const [assignedTo, setAssignedTo] = useState(taskMaster?.assignedTo || '');
  const [priority, setPriority] = useState<TaskMaster['priority']>(taskMaster?.priority || 'medium');
  const [frequency, setFrequency] = useState<TaskFrequency>(taskMaster?.frequency || 'daily');
  const [frequencyValue, setFrequencyValue] = useState(taskMaster?.frequencyValue || 1);
  const [frequencyUnit, setFrequencyUnit] = useState<'days' | 'weeks' | 'months'>(taskMaster?.frequencyUnit || 'days');
  // For one-time tasks: scheduled date and due date
  const [scheduledDate, setScheduledDate] = useState(() => {
    if (taskMaster?.startDate) {
      try {
        if (typeof taskMaster.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(taskMaster.startDate)) {
          return taskMaster.startDate;
        }
        const date = new Date(taskMaster.startDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing scheduledDate:', error);
      }
    }
    return new Date().toISOString().split('T')[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    // Default due date to 1 day after scheduled date
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    return defaultDate.toISOString().split('T')[0];
  });
  const [startDate, setStartDate] = useState(() => {
    if (taskMaster?.startDate) {
      try {
        // Handle different date formats
        let date: Date;
        
        // If it's already in YYYY-MM-DD format, use it directly
        if (typeof taskMaster.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(taskMaster.startDate)) {
          return taskMaster.startDate;
        }
        
        // Try to parse as Date
        date = new Date(taskMaster.startDate);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid startDate in taskMaster:', taskMaster.startDate);
          return new Date().toISOString().split('T')[0]; // Fallback to today
        }
        
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } catch (error) {
        console.error('Error parsing startDate:', error);
        return new Date().toISOString().split('T')[0]; // Fallback to today
      }
    }
    return new Date().toISOString().split('T')[0]; // Default to today
  });
  const [estimatedDuration, setEstimatedDuration] = useState(taskMaster?.estimatedDuration?.toString() || '');
  const [instructions, setInstructions] = useState(taskMaster?.instructions || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width <= 480;

  // Auto-fill plant when assignedTo changes
  useEffect(() => {
    if (assignedTo && users.length > 0 && plants.length > 0) {
      const selectedUser = users.find((u) => u.id === assignedTo);
      if (selectedUser && selectedUser.plant) {
        const userPlantValue = selectedUser.plant.trim();
        
        // Try to match by plant code first (case-insensitive)
        let matchedPlant = plants.find((plant: Plant) => 
          plant.isActive && plant.code.toLowerCase() === userPlantValue.toLowerCase()
        );

        // If not found by code, try to match by plant name (case-insensitive)
        if (!matchedPlant) {
          matchedPlant = plants.find((plant: Plant) => 
            plant.isActive && plant.name.toLowerCase() === userPlantValue.toLowerCase()
          );
        }

        if (matchedPlant) {
          setPlantId(matchedPlant.id);
        }
      }
    }
  }, [assignedTo, users, plants]);

  // Get current user for assignedBy
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    retry: 2,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'high':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'medium':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
      default:
        return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Wait for current user to load
    if (isLoadingUser) {
      setError('Loading user information... Please wait.');
      setLoading(false);
      return;
    }

    if (!title.trim() || !description.trim() || !assignedTo) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate that plant is set (should be auto-filled from employee)
    if (!plantId) {
      const selectedUser = users.find((u) => u.id === assignedTo);
      if (selectedUser && !selectedUser.plant) {
        setError('Selected employee does not have a plant assigned. Please assign a plant to this employee first.');
      } else {
        setError('Plant could not be determined. Please try selecting the employee again.');
      }
      setLoading(false);
      return;
    }

    if (frequency === 'custom' && (!frequencyValue || !frequencyUnit)) {
      setError('Please specify frequency value and unit for custom frequency');
      setLoading(false);
      return;
    }

    try {
      // Ensure assignedBy is set - use currentUser if available, otherwise use assignedTo
      const assignedByValue = currentUser?.id || assignedTo;
      
      if (!assignedByValue) {
        setError('Unable to determine task assigner. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Validate estimatedDuration is provided
      if (!estimatedDuration || estimatedDuration.trim() === '' || parseInt(estimatedDuration) <= 0) {
        setError('Estimated Duration is required and must be greater than 0');
        setLoading(false);
        return;
      }

      // Handle one-time task
      if (taskType === 'one-time') {
        // Validate dates for one-time task
        if (!scheduledDate || scheduledDate.trim() === '') {
          setError('Scheduled Date is required');
          setLoading(false);
          return;
        }
        if (!dueDate || dueDate.trim() === '') {
          setError('Due Date is required');
          setLoading(false);
          return;
        }
        if (new Date(dueDate) < new Date(scheduledDate)) {
          setError('Due Date must be after Scheduled Date');
          setLoading(false);
          return;
        }

        // Create a temporary task master with isActive=false, then create task instance
        const tempTaskMasterData: CreateTaskMasterDto = {
          title: title.trim(),
          description: description.trim(),
          plantId,
          assignedTo,
          assignedBy: assignedByValue,
          priority,
          frequency: 'daily', // Dummy frequency for one-time tasks
          startDate: scheduledDate,
          estimatedDuration: parseInt(estimatedDuration),
          instructions: instructions.trim() || undefined,
          isActive: false, // Mark as inactive so it never generates
        };

        // Create task master first (call service directly to get the created task master)
        const createdTaskMaster = await taskMasterService.createTaskMaster(tempTaskMasterData);
        
        // Then create task instance immediately
        if (createdTaskMaster?.id) {
          const taskInstanceData: CreateTaskInstanceDto = {
            taskMasterId: createdTaskMaster.id,
            scheduledDate: scheduledDate,
            dueDate: dueDate,
          };
          
          await taskInstanceService.createTaskInstance(taskInstanceData);
        }
        
        // Call onSubmit to trigger parent's success handling (closing form, invalidating queries, etc.)
        await onSubmit(tempTaskMasterData);
        return;
      }

      // Handle recurring task (existing logic)
      // Validate startDate is provided
      if (!startDate || startDate.trim() === '') {
        setError('Start Date is required');
        setLoading(false);
        return;
      }

      const taskMasterData: CreateTaskMasterDto = {
        title: title.trim(),
        description: description.trim(),
        plantId,
        assignedTo,
        assignedBy: assignedByValue,
        priority,
        frequency,
        frequencyValue: frequency === 'custom' ? frequencyValue : undefined,
        frequencyUnit: frequency === 'custom' ? frequencyUnit : undefined,
        startDate: startDate, // Required - ISO date string
        estimatedDuration: parseInt(estimatedDuration),
        instructions: instructions.trim() || undefined,
      };

      await onSubmit(taskMasterData);
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = 'An error occurred while saving the task master';
      
      console.error('Task master form error:', err);
      console.error('Error response:', err.response);
      // Log full error details
      const errorData = err.response?.data;
      console.error('=== FULL ERROR DETAILS ===');
      console.error('Error response data:', errorData);
      if (errorData?.error) {
        console.error('Error object:', errorData.error);
        console.error('Error message:', errorData.error.message);
        console.error('Error code:', errorData.error.code);
        console.error('Error details:', errorData.error.details);
      }
      console.error('=== END ERROR DETAILS ===');
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        // Check for error object
        if (responseData.error) {
          const apiError = responseData.error;
          errorMessage = apiError.message || apiError.code || 'An error occurred';
          
          // If there are validation errors, show them
          if (apiError.details && Array.isArray(apiError.details)) {
            const validationErrors = apiError.details
              .map((detail: any) => {
                if (typeof detail === 'string') return detail;
                return detail.msg || detail.message || `${detail.param || detail.field || 'field'}: ${detail.msg || detail.message || 'invalid'}`;
              })
              .filter(Boolean)
              .join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          } else if (apiError.details && typeof apiError.details === 'string') {
            errorMessage = apiError.details;
          } else if (apiError.details && typeof apiError.details === 'object') {
            // Handle object details
            errorMessage = apiError.message || JSON.stringify(apiError.details);
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = getPriorityColor(priority);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: '700px',
          width: '100%',
          maxHeight: '95vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid var(--border)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: 'var(--text)' }}>
              {taskMaster ? 'Edit Task Master' : 'Create New Task'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px', margin: 0 }}>
              {taskMaster ? 'Update task master details' : 'Create a recurring task template or one-time task'}
            </p>
          </div>
          <button
            className="btn"
            onClick={onCancel}
            style={{
              padding: '8px',
              minWidth: 'auto',
              background: 'transparent',
              color: 'var(--text-light)',
            }}
          >
            <X size={20} />
          </button>
        </div>

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

        <form onSubmit={handleSubmit}>
          {/* Task Type Selection (only for new tasks) */}
          {!taskMaster && (
            <div style={{ marginBottom: '28px' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                <Info size={14} />
                Task Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTaskType('recurring')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: `2px solid ${taskType === 'recurring' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    background: taskType === 'recurring' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    color: taskType === 'recurring' ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: taskType === 'recurring' ? 600 : 400,
                  }}
                >
                  <Repeat size={16} />
                  Recurring Task
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('one-time')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: `2px solid ${taskType === 'one-time' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    background: taskType === 'one-time' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    color: taskType === 'one-time' ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: taskType === 'one-time' ? 600 : 400,
                  }}
                >
                  <CalendarCheck size={16} />
                  One-Time Task
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                {taskType === 'recurring' 
                  ? 'Recurring tasks generate automatically based on frequency'
                  : 'One-time tasks are created immediately and do not repeat'}
              </p>
            </div>
          )}

          {/* Basic Information Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileText size={18} />
              Basic Information
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Task Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Equipment Inspection"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Provide a detailed description of the task..."
                style={{ fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Assignment & Configuration Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Building2 size={18} />
              Assignment & Configuration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building2 size={14} />
                  Plant <span style={{ color: '#ef4444' }}>*</span>
                  <Lock size={12} style={{ color: 'var(--text-light)', marginLeft: '4px' }} />
                </label>
                <select
                  className="input"
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  required
                  disabled
                  style={{ 
                    fontSize: '15px',
                    backgroundColor: 'var(--bg)',
                    cursor: 'not-allowed',
                    opacity: 0.7
                  }}
                >
                  <option value="">Select Employee First</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} {plant.code && `(${plant.code})`}
                    </option>
                  ))}
                </select>
                {!assignedTo && (
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Plant will be auto-filled when you select an employee
                  </p>
                )}
                {assignedTo && !plantId && (
                  <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>
                    Selected employee does not have a plant assigned
                  </p>
                )}
                {plants.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    No plants available. Add plants in App Settings.
                  </p>
                )}
              </div>

              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserIcon size={14} />
                  Assign To <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="input"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  style={{ fontSize: '15px' }}
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => {
                    // Display format: "Name (Employee ID)" or just "Name" if no Employee ID
                    const displayText = user.employeeId 
                      ? `${user.displayName} (${user.employeeId})`
                      : user.displayName;
                    return (
                      <option key={user.id} value={user.id}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
                {assignedTo && (
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    {(() => {
                      const selectedUser = users.find((u) => u.id === assignedTo);
                      if (selectedUser?.plant) {
                        return `Plant will be set to: ${selectedUser.plant}`;
                      }
                      return 'Selected employee has no plant assigned';
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} />
                  Priority <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskMaster['priority'])}
                  required
                  style={{
                    fontSize: '15px',
                    background: priorityColors.bg,
                    borderColor: priorityColors.border,
                    color: priorityColors.text,
                    fontWeight: '500',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {taskType === 'recurring' && (
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  Frequency <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="input"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                  required
                  style={{ fontSize: '15px' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              )}
            </div>

            {taskType === 'recurring' && frequency === 'custom' && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', fontWeight: '500' }}>
                  Custom Frequency Settings
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label" style={{ fontSize: '13px' }}>
                      Frequency Value <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={frequencyValue}
                      onChange={(e) => setFrequencyValue(parseInt(e.target.value) || 1)}
                      min={1}
                      required
                      style={{ fontSize: '15px' }}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '13px' }}>
                      Frequency Unit <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={frequencyUnit}
                      onChange={(e) => setFrequencyUnit(e.target.value as 'days' | 'weeks' | 'months')}
                      required
                      style={{ fontSize: '15px' }}
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Date Fields - Different for recurring vs one-time */}
            {taskType === 'recurring' ? (
              <div style={{ marginTop: '16px' }}>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  Start Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ fontSize: '15px' }}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                  When should task generation begin? Tasks will only be generated on or after this date.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    Scheduled Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    style={{ fontSize: '15px' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    When the task should be scheduled
                  </p>
                </div>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    Due Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    style={{ fontSize: '15px' }}
                    min={scheduledDate || new Date().toISOString().split('T')[0]}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    When the task should be completed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Info size={18} />
              Additional Details
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                Estimated Duration (minutes) <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="number"
                className="input"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                min={1}
                required
                placeholder="e.g., 30"
                style={{ fontSize: '15px' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                Required: Estimated time to complete this task (in minutes)
              </p>
            </div>

            <div>
              <label className="label">Detailed Instructions</label>
              <textarea
                className="input"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={5}
                placeholder="Provide step-by-step instructions for completing this task..."
                style={{ fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                Optional: Detailed instructions will be shown to employees when they view the task
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '2px solid var(--border)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              style={{ width: isMobile ? '100%' : 'auto', minWidth: '120px' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: isMobile ? '100%' : 'auto', minWidth: '120px' }}
              disabled={loading || isLoadingUser}
            >
              {loading || isLoadingUser ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  {isLoadingUser ? 'Loading...' : 'Saving...'}
                </>
              ) : taskMaster ? (
                'Update Task Master'
              ) : (
                'Create Task Master'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskMasterForm;
