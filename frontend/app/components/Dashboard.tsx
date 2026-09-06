'use client';
import { useApp } from '../context/AppContext';
import { JOBS, IMPORTS, GROUPS, PHONES, CONTACTS } from '../lib/mockData';
import { StatusBadge, ProgressBar } from './ui';
import { Users, FolderOpen, Smartphone, Activity, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const { setCurrentPage } = useApp();

  const stats = [
    { label: 'Total Contacts', value: CONTACTS.length, icon: Users, color: '#3b82f6', link: 'contacts' },
    { label: 'Active Groups', value: GROUPS.length, icon: FolderOpen, color: '#f59e0b', link: 'groups' },
    { label: 'Connected Phones', value: PHONES.filter(p => p.status === 'connected').length, icon: Smartphone, color: '#22c55e', link: 'settings' },
    { label: 'Jobs Running', value: JOBS.filter(j => j.status === 'running').length, icon: Activity, color: '#9333ea', link: 'jobs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .dashboard-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; gap: 8px; }
          .dashboard-grid { grid-template-columns: 1fr; gap: 8px; }
          .dashboard-content { padding: 8px; gap: 8px; }
        }
      `}</style>

      <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Welcome back, Admin</h1>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Here's what's happening with your WhatsApp operations today.</p>
      </div>

      <div className="dashboard-content">
        {/* Stats row */}
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => setCurrentPage(s.link as any)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  <s.icon size={20} />
                </div>
                <ArrowUpRight size={16} color="#9ca3af" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Active Jobs */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Recent Jobs</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage('jobs')}>View All</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {JOBS.slice(0, 3).map(job => (
                <div key={job.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13, color: '#111827' }}>{job.group}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Started {job.startedAt}</div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <ProgressBar value={job.completed} max={job.total} color={job.status === 'running' ? '#3b82f6' : job.status === 'paused' ? '#f59e0b' : '#22c55e'} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Imports */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Recent Imports</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage('imports')}>View All</button>
            </div>
            <div style={{ padding: 0 }}>
              <table className="data-table" style={{ margin: 0 }}>
                <tbody>
                  {IMPORTS.slice(0, 4).map(imp => (
                    <tr key={imp.id}>
                      <td style={{ padding: '8px 20px' }}>
                        <div style={{ fontWeight: 500, fontSize: 12.5, color: '#374151', marginBottom: 2 }}>{imp.filename}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{imp.rows} rows • {imp.uploadedAt}</div>
                      </td>
                      <td style={{ padding: '8px 20px', textAlign: 'right' }}>
                        <StatusBadge status={imp.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
