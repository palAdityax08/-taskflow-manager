import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard({ onNavigateToProject }) {
  const { token, projects } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAllTasks();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: '1', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>Analyzing Workspace...</p>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'review').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'completed' && t.dueDate && t.dueDate < todayStr;
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  const getPriorityPercentage = (count) => {
    return totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-container" style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>Command Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here is your team's real-time productivity breakdown.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-card-left">
            <div className="stat-title">Active Projects</div>
            <div className="stat-value">{projects.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)' }}>
            📁
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-card-left">
            <div className="stat-title">Total Workspace Tasks</div>
            <div className="stat-value">{totalTasks}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
            ⚡
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-card-left">
            <div className="stat-title">Tasks In Progress</div>
            <div className="stat-value">{inProgressTasks + reviewTasks}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            ⚙️
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ border: overdueTasks.length > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '' }}>
          <div className="stat-card-left">
            <div className="stat-title" style={{ color: overdueTasks.length > 0 ? '#f87171' : '' }}>Overdue Deadlines</div>
            <div className="stat-value" style={{ color: overdueTasks.length > 0 ? '#ef4444' : '' }}>{overdueTasks.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ 
            background: overdueTasks.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
            color: overdueTasks.length > 0 ? '#f87171' : 'var(--text-dim)' 
          }}>
            ⚠️
          </div>
        </div>
      </div>

      <div className="dashboard-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel chart-card">
            <h3 className="card-title" style={{ marginBottom: '24px' }}>Efficiency Analytics</h3>
            <div className="progress-gauge-container">
              <div className="gauge-box">
                <svg className="gauge-svg">
                  <circle className="gauge-bg" cx="60" cy="60" r={radius} />
                  <circle 
                    className="gauge-fill" 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                  <text className="gauge-text" x="60" y="66" textAnchor="middle" transform="rotate(90 60 60)">
                    {completionRate}%
                  </text>
                </svg>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETION RATE</div>
              </div>

              <div style={{ flex: '1', maxWidth: '300px' }} className="priority-list">
                <div className="priority-row">
                  <div className="priority-meta">
                    <span style={{ color: '#f87171' }}>🔴 High Priority</span>
                    <span style={{ color: 'white' }}>{highPriority}</span>
                  </div>
                  <div className="priority-track">
                    <div className="priority-fill" style={{ width: `${getPriorityPercentage(highPriority)}%`, background: '#f87171' }} />
                  </div>
                </div>

                <div className="priority-row">
                  <div className="priority-meta">
                    <span style={{ color: '#fbbf24' }}>🟡 Medium Priority</span>
                    <span style={{ color: 'white' }}>{mediumPriority}</span>
                  </div>
                  <div className="priority-track">
                    <div className="priority-fill" style={{ width: `${getPriorityPercentage(mediumPriority)}%`, background: '#fbbf24' }} />
                  </div>
                </div>

                <div className="priority-row">
                  <div className="priority-meta">
                    <span style={{ color: '#818cf8' }}>🔵 Low Priority</span>
                    <span style={{ color: 'white' }}>{lowPriority}</span>
                  </div>
                  <div className="priority-track">
                    <div className="priority-fill" style={{ width: `${getPriorityPercentage(lowPriority)}%`, background: '#818cf8' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel chart-card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>Task Stages</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-todo)', fontWeight: 700, marginBottom: '6px' }}>TO DO</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todoTasks}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-in-progress)', fontWeight: 700, marginBottom: '6px' }}>IN PROGRESS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{inProgressTasks}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-review)', fontWeight: 700, marginBottom: '6px' }}>REVIEW</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{reviewTasks}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-completed)', fontWeight: 700, marginBottom: '6px' }}>COMPLETED</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completedTasks}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel list-card">
          <h3 className="card-title" style={{ color: overdueTasks.length > 0 ? '#f87171' : 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {overdueTasks.length > 0 ? '⚠️ Critical Actions Required' : '🎯 Next Deadlines'}
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {overdueTasks.length > 0 ? 'These tasks have missed their scheduled deadline.' : 'No immediate critical tasks. Nice job!'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overdueTasks.length > 0 ? (
              overdueTasks.slice(0, 5).map(task => (
                <div key={task.id} className="recent-task-row" style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                  <div style={{ overflow: 'hidden', marginRight: '10px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 500, marginTop: '2px' }}>
                      Overdue since {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigateToProject(task.projectId)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    Go To
                  </button>
                </div>
              ))
            ) : (
              tasks
                .filter(t => t.status !== 'completed' && t.dueDate)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className="recent-task-row">
                    <div style={{ overflow: 'hidden', marginRight: '10px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigateToProject(task.projectId)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Go To
                    </button>
                  </div>
                ))
            )}

            {totalTasks === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
                No active tasks to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
