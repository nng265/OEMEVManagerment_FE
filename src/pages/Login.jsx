import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/atoms/Button/Button';
import Input from '../components/atoms/Input/Input';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <img src="/logo.png" alt="Logo" className="login-logo" />
          <h1>OEM EV Management</h1>
          <p className="login-subtitle">Internal electric vehicle warranty system</p>
        </div>
        
        <div className="login-box">
          <h2>Login</h2>
          {error && (
            <div className="login-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <Input
                type="text"
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
                className="login-input"
              />
            </div>
            
            <div className="form-group">
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                className="login-input"
              />
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
        
        <div className="login-footer">
          © 2025 OEM EV • For internal staff only
        </div>
      </div>
    </div>
  );
};

export default Login;