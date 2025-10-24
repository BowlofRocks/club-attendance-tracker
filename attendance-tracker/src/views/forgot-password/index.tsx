import { useState } from "react";
import { Link } from "react-router-dom";
import './index.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // For development - show the token
        if (data.dev_token) {
          setResetToken(data.dev_token);
        }
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <h2 className="forgot-password-title">Check Your Email</h2>
        
        <div className="forgot-password-success">
          <p>If an account exists with <strong>{email}</strong>, a password reset code has been sent.</p>
          <p>The code will expire in 30 minutes.</p>
        </div>

        {resetToken && (
          <div className="forgot-password-dev-token">
            <strong>Development Mode - Your Reset Code:</strong>
            <div className="reset-code">{resetToken}</div>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
              In production, this would be sent via email.
            </p>
          </div>
        )}

        <Link to="/reset-password" className="forgot-password-link-button">
          Enter Reset Code →
        </Link>

        <Link to="/login" className="forgot-password-back-link">
          ← Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Forgot Password</h2>
      <p className="forgot-password-description">
        Enter your email address and we'll send you a code to reset your password.
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

        <button 
          type="submit" 
          disabled={loading}
          className="forgot-password-button"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>

      <Link to="/login" className="forgot-password-back-link">
        ← Back to Login
      </Link>
    </div>
  );
};

export default ForgotPassword;
