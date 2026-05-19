import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchProjects();
      fetchUsersList();
    }
  }, [user, token]);

  useEffect(() => {
    if (activeProjectId && token) {
      fetchActiveProject(activeProjectId);
    } else {
      setActiveProject(null);
    }
  }, [activeProjectId]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProjects([]);
    setActiveProjectId(null);
    setActiveProject(null);
    setUsersList([]);
    setGlobalError(null);
  };

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      return data;
    } catch (err) {
      setGlobalError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setGlobalError(null);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    setGlobalError(null);
    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiFetch('/api/projects');
      setProjects(data);
      if (data.length > 0 && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchActiveProject = async (id) => {
    try {
      const data = await apiFetch(`/api/projects/${id}`);
      setActiveProject(data);
    } catch (err) {
      console.error(`Error fetching project ${id}:`, err);
      setActiveProject(null);
    }
  };

  const fetchUsersList = async () => {
    try {
      const data = await apiFetch('/api/users');
      setUsersList(data);
    } catch (err) {
      console.error('Error fetching users directory:', err);
    }
  };

  const createProject = async (name, description) => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description })
      });
      setProjects(prev => [data, ...prev]);
      setActiveProjectId(data.id);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId, name, description) => {
    try {
      const data = await apiFetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description })
      });
      
      setProjects(prev => prev.map(p => p.id === projectId ? data : p));
      if (activeProjectId === projectId) {
        setActiveProject(prev => ({ ...prev, ...data }));
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await apiFetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      if (activeProjectId === projectId) {
        setActiveProjectId(updatedProjects.length > 0 ? updatedProjects[0].id : null);
      }
    } catch (err) {
      throw err;
    }
  };

  const addProjectMember = async (projectId, userId) => {
    try {
      const data = await apiFetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      
      if (activeProjectId === projectId) {
        setActiveProject(prev => ({
          ...prev,
          Members: data.members
        }));
      }
      
      fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const removeProjectMember = async (projectId, userId) => {
    try {
      const data = await apiFetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE'
      });
      
      if (activeProjectId === projectId) {
        setActiveProject(prev => ({
          ...prev,
          Members: data.members
        }));
      }
      fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const createTask = async (taskData) => {
    try {
      const data = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...taskData, projectId: activeProjectId })
      });

      if (activeProject) {
        setActiveProject(prev => ({
          ...prev,
          Tasks: [data, ...prev.Tasks]
        }));
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      const data = await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (activeProject) {
        setActiveProject(prev => ({
          ...prev,
          Tasks: prev.Tasks.map(t => t.id === taskId ? data : t)
        }));
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (activeProject) {
        setActiveProject(prev => ({
          ...prev,
          Tasks: prev.Tasks.filter(t => t.id !== taskId)
        }));
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      projects,
      activeProjectId,
      activeProject,
      usersList,
      loading,
      globalError,
      setGlobalError,
      setActiveProjectId,
      login,
      signup,
      logout,
      createProject,
      updateProject,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      createTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
