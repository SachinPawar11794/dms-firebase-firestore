import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import TaskMasters from './Tasks/TaskMasters';
import MyTasks from './Tasks/MyTasks';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState<'masters' | 'my-tasks'>('my-tasks');

  // Get current user to determine which tabs to show
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
  });

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: '2px solid var(--border)' }}>
        <button
          className={`btn ${activeTab === 'my-tasks' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('my-tasks')}
          style={{
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'my-tasks' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          My Tasks
        </button>
        {isAdminOrManager && (
          <button
            className={`btn ${activeTab === 'masters' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('masters')}
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === 'masters' ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            Task Masters
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'my-tasks' && <MyTasks />}
      {activeTab === 'masters' && isAdminOrManager && <TaskMasters />}
    </div>
  );
};

export default Tasks;
