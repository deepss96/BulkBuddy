'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui';
import { Wifi, WifiOff, RefreshCw, LogOut, Plus, Smartphone, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Select from 'react-select';

const COUNTRY_OPTIONS = [
  { value: '91', label: 'India (+91)' },
  { value: '1', label: 'USA/Canada (+1)' },
  { value: '44', label: 'UK (+44)' },
  { value: '61', label: 'Australia (+61)' },
  { value: '971', label: 'UAE (+971)' },
  { value: '92', label: 'Pakistan (+92)' },
  { value: '880', label: 'Bangladesh (+880)' },
  { value: '94', label: 'Sri Lanka (+94)' },
  { value: '977', label: 'Nepal (+977)' },
  { value: '65', label: 'Singapore (+65)' },
  { value: '60', label: 'Malaysia (+60)' },
  { value: '49', label: 'Germany (+49)' },
  { value: '33', label: 'France (+33)' },
  { value: '39', label: 'Italy (+39)' },
  { value: '34', label: 'Spain (+34)' },
  { value: '55', label: 'Brazil (+55)' },
  { value: '52', label: 'Mexico (+52)' },
  { value: '27', label: 'South Africa (+27)' },
  { value: '234', label: 'Nigeria (+234)' },
  { value: '254', label: 'Kenya (+254)' },
  { value: '64', label: 'New Zealand (+64)' },
  { value: '81', label: 'Japan (+81)' },
  { value: '82', label: 'South Korea (+82)' },
  { value: '86', label: 'China (+86)' },
  { value: '7', label: 'Russia/Kazakhstan (+7)' },
];

export default function ConnectionsPage() {
  const { apiUrl, phones, fetchConnections } = useApp();
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false); // Can be removed or kept if needed

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Poll connections every 3 seconds if any connection is still 'Loading...'
  useEffect(() => {
    const isLoading = phones.some(p => p.number === 'Loading...');
    if (isLoading) {
      const interval = setInterval(() => fetchConnections(), 3000);
      return () => clearInterval(interval);
    }
  }, [phones, fetchConnections]);

  const disconnect = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Optimistic update could be added here, but relying on fetchConnections is safer for now.
      await fetch(`${apiUrl}/api/v1/whatsapp/disconnect/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchConnections();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>WhatsApp Connections</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{phones.filter(p => p.status === 'connected').length} of {phones.length} phones connected</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowQR(true)}>
              <Plus size={13} /> Add Phone
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {phones.map(phone => (
            <div key={phone.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: phone.status === 'connected' ? 'linear-gradient(135deg,#25d366,#128c7e)' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: phone.status === 'connected' ? '#fff' : '#9ca3af', flexShrink: 0, fontSize: 16, fontWeight: 700, position: 'relative' }}>
                {phone.name.charAt(0)}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: phone.status === 'connected' ? '#22c55e' : phone.status === 'connecting' ? '#f59e0b' : '#ef4444', border: '2px solid #fff' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{phone.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{phone.number}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  {phone.status === 'connected' && <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><Wifi size={11} /> Connected & Ready</span>}
                  {phone.status === 'disconnected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><WifiOff size={11} /> Disconnected</span>}
                  {phone.status === 'connecting' && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Reconnecting...</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }} onClick={() => disconnect(phone.id)}>
                  <LogOut size={12} /> Logout
                </button>
              </div>
            </div>
          ))}
        </div>

        {showQR && <QRModal onClose={() => setShowQR(false)} onConnected={() => { setShowQR(false); fetchConnections(); }} apiUrl={apiUrl} />}
      </div>
    </>
  );
}

function QRModal({ onClose, onConnected, apiUrl }: { onClose: () => void; onConnected: () => void; apiUrl: string }) {
  const [stage, setStage] = useState<'loading' | 'qr' | 'done'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>('');
  
  // New states for Link with Phone Number
  const [linkMode, setLinkMode] = useState<'qr' | 'phone'>('qr');
  const [countryCode, setCountryCode] = useState(COUNTRY_OPTIONS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  // Instant UX: show overlay as soon as action is taken
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let interval: any;
    let isMounted = true;
    let createdConnectionId: string | null = null;

    const startConnection = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${apiUrl}/api/v1/whatsapp/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            name: `Phone ${Math.floor(Math.random() * 1000)}`,
            // Send the real browser User Agent so WhatsApp Linked Devices shows correct OS
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
          })
        });
        const data = await res.json();

        if (!isMounted) {
          await fetch(`${apiUrl}/api/v1/whatsapp/disconnect/${data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return;
        }

        createdConnectionId = data.id;
        setConnectionId(data.id);

        // Poll function — runs immediately then on interval
        const poll = async () => {
          if (!isMounted) return;
          try {
            const pollRes = await fetch(`${apiUrl}/api/v1/whatsapp/qr/${data.id}`, {
              headers: { 'Authorization': `Bearer ${token}` },
              cache: 'no-store'
            });
            const pollData = await pollRes.json();

            if (!pollRes.ok) {
              clearInterval(interval);
              if (isMounted) {
                setIsConnecting(false);
                toast.error(pollData.error || 'Connection failed');
                onClose();
              }
              return;
            }

            setDebugLog(JSON.stringify(pollData).substring(0, 50));

            if (pollData.status === 'connected') {
              createdConnectionId = null;
              clearInterval(interval);
              // Show connecting overlay instantly before success toast
              if (isMounted) setIsConnecting(true);
              toast.success('WhatsApp connected successfully!');
              onConnected();
            } else if (pollData.qr) {
              // QR received — make sure overlay is hidden, show QR
              if (isMounted) setIsConnecting(false);
              setQrCode(pollData.qr);
              setStage('qr');
              // Switch to slow polling now that QR is visible
              clearInterval(interval);
              interval = setInterval(poll, 3000);
            } else if (!pollData.qr && stage === 'qr') {
              // We were showing QR but now it's gone AND not yet connected
              // → This means user JUST scanned the QR. Show overlay NOW.
              if (isMounted) setIsConnecting(true);
            }
            // else: still in initial loading phase (stage === 'loading'), keep fast polling
          } catch (err: any) {
            setDebugLog(`Error: ${err.message}`);
          }
        };

        // 🚀 Fire first poll IMMEDIATELY (no wait), then every 800ms until QR appears
        poll();
        interval = setInterval(poll, 800);
      } catch (e: any) {
        setDebugLog(`Start Error: ${e.message}`);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);

      if (createdConnectionId) {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/v1/whatsapp/disconnect/${createdConnectionId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => { });
      }
    };
  }, [apiUrl, onConnected]);

  const handleRequestPairingCode = async () => {
    if (!phoneNumber || !connectionId) return;
    setIsRequestingCode(true);
    // Instant feedback: show connecting overlay immediately
    setIsConnecting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/whatsapp/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ connectionId, phoneNumber: `${countryCode.value}${phoneNumber}` })
      });
      const data = await res.json();
      if (data.code) {
        setPairingCode(data.code);
        // Once we have the code, hide the overlay so user sees the code
        setIsConnecting(false);
      } else {
        toast.error(data.error || 'Failed to request pairing code');
        setIsConnecting(false);
      }
    } catch(err) {
      toast.error('Failed to request pairing code');
      setIsConnecting(false);
    } finally {
      setIsRequestingCode(false);
    }
  };

  return (
    <Modal title="" onClose={onClose} width={800}>
      {/* Instant connecting overlay — shows as soon as QR scanned or code submitted */}
      {isConnecting && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(17, 24, 39, 0.96)',
          borderRadius: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
          animation: 'qrOverlayIn 0.25s ease'
        }}>
          <style>{`
            @keyframes qrOverlayIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes qrPulseRing {
              0% { transform: scale(0.8); opacity: 0.8; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes qrSpin { to { transform: rotate(360deg); } }
          `}</style>
          {/* Pulsing green ring */}
          <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '3px solid #25d366',
              animation: 'qrPulseRing 1.2s ease-out infinite'
            }} />
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #25d366, #128c7e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(37,211,102,0.5)'
            }}>
              <Smartphone size={28} color="#fff" />
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, textAlign: 'center' }}>Verifying connection...</div>
          <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', maxWidth: 220 }}>Please wait while we securely connect your WhatsApp</div>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#25d366', borderRadius: '50%', animation: 'qrSpin 0.7s linear infinite' }} />
        </div>
      )}
      <div className="qr-modal-container" style={{ display: 'flex', background: '#fff', borderRadius: 8, padding: '40px 30px' }}>
        {/* Left Side: Instructions */}
        <div className="qr-modal-left" style={{ flex: 1, paddingRight: 40 }}>
          <h2 className="qr-modal-title" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 40, marginTop: 0 }}>
            {linkMode === 'qr' ? 'Scan to log in' : 'Link with phone number'}
          </h2>

          {linkMode === 'qr' ? (
            <div style={{ position: 'relative', paddingLeft: 36 }}>
              <div style={{ position: 'absolute', left: 13, top: 24, bottom: 30, width: 1, background: '#e5e7eb' }}></div>

              <div style={{ position: 'relative', marginBottom: 32 }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>1</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>Open WhatsApp on your phone</div>
              </div>

              <div style={{ position: 'relative', marginBottom: 32 }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>2</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  Tap Menu or Settings and select <strong style={{ fontWeight: 600 }}>Linked Devices</strong>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>3</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  Tap on <strong style={{ fontWeight: 600 }}>Link a device</strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 36 }}>
              <div style={{ position: 'absolute', left: 13, top: 24, bottom: 30, width: 1, background: '#e5e7eb' }}></div>

              <div style={{ position: 'relative', marginBottom: 32 }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>1</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>Open WhatsApp on your phone</div>
              </div>

              <div style={{ position: 'relative', marginBottom: 32 }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>2</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  Tap <strong style={{ fontWeight: 600 }}>Linked Devices</strong> &rarr; <strong style={{ fontWeight: 600 }}>Link a device</strong> &rarr; <strong style={{ fontWeight: 600 }}>Link with phone number instead</strong>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', zIndex: 1, fontWeight: 600 }}>3</div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  Enter the 8-character code shown on the screen
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 45, display: 'flex', alignItems: 'center', gap: 15 }}>
            {linkMode === 'qr' ? (
              <div onClick={() => setLinkMode('phone')} style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600, cursor: 'pointer' }}>
                Link with phone number instead
              </div>
            ) : (
              <div onClick={() => setLinkMode('qr')} style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600, cursor: 'pointer' }}>
                Link with QR code instead
              </div>
            )}
          </div>
        </div>

        {/* Right Side: QR Code or Pairing Code */}
        <div className="qr-modal-right" style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          {linkMode === 'qr' ? (
            <>
              {stage === 'loading' && (
                <div className="qr-modal-spinner-container" style={{ width: 264, height: 264, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: 8 }}>
                  <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#25d366', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
              )}
              {stage === 'qr' && qrCode && (
                <div className="qr-modal-qr-container" style={{ padding: 10, background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6' }}>
                  <QRCodeSVG
                    value={qrCode}
                    size={264}
                    bgColor="#ffffff"
                    fgColor="#111827"
                    level="M"
                    imageSettings={{
                      src: '/icon.png',
                      height: 50,
                      width: 50,
                      excavate: true
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {!pairingCode ? (
                <>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Enter your WhatsApp phone number</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <Select 
                        options={COUNTRY_OPTIONS}
                        value={countryCode}
                        onChange={(val: any) => setCountryCode(val)}
                        styles={{
                          control: (base) => ({ ...base, borderColor: '#e5e7eb', padding: '2px', fontSize: 13, borderRadius: 5, boxShadow: 'none' }),
                          menu: (base) => ({ ...base, fontSize: 13, zIndex: 100 })
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(val);
                      }}
                      className="input"
                      style={{ fontSize: 14, padding: '8px 14px', flex: 1 }}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '10px', fontSize: 14, opacity: (isRequestingCode || stage === 'loading') ? 0.7 : 1, cursor: isRequestingCode || stage === 'loading' ? 'not-allowed' : 'pointer' }}
                    onClick={handleRequestPairingCode}
                    disabled={isRequestingCode || stage === 'loading'}
                  >
                    {isRequestingCode ? 'Requesting Code...' : 'Get Pairing Code'}
                  </button>
                  {stage === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Connecting to WhatsApp servers...</div>}
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>Your Pairing Code</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: 28, letterSpacing: 4, fontWeight: 700, color: 'var(--text-primary)', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '16px', borderRadius: 8 }}>
                    {pairingCode.substring(0, 4)} - {pairingCode.substring(4)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 15 }}>Waiting for you to enter this code on your phone...</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
