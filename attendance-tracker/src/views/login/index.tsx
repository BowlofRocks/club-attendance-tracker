// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './index.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Trigger storage event for Nav component to update
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        alert(`Welcome, ${data.user.first_name} ${data.user.last_name}!${data.user.is_admin ? ' (Admin)' : ''}`);
        
        // Redirect to attendance page
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Club Attendance Tracker</h2>
      <h3 className="login-subtitle">Login</h3>
      
      {error && (
        <div className="login-error">
          {error}
        </div>
      )}
      
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-group">
          <label className="login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            className="login-input"
          />
        </div>
        <div className="login-form-group">
          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            className="login-input"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="login-button"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="login-forgot-password">
        <Link to="/forgot-password" className="login-forgot-password-link">
          Forgot your password?
        </Link>
      </div>
      
      <div className="login-test-credentials">
        <strong>Test Credentials:</strong>
        Email: david.bell1@email.com
        <br />
        Password: temp_password_1
        <br />
        <br />
        Or:
        <br />
        Email: tanner.larson@email.com
        <br />
        Password: temp_password_2
      </div>
    </div>
  );
};

export default Login;
