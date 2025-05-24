import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Setup2FA: React.FC = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setup2FA, verify2FA } = useAuth();

  const handleSetup = async () => {
    try {
      const data = await setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
      setError('');
      setSuccess('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await verify2FA(token);
      setSuccess('Two-factor authentication enabled successfully!');
      setShowSetup(false);
      setQrCode('');
      setSecret('');
      setToken('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!showSetup) {
    return (
      <div className="card p-4 mb-4">
        <h2 className="h5 mb-3">Setup Two-Factor Authentication</h2>
        {success && <div className="alert alert-success mb-3">{success}</div>}
        <button
          onClick={handleSetup}
          className="btn btn-primary w-100"
        >
          Setup 2FA
        </button>
      </div>
    );
  }

  return (
    <div className="card p-4 mb-4">
      <h2 className="h5 mb-3">Setup Two-Factor Authentication</h2>
      <p>Scan this QR code with your authenticator app:</p>
      <div className="d-flex justify-content-center mb-3">
        <img src={qrCode} alt="2FA QR Code" />
      </div>
      <p className="mb-2">Or enter this secret key manually:</p>
      <code className="d-block mb-3 text-danger">{secret}</code>
      <form onSubmit={handleVerify}>
        <div className="mb-3 row align-items-center">
          <div className="col-auto">
            <label className="col-form-label">Enter 6-digit code from your authenticator app</label>
          </div>
          <div className="col">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="form-control"
              placeholder="Enter 6-digit code"
            />
          </div>
        </div>
        {error && <div className="alert alert-danger py-1 mb-3">{error}</div>}
        <button
          type="submit"
          className="btn btn-success w-100"
        >
          Verify and Enable 2FA
        </button>
      </form>
    </div>
  );
};

export default Setup2FA; 