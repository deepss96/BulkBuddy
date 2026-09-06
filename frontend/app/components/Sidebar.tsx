'use client';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, MessageSquare, Clock, BookTemplate, Radio,
  Users, FolderOpen, Briefcase, ScrollText, Settings,
  Zap, BarChart2, GripHorizontal, X
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { icon: LayoutDashboard, id: 'dashboard', label: 'Dashboard', group: 1 },
  { icon: MessageSquare, id: 'bulk-messages', label: 'Bulk Messages', group: 1 },
  { icon: Clock, id: 'scheduled', label: 'Scheduled', group: 1 },
  { icon: BookTemplate, id: 'templates', label: 'Templates', group: 1 },
  { icon: Radio, id: 'broadcast', label: 'Broadcast Lists', group: 1 },
  { icon: Users, id: 'contacts', label: 'Contacts', group: 2 },
  { icon: FolderOpen, id: 'groups', label: 'Groups', group: 2 },
  { icon: Briefcase, id: 'jobs', label: 'Job Monitor', group: 2 },
  { icon: ScrollText, id: 'logs', label: 'Logs', group: 2 },
  { icon: BarChart2, id: 'analytics', label: 'Analytics', group: 3 },
  { icon: Zap, id: 'automations', label: 'Automations', group: 3 },
  { icon: Settings, id: 'settings', label: 'Settings', group: 3 },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Groupings for Desktop
  const NAV = ALL_NAV_ITEMS.filter(i => i.group === 1);
  const NAV2 = ALL_NAV_ITEMS.filter(i => i.group === 2);
  const NAV3 = ALL_NAV_ITEMS.filter(i => i.group === 3);

  // Groupings for Mobile Bottom Bar vs Drawer
  const MAIN_MOBILE_IDS = ['dashboard', 'contacts', 'groups', 'settings'];
  const MAIN_MOBILE_ITEMS = ALL_NAV_ITEMS.filter(i => MAIN_MOBILE_IDS.includes(i.id));
  const DRAWER_ITEMS = ALL_NAV_ITEMS.filter(i => !MAIN_MOBILE_IDS.includes(i.id));

  // Desktop Item Component
  const NavItem = ({ icon: Icon, id, label }: any) => {
    const active = currentPage === id;
    return (
      <div
        className="sidebar-nav-item relative"
        style={{ position: 'relative' }}
        onClick={() => setCurrentPage(id)}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
            background: active ? 'rgba(37,211,102,0.15)' : 'transparent',
            color: active ? '#25d366' : '#6b7280',
            transition: 'all 0.15s',
            margin: '2px auto',
          }}
          onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#d1d5db'; } }}
          onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; } }}
        >
          <Icon size={18} />
        </div>
        <span className="sidebar-tooltip">{label}</span>
      </div>
    );
  };

  // Mobile Item Component
  const MobileItem = ({ icon: Icon, id, label, inDrawer }: any) => {
    const active = currentPage === id;
    return (
      <div 
        onClick={() => {
          setCurrentPage(id);
          setDrawerOpen(false);
        }}
        style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
          color: active ? '#25d366' : '#9ca3af', width: inDrawer ? '100%' : '56px'
        }}
      >
        <div style={{
          background: active && inDrawer ? 'rgba(37,211,102,0.15)' : 'transparent',
          padding: inDrawer ? 12 : 0, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
          <Icon size={inDrawer ? 24 : 22} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .sidebar-desktop { 
          width: 52px; height: 100vh; flex-direction: column; padding-top: 12px; padding-bottom: 12px;
          border-right: 1px solid #1f2937; background: #111827; display: flex; align-items: center; gap: 2px;
          flex-shrink: 0;
        }
        .sidebar-mobile { display: none; }
        
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile { display: block !important; }
        }

        /* Modern subtle animation for drawer */
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ======================= */}
      {/* DESKTOP SIDEBAR (0 Changes) */}
      {/* ======================= */}
      <div className="sidebar-desktop">
        {/* Logo */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/icon.png" alt="BulkBuddy Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </div>

        {NAV.map(n => <NavItem key={n.id} {...n} />)}
        <div style={{ height: 1, background: '#1f2937', width: 32, margin: '8px auto' }} />
        {NAV2.map(n => <NavItem key={n.id} {...n} />)}
        <div style={{ height: 1, background: '#1f2937', width: 32, margin: '8px auto' }} />
        {NAV3.map(n => <NavItem key={n.id} {...n} />)}

        <div style={{ flex: 1 }} />

        {/* User avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#374151',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d1d5db', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          border: '2px solid #4b5563',
        }}>A</div>
      </div>

      {/* ============================== */}
      {/* MOBILE BOTTOM NAVIGATION & DRAWER */}
      {/* ============================== */}
      <div className="sidebar-mobile">
        
        {/* Dark overlay backdrop to close drawer */}
        <div 
          onClick={() => setDrawerOpen(false)}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            zIndex: 38, backdropFilter: 'blur(2px)',
            opacity: drawerOpen ? 1 : 0,
            pointerEvents: drawerOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-out'
          }}
        />
        
        {/* Modern Bottom Sheet Drawer (Slides from behind the navbar) */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#111827',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: '16px 20px 84px 20px', zIndex: 39,
          boxShadow: drawerOpen ? '0 -10px 40px rgba(0,0,0,0.5)' : 'none',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease-out',
          pointerEvents: drawerOpen ? 'auto' : 'none'
        }}>
           {/* Drawer Handle */}
           <div style={{ width: 40, height: 4, borderRadius: 2, background: '#374151', margin: '0 auto 16px auto' }} />
           
           {/* Header */}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ margin: 0, fontSize: 16, color: '#f3f4f6', fontWeight: 600 }}>All Features</h3>
           </div>

           {/* Grid of remaining items */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 12px' }}>
             {DRAWER_ITEMS.map(n => <MobileItem key={n.id} {...n} inDrawer={true} />)}
           </div>
        </div>

        {/* Clean Fixed Bottom Nav Bar */}
        <div style={{
           position: 'fixed', bottom: 0, left: 0, width: '100%', height: 64, background: '#111827',
           display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
           borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 40,
           paddingBottom: 'env(safe-area-inset-bottom)', // for iPhones
        }}>
           
           {/* 4 Main Nav Items */}
           {MAIN_MOBILE_ITEMS.map(n => <MobileItem key={n.id} {...n} />)}
           
           {/* 'More' Button to toggle drawer */}
           <div 
             onClick={() => setDrawerOpen(!drawerOpen)}
             style={{ 
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
               color: drawerOpen ? '#25d366' : '#9ca3af', width: '56px'
             }}
           >
             <div style={{
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               transition: 'all 0.2s'
             }}>
               <GripHorizontal size={22} strokeWidth={drawerOpen ? 2.5 : 2} />
             </div>
             <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap' }}>More</span>
           </div>
        </div>
      </div>
    </>
  );
}
