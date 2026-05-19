import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ activeTab, setActiveTab, onCreateProjectClick }) {
  const { user, projects, activeProjectId, setActiveProjectId, logout } = useApp();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleProjectSelect = (projId) => {
    setActiveProjectId(projId);
    setActiveTab('project');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ textShadow: '0 0 15px var(--primary-glow)' }}>🚀</span>
        <span style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          TaskFlow
        </span>
      </div>

      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
          </svg>
          Dashboard
        </li>
      </ul>

      <div style={{ marginTop: '30px', textAlign: 'left' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px',
          padding: '0 8px'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: 'var(--text-dim)', 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Projects ({projects.length})
          </span>
          {user?.role === 'admin' && (
            <button 
              onClick={onCreateProjectClick}
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: 'none',
                color: 'var(--primary)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                transition: 'var(--transition-smooth)'
              }}
              title="Create New Project"
            >
              +
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '0 8px', fontStyle: 'italic' }}>
            No projects created.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '350px', overflowY: 'auto' }}>
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleProjectSelect(proj.id)}
                className={`sidebar-item ${activeTab === 'project' && activeProjectId === proj.id ? 'active' : ''}`}
                style={{ fontSize: '0.9rem', padding: '10px 14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                <span style={{ color: activeProjectId === proj.id ? 'var(--primary)' : 'var(--text-dim)', marginRight: '6px' }}>📁</span>
                {proj.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-user">
        <div className="avatar">
          {getInitials(user?.name)}
        </div>
        <div className="user-info">
          <div className="user-name" title={user?.name}>{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button 
          onClick={logout}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign Out"
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </aside>
  );
}
