import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import Modal from './components/Modal';

function AppContent() {
  const { user, loading } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create-project');
  const [taskToEdit, setTaskToEdit] = useState(null);

  if (loading && !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🚀</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>Booting TaskFlow...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleOpenCreateProject = () => {
    setModalType('create-project');
    setModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setModalType('edit-task');
    setModalOpen(true);
  };

  const handleNavigateToProject = (id) => {
    setActiveTab('project');
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onCreateProjectClick={handleOpenCreateProject}
      />

      <main className="main-content">
        <Navbar activeTab={activeTab} />

        {activeTab === 'dashboard' ? (
          <Dashboard onNavigateToProject={handleNavigateToProject} />
        ) : (
          <ProjectBoard 
            onManageTeamClick={() => { setModalType('manage-members'); setModalOpen(true); }}
            onAddTaskClick={() => { setModalType('create-task'); setModalOpen(true); }}
            onEditProjectClick={() => { setModalType('edit-project'); setModalOpen(true); }}
            onEditTaskClick={handleOpenEditTask}
          />
        )}
      </main>

      {modalOpen && (
        <Modal 
          type={modalType}
          taskToEdit={taskToEdit}
          onClose={() => { setModalOpen(false); setTaskToEdit(null); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
