import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const { login, signup, globalError, setGlobalError } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setGlobalError(null);

    if (!email || !password) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !name) {
      setValidationError('Please provide your name.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password, role);
      }
    } catch (err) {}
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setValidationError('');
    setGlobalError(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('member');
  };

  const setDemoCredentials = (roleType) => {
    setGlobalError(null);
    setValidationError('');
    setIsLogin(true);
    if (roleType === 'admin') {
      setEmail('admin@taskflow.com');
      setPassword('admin123');
    } else {
      setEmail('member@taskflow.com');
      setPassword('member123');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚀</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TaskFlow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isLogin ? 'Collaborate, track, and complete tasks seamlessly' : 'Get started by creating a secure team account'}
          </p>
        </div>

        {(validationError || globalError) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            {validationError || globalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Sarah Conner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Default Role</label>
              <select 
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="member">Team Member (Task tracking & execution)</option>
                <option value="admin">System Admin (Full project & task authority)</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isLogin ? 'Secure Sign In' : 'Create Team Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span 
            onClick={toggleAuthMode} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>

        {isLogin && (
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              ⚡ Quick Demo Logins
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDemoCredentials('admin')}
                className="btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 'var(--border-radius-sm)' }}
              >
                🔑 Admin Demo
              </button>
              <button 
                onClick={() => setDemoCredentials('member')}
                className="btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 'var(--border-radius-sm)' }}
              >
                👤 Member Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
