import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './index.css';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password has been reset successfully! You can now login with your new password.');
        navigate('/login');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Reset Your Password</h2>
      <p className="forgot-password-description">
        Enter the 6-digit code sent to your email and choose a new password.
      </p>

      {error && (
        <div className="forgot-password-error">
          {error}
        </div>
      )}

      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <div className="forgot-password-form-group">
          <label className="forgot-password-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            className="forgot-password-input"
          />
        </div>

        <div className="forgot-password-form-group">
          <label className="forgot-password-label" htmlFor="token">Reset Code</label>
          <input
            id="token"
            type="text"
            placeholder="Enter 6-digit code"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
            disabled={loading}
            maxLength={6}
            pattern="[0-9]{6}"
            className="forgot-password-input reset-code-input"
          />
        </div>

        <div className="forgot-password-form-group">
          <label className="forgot-password-label" htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="forgot-password-input"
          />
        </div>

        <div className="forgot-password-form-group">
          <label className="forgot-password-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="forgot-password-input"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="forgot-password-button"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="forgot-password-links">
        <Link to="/forgot-password" className="forgot-password-back-link">
          Didn't receive a code?
        </Link>
        <Link to="/login" className="forgot-password-back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
