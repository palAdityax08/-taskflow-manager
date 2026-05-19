import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Modal({ type, taskToEdit, onClose }) {
  const { 
    activeProject, 
    usersList, 
    createProject, 
    updateProject, 
    createTask, 
    updateTask, 
    addProjectMember, 
    removeProjectMember 
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projName, setProjName] = useState(activeProject && type === 'edit-project' ? activeProject.name : '');
  const [projDesc, setProjDesc] = useState(activeProject && type === 'edit-project' ? activeProject.description : '');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedId, setTaskAssignedId] = useState('');

  useEffect(() => {
    if (type === 'edit-task' && taskToEdit) {
      setTaskTitle(taskToEdit.title || '');
      setTaskDesc(taskToEdit.description || '');
      setTaskStatus(taskToEdit.status || 'todo');
      setTaskPriority(taskToEdit.priority || 'medium');
      setTaskDueDate(taskToEdit.dueDate || '');
      setTaskAssignedId(taskToEdit.assignedId || '');
    } else {
      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus('todo');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskAssignedId('');
    }
  }, [type, taskToEdit]);

  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');

  const nonMembers = usersList.filter(user => {
    return !activeProject?.Members?.some(m => m.id === user.id);
  });

  useEffect(() => {
    if (nonMembers.length > 0) {
      setSelectedNewMemberId(nonMembers[0].id.toString());
    } else {
      setSelectedNewMemberId('');
    }
  }, [activeProject, usersList]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!projName) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'edit-project') {
        await updateProject(activeProject.id, projName, projDesc);
      } else {
        await createProject(projName, projDesc);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!taskTitle) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    try {
      const taskPayload = {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        assignedId: taskAssignedId ? parseInt(taskAssignedId) : null
      };

      if (type === 'edit-task' && taskToEdit) {
        await updateTask(taskToEdit.id, taskPayload);
      } else {
        await createTask(taskPayload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedNewMemberId) return;

    setLoading(true);
    try {
      await addProjectMember(activeProject.id, parseInt(selectedNewMemberId));
    } catch (err) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    setError('');
    setLoading(true);
    try {
      await removeProjectMember(activeProject.id, userId);
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderContent = () => {
    if (type === 'create-project' || type === 'edit-project') {
      return (
        <form onSubmit={handleProjectSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Mobile App Redesign"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="4"
              placeholder="Outline project goal, milestones, and deliverables..."
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : type === 'edit-project' ? 'Update Project' : 'Launch Project'}
          </button>
        </form>
      );
    }

    if (type === 'create-task' || type === 'edit-task') {
      return (
        <form onSubmit={handleTaskSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Design API auth scheme"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="3"
              placeholder="Detail the instructions or dependencies..."
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-select" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={taskDueDate} 
                onChange={(e) => setTaskDueDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Member</label>
              <select className="form-select" value={taskAssignedId} onChange={(e) => setTaskAssignedId(e.target.value)}>
                <option value="">Unassigned</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : type === 'edit-task' ? 'Save Changes' : 'Assign Task'}
          </button>
        </form>
      );
    }

    if (type === 'manage-members') {
      return (
        <div>
          {nonMembers.length > 0 ? (
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <select 
                  className="form-select"
                  value={selectedNewMemberId}
                  onChange={(e) => setSelectedNewMemberId(e.target.value)}
                >
                  {nonMembers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0 20px' }} disabled={loading}>
                Add
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '20px', fontStyle: 'italic' }}>
              All registered users are already members of this project.
            </p>
          )}

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Team Members ({activeProject?.Members?.length || 0})
          </span>
          <div className="team-member-list">
            {activeProject?.Members?.map(member => (
              <div key={member.id} className="team-member-row">
                <div className="member-core">
                  <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{member.email}</div>
                  </div>
                </div>

                {activeProject.ownerId !== member.id && (
                  <button 
                    onClick={() => handleRemoveMember(member.id)}
                    className="remove-member-btn"
                    title="Remove member"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'create-project': return 'Initialize Workspace';
      case 'edit-project': return 'Edit Workspace Details';
      case 'create-task': return 'Create & Assign Task';
      case 'edit-task': return 'Edit Task Details';
      case 'manage-members': return 'Manage Workspace Team';
      default: return 'TaskFlow Overlay';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-panel modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{getModalTitle()}</h2>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
