'use client';
import { useState, useEffect } from 'react';
import { Search, RefreshCw, HelpCircle, MonitorSmartphone, Bell, ListTodo, User, Settings, LogOut, Download, Share, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui';
import toast from 'react-hot-toast';

export default function TopNavbar() {
  const { logout, setCurrentPage, currentPage, phones, user, fetchConnections, refreshUser } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstallGuide(true);
      return;
    }
    if (!installPrompt) {
      setShowInstallGuide(true);
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchConnections(), refreshUser()]);
  };

  const connectedCount = phones?.filter(p => p.status === 'connected').length || 0;
  const totalCount = phones?.length || 0;
  const isConnected = phones?.some(p => p.status === 'connected');

  return (
    <>
      <style>{`
        .topbar-desktop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          height: 56px;
          padding: 8px 24px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-mobile { display: none; }

        @media (max-width: 768px) {
          .topbar-desktop { display: none; }
          .topbar-mobile {
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            z-index: 30;
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
          }
          .topbar-mobile-row1 {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            gap: 8px;
          }
          .topbar-mobile-row2 { padding: 0 14px 10px; }
          .mobile-search {
            width: 100%;
            padding: 8px 12px 8px 34px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 13px;
            outline: none;
            background: #f3f4f6;
            color: #111827;
          }
        }
      `}</style>

      {/* ========== DESKTOP NAVBAR ========== */}
      <div className="topbar-desktop">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
          <MonitorSmartphone size={16} color="#9ca3af" />
          <span>{currentPage.replace('-', ' ')}</span>
        </div>

        <div style={{ flex: 1, maxWidth: 400, margin: '0 24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 12 }} />
          <input type="text" placeholder="Search chats, messages, tickets, contacts..."
            style={{ width: '100%', padding: '6px 12px 6px 32px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none', background: '#f9fafb', color: '#111827' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} style={{ color: '#4b5563', gap: 6, padding: '4px 8px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHelp(true)} style={{ color: '#4b5563', gap: 6, padding: '4px 8px' }}>
            <HelpCircle size={14} /> Help
          </button>
          <button className="btn btn-secondary btn-sm" style={{ gap: 6, padding: '4px 12px', background: '#fff' }} onClick={() => setCurrentPage('connections')}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#22c55e' : '#fbbf24' }} />
            {connectedCount} / {totalCount} phones
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleInstall} style={{ gap: 6, padding: '4px 12px', background: '#fff', color: '#111827', borderColor: '#e5e7eb' }}>
            <MonitorSmartphone size={14} /> Install Desktop App
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setTasksOpen(!tasksOpen); setNotifOpen(false); setDropdownOpen(false); }}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', position: 'relative', cursor: 'pointer' }}>
                <ListTodo size={16} color="#4b5563" />
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 4px', borderRadius: 10, lineHeight: 1 }}>0</span>
              </button>
              {tasksOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: 250, padding: 16, zIndex: 50 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Active Jobs</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>No active background jobs running.</div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setTasksOpen(false); setDropdownOpen(false); }}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                <Bell size={16} color="#4b5563" />
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: 250, padding: 16, zIndex: 50 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Notifications</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>You have no new notifications.</div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative', marginLeft: 8 }}>
              <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); setTasksOpen(false); }}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#f3f4f6', cursor: 'pointer', border: 'none' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} color="#4b5563" />}
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: 160, padding: '4px', zIndex: 50 }}>
                  <button onClick={() => { setDropdownOpen(false); setCurrentPage('profile'); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <Settings size={14} /> My Profile
                  </button>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
                  <button onClick={() => { setDropdownOpen(false); logout(); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE NAVBAR ========== */}
      <div className="topbar-mobile">

        {/* ROW 1: App title + All Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', overflowX: 'auto' }}>
          {/* Left: page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8, flexShrink: 0 }}>
            <MonitorSmartphone size={18} color="#25d366" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>
              {currentPage.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Right: All Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Phone count */}
            <button onClick={() => setCurrentPage('connections')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? '#22c55e' : '#fbbf24', flexShrink: 0 }} />
              {connectedCount}/{totalCount}
            </button>

            {/* Refresh */}
            <button onClick={handleRefresh}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
              <RefreshCw size={14} color="#4b5563" />
            </button>


            {/* Bell */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setTasksOpen(false); setDropdownOpen(false); }}
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
                <Bell size={14} color="#4b5563" />
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 25px -3px rgba(0,0,0,0.12)', width: 220, padding: 16, zIndex: 50 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Notifications</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>No new notifications.</div>
                </div>
              )}
            </div>

            {/* Install App */}
            <button onClick={handleInstall}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
              {isIOS ? <Share size={14} color="#4b5563" /> : <Download size={14} color="#4b5563" />}
            </button>

            {/* Profile */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); setTasksOpen(false); }}
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#25d366', cursor: 'pointer', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} color="#fff" />}
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 25px -3px rgba(0,0,0,0.12)', width: 160, padding: '4px', zIndex: 50 }}>
                  <button onClick={() => { setDropdownOpen(false); setCurrentPage('profile'); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={14} /> My Profile
                  </button>
                  <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
                  <button onClick={() => { setDropdownOpen(false); logout(); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Search + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 10px' }}>
          {/* Search (fills remaining space) */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search..." className="mobile-search" />
          </div>

          {/* Tasks */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => { setTasksOpen(!tasksOpen); setNotifOpen(false); setDropdownOpen(false); }}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', position: 'relative' }}>
              <ListTodo size={15} color="#4b5563" />
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 10, lineHeight: 1 }}>0</span>
            </button>
            {tasksOpen && (
              <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 25px -3px rgba(0,0,0,0.12)', width: 210, padding: 16, zIndex: 50 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Active Jobs</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>No active background jobs.</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Help Modal */}
      {showHelp && (
        <Modal title="Help & Support" onClose={() => setShowHelp(false)}>
          <div style={{ padding: '10px 0', fontSize: 14, color: '#374151' }}>
            <p style={{ marginBottom: 16 }}>Need assistance with BulkBuddy? We are here to help!</p>
            <div style={{ marginBottom: 12 }}>
              <strong>Email Support:</strong><br />
              <a href="mailto:support@bulkbuddy.com" style={{ color: '#25d366', textDecoration: 'none' }}>support@bulkbuddy.com</a>
            </div>
            <div>
              <strong>Documentation:</strong><br />
              <a href="#" style={{ color: '#25d366', textDecoration: 'none' }}>View our getting started guide</a>
            </div>
          </div>
        </Modal>
      )}

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <Modal title="Install BulkBuddy App" onClose={() => setShowInstallGuide(false)}>
          <div style={{ padding: '10px 0', fontSize: 14, color: '#374151' }}>
            {isIOS ? (
              <>
                <p style={{ marginBottom: 16, fontWeight: 500 }}>To install on iPhone/iPad:</p>
                <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                  <li>Tap the <strong>Share</strong> button <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>⬆</span> at the bottom of Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right</li>
                </ol>
                <p style={{ marginTop: 12, color: '#6b7280', fontSize: 12 }}>Note: Must use Safari browser on iOS.</p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 16, fontWeight: 500 }}>To install on Android:</p>
                <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                  <li>Tap the <strong>3-dot menu</strong> in Chrome</li>
                  <li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></li>
                  <li>Tap <strong>"Install"</strong></li>
                </ol>
                <p style={{ marginTop: 12, color: '#6b7280', fontSize: 12 }}>Note: Use Chrome browser for best experience.</p>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
