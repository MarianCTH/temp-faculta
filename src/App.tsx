import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Setup2FA from './components/Setup2FA';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Welcome, <span className="text-primary">{user.email}</span>!</h1>
          <button
            onClick={logout}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
      {!user.two_factor_enabled && <div className="mb-4"><Setup2FA /></div>}
      <div className="card">
        <div className="card-body">
          <h2 className="h5 mb-3">Protected Content</h2>
          <p className="text-muted mb-0">
            This content is only visible to authenticated users.
            {user.two_factor_enabled && ' Your account is protected with 2FA!'}
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
