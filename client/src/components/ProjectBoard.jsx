import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProjectBoard({ 
  onManageTeamClick, 
  onAddTaskClick, 
  onEditProjectClick,
  onEditTaskClick 
}) {
  const { user, activeProject, updateTask, deleteTask, deleteProject } = useApp();
  const [viewTab, setViewTab] = useState('kanban');

  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  if (!activeProject) {
    return (
      <div style={{ display: 'flex', flex: '1', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          <span style={{ fontSize: '3rem' }}>📂</span>
          <h3 style={{ fontSize: '1.2rem', color: 'white', marginTop: '10px' }}>No Project Selected</h3>
          <p>Please select a project from the sidebar, or create a new one.</p>
        </div>
      </div>
    );
  }

  const tasks = activeProject.Tasks || [];
  const members = activeProject.Members || [];

  const moveTask = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      alert(err.message || 'Failed to move task.');
    }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete this project? This will permanently delete all associated tasks.')) {
      try {
        await deleteProject(activeProject.id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canUpdateStatus = (task) => {
    if (user?.role === 'admin') return true;
    return task.assignedId === user?.id;
  };

  const isOverdue = (task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  };

  const filteredTasks = tasks.filter(task => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (assigneeFilter === 'me' && task.assignedId !== user?.id) return false;
    return true;
  });

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  const renderTaskCard = (task) => {
    const priorityColor = {
      high: '#f87171',
      medium: '#fbbf24',
      low: '#818cf8'
    }[task.priority];

    const isOverdueTask = isOverdue(task);

    return (
      <div 
        key={task.id} 
        className="glass-panel task-card"
        onClick={() => user?.role === 'admin' && onEditTaskClick(task)}
        style={{ 
          borderLeft: `4px solid ${priorityColor}`,
          position: 'relative',
          cursor: user?.role === 'admin' ? 'pointer' : 'default'
        }}
      >
        {isOverdueTask && (
          <div className="overdue-banner" style={{ fontSize: '0.7rem', padding: '4px 8px', marginBottom: '8px' }}>
            ⚠️ Overdue Deadline
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <span 
            className="task-priority-tag" 
            style={{ 
              background: `rgba(${task.priority === 'high' ? '239,68,68' : task.priority === 'medium' ? '245,158,11' : '99,102,241'}, 0.15)`,
              color: priorityColor 
            }}
          >
            {task.priority}
          </span>

          {user?.role === 'admin' && (
            <button 
              onClick={(e) => handleDeleteTask(e, task.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(239, 68, 68, 0.6)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'var(--transition-smooth)'
              }}
              title="Delete Task"
            >
              🗑️
            </button>
          )}
        </div>

        <h4 className="task-card-title">{task.title}</h4>
        {task.description && <p className="task-card-desc">{task.description}</p>}

        <div className="task-card-footer">
          <span className="task-due">
            📅 {task.dueDate ? task.dueDate.split('-').slice(1).join('/') : 'No Date'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canUpdateStatus(task) && (
              <div className="task-quick-actions">
                {task.status !== 'todo' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveTask(task.id, {
                      in_progress: 'todo',
                      review: 'in_progress',
                      completed: 'review'
                    }[task.status]); }}
                    className="quick-action-btn"
                    title="Move back"
                  >
                    ◀
                  </button>
                )}
                {task.status !== 'completed' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveTask(task.id, {
                      todo: 'in_progress',
                      in_progress: 'review',
                      review: 'completed'
                    }[task.status]); }}
                    className="quick-action-btn"
                    title="Move forward"
                    style={{ color: 'var(--color-completed)' }}
                  >
                    ▶
                  </button>
                )}
              </div>
            )}

            {task.Assignee ? (
              <div 
                className="avatar task-assignee-avatar" 
                title={`Assigned to: ${task.Assignee.name} (${task.Assignee.role})`}
              >
                {getInitials(task.Assignee.name)}
              </div>
            ) : (
              <div 
                className="avatar task-assignee-avatar" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', border: '1px dashed var(--border-glass)' }}
                title="Unassigned"
              >
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container" style={{ textAlign: 'left' }}>
      
      <div className="glass-panel project-header-panel">
        <div className="project-meta-info">
          <h1 className="project-title">{activeProject.name}</h1>
          <p className="project-description">{activeProject.description || 'No description provided.'}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEAM MEMBERS:</span>
            <div style={{ display: 'flex', marginLeft: '6px' }}>
              {members.slice(0, 5).map((m, idx) => (
                <div 
                  key={m.id} 
                  className="avatar" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    fontSize: '0.75rem',
                    marginLeft: idx > 0 ? '-8px' : '0',
                    border: '2px solid #09090b',
                    zIndex: 5 - idx
                  }}
                  title={`${m.name} (${m.role})`}
                >
                  {getInitials(m.name)}
                </div>
              ))}
              {members.length > 5 && (
                <div 
                  className="avatar" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    fontSize: '0.75rem',
                    marginLeft: '-8px',
                    border: '2px solid #09090b',
                    background: 'rgba(255,255,255,0.1)',
                    zIndex: 0
                  }}
                  title={`${members.length - 5} more members`}
                >
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="project-action-buttons">
            <button onClick={onAddTaskClick} className="btn-primary">
              ➕ New Task
            </button>
            <button onClick={onManageTeamClick} className="btn-secondary">
              👥 Members
            </button>
            <button onClick={onEditProjectClick} className="btn-secondary" title="Edit details">
              ✏️
            </button>
            <button onClick={handleDeleteProject} className="btn-danger" style={{ padding: '10px 14px' }} title="Delete project">
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="project-view-tabs">
        <button 
          className={`tab-btn ${viewTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setViewTab('kanban')}
        >
          📋 Kanban Board
        </button>
        <button 
          className={`tab-btn ${viewTab === 'list' ? 'active' : ''}`}
          onClick={() => setViewTab('list')}
        >
          🔍 Structured Task List
        </button>
      </div>

      {viewTab === 'kanban' ? (
        <div className="kanban-view">
          
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title-group">
                <span className="column-dot" style={{ background: 'var(--color-todo)' }} />
                <span className="column-title" style={{ color: 'var(--color-todo)' }}>To Do</span>
              </div>
              <span className="column-count">{getTasksByStatus('todo').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getTasksByStatus('todo').map(renderTaskCard)}
              {getTasksByStatus('todo').length === 0 && (
                <div style={{ padding: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  Column empty
                </div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title-group">
                <span className="column-dot" style={{ background: 'var(--color-in-progress)' }} />
                <span className="column-title" style={{ color: 'var(--color-in-progress)' }}>In Progress</span>
              </div>
              <span className="column-count">{getTasksByStatus('in_progress').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getTasksByStatus('in_progress').map(renderTaskCard)}
              {getTasksByStatus('in_progress').length === 0 && (
                <div style={{ padding: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  Column empty
                </div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title-group">
                <span className="column-dot" style={{ background: 'var(--color-review)' }} />
                <span className="column-title" style={{ color: 'var(--color-review)' }}>Review</span>
              </div>
              <span className="column-count">{getTasksByStatus('review').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getTasksByStatus('review').map(renderTaskCard)}
              {getTasksByStatus('review').length === 0 && (
                <div style={{ padding: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  Column empty
                </div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title-group">
                <span className="column-dot" style={{ background: 'var(--color-completed)' }} />
                <span className="column-title" style={{ color: 'var(--color-completed)' }}>Completed</span>
              </div>
              <span className="column-count">{getTasksByStatus('completed').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getTasksByStatus('completed').map(renderTaskCard)}
              {getTasksByStatus('completed').length === 0 && (
                <div style={{ padding: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--border-radius-md)' }}>
                  Column empty
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>FILTER BY:</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Priority</span>
              <select 
                className="form-select" 
                style={{ width: '130px', padding: '6px 28px 6px 12px', fontSize: '0.85rem' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Status</span>
              <select 
                className="form-select" 
                style={{ width: '130px', padding: '6px 28px 6px 12px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Assignee</span>
              <select 
                className="form-select" 
                style={{ width: '150px', padding: '6px 28px 6px 12px', fontSize: '0.85rem' }}
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all">Everyone</option>
                <option value="me">Assigned to me</option>
              </select>
            </div>
          </div>

          <div className="task-table-container glass-panel">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h4 className="empty-state-title">No matching tasks found</h4>
                <p>Try loosening your search filters.</p>
              </div>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const priorityColor = {
                      high: '#f87171',
                      medium: '#fbbf24',
                      low: '#818cf8'
                    }[task.priority];

                    const statusPillColor = {
                      todo: 'var(--color-todo)',
                      in_progress: 'var(--color-in-progress)',
                      review: 'var(--color-review)',
                      completed: 'var(--color-completed)'
                    }[task.status];

                    return (
                      <tr 
                        key={task.id} 
                        style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default' }}
                        onClick={() => user?.role === 'admin' && onEditTaskClick(task)}
                      >
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span>{task.title}</span>
                            {isOverdue(task) && (
                              <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>⚠️ Overdue!</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: priorityColor, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            background: `rgba(${task.status === 'completed' ? '16,185,129' : task.status === 'review' ? '6,182,212' : task.status === 'in_progress' ? '245,158,11' : '99,102,241'}, 0.12)`,
                            color: statusPillColor,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {task.Assignee ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="avatar" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                                {getInitials(task.Assignee.name)}
                              </div>
                              <span style={{ fontSize: '0.9rem' }}>{task.Assignee.name}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.9rem', color: isOverdue(task) ? '#f87171' : 'var(--text-muted)' }}>
                          {task.dueDate ? task.dueDate : 'No Date'}
                        </td>
                        {user?.role === 'admin' && (
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={(e) => handleDeleteTask(e, task.id)}
                              className="btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
