import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  CreditCard,
  Send,
  RefreshCw,
  LogOut,
  Plus,
  Edit2,
  Lock,
  MessageSquare,
  History,
  X,
  ExternalLink,
  ChevronRight,
  User
} from 'lucide-react';
import { Application, MembershipCard, NotificationLog, AuditLog } from '../types';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  navigate,
}) => {
  // Navigation tabs within Admin Dashboard
  const [activeTab, setActiveTab] = useState<'applications' | 'cards' | 'telegram' | 'audit' | 'notifications'>('applications');

  // Stats
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    declined: 0,
    infoNeeded: 0
  });

  // Applications list state
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected application review drawer
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Cards management
  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    category: '',
    tier: 'Platinum',
    description: '',
    benefits: 'Verified Fan Accreditation, Priority Entry',
  });

  // Telegram & Notifications Hub
  const [telegramInfo, setTelegramInfo] = useState<any>(null);
  const [telegramUpdates, setTelegramUpdates] = useState<any[]>([]);
  const [telegramTestResult, setTelegramTestResult] = useState<string | null>(null);
  const [customTgChat, setCustomTgChat] = useState('6724972542');
  const [customTgMessage, setCustomTgMessage] = useState('');
  const [tgSending, setTgSending] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch initial data
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const url = `/api/admin/applications?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/admin/cards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTelegramAndLogs = async () => {
    try {
      const [tgInfoRes, tgUpRes, notifRes, auditRes] = await Promise.all([
        fetch('/api/admin/telegram/info', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/telegram/updates', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (tgInfoRes.ok) setTelegramInfo((await tgInfoRes.json()).info);
      if (tgUpRes.ok) setTelegramUpdates((await tgUpRes.json()).result || []);
      if (notifRes.ok) setNotificationLogs((await notifRes.json()).logs || []);
      if (auditRes.ok) setAuditLogs((await auditRes.json()).logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchApplications();
    fetchCards();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'telegram' || activeTab === 'notifications' || activeTab === 'audit') {
      fetchTelegramAndLogs();
    }
  }, [activeTab]);

  // Requirement 14: "Add an 'Export to CSV' button to the AdminDashboardPage, allowing administrators to download lists of all pending, approved, and declined applications."
  const handleExportCsv = () => {
    const exportUrl = `/api/admin/applications/export/csv?status=${encodeURIComponent(statusFilter)}`;
    
    // Fetch with auth header and trigger browser download
    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('CSV Export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fan-card-applications-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  // Open Application Detail Drawer
  const handleSelectApplication = async (appId: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedApp(data);
      setInternalNotes(data.application.admin_notes || '');
      setFeedbackMsg(data.application.feedback_message || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Requirement 15: "Allow admin to approve or decline"
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.application.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: internalNotes,
          feedback_message: feedbackMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      // Update state
      setSelectedApp({
        ...selectedApp,
        application: {
          ...selectedApp.application,
          verification_status: newStatus,
          card_issued_number: data.card_issued_number,
          admin_notes: internalNotes,
          feedback_message: feedbackMsg,
        },
      });

      fetchStats();
      fetchApplications();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Send Test Telegram Alert
  const handleTestTelegram = async () => {
    setTelegramTestResult('Sending test dispatch...');
    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestResult('✓ Telegram test notification successfully delivered to Chat ID 6724972542!');
      } else {
        setTelegramTestResult(`✗ Delivery failed: ${data.error}`);
      }
      fetchTelegramAndLogs();
    } catch (err: any) {
      setTelegramTestResult(`Error: ${err.message}`);
    }
  };

  // Requirement 17: "Let telegram bot to receive and send message"
  const handleSendTelegramCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTgMessage) return;
    setTgSending(true);

    try {
      const res = await fetch('/api/admin/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chat_id: customTgChat,
          message: customTgMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Message successfully transmitted via Telegram Bot API!');
        setCustomTgMessage('');
        fetchTelegramAndLogs();
      } else {
        alert(`Telegram transmission error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setTgSending(false);
    }
  };

  // Add Card Submission
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newCard,
          benefits: newCard.benefits.split(',').map(b => b.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setShowAddCardModal(false);
        setNewCard({
          name: '',
          category: '',
          tier: 'Platinum',
          description: '',
          benefits: 'Verified Fan Accreditation, Priority Entry',
        });
        fetchCards();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle Card Active/Inactive
  const handleToggleCard = async (cardId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/admin/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentActive }),
      });
      fetchCards();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Admin Navigation Header (Requirement 18: Never display personal admin details) */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white">
              Administrator Verification Dashboard
            </h1>
            <p className="text-[11px] text-slate-400">
              Authenticated Session: <span className="text-emerald-400 font-semibold">Active & Encrypted</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            Public Site
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'applications'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Applications ({stats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'cards'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Card Categories ({cards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'telegram'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Telegram Bot Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'notifications'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Dispatch Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'audit'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Audit Trail</span>
            </button>
          </div>

          {/* Requirement 14: Export to CSV Button */}
          {activeTab === 'applications' && (
            <button
              onClick={handleExportCsv}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
              title="Download applications matching current filter to CSV spreadsheet"
            >
              <Download className="h-4 w-4" />
              <span>Export to CSV ({statusFilter.toUpperCase()})</span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: APPLICATIONS LIST & REVIEW DRAWER */}
        {/* ======================================================== */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div
                onClick={() => setStatusFilter('all')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'all' ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-slate-400 font-semibold">Total Intake</div>
                <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
              </div>

              <div
                onClick={() => setStatusFilter('Pending Review')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'Pending Review' ? 'border-yellow-500 bg-yellow-950/40 ring-1 ring-yellow-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-yellow-400 font-semibold">Pending Review</div>
                <div className="text-2xl font-black text-yellow-300 mt-1">{stats.pending}</div>
              </div>

              <div
                onClick={() => setStatusFilter('Under Review')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'Under Review' ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-sky-400 font-semibold">Under Review</div>
                <div className="text-2xl font-black text-sky-300 mt-1">{stats.underReview}</div>
              </div>

              <div
                onClick={() => setStatusFilter('Approved')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'Approved' ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-emerald-400 font-semibold">Approved & Issued</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">{stats.approved}</div>
              </div>

              <div
                onClick={() => setStatusFilter('Declined')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'Declined' ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-rose-400 font-semibold">Declined</div>
                <div className="text-2xl font-black text-rose-300 mt-1">{stats.declined}</div>
              </div>

              <div
                onClick={() => setStatusFilter('Additional Information Required')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  statusFilter === 'Additional Information Required' ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="text-xs text-amber-400 font-semibold">Info Requested</div>
                <div className="text-2xl font-black text-amber-300 mt-1">{stats.infoNeeded}</div>
              </div>
            </div>

            {/* Filter and Search Input Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search Ref #, Name, Email, Country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 flex items-center space-x-1 shrink-0">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Status Filter:</span>
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="all">All Applications ({stats.total})</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                  <option value="Additional Information Required">Additional Information Required</option>
                </select>

                <button
                  onClick={fetchApplications}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Selected Card</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingApps ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Loading verification applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No applications found matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() => handleSelectApplication(app.id)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-sky-400">
                          {app.reference_number}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{app.full_name}</div>
                          <div className="text-[11px] text-slate-400">{app.email} • {app.country}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-200">{app.card_name}</span>
                          <span className="block text-[10px] text-slate-500">{app.card_tier} Tier</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                            {app.doc_count || 1} File(s)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            app.verification_status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : app.verification_status === 'Declined'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : app.verification_status === 'Additional Information Required'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            <span>{app.verification_status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectApplication(app.id);
                            }}
                            className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* APPLICATION REVIEW MODAL / DRAWER (Requirements 15 & 18) */}
        {/* ======================================================== */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xl font-bold text-sky-400">
                      {selectedApp.application.reference_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedApp.application.verification_status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : selectedApp.application.verification_status === 'Declined'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {selectedApp.application.verification_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Submitted on {new Date(selectedApp.application.created_at).toUTCString()}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Applicant Dossier Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile Photo & Summary */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center text-center">
                  <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-slate-700 mb-3 bg-slate-900">
                    <img
                      src={`/api/admin/applications/${selectedApp.application.id}/profile-photo`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-white text-base">{selectedApp.application.full_name}</h3>
                  <p className="text-xs text-slate-400">{selectedApp.application.country}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-800 w-full text-left text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-500 block">Father:</span>
                      <span className="text-slate-200">{selectedApp.application.father_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mother:</span>
                      <span className="text-slate-200">{selectedApp.application.mother_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email:</span>
                      <span className="text-sky-400">{selectedApp.application.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone:</span>
                      <span className="text-slate-200">{selectedApp.application.phone_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Residential Address:</span>
                      <span className="text-slate-200">{selectedApp.application.residential_address}</span>
                    </div>
                  </div>
                </div>

                {/* Card & Documents Column */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Selected Card Info */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Selected Membership Fan Card
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-base">{selectedApp.application.card_name}</div>
                        <div className="text-xs text-slate-400">{selectedApp.application.card_category} • {selectedApp.application.card_tier} Tier</div>
                      </div>
                      {selectedApp.application.card_issued_number && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">CERTIFIED MEMBER ID</span>
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            {selectedApp.application.card_issued_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Private Documents Viewer */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Uploaded Identity Documents ({selectedApp.documents?.length || 0})
                    </div>
                    <div className="space-y-2">
                      {selectedApp.documents?.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-sky-400" />
                            <div>
                              <div className="font-bold text-white">{doc.original_filename}</div>
                              <div className="text-[10px] text-slate-400 capitalize">
                                Type: {doc.document_type.replace('_', ' ')} • {(doc.file_size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 text-xs font-semibold flex items-center space-x-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View File</span>
                            </button>
                            <a
                              href={`/api/admin/documents/${doc.id}/file`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                              title="Open Raw"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Internal Review Notes & Feedback Message */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Internal Administrative Review Notes (Confidential):
                      </label>
                      <textarea
                        rows={2}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Add internal observations, compliance check notes, or security references..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Feedback Message to Applicant (Visible on Status Tracker):
                      </label>
                      <textarea
                        rows={2}
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        placeholder="Provide reason for approval/rejection or specify additional documents required..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Requirement 15: Approve / Decline Action Controls */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('Under Review')}
                    className="rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 px-4 py-2 text-xs font-semibold"
                  >
                    Set Under Review
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('Additional Information Required')}
                    className="rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 px-4 py-2 text-xs font-semibold"
                  >
                    Request More Info
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('Declined')}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 text-xs transition-colors flex items-center space-x-1.5 shadow-lg shadow-rose-600/20"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Decline Application</span>
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('Approved')}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 text-xs transition-colors flex items-center space-x-1.5 shadow-xl shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Issue Fan Card</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Document Preview Lightbox Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative max-w-4xl w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white text-xs">{previewDoc.original_filename}</span>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
                {previewDoc.mime_type.startsWith('image/') ? (
                  <img
                    src={`/api/admin/documents/${previewDoc.id}/file`}
                    alt="Document Preview"
                    className="max-h-[70vh] object-contain rounded"
                  />
                ) : (
                  <iframe
                    src={`/api/admin/documents/${previewDoc.id}/file`}
                    title="PDF Document"
                    className="w-full h-[70vh] rounded border border-slate-800"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MEMBERSHIP CARDS MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Membership Card Categories</h2>
                <p className="text-xs text-slate-400">
                  Add, edit, activate, or deactivate fan card categories from this console.
                </p>
              </div>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 text-xs flex items-center space-x-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Add Card Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badge_color}`}>
                        {card.tier} Tier
                      </span>
                      <span className={`text-[10px] font-bold ${card.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {card.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">{card.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{card.description}</p>

                    <div className="space-y-1 mb-4 text-[11px] text-slate-300">
                      {card.benefits.map((b, i) => (
                        <div key={i} className="flex items-center space-x-1.5 truncate">
                          <span className="text-sky-400">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleCard(card.id, card.active)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        card.active
                          ? 'border border-amber-500/30 text-amber-400 hover:bg-amber-950/40'
                          : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                    >
                      {card.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Card Modal */}
            {showAddCardModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-white text-base">Add New Membership Card Tier</h3>
                    <button onClick={() => setShowAddCardModal(false)} className="text-slate-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCard} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Card Name:</label>
                      <input
                        type="text"
                        required
                        value={newCard.name}
                        onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                        placeholder="e.g. Diamond All-Access Pass"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Category:</label>
                      <input
                        type="text"
                        required
                        value={newCard.category}
                        onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                        placeholder="e.g. Premier Fan Club"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Tier:</label>
                      <select
                        value={newCard.tier}
                        onChange={(e) => setNewCard({ ...newCard, tier: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      >
                        <option value="Platinum">Platinum</option>
                        <option value="Obsidian">Obsidian</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Diamond">Diamond</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Description:</label>
                      <textarea
                        rows={2}
                        required
                        value={newCard.description}
                        onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                        placeholder="Benefits and card description..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Benefits (comma-separated):</label>
                      <input
                        type="text"
                        value={newCard.benefits}
                        onChange={(e) => setNewCard({ ...newCard, benefits: e.target.value })}
                        placeholder="Perk 1, Perk 2, Perk 3"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 text-xs shadow mt-2"
                    >
                      Save & Activate Card
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TELEGRAM BOT HUB (Requirement 17) */}
        {/* ======================================================== */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Telegram Administrator Integration Hub</h2>
              <p className="text-xs text-slate-400">
                Official bot integration. Sends instant notifications for applications and allows receiving and responding to messages.
              </p>
            </div>

            {/* Telegram Bot Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      TG
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Telegram Bot API Status</h3>
                      <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Connected & Ready</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTestTelegram}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 text-xs shadow"
                  >
                    Send Test Ping
                  </button>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admin Chat ID:</span>
                    <code className="text-sky-300 font-mono">6724972542</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bot Token:</span>
                    <span className="text-slate-400 font-mono">89350...2yv4 (Secured on Server)</span>
                  </div>
                  {telegramInfo && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bot Username:</span>
                      <span className="text-emerald-400 font-mono">@{telegramInfo.username || 'FanCardBot'}</span>
                    </div>
                  )}
                </div>

                {telegramTestResult && (
                  <div className="rounded-xl bg-slate-950 p-3 text-xs border border-slate-800 font-mono text-slate-300">
                    {telegramTestResult}
                  </div>
                )}
              </div>

              {/* Requirement 17: Send message or reply through Telegram Bot */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="font-bold text-white text-sm mb-1">Send Message via Telegram Bot</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Transmit an encrypted direct notification or reply to an applicant chat ID.
                </p>

                <form onSubmit={handleSendTelegramCustom} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Recipient Chat ID:</label>
                    <input
                      type="text"
                      required
                      value={customTgChat}
                      onChange={(e) => setCustomTgChat(e.target.value)}
                      placeholder="e.g. 6724972542"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Message Text:</label>
                    <textarea
                      rows={3}
                      required
                      value={customTgMessage}
                      onChange={(e) => setCustomTgMessage(e.target.value)}
                      placeholder="Enter administrative notification..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tgSending}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-2 text-xs shadow flex items-center justify-center space-x-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{tgSending ? 'Transmitting...' : 'Send Message via Bot'}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Requirement 17: Incoming Telegram Updates / Messages */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Recent Incoming Telegram Messages</h3>
                  <p className="text-xs text-slate-400">Queries received by the Telegram Bot</p>
                </div>
                <button
                  onClick={fetchTelegramAndLogs}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                >
                  Fetch Updates
                </button>
              </div>

              <div className="space-y-2">
                {telegramUpdates.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No new Telegram messages received yet. Users can message the bot directly.
                  </div>
                ) : (
                  telegramUpdates.slice(-10).map((up: any, idx: number) => {
                    const msg = up.message || up.edited_message;
                    if (!msg) return null;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="font-bold text-sky-400">
                            {msg.from?.first_name || 'User'} (ID: {msg.chat?.id})
                          </span>
                          <p className="text-slate-200 mt-0.5">{msg.text || '[Non-text message]'}</p>
                        </div>
                        <button
                          onClick={() => {
                            setCustomTgChat(String(msg.chat?.id));
                            setCustomTgMessage(`Re: "${msg.text?.slice(0, 30)}..." `);
                          }}
                          className="text-xs text-sky-400 hover:text-white underline ml-4 shrink-0"
                        >
                          Reply
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DISPATCH & NOTIFICATION LOGS */}
        {/* ======================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Notification Delivery Logs</h2>
              <p className="text-xs text-slate-400">
                Audited transmission logs for Telegram alerts, Administrator emails, and Applicant confirmation emails.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {notificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${
                          log.channel === 'telegram' ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {log.recipient}
                      </td>
                      <td className="py-3 px-4 font-mono text-sky-400">
                        {log.reference_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.delivery_status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {log.delivery_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: AUDIT TRAIL LOGS */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Immutable security records of all status approvals, rejections, notes additions, and data exports.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
