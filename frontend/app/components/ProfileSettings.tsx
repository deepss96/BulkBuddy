'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileSettings() {
  const { user, refreshUser, apiUrl } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Populate fields from context user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${apiUrl}/api/v1/user/profile`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      await refreshUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${apiUrl}/api/v1/user/password`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        width: '100%',
        maxWidth: 1000,
        height: 'calc(100vh - 90px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}>
        {/* Fixed Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Profile Settings</h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            Manage your personal information, security preferences, and account settings.
          </p>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, background: '#fafafa' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                <CheckCircle2 size={16} /> {message}
              </div>
            )}

            {/* Main Info Card */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="#25d366" /> Personal Information
              </h2>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      style={{ paddingLeft: 34, maxWidth: 400 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      style={{ paddingLeft: 34, maxWidth: 400 }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save Changes</button>
                </div>
              </form>
            </div>

            {/* Security Card */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#25d366" /> Security & Password
              </h2>

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      style={{ paddingLeft: 34, maxWidth: 400 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      style={{ paddingLeft: 34, maxWidth: 400 }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Update Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
