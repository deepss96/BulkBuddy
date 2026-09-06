// Mock data for all screens

export const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  Amritsar: { bg: '#dbeafe', text: '#1d4ed8' },
  belfast: { bg: '#fce7f3', text: '#9d174d' },
  bloom: { bg: '#d1fae5', text: '#065f46' },
  churn: { bg: '#fee2e2', text: '#991b1b' },
  answered: { bg: '#dcfce7', text: '#166534' },
  helloxyz: { bg: '#fef9c3', text: '#854d0e' },
  important: { bg: '#fef3c7', text: '#92400e' },
  lol: { bg: '#ede9fe', text: '#5b21b6' },
  bro: { bg: '#e0f2fe', text: '#0369a1' },
  Client: { bg: '#f0fdf4', text: '#15803d' },
  chatlabel2: { bg: '#fdf4ff', text: '#86198f' },
};

export const CONTACTS = [
  { id: 1, name: 'Bharat Kumar', phone: '+91 95378 51844', phone_e164: '+919537851844', labels: ['belfast', 'bloom'], type: 'User', lastActive: '30-Sep-25', consent: 'authorized', city: 'Amritsar', status: 'valid' },
  { id: 2, name: 'Test North Davonteview', phone: '12036340276@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '17:18', consent: 'unknown', city: '', status: 'valid' },
  { id: 3, name: 'Rohosen', phone: '+91 98360 25090', phone_e164: '+919836025090', labels: ['Amritsar', 'helloxyz'], type: 'User', lastActive: '10:35', consent: 'authorized', city: 'Amritsar', status: 'valid' },
  { id: 4, name: 'Luan Mandu', phone: '+55 11 96454 2391', phone_e164: '+5511964542391', labels: [], type: 'User', lastActive: '01:16', consent: 'unknown', city: '', status: 'valid' },
  { id: 5, name: 'FlowBorder <> Periskope', phone: '12036340410868101@g.us', phone_e164: null, labels: ['belfast'], type: 'Group', lastActive: '00:42', consent: 'unknown', city: '', status: 'valid' },
  { id: 6, name: 'Nikil Jonnada', phone: '+91 91002 40276', phone_e164: '+919100240276', labels: ['belfast', 'bro'], type: 'User', lastActive: '07-Oct-25', consent: 'authorized', city: 'Delhi', status: 'valid' },
  { id: 7, name: 'TS Group 2025-11-02', phone: '12036342017846744@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: 'Yesterday', consent: 'unknown', city: '', status: 'valid' },
  { id: 8, name: 'Hansal', phone: '+91 88242 48940', phone_e164: '+918824248940', labels: ['Amritsar', 'belfast'], type: 'User', lastActive: 'Yesterday', consent: 'authorized', city: 'Amritsar', status: 'valid' },
  { id: 9, name: 'Periskope Team Chat', phone: '12036325417363141​2@g.us', phone_e164: null, labels: ['chatlabel2', 'Client'], type: 'Group', lastActive: 'Yesterday', consent: 'unknown', city: '', status: 'valid' },
  { id: 10, name: 'Test Jedton', phone: '12036342476837379​1@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '-', consent: 'unknown', city: '', status: 'valid' },
  { id: 11, name: 'Test Leannonfort', phone: '120363420208223861@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '-', consent: 'unknown', city: '', status: 'valid' },
  { id: 12, name: 'Test South Deron', phone: '120363420862896147@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '-', consent: 'unknown', city: '', status: 'valid' },
  { id: 13, name: 'Test East Kasandra', phone: '120363403038973179@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '-', consent: 'unknown', city: '', status: 'valid' },
  { id: 14, name: 'Test Madisenport', phone: '120363403032964888@g.us', phone_e164: null, labels: [], type: 'Group', lastActive: '28-Oct-25', consent: 'unknown', city: '', status: 'valid' },
  { id: 15, name: 'Ameesh Gupta', phone: '+91 93119 48371', phone_e164: '+919311948371', labels: ['important', 'lol'], type: 'User', lastActive: '2 days ago', consent: 'authorized', city: 'Mumbai', status: 'valid' },
];

export const GROUPS = [
  { id: 'g1', name: 'Test North Davonteview', provider_id: '12036340276@g.us', members: 12, status: 'active', lastSync: '17:18' },
  { id: 'g2', name: 'FlowBorder <> Periskope', provider_id: '12036340410868101@g.us', members: 47, status: 'active', lastSync: '00:42' },
  { id: 'g3', name: 'TS Group 2025-11-02', provider_id: '12036342017846744@g.us', members: 8, status: 'active', lastSync: 'Yesterday' },
  { id: 'g4', name: 'Periskope Team Chat', provider_id: '120363254173631412@g.us', members: 23, status: 'active', lastSync: 'Yesterday' },
  { id: 'g5', name: 'Test Jedton', provider_id: '120363424768373791@g.us', members: 3, status: 'active', lastSync: '-' },
  { id: 'g6', name: 'Test Leannonfort', provider_id: '120363420208223861@g.us', members: 2, status: 'active', lastSync: '-' },
];

export const PHONES = [
  { id: 'p1', number: '+91 85271 84400', name: 'Local test', status: 'connected', avatar: null },
  { id: 'p2', number: '+91 93119 48371', name: 'Ameesh Gupta', status: 'connected', avatar: null },
  { id: 'p3', number: '+91 02890 02089', name: 'Periskope', status: 'disconnected', avatar: null },
  { id: 'p4', number: '+91 99718 44008', name: 'Periskope Support', status: 'disconnected', avatar: null },
  { id: 'p5', number: '+91 95108 74901', name: 'Test Periskope', status: 'disconnected', avatar: null },
];

export const JOBS = [
  {
    id: 'job-001', group: 'FlowBorder <> Periskope', groupId: 'g2',
    status: 'completed', total: 47, completed: 44, failed: 2, skipped: 1,
    createdBy: 'Admin', startedAt: '2026-08-31 20:10', finishedAt: '2026-08-31 20:28',
    items: [
      { contact: 'Bharat Kumar', phone: '+91 95378 51844', status: 'SUCCESS', error: null, attempts: 1 },
      { contact: 'Rohosen', phone: '+91 98360 25090', status: 'SUCCESS', error: null, attempts: 1 },
      { contact: 'Hansal', phone: '+91 88242 48940', status: 'FAILED_FINAL', error: 'PRIVACY_RESTRICTED', attempts: 2 },
      { contact: 'Nikil Jonnada', phone: '+91 91002 40276', status: 'SUCCESS', error: null, attempts: 1 },
      { contact: 'Ameesh Gupta', phone: '+91 93119 48371', status: 'ALREADY_MEMBER', error: null, attempts: 1 },
      { contact: 'Luan Mandu', phone: '+55 11 96454 2391', status: 'FAILED_RETRYABLE', error: 'NOT_REGISTERED', attempts: 1 },
    ]
  },
  {
    id: 'job-002', group: 'TS Group 2025-11-02', groupId: 'g3',
    status: 'running', total: 120, completed: 67, failed: 3, skipped: 0,
    createdBy: 'Admin', startedAt: '2026-08-31 21:55', finishedAt: null,
    items: []
  },
  {
    id: 'job-003', group: 'Test North Davonteview', groupId: 'g1',
    status: 'paused', total: 35, completed: 12, failed: 1, skipped: 0,
    createdBy: 'Admin', startedAt: '2026-08-31 19:30', finishedAt: null,
    items: []
  },
];

export const AUDIT_LOGS = [
  { id: 1, ts: '2026-08-31 21:55:04', actor: 'Admin', action: 'JOB_STARTED', target: 'job-002', result: 'OK', meta: '120 contacts queued' },
  { id: 2, ts: '2026-08-31 21:10:22', actor: 'Admin', action: 'GROUP_CREATED', target: 'TS Group 2025-11-02', result: 'OK', meta: 'provider_id: 12036342017...' },
  { id: 3, ts: '2026-08-31 20:28:11', actor: 'Admin', action: 'JOB_COMPLETED', target: 'job-001', result: 'OK', meta: '44/47 success' },
  { id: 4, ts: '2026-08-31 20:10:05', actor: 'Admin', action: 'JOB_STARTED', target: 'job-001', result: 'OK', meta: '47 contacts queued' },
  { id: 5, ts: '2026-08-31 19:31:00', actor: 'Admin', action: 'JOB_PAUSED', target: 'job-003', result: 'OK', meta: 'User paused job' },
  { id: 6, ts: '2026-08-31 19:30:12', actor: 'Admin', action: 'JOB_STARTED', target: 'job-003', result: 'OK', meta: '35 contacts queued' },
  { id: 7, ts: '2026-08-31 18:45:00', actor: 'Admin', action: 'IMPORT_COMPLETED', target: 'import-001', result: 'OK', meta: '700 rows, 693 valid, 7 duplicates' },
  { id: 8, ts: '2026-08-31 18:44:05', actor: 'Admin', action: 'IMPORT_STARTED', target: 'import-001', result: 'OK', meta: 'contacts_list.xlsx' },
  { id: 9, ts: '2026-08-31 18:00:30', actor: 'Admin', action: 'SESSION_CONNECTED', target: '+91 85271 84400', result: 'OK', meta: 'Local test' },
  { id: 10, ts: '2026-08-31 17:58:00', actor: 'Admin', action: 'SESSION_QR_SCANNED', target: '+91 85271 84400', result: 'OK', meta: 'session_id: sess_001' },
];

export const TEMPLATES = [
  { id: 't1', name: 'Welcome Message', body: 'Hey {{name}}! Welcome to our group. We\'re excited to have you from {{city}} 🎉', usedCount: 12, createdAt: '2026-08-15' },
  { id: 't2', name: 'Event Invite', body: 'Hi {{name}}, you\'re invited to our upcoming event. Please confirm attendance.', usedCount: 5, createdAt: '2026-08-20' },
  { id: 't3', name: 'Follow Up', body: 'Hi {{name}}, just following up on our previous conversation. Let us know if you have questions!', usedCount: 3, createdAt: '2026-08-25' },
];

export const IMPORTS = [
  { id: 'imp-001', filename: 'contacts_list.xlsx', rows: 700, valid: 693, duplicates: 7, invalid: 0, status: 'completed', uploadedAt: '2026-08-31 18:44' },
  { id: 'imp-002', filename: 'amritsar_contacts.csv', rows: 245, valid: 238, duplicates: 4, invalid: 3, status: 'completed', uploadedAt: '2026-08-30 14:22' },
  { id: 'imp-003', filename: 'delhi_leads.xlsx', rows: 389, valid: 0, duplicates: 0, invalid: 0, status: 'processing', uploadedAt: '2026-08-31 22:01' },
];
