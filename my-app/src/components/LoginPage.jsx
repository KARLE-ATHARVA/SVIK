import React, { useState } from 'react';
import './LoginPage.css';
import illustration from '../assets/illustration.jpg';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-container">
      {/* Left Side Image */}
      <div className="left-section">
        <img src={illustration} alt="Illustration" />
      </div>

      {/* Right Side Login */}
      <div className="right-section">
        <div className="login-box">
          <h1>Login</h1>
          <p>Welcome back! Log in to your account.</p>

          <form>
            <div className="input-group">
              <p>Email Address</p>
              <div className="input-wrapper">
                <i className="fas fa-envelope icon-left"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <p>Password</p>
              <div className="input-wrapper">
                <i className="fas fa-lock icon-left"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember password
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="signin-btn">SIGN IN</button>
          </form>

          <div className="divider">
            <span>Sign in with</span>
          </div>

          <div className="social-icons">
            <i className="fab fa-linkedin"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-facebook"></i>
            <i className="fab fa-instagram"></i>
          </div>

        {/* <p className="create-account">
          Don't have account? <a href="#">Create Account</a>
          </p>
        */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
