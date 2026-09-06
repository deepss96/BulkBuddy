'use client';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './ui';
import { Plus, RefreshCw, Users, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GroupsPage() {
  const { apiUrl, phones, setCurrentPage } = useApp() as any;
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchGroups = async (isSync = false) => {
    if (isSync) setSyncing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/whatsapp/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching groups');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [apiUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Groups</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{groups.length} WhatsApp groups synced</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => fetchGroups(true)}
            disabled={syncing || loading}
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> Sync
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setCurrentPage('contacts')}
          >
            <Plus size={14} /> Create Group
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#6b7280' }}>
            <RefreshCw size={24} className="animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280' }}>
            <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: '#374151' }}>No Groups Found</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Create a group from the Contacts page, or connect a WhatsApp account with existing groups.</div>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => setCurrentPage('contacts')}>Go to Contacts</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {groups.map(g => (
              <div key={g.id} className="card" style={{ padding: 16, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onClick={() => setSelected(g)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #25d366, #128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>via {g.connectionName}</div>
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginTop: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {g.members} members</span>
                  <span>Synced: {g.lastSync}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <GroupDetailModal group={selected} onClose={() => setSelected(null)} onSync={() => fetchGroups(true)} />}
    </div>
  );
}

function GroupDetailModal({ group, onClose, onSync }: { group: any; onClose: () => void, onSync: () => void }) {
  return (
    <Modal title={group.name} onClose={onClose} width={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          ['WhatsApp Account', group.connectionName],
          ['Group ID', group.provider_id],
          ['Total Members', group.members],
          ['Status', group.status],
          ['Last Synced', group.lastSync],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>{k}</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { onClose(); onSync(); }}><RefreshCw size={14} /> Sync Group</button>
          <button className="btn btn-primary btn-sm"><Users size={14} /> Manage Members (Coming Soon)</button>
        </div>
      </div>
    </Modal>
  );
}
