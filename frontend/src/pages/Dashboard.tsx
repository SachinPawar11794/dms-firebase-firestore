import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { taskService } from '../services/taskService';
import { CheckSquare, Factory, Users, Wrench } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
import { usePlant } from '../contexts/PlantContext';

const Dashboard = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { selectedPlant } = usePlant();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    enabled: true, // Always try to get current user
    retry: false, // Don't retry if fails
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', { page: 1, limit: 5, plantId: selectedPlant?.id }],
    queryFn: () => taskService.getTasks({ 
      page: 1, 
      limit: 5,
      plantId: selectedPlant?.id 
    }),
    enabled: !!user, // Only fetch tasks if user is logged in
    retry: false,
  });

  const stats = [
    { label: 'Tasks', value: tasksData?.pagination?.total || 0, icon: CheckSquare, color: '#3b82f6' },
    { label: 'Productions', value: 0, icon: Factory, color: '#10b981' },
    { label: 'Employees', value: 0, icon: Users, color: '#f59e0b' },
    { label: 'Maintenance', value: 0, icon: Wrench, color: '#ef4444' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-light)' }}>
          Welcome back, {user?.displayName || 'User'}!
          {selectedPlant && (
            <span style={{ marginLeft: '12px', fontWeight: 500 }}>
              • Viewing: {selectedPlant.name} ({selectedPlant.code})
            </span>
          )}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : width <= 1024 
            ? 'repeat(2, 1fr)' 
            : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '8px' }}>
                    {stat.label}
                  </p>
                  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text)' }}>
                    {stat.value}
                  </h2>
                </div>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={28} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Recent Tasks</h2>
        {tasksData?.data?.length > 0 ? (
          <div>
            {tasksData.data.map((task: any) => (
              <div
                key={task.id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>{task.title}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                    {task.description}
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background:
                      task.status === 'completed'
                        ? '#d1fae5'
                        : task.status === 'in-progress'
                        ? '#dbeafe'
                        : '#fef3c7',
                    color:
                      task.status === 'completed'
                        ? '#065f46'
                        : task.status === 'in-progress'
                        ? '#1e40af'
                        : '#92400e',
                    alignSelf: isMobile ? 'flex-start' : 'center',
                  }}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>
            No tasks found
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
