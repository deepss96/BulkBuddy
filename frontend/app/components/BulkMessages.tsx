'use client';
import { useApp } from '../context/AppContext';
import { CONTACTS, GROUPS } from '../lib/mockData';
import { useState } from 'react';
import { LabelChip, SearchInput } from './ui';
import { Users, Filter } from 'lucide-react';

export default function BulkMessages() {
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [showSelectModal, setShowSelectModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      {/* Wizard Header (matching screenshot 1 & 2) */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button className="btn btn-secondary btn-sm" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
          <Users size={14} /> Select chats
        </button>
        <span style={{ color: '#d1d5db' }}>›</span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#9ca3af' }}>Draft message</button>
        <span style={{ color: '#d1d5db' }}>›</span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#9ca3af' }}>{`{ }`} Fill variables</button>
        <span style={{ color: '#d1d5db' }}>›</span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#9ca3af' }}>Preview & send</button>
      </div>

      <div style={{ padding: '8px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', flexWrap: 'wrap', gap: 12 }}>
         <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            {selectedChats.length === 0 ? 'No chats selected' : <><span style={{ color: '#16a34a', fontWeight: 600 }}>{selectedChats.length} selected</span> <span style={{ color: '#9ca3af', cursor: 'pointer', marginLeft: 8 }} onClick={() => setSelectedChats([])}>× Clear all</span></>}
         </div>
         <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span> 96107</span>
            <div style={{ position: 'relative' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowSelectModal(true)}>Add Chats ▾</button>
            </div>
            <button className="btn btn-secondary btn-sm">Save as chat list</button>
            <select className="select btn-sm" style={{ padding: '4px 24px 4px 8px' }}><option>Any Phone</option></select>
            <button className="btn btn-primary btn-sm" disabled={selectedChats.length === 0}>Draft message ›</button>
         </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {selectedChats.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#6b7280' }}>
            <div style={{ fontSize: 13 }}>No chats selected</div>
            <button className="btn btn-secondary" onClick={() => setShowSelectModal(true)}>Select chats</button>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>or</div>
            <button className="btn btn-secondary">Upload numbers / chat IDs</button>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>or</div>
            <button className="btn btn-ghost">Select from saved chat lists</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Chat Name</th>
                <th>Labels</th>
                <th>Chat Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {CONTACTS.filter(c => selectedChats.includes(c.id)).map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: c.type === 'Group' ? '#e5e7eb' : `hsl(${(c.id * 47) % 360}, 60%, 85%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, color: '#374151',
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 12.5 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                          {c.phone.length > 20 ? c.phone.slice(0, 20) + '...' : c.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.labels.slice(0, 3).map(l => <LabelChip key={l} label={l} />)}
                      {c.labels.length > 3 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{c.labels.length - 3}</span>}
                    </div>
                  </td>
                  <td><span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{c.type}</span></td>
                  <td>
                    <button style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #fca5a5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 14, fontWeight: 700, lineHeight: 1 }}
                            onClick={() => setSelectedChats(prev => prev.filter(id => id !== c.id))}>−</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSelectModal && (
        <SelectChatsModal
          selected={selectedChats}
          onClose={() => setShowSelectModal(false)}
          onUpdate={(ids) => { setSelectedChats(ids); setShowSelectModal(false); }}
        />
      )}
    </div>
  );
}

function SelectChatsModal({ selected, onClose, onUpdate }: { selected: number[], onClose: () => void, onUpdate: (ids: number[]) => void }) {
  const [currentSelected, setCurrentSelected] = useState<number[]>(selected);
  const [search, setSearch] = useState('');

  const filtered = CONTACTS.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800, height: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Select Chats</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '8px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb' }}>
            <div style={{ display: 'flex', gap: 12 }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Search chats..." />
                <button className="btn btn-secondary"><Filter size={14} /> Filter</button>
            </div>
            <button className="btn btn-primary" onClick={() => onUpdate(currentSelected)}>Update selected chats</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: 36 }}></th>
                        <th>Chat Name</th>
                        <th>Labels</th>
                        <th>Chat Type</th>
                        <th>Last active</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setCurrentSelected(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}>
                            <td><input type="checkbox" checked={currentSelected.includes(c.id)} readOnly style={{ accentColor: '#25d366' }} /></td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                        background: c.type === 'Group' ? '#e5e7eb' : `hsl(${(c.id * 47) % 360}, 60%, 85%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 600, color: '#374151',
                                    }}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 12.5 }}>{c.name}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                                        {c.phone.length > 20 ? c.phone.slice(0, 20) + '...' : c.phone}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {c.labels.slice(0, 2).map(l => <LabelChip key={l} label={l} />)}
                                    {c.labels.length > 2 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{c.labels.length - 2}</span>}
                                    {c.labels.length === 0 && <span style={{ fontSize: 11, color: '#d1d5db', border: '1px dashed #e5e7eb', borderRadius: 4, padding: '1px 4px' }}>+ Label</span>}
                                </div>
                            </td>
                            <td style={{ fontSize: 12, color: '#6b7280' }}>{c.type}</td>
                            <td style={{ fontSize: 12, color: '#6b7280' }}>{c.lastActive}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
