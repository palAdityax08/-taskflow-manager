import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar({ activeTab }) {
  const { user, activeProject } = useApp();

  const getHeaderTitle = () => {
    if (activeTab === 'dashboard') {
      return 'Command Center';
    }
    if (activeTab === 'project' && activeProject) {
      return `Workspace / ${activeProject.name}`;
    }
    return 'TaskFlow Manager';
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        {getHeaderTitle()}
      </div>

      <div className="navbar-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Logged in as:</span>
          <span className="badge-role">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}
