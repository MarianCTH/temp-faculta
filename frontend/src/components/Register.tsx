import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(email, password);
      setSuccess('Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ width: 350 }}>
        <h2 className="mb-4 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter your email"
              required
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
              required
            />
          </div>
          {error && <div className="alert alert-danger py-1 mb-3">{error}</div>}
          {success && <div className="alert alert-success py-1 mb-3">{success}</div>}
          <button type="submit" className="btn btn-success w-100 mb-2">Register</button>
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onSwitchToLogin}>Back to Login</button>
        </form>
      </div>
    </div>
  );
};

export default Register; 