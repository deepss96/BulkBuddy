'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui';
import { Wifi, WifiOff, RefreshCw, LogOut, Plus, Smartphone, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

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
          body: JSON.stringify({ name: `Phone ${Math.floor(Math.random()*1000)}` })
        });
        const data = await res.json();
        
        if (!isMounted) {
          // If unmounted before we even finished, disconnect it immediately
          await fetch(`${apiUrl}/api/v1/whatsapp/disconnect/${data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return;
        }

        createdConnectionId = data.id;
        setConnectionId(data.id);

        // Start polling
        interval = setInterval(async () => {
          if (!isMounted) return; // Stop polling if unmounted
          try {
            const pollRes = await fetch(`${apiUrl}/api/v1/whatsapp/qr/${data.id}`, {
              headers: { 'Authorization': `Bearer ${token}` },
              cache: 'no-store' // prevent any possible caching
            });
            const pollData = await pollRes.json();
            
            setDebugLog(JSON.stringify(pollData).substring(0, 50));
            
            if (pollData.status === 'connected') {
              createdConnectionId = null; // nullify so cleanup doesn't delete it
              clearInterval(interval);
              toast.success('WhatsApp connected successfully!');
              onConnected();
            } else if (pollData.qr) {
              setQrCode(pollData.qr);
              setStage('qr');
            }
          } catch (err: any) {
            setDebugLog(`Error: ${err.message}`);
          }
        }, 3000);
      } catch (e: any) {
        setDebugLog(`Start Error: ${e.message}`);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      
      // Cleanup the connection if modal is closed before connecting
      if (createdConnectionId) {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/v1/whatsapp/disconnect/${createdConnectionId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    };
  }, [apiUrl, onConnected]);

  return (
    <Modal title="" onClose={onClose} width={800}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: 8, padding: '40px 30px' }}>
        {/* Left Side: Instructions */}
        <div style={{ flex: 1, paddingRight: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 300, color: '#41525d', marginBottom: 40, marginTop: 0 }}>Scan to log in</h2>
          
          <div style={{ position: 'relative', paddingLeft: 36 }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: 13, top: 24, bottom: 30, width: 1, background: '#d1d7db' }}></div>
            
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d7db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#41525d', zIndex: 1 }}>1</div>
              <div style={{ fontSize: 18, color: '#3b4a54', lineHeight: 1.4 }}>Scan the QR code with your phone's camera</div>
            </div>
            
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d7db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#41525d', zIndex: 1 }}>2</div>
              <div style={{ fontSize: 18, color: '#3b4a54', lineHeight: 1.4 }}>
                Tap the link to open <strong>WhatsApp</strong> <span style={{ color: '#25d366' }}>●</span>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: -36, top: -2, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid #d1d7db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#41525d', zIndex: 1 }}>3</div>
              <div style={{ fontSize: 18, color: '#3b4a54', lineHeight: 1.4 }}>
                Scan the QR code again to link to your account
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 45, fontSize: 15, color: '#008069', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}>
            Need help? ↗
          </div>
        </div>
        
        {/* Right Side: QR Code */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          {stage === 'loading' && (
             <div style={{ width: 264, height: 264, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderRadius: 8 }}>
                <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#008069', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
             </div>
          )}
          {stage === 'qr' && qrCode && (
             <div style={{ padding: 10, background: '#fff', borderRadius: 12 }}>
               <QRCodeSVG 
                 value={qrCode} 
                 size={264} 
                 bgColor="#ffffff"
                 fgColor="#111b21"
                 level="M"
                 imageSettings={{
                   src: '/icon.png', // BulkBuddy Logo
                   height: 50,
                   width: 50,
                   excavate: true
                 }}
               />
             </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
