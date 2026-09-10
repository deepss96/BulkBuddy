'use client';
import { useState, useEffect, useRef } from 'react';
import { SearchInput, StatusBadge } from './ui';
import { Upload, Loader2, CheckCircle2, AlertCircle, Clock, PlusCircle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const { apiUrl, phones } = useApp() as any;
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [addingContact, setAddingContact] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [verifyingWhatsApp, setVerifyingWhatsApp] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [showGroupCreatedModal, setShowGroupCreatedModal] = useState(false);
  const [createdGroupData, setCreatedGroupData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const startAutoVerification = async (data: any[], connId: string) => {
    setVerifyingWhatsApp(true);
    let currentData = [...data];
    
    for (let i = 0; i < currentData.length; i++) {
      const row = currentData[i];
      if (row.isWhatsAppRegistered !== null) continue;
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/v1/whatsapp/validate-numbers`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionId: connId, numbers: [row.phone] })
        });
        const resData = await res.json();
        if (res.ok && resData.results && resData.results[0]) {
          currentData[i].isWhatsAppRegistered = resData.results[0].isWhatsAppRegistered;
          setPreviewData([...currentData]);
        } else {
          toast.error(`Validation stopped: ${resData.error || 'Unknown error'}. You may need to reconnect your WhatsApp account if the server was restarted.`);
          break; // Stop verifying
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to connect to the server for verification.');
        break;
      }
      
      // small delay to avoid spamming the backend/whatsapp
      await new Promise(r => setTimeout(r, 600));
    }
    setVerifyingWhatsApp(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const parsed = data.map((row: any) => {
          let phone = row['phone'] || row['Phone'] || row['Number'] || row['number'] || row['Phone Number'] || row['whatsapp'] || row['WhatsApp'] || '';
          let name = row['name'] || row['Name'] || row['Contact Name'] || row['contact'] || '';
          
          if (typeof phone === 'number') phone = phone.toString();
          const cleanPhone = String(phone).replace(/[^\d+]/g, '');
          
          const isDuplicate = contacts.some(c => c.phone.replace(/[^\d+]/g, '') === cleanPhone);

          return {
            name: String(name),
            phone: cleanPhone,
            isDuplicate,
            isWhatsAppRegistered: null
          };
        }).filter(r => r.phone.length > 5);

        const defaultConn = phones && phones.length > 0 ? phones[0].id : '';
        if (defaultConn) setSelectedConnection(defaultConn);

        setPreviewData(parsed);
        setShowPreviewModal(true);

        if (defaultConn) {
          startAutoVerification(parsed, defaultConn);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      toast.error('Error parsing file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBulk = async () => {
    try {
      setSavingBulk(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/contacts/bulk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData)
      });
      if (res.ok) {
        setShowPreviewModal(false);
        fetchContacts();
      } else {
        toast.error('Failed to save');
      }
    } catch(err) {
      toast.error('Error');
    } finally {
      setSavingBulk(false);
    }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.name && c.name.toLowerCase().includes(q)) || c.phone.includes(q);
  });

  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getValidationBadge = (isValid: boolean | null) => {
    if (isValid === true) return <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 11, background: '#dcfce7', padding: '2px 6px', borderRadius: 10, fontWeight: 600, width: 'fit-content' }}><CheckCircle2 size={12}/> Valid</span>;
    if (isValid === false) return <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: 11, background: '#fee2e2', padding: '2px 6px', borderRadius: 10, fontWeight: 600, width: 'fit-content' }}><AlertCircle size={12}/> Invalid</span>;
    return <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 11, background: '#fef3c7', padding: '2px 6px', borderRadius: 10, fontWeight: 600, width: 'fit-content' }}><Clock size={12}/> Pending</span>;
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !selectedConnection) {
      toast.error('Please enter group name and select a connection.');
      return;
    }
    if (selected.length === 0) {
      toast.error('Please select at least one contact.');
      return;
    }
    if (selected.length > 1024) {
      toast.error('Cannot add more than 1024 members to a WhatsApp group.');
      return;
    }

    try {
      setCreatingGroup(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/whatsapp/group`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: groupName,
          connectionId: selectedConnection,
          contactIds: selected
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Group creation started! Check the Jobs page for status.');
        setShowGroupModal(false);
        setGroupName('');
        setSelected([]);
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (err) {
      toast.error('Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    try {
      setAddingContact(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/v1/contacts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });
      if (res.ok) {
        setShowAddContactModal(false);
        setNewContact({ name: '', phone: '' });
        fetchContacts();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (err) {
      toast.error('Failed to add contact');
    } finally {
      setAddingContact(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Contacts</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{contacts.length.toLocaleString()} total imported contacts</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button 
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setShowAddContactModal(true)}
            >
              <PlusCircle size={13} /> Add Contact
            </button>
            <input 
              type="file" 
              accept=".csv, .xls, .xlsx" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                if (!phones || phones.length === 0) {
                  toast.error('Please link your WhatsApp account from the "Connections" page before importing contacts.');
                  return;
                }
                fileInputRef.current?.click();
              }}
            >
              <Upload size={13} /> Import
            </button>
            <button 
              className="btn btn-primary btn-sm desktop-only"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                if (selected.length > 1024) {
                  toast.error('1024 WhatsApp users are selected! WhatsApp only allows up to 1024 members per group.');
                  return;
                }
                if (selected.length === 0) {
                  toast.error('Please select at least one contact.');
                  return;
                }
                setShowGroupModal(true);
              }}
            >
              Create Group
            </button>
          </div>
        </div>

        {/* Mobile only Create Group Row */}
        <div className="mobile-only" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 12 }}>
          <button 
            className="btn btn-primary btn-sm"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => {
              if (selected.length > 1024) {
                toast.error('1024 WhatsApp users are selected! WhatsApp only allows up to 1024 members per group.');
                return;
              }
              if (selected.length === 0) {
                toast.error('Please select at least one contact.');
                return;
              }
              setShowGroupModal(true);
            }}
          >
            Create Group
          </button>
        </div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, color: '#166534', marginTop: 12 }}>
            <span style={{ fontWeight: 600 }}>{selected.length} selected</span>
            <button 
              className="btn btn-ghost btn-xs" 
              style={{ background: '#25d366', color: '#fff', marginLeft: 'auto' }}
              onClick={() => {
                if (selected.length > 1024) {
                  toast.error('1024 WhatsApp users are selected! WhatsApp only allows up to 1024 members per group.');
                  return;
                }
                setShowGroupModal(true);
              }}
            >
              Add to Group
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, marginLeft: 4 }} onClick={() => setSelected([])}>×</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Loader2 size={24} className="animate-spin" style={{ color: '#25d366' }} />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor: '#25d366' }} /></th>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className={selected.includes(c.id) ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} style={{ accentColor: '#25d366' }} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: `hsl(${(c.phone.length * 47) % 360}, 60%, 85%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, color: '#374151',
                      }}>
                        {(c.name || c.phone).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 500, fontSize: 12.5 }}>
                        {c.name || 'Unknown Contact'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4b5563' }}>{c.phone}</span>
                  </td>
                  <td>
                    {getValidationBadge(c.isWhatsAppRegistered)}
                  </td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af', fontSize: 13 }}>
            No contacts match your filters.
          </div>
        )}
      </div>

      {/* Bottom stat bar */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', gap: 20, fontSize: 12, color: '#6b7280' }}>
        <span>Total: <strong style={{ color: '#374151' }}>{filtered.length}</strong></span>
        {selected.length > 0 && <span style={{ color: '#25d366', fontWeight: 600 }}>Selected: {selected.length}</span>}
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 10, width: 380, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: '#111827', fontWeight: 600 }}>Create WhatsApp Group</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Group Name</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. Special Offer Group"
                  className="input"
                  style={{ width: '100%', padding: '6px 10px', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Group Description (Optional)</label>
                <textarea 
                  id="groupDescription"
                  placeholder="Tell members what this group is about..."
                  className="input"
                  style={{ width: '100%', padding: '6px 10px', fontSize: 13, minHeight: 60, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Group Icon / DP (Optional)</label>
                <input 
                  type="file" 
                  id="groupDp"
                  accept="image/png, image/jpeg, image/jpg"
                  className="input"
                  style={{ width: '100%', padding: '4px 6px', fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Select WhatsApp Account</label>
                <select 
                  value={selectedConnection}
                  onChange={e => setSelectedConnection(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '6px 10px', fontSize: 13 }}
                >
                  <option value="">-- Choose Account --</option>
                  {phones?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button 
                onClick={() => setShowGroupModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  const desc = (document.getElementById('groupDescription') as HTMLTextAreaElement)?.value;
                  const dpFile = (document.getElementById('groupDp') as HTMLInputElement)?.files?.[0];
                  
                  let dpBase64 = null;
                  if (dpFile) {
                    const reader = new FileReader();
                    dpBase64 = await new Promise((resolve) => {
                      reader.onload = (e) => resolve(e.target?.result);
                      reader.readAsDataURL(dpFile);
                    });
                  }

                  if (!groupName.trim() || !selectedConnection) {
                    toast.error('Please enter group name and select a connection.');
                    return;
                  }
                  if (selected.length === 0) {
                    toast.error('Please select at least one contact.');
                    return;
                  }

                  try {
                    setCreatingGroup(true);
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${apiUrl}/api/v1/whatsapp/group`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        name: groupName,
                        connectionId: selectedConnection,
                        contactIds: selected,
                        description: desc,
                        dp: dpBase64
                      })
                    });

                    const data = await res.json();
                    if (res.ok) {
                      toast.success('Group created successfully!');
                      setShowGroupModal(false);
                      setGroupName('');
                      setSelected([]);
                      if (data.groupData) {
                        setCreatedGroupData(data.groupData);
                        setShowGroupCreatedModal(true);
                      }
                    } else {
                      toast.error(`Error: ${data.error}`);
                    }
                  } catch (err) {
                    toast.error('Failed to create group');
                  } finally {
                    setCreatingGroup(false);
                  }
                }}
                disabled={creatingGroup}
                className="btn btn-primary btn-sm"
              >
                {creatingGroup ? <Loader2 size={14} className="animate-spin" /> : null}
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#111827' }}>Add New Contact</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Name</label>
              <input 
                type="text" 
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="e.g. John Doe"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>WhatsApp Number</label>
              <input 
                type="text" 
                value={newContact.phone}
                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={() => setShowAddContactModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddContact}
                disabled={addingContact}
                style={{ padding: '8px 16px', border: 'none', background: '#0f172a', color: '#fff', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {addingContact ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showPreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12, width: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#111827' }}>Import Preview ({previewData.length} records)</h3>
                {verifyingWhatsApp && <div style={{ fontSize: 12, color: '#d97706', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Loader2 size={12} className="animate-spin" /> Verifying numbers...</div>}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <select 
                  value={selectedConnection}
                  onChange={e => {
                    setSelectedConnection(e.target.value);
                    if (e.target.value && !verifyingWhatsApp) {
                      startAutoVerification(previewData, e.target.value);
                    }
                  }}
                  style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}
                >
                  <option value="">-- Choose Account --</option>
                  {phones?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 16 }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Duplicate?</th>
                    <th>WhatsApp Valid?</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{ opacity: row.isDuplicate ? 0.6 : 1 }}>
                      <td>{row.name || '-'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.phone}</td>
                      <td>
                        {row.isDuplicate ? (
                          <span style={{ color: '#d97706', fontSize: 11, background: '#fef3c7', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>Duplicate</span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: 11 }}>New</span>
                        )}
                      </td>
                      <td>
                        {getValidationBadge(row.isWhatsAppRegistered)}
                      </td>
                      <td>
                        <button 
                          onClick={() => setPreviewData(previewData.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBulk}
                disabled={savingBulk}
                className="btn btn-primary btn-sm"
              >
                {savingBulk ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Contacts
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Group Created Success Preview Modal */}
      {showGroupCreatedModal && createdGroupData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 320, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: '#dcfce7', color: '#16a34a', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={24} />
            </div>
            
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#111827', fontWeight: 700 }}>Group Created!</h3>
            
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #25d366' }}>
              {createdGroupData.dp ? (
                <img src={createdGroupData.dp} alt="Group DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Users size={32} color="#9ca3af" />
              )}
            </div>
            
            <div style={{ fontWeight: 600, fontSize: 16, color: '#111827', marginBottom: 4 }}>{createdGroupData.name}</div>
            {createdGroupData.description && (
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {createdGroupData.description}
              </div>
            )}
            
            <button 
              onClick={() => { setShowGroupCreatedModal(false); setCreatedGroupData(null); }}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
