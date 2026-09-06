'use client';
import { LABEL_COLORS } from '../lib/mockData';

export function LabelChip({ label }: { label: string }) {
  const color = LABEL_COLORS[label] || { bg: '#f3f4f6', text: '#6b7280' };
  return (
    <span className="label-chip" style={{ background: color.bg, color: color.text }}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: 'badge-green', ALREADY_MEMBER: 'badge-green',
    FAILED_FINAL: 'badge-red', FAILED_RETRYABLE: 'badge-yellow',
    PENDING: 'badge-gray', PROCESSING: 'badge-blue',
    NEEDS_REVIEW: 'badge-purple', SKIPPED: 'badge-gray',
    completed: 'badge-green', running: 'badge-blue', paused: 'badge-yellow',
    connected: 'badge-green', disconnected: 'badge-red', connecting: 'badge-yellow',
    valid: 'badge-green', invalid: 'badge-red', processing: 'badge-blue',
  };
  const labels: Record<string, string> = {
    SUCCESS: 'Success', ALREADY_MEMBER: 'Already Member',
    FAILED_FINAL: 'Failed', FAILED_RETRYABLE: 'Retry',
    PENDING: 'Pending', PROCESSING: 'Processing',
    NEEDS_REVIEW: 'Needs Review', SKIPPED: 'Skipped',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ProgressBar({ value, max, color = '#25d366' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 2 }}>{pct}% ({value}/{max})</div>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid #e5e7eb`,
      borderTopColor: '#25d366', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block',
    }} />
  );
}

export function EmptyState({ icon, title, desc }: { icon: any; title: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#9ca3af', gap: 10 }}>
      <div style={{ fontSize: 40, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#6b7280' }}>{title}</div>
      {desc && <div style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 280 }}>{desc}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, width = 520 }: { title: string; onClose: () => void; children: any; width?: number }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" style={{ maxWidth: width, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input className="input" style={{ paddingLeft: 30, width: 220 }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: any }) {
  return (
    <div style={{ padding: '8px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
