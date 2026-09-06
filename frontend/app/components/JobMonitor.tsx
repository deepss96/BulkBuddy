'use client';
import { useState } from 'react';
import { JOBS, CONTACTS, GROUPS } from '../lib/mockData';
import { ProgressBar, StatusBadge, Modal, Spinner } from './ui';
import { Play, Pause, RotateCcw, RefreshCw, ChevronRight, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function JobMonitor() {
  const [jobs, setJobs] = useState(JOBS);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);

  const togglePause = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId
      ? { ...j, status: j.status === 'paused' ? 'running' : 'paused' }
      : j
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Job Monitor</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Track all participant-management jobs</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowWizard(true)}>
            <Users size={13} /> New Job
          </button>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {jobs.map(job => (
          <div key={job.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{job.group}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                  {job.id} • Started {job.startedAt} • by {job.createdBy}
                  {job.finishedAt && ` • Finished ${job.finishedAt}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <StatusBadge status={job.status} />
                {(job.status === 'running' || job.status === 'paused') && (
                  <button className="btn btn-secondary btn-xs" onClick={() => togglePause(job.id)}>
                    {job.status === 'running' ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
                  </button>
                )}
                {job.status === 'paused' && (
                  <button className="btn btn-secondary btn-xs">
                    <RotateCcw size={11} /> Retry Failed
                  </button>
                )}
                <button className="btn btn-ghost btn-xs" onClick={() => setSelectedJob(job)}>
                  Details <ChevronRight size={11} />
                </button>
              </div>
            </div>

            <ProgressBar value={job.completed} max={job.total} />

            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              {[
                { icon: CheckCircle, color: '#22c55e', label: 'Success', val: job.completed },
                { icon: XCircle, color: '#ef4444', label: 'Failed', val: job.failed },
                { icon: Clock, color: '#9ca3af', label: 'Pending', val: job.total - job.completed - job.failed - job.skipped },
                { icon: AlertCircle, color: '#f59e0b', label: 'Skipped', val: job.skipped },
              ].map(({ icon: Icon, color, label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontWeight: 600 }}>{val}</span>
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <Modal title={`Job: ${selectedJob.group}`} onClose={() => setSelectedJob(null)} width={680}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
            {selectedJob.id} • <StatusBadge status={selectedJob.status} />
          </div>
          {selectedJob.items.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th><th>Phone</th><th>Status</th><th>Error</th><th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {selectedJob.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.contact}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.phone.replace(/(\+\d{2})\d+(\d{4})/, '$1******$2')}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ color: '#ef4444', fontSize: 11.5 }}>{item.error || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{item.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0', fontSize: 13 }}>No item-level data available yet</div>
          )}
        </Modal>
      )}

      {showWizard && <JobWizard onClose={() => setShowWizard(false)} onStart={(job: any) => { setJobs(prev => [...prev, job]); setShowWizard(false); }} />}
    </div>
  );
}

function JobWizard({ onClose, onStart }: { onClose: () => void; onStart: (job: any) => void }) {
  const [step, setStep] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [starting, setStarting] = useState(false);

  const eligible = CONTACTS.filter(c => c.type === 'User' && c.phone_e164);

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => {
      onStart({
        id: `job-00${Math.floor(Math.random() * 99)}`,
        group: selectedGroup.name, groupId: selectedGroup.id,
        status: 'running', total: selectedContacts.length,
        completed: 0, failed: 0, skipped: 0,
        createdBy: 'Admin',
        startedAt: new Date().toLocaleString('sv').slice(0, 16),
        finishedAt: null, items: [],
      });
    }, 1200);
  };

  const steps = ['Select Group', 'Select Contacts', 'Review & Confirm'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        {/* Stepper header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`stepper-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: i === step ? '#25d366' : i < step ? '#e5e7eb' : '#f3f4f6', color: i === step ? '#fff' : '#6b7280' }}>{i < step ? '✓' : i + 1}</span>
                {s}
              </div>
              {i < steps.length - 1 && <ChevronRight size={12} color="#d1d5db" />}
            </div>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {step === 0 && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Select a WhatsApp Group</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {GROUPS.map(g => (
                  <div key={g.id} onClick={() => setSelectedGroup(g)} style={{ padding: '10px 14px', border: `1.5px solid ${selectedGroup?.id === g.id ? '#25d366' : '#e5e7eb'}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: selectedGroup?.id === g.id ? '#f0fdf4' : '#fff', transition: 'all 0.15s' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{g.members} members • {g.provider_id}</div>
                    </div>
                    {selectedGroup?.id === g.id && <CheckCircle size={16} color="#25d366" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Select Contacts ({selectedContacts.length} selected)</span>
                <button className="btn btn-ghost btn-xs" onClick={() => setSelectedContacts(eligible.map(c => c.id))}>Select All</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <table className="data-table">
                  <thead><tr><th style={{ width: 32 }}></th><th>Name</th><th>Phone</th><th>City</th></tr></thead>
                  <tbody>
                    {eligible.map(c => (
                      <tr key={c.id} className={selectedContacts.includes(c.id) ? 'selected' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelectedContacts(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}>
                        <td><input type="checkbox" readOnly checked={selectedContacts.includes(c.id)} style={{ accentColor: '#25d366' }} /></td>
                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{c.phone}</td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>{c.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Job Summary</div>
                {[
                  ['Group', selectedGroup?.name],
                  ['Members already in group', selectedGroup?.members],
                  ['Contacts to add', selectedContacts.length],
                  ['Adapter', 'whatsapp-web.js (wwebjs)'],
                  ['Phone session', '+91 85271 84400 (Local test)'],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12.5 }}>
                    <span style={{ color: '#6b7280' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 7, padding: '10px 14px', fontSize: 12, color: '#854d0e' }}>
                ⚠️ Operations are asynchronous. Each contact will be processed with status tracking. You can pause/resume/retry at any time.
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '8px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <button className="btn btn-primary btn-sm"
            disabled={(step === 0 && !selectedGroup) || (step === 1 && selectedContacts.length === 0) || starting}
            onClick={step < 2 ? () => setStep(s => s + 1) : handleStart}>
            {starting ? <><Spinner size={13} /> Starting...</> : step < 2 ? 'Next →' : '🚀 Start Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
