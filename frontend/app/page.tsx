'use client';
import { useApp } from './context/AppContext';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Dashboard from './components/Dashboard';
import BulkMessages from './components/BulkMessages';
import ContactsPage from './components/ContactsPage';
import GroupsPage from './components/GroupsPage';
import JobMonitor from './components/JobMonitor';
import ConnectionsPage from './components/ConnectionsPage';
import ImportsPage from './components/ImportsPage';
import ProfileSettings from './components/ProfileSettings';
import { EmptyState } from './components/ui';
import { FileQuestion } from 'lucide-react';

export default function Home() {
  const { currentPage, isLoggedIn, isInitializing } = useApp();

  if (isInitializing) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#25d366', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>;
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'bulk-messages': return <BulkMessages />;
      case 'contacts': return <ContactsPage />;
      case 'groups': return <GroupsPage />;
      case 'jobs': return <JobMonitor />;
      case 'settings':
      case 'connections':
        return <ConnectionsPage />;
      case 'profile':
        return <ProfileSettings />;
      case 'imports': return <ImportsPage />;
      default: return <EmptyState icon={<FileQuestion />} title="Coming Soon" desc="This page is under development." />;
    }
  };

  return (
    <>
      <style>{`
        .app-layout { flex-direction: row; }
        .main-content { padding-bottom: 0px; }
        @media (max-width: 768px) {
          .app-layout { flex-direction: column-reverse; }
          .main-content { padding-bottom: 0px; }
        }
      `}</style>
      <div className="app-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNavbar />
          {renderPage()}
        </main>
      </div>
    </>
  );
}
