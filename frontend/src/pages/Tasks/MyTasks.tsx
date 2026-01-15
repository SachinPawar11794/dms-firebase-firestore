import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { taskInstanceService, TaskInstance } from '../../services/taskInstanceService';
import { TaskStatus } from '../../services/taskService';
import { CheckCircle, Clock, XCircle, AlertCircle, Calendar, Play, CheckCircle2, Filter } from 'lucide-react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { usePlant } from '../../contexts/PlantContext';
import { formatDate, parseDate } from '../../utils/dateFormatter';

const MyTasks = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant } = usePlant();

  // Track auth state reactively
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['myTasks', { page, status: statusFilter, plantId: selectedPlant?.id }],
    queryFn: () =>
      taskInstanceService.getMyTasks({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        plantId: selectedPlant?.id,
      }),
    enabled: !!currentUser, // Only fetch if authenticated
    retry: false, // Don't retry on error
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: TaskStatus; notes?: string }) =>
      taskInstanceService.updateTaskInstance(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      setSelectedTask(null);
    },
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  // Date parsing and formatting functions are imported from utils/dateFormatter
  // All dates are formatted as dd/mm/yyyy across the application

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

  const isOverdue = (dueDate: string) => {
    const date = parseDate(dueDate);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    return due < today && due.toDateString() !== today.toDateString();
  };

  const isDueSoon = (dueDate: string) => {
    const date = parseDate(dueDate);
    if (!date) return false;
    const daysUntilDue = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue > 0;
  };

  const handleStatusChange = (task: TaskInstance, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({
      id: task.id,
      status: newStatus,
      notes: task.notes,
    });
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)', marginBottom: '8px' }}>My Tasks</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
            View and manage your assigned tasks
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
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)', marginBottom: '8px' }}>My Tasks</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
            View and manage your assigned tasks
          </p>
        </div>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>Error Loading Tasks</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
            {error instanceof Error ? error.message : 'Failed to load tasks. Please try again.'}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tasks = data?.data || [];
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t: TaskInstance) => t.status === 'pending').length,
    inProgress: tasks.filter((t: TaskInstance) => t.status === 'in-progress').length,
    completed: tasks.filter((t: TaskInstance) => t.status === 'completed').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: 'var(--text)', marginBottom: '8px' }}>My Tasks</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
          View and manage your assigned tasks
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="card" style={{ padding: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-light)', marginRight: '4px' }} />
          <button
            className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setStatusFilter('all')}
            style={{
              fontSize: '14px',
              background: statusFilter === 'all' ? undefined : 'transparent',
              color: statusFilter === 'all' ? undefined : 'var(--text)',
              border: statusFilter === 'all' ? undefined : '1px solid var(--border)',
            }}
          >
            All
            {taskCounts.all > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                {taskCounts.all}
              </span>
            )}
          </button>
          <button
            className={`btn ${statusFilter === 'pending' ? 'btn-primary' : ''}`}
            onClick={() => setStatusFilter('pending')}
            style={{
              fontSize: '14px',
              background: statusFilter === 'pending' ? undefined : 'transparent',
              color: statusFilter === 'pending' ? undefined : 'var(--text)',
              border: statusFilter === 'pending' ? undefined : '1px solid var(--border)',
            }}
          >
            Pending
            {taskCounts.pending > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                {taskCounts.pending}
              </span>
            )}
          </button>
          <button
            className={`btn ${statusFilter === 'in-progress' ? 'btn-primary' : ''}`}
            onClick={() => setStatusFilter('in-progress')}
            style={{
              fontSize: '14px',
              background: statusFilter === 'in-progress' ? undefined : 'transparent',
              color: statusFilter === 'in-progress' ? undefined : 'var(--text)',
              border: statusFilter === 'in-progress' ? undefined : '1px solid var(--border)',
            }}
          >
            In Progress
            {taskCounts.inProgress > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                {taskCounts.inProgress}
              </span>
            )}
          </button>
          <button
            className={`btn ${statusFilter === 'completed' ? 'btn-primary' : ''}`}
            onClick={() => setStatusFilter('completed')}
            style={{
              fontSize: '14px',
              background: statusFilter === 'completed' ? undefined : 'transparent',
              color: statusFilter === 'completed' ? undefined : 'var(--text)',
              border: statusFilter === 'completed' ? undefined : '1px solid var(--border)',
            }}
          >
            Completed
            {taskCounts.completed > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                {taskCounts.completed}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {tasks.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div style={{ display: !isMobile ? 'block' : 'none', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduled</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</th>
                    <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task: TaskInstance, index: number) => (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isOverdue(task.dueDate) && task.status !== 'completed' ? '#fee2e220' : index % 2 === 0 ? 'var(--white)' : '#f8fafc',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isOverdue(task.dueDate) && task.status !== 'completed' ? '#fee2e220' : index % 2 === 0 ? 'var(--white)' : '#f8fafc';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>{task.title}</strong>
                          <p style={{ color: 'var(--text-light)', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                            {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                          {formatDate(task.scheduledDate)}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: isOverdue(task.dueDate) ? '#ef4444' : isDueSoon(task.dueDate) ? '#f59e0b' : 'var(--text)', fontSize: '14px', fontWeight: isOverdue(task.dueDate) || isDueSoon(task.dueDate) ? '600' : '400' }}>
                            {formatDate(task.dueDate)}
                          </span>
                          {isOverdue(task.dueDate) && task.status !== 'completed' && (
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                              Overdue
                            </span>
                          )}
                          {isDueSoon(task.dueDate) && task.status !== 'completed' && (
                            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                              Due Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text)', fontSize: '14px' }}>
                        {task.completedAt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            {formatDate(task.completedAt)}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '13px', fontStyle: 'italic' }}>Not completed</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${getPriorityColor(task.priority)}20`,
                            color: getPriorityColor(task.priority),
                            display: 'inline-block',
                            textTransform: 'capitalize',
                          }}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${getStatusColor(task.status)}20`,
                            color: getStatusColor(task.status),
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {task.status === 'pending' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '8px 12px', fontSize: '12px', minWidth: '80px' }}
                              onClick={() => handleStatusChange(task, 'in-progress')}
                            >
                              <Play size={14} />
                              Start
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button
                              className="btn"
                              style={{ padding: '8px 12px', fontSize: '12px', background: '#10b981', color: 'white', minWidth: '100px' }}
                              onClick={() => handleStatusChange(task, 'completed')}
                            >
                              <CheckCircle2 size={14} />
                              Complete
                            </button>
                          )}
                          <button
                            className="btn"
                            style={{ padding: '8px 12px', fontSize: '12px', background: '#dbeafe', color: '#1e40af', border: 'none' }}
                            onClick={() => setSelectedTask(task)}
                          >
                            View
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
              {data.data.map((task: TaskInstance) => (
                <div
                  key={task.id}
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: isOverdue(task.dueDate) && task.status !== 'completed' ? '#fee2e220' : 'var(--white)',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ marginBottom: '4px', fontSize: '16px', fontWeight: '600' }}>{task.title}</h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '12px' }}>
                      {task.description}
                    </p>
                    {task.instructions && (
                      <p style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>
                        {task.instructions}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                      Scheduled: {formatDate(task.scheduledDate)}
                    </span>
                    <span style={{ color: isOverdue(task.dueDate) ? '#ef4444' : isDueSoon(task.dueDate) ? '#f59e0b' : 'var(--text-light)', fontSize: '12px' }}>
                      Due: {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && task.status !== 'completed' && ' ⚠️ Overdue'}
                      {isDueSoon(task.dueDate) && task.status !== 'completed' && ' ⚠️ Due Soon'}
                    </span>
                    {task.completedAt && (
                      <span style={{ color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        Completed: {formatDate(task.completedAt)}
                      </span>
                    )}
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                      }}
                    >
                      {task.priority}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: `${getStatusColor(task.status)}20`,
                        color: getStatusColor(task.status),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {getStatusIcon(task.status)}
                      {task.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {task.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => handleStatusChange(task, 'in-progress')}
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button
                        className="btn"
                        style={{ padding: '8px 12px', fontSize: '12px', background: '#10b981', color: 'white' }}
                        onClick={() => handleStatusChange(task, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      className="btn"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                      onClick={() => setSelectedTask(task)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '20px',
                }}
                onClick={() => setSelectedTask(null)}
              >
                <div
                  className="card"
                  style={{
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{selectedTask.title}</h2>
                    <button className="btn" onClick={() => setSelectedTask(null)}>
                      ✕
                    </button>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>{selectedTask.description}</p>
                    {selectedTask.instructions && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Instructions:</strong>
                        <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>{selectedTask.instructions}</p>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      <div>
                        <strong>Scheduled Date:</strong>
                        <p style={{ color: 'var(--text-light)' }}>{formatDate(selectedTask.scheduledDate)}</p>
                      </div>
                      <div>
                        <strong>Due Date:</strong>
                        <p style={{ color: isOverdue(selectedTask.dueDate) ? '#ef4444' : 'var(--text-light)' }}>
                          {formatDate(selectedTask.dueDate)}
                          {isOverdue(selectedTask.dueDate) && ' ⚠️ Overdue'}
                        </p>
                      </div>
                      <div>
                        <strong>Priority:</strong>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: `${getPriorityColor(selectedTask.priority)}20`,
                            color: getPriorityColor(selectedTask.priority),
                          }}
                        >
                          {selectedTask.priority}
                        </span>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: `${getStatusColor(selectedTask.status)}20`,
                            color: getStatusColor(selectedTask.status),
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {getStatusIcon(selectedTask.status)}
                          {selectedTask.status}
                        </span>
                      </div>
                    </div>
                    {selectedTask.notes && (
                      <div style={{ marginTop: '16px' }}>
                        <strong>Notes:</strong>
                        <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>{selectedTask.notes}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    {selectedTask.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(selectedTask, 'in-progress')}
                      >
                        Start Task
                      </button>
                    )}
                    {selectedTask.status === 'in-progress' && (
                      <button
                        className="btn"
                        style={{ background: '#10b981', color: 'white' }}
                        onClick={() => handleStatusChange(selectedTask, 'completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                    <button className="btn" onClick={() => setSelectedTask(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data?.pagination && (
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
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
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
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>
            No tasks found
          </p>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
