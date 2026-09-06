'use client';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, ArrowRight, CheckCircle2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { login, apiUrl } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = isLogin ? `${apiUrl}/api/v1/auth/login` : `${apiUrl}/api/v1/auth/signup`;
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      await login(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleForgotPassword = () => {
    toast.error('Please contact the admin to reset your password.');
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  return (
    <>
      <style>{`
        .auth-desktop { display: flex; }
        .auth-mobile { display: none; }
        @media (max-width: 768px) {
          .auth-desktop { display: none !important; }
          .auth-mobile { display: flex !important; }
        }
      `}</style>

      {/* ========================================= */}
      {/* MOBILE VIEW (Only visible on small screens) */}
      {/* ========================================= */}
      <div className="auth-mobile" style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fafafa', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Mobile Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <img src="/icon.png" alt="BulkBuddy Logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>BulkBuddy</h1>
          </div>

          {/* Mobile Toggle Switch */}
          <div style={{ display: 'flex', background: '#e5e7eb', padding: '4px', borderRadius: '12px', marginBottom: '32px' }}>
            <button 
              type="button"
              onClick={() => setIsLogin(true)} 
              style={{ flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: isLogin ? '#111827' : 'transparent', color: isLogin ? '#fff' : '#6b7280', boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)} 
              style={{ flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: !isLogin ? '#111827' : 'transparent', color: !isLogin ? '#fff' : '#6b7280', boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    style={{ width: '100%', background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', outline: 'none', padding: '12px 12px 12px 42px', fontSize: 14, boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: '100%', background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', outline: 'none', padding: '12px 12px 12px 42px', fontSize: 14, boxSizing: 'border-box' }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', outline: 'none', padding: '12px 42px 12px 42px', fontSize: 14, boxSizing: 'border-box' }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {isLogin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={handleForgotPassword} style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '14px', background: '#25d366', color: 'white', borderRadius: '12px', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, border: 'none', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', color: '#374151', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      {/* =========================================== */}
      {/* DESKTOP VIEW (Exactly as original, unaltered) */}
      {/* =========================================== */}
      <div className="auth-desktop" style={{ height: '100vh', width: '100vw', background: '#fff' }}>
        
        {/* Left Side - Branding / Graphic */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#fff',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Decorative Pattern */}
          <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1, pointerEvents: 'none' }}>
            <MessageSquare size={400} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <img src="/icon.png" alt="BulkBuddy Logo" style={{ width: 56, height: 56, borderRadius: 12 }} />
              <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px' }}>BulkBuddy</h1>
            </div>
            
            <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, maxWidth: 500 }}>
              Automate your WhatsApp operations at scale.
            </h2>
            <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 450, lineHeight: 1.5 }}>
              The all-in-one platform for bulk messaging, group management, and CRM syncing. Manage thousands of chats without getting blocked.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <CheckCircle2 size={20} color="#25d366" />
              <span style={{ fontSize: 15, color: '#d1d5db' }}>Smart anti-ban algorithms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <CheckCircle2 size={20} color="#25d366" />
              <span style={{ fontSize: 15, color: '#d1d5db' }}>Unlimited device connections</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={20} color="#25d366" />
              <span style={{ fontSize: 15, color: '#d1d5db' }}>Advanced group monitoring</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          maxWidth: 600
        }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {isLogin ? 'Welcome back to BulkBuddy' : 'Create your account'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 32 }}>
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start automating your WhatsApp messages.'}
            </p>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, color: '#374151', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: 13 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 12 }} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="input" 
                      style={{ paddingLeft: 38 }}
                      required 
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input" 
                    style={{ paddingLeft: 38 }}
                    required 
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                  {isLogin && (
                    <button type="button" onClick={handleForgotPassword} style={{ fontSize: 13, color: '#25d366', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 12 }} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input" 
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                    required 
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '12px', fontSize: 15, justifyContent: 'center', marginTop: 8 }}
              >
                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: '#25d366', fontWeight: 600, cursor: 'pointer' }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
