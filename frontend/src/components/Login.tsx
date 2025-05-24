import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const { login, verifyLogin2FA } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor && result.userId) {
        setShowTwoFactor(true);
        setUserId(result.userId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (userId === null) {
        throw new Error('User ID is missing');
      }
      await verifyLogin2FA(userId, twoFactorToken);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (showTwoFactor) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="card p-4 shadow" style={{ width: 350 }}>
          <h2 className="mb-4 text-center">Two-Factor Authentication</h2>
          <form onSubmit={handleTwoFactorSubmit}>
            <div className="mb-3">
              <label className="form-label">Enter 2FA Code</label>
              <input
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                className="form-control"
                placeholder="Enter 6-digit code"
              />
            </div>
            {error && <div className="alert alert-danger py-1 mb-3">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 mb-2">Verify</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ width: 350 }}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="alert alert-danger py-1 mb-3">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mb-2">Login</button>
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onSwitchToRegister}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 