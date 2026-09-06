'use client';
import { useState, useRef } from 'react';
import { CONTACTS, LABEL_COLORS, IMPORTS } from '../lib/mockData';
import { LabelChip, SearchInput, Modal, StatusBadge } from './ui';
import { Upload, Download, Filter, X, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function ImportsPage() {
  const [imports, setImports] = useState(IMPORTS);
  const [showUpload, setShowUpload] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Imports</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Upload Excel/CSV to import contacts</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowUpload(true)}>
            <Upload size={13} /> Upload File
          </button>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th><th>Rows</th><th>Valid</th><th>Duplicates</th><th>Invalid</th><th>Status</th><th>Uploaded</th><th></th>
              </tr>
            </thead>
            <tbody>
              {imports.map(imp => (
                <tr key={imp.id}>
                  <td style={{ fontWeight: 500 }}>{imp.filename}</td>
                  <td>{imp.rows.toLocaleString()}</td>
                  <td style={{ color: '#22c55e', fontWeight: 600 }}>{imp.valid.toLocaleString()}</td>
                  <td style={{ color: '#f59e0b' }}>{imp.duplicates}</td>
                  <td style={{ color: '#ef4444' }}>{imp.invalid}</td>
                  <td><StatusBadge status={imp.status} /></td>
                  <td style={{ color: '#6b7280', fontSize: 12 }}>{imp.uploadedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-xs"><Download size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={(imp: any) => { setImports(prev => [imp, ...prev]); setShowUpload(false); }} />}
    </div>
  );
}

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: (imp: any) => void }) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'done'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mapping, setMapping] = useState({ name: 'A', phone: 'B', city: 'C', consent: 'D', notes: 'E' });
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.csv') || f.name.endsWith('.xls'))) {
      setFile(f); setStep('mapping');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setStep('mapping'); }
  };

  const handleProcess = () => {
    setProcessing(true);
    setStep('preview');
    setTimeout(() => {
      setProcessing(false);
      setStep('done');
    }, 2000);
  };

  const handleConfirm = () => {
    onUploaded({
      id: `imp-${Date.now()}`,
      filename: file?.name,
      rows: 456, valid: 448, duplicates: 6, invalid: 2,
      status: 'completed',
      uploadedAt: new Date().toLocaleString('sv').slice(0, 16),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Upload phone numbers</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18 }}>×</button>
        </div>

        <div style={{ padding: 20 }}>
          {step === 'upload' && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#25d366' : '#d1d5db'}`, borderRadius: 10,
                  padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                  background: dragging ? '#f0fdf4' : '#f9fafb', transition: 'all 0.15s', marginBottom: 20,
                }}>
                <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Click to upload CSV / Excel file</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Maximum file size: 50MB</div>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileSelect} />
              </div>

              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={13} color="#6b7280" /> CSV format requirements
                </div>
                {[
                  'Columns: name, phone, city, category, consent, notes',
                  'Phone numbers with country code preferred (+91...)',
                  'One contact per row',
                  'Duplicate numbers will be automatically removed',
                ].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 6, marginBottom: 5 }}>
                    <span style={{ color: '#9ca3af' }}>•</span> {t}
                  </div>
                ))}
                <button className="btn btn-ghost btn-xs" style={{ marginTop: 8 }}>
                  <Download size={12} /> Download template CSV
                </button>
              </div>
            </>
          )}

          {step === 'mapping' && file && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Column Mapping</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>File: <strong>{file.name}</strong> — Map your columns to required fields</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.entries(mapping).map(([field, col]) => (
                  <div key={field}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>{field.charAt(0).toUpperCase() + field.slice(1)} {field === 'phone' && <span style={{ color: '#ef4444' }}>*</span>}</label>
                    <select className="select" style={{ width: '100%' }} value={col} onChange={e => setMapping(prev => ({ ...prev, [field]: e.target.value }))}>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Skip'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '10px 14px', marginTop: 16, fontSize: 12, color: '#166534' }}>
                ✓ Default country: <strong>India (+91)</strong>. Numbers without country code will get +91 prefix.
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#25d366', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 600, fontSize: 13 }}>Processing file...</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Normalizing phone numbers and detecting duplicates</div>
            </div>
          )}

          {step === 'done' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <CheckCircle size={40} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: 14 }}>Validation Complete</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Total Rows', val: 456, color: '#374151' },
                  { label: 'Valid', val: 448, color: '#22c55e' },
                  { label: 'Duplicates', val: 6, color: '#f59e0b' },
                  { label: 'Invalid', val: 2, color: '#ef4444' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 11.5, color: '#6b7280' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '8px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          {step === 'mapping' && <button className="btn btn-primary btn-sm" onClick={handleProcess}>Validate & Preview →</button>}
          {step === 'done' && <button className="btn btn-primary btn-sm" onClick={handleConfirm}>Import Contacts ✓</button>}
        </div>
      </div>
    </div>
  );
}
