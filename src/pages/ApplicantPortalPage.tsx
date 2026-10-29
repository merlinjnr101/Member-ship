import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Printer,
  LogOut,
  Sparkles
} from 'lucide-react';
import { MembershipCardVisual } from '../components/MembershipCardVisual';

interface ApplicantPortalProps {
  navigate: (path: string) => void;
}

export const ApplicantPortalPage: React.FC<ApplicantPortalProps> = ({ navigate }) => {
  const [refInput, setRefInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicantData, setApplicantData] = useState<any | null>(null);

  // Additional doc upload state
  const [extraFile, setExtraFile] = useState<File | null>(null);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [extraSuccess, setExtraSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/applications/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_number: refInput.trim(),
          email: emailInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate applicant.');

      setApplicantData(data.application);
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setApplicantData(null);
    setRefInput('');
    setEmailInput('');
  };

  const handleUploadAdditional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraFile || !applicantData) return;
    setUploadingExtra(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('additional_document', extraFile);
      formData.append('email', applicantData.email);

      const res = await fetch(`/api/applications/${encodeURIComponent(applicantData.reference_number)}/upload-additional`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setExtraSuccess(true);
      setExtraFile(null);
      // Re-fetch applicant data
      const refresh = await fetch('/api/applications/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_number: applicantData.reference_number,
          email: applicantData.email,
        }),
      });
      const refreshData = await refresh.json();
      if (refresh.ok) setApplicantData(refreshData.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingExtra(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* If Not Logged In: Show Applicant Sign In Box */}
        {!applicantData ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-4">
                <UserCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Applicant Portal
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Sign in with your Application Reference Number and Email to view your verification dossier.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Application Reference Number:
                  </label>
                  <input
                    type="text"
                    required
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. MFC-2026-X8R4P9"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Application Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-600 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Access Applicant Dashboard</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
                Haven't applied yet?{' '}
                <button
                  onClick={() => navigate('/apply')}
                  className="text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Submit application
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Applicant Dashboard */
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Authenticated Applicant Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome, {applicantData.full_name}
                </h1>
                <p className="text-xs text-slate-400">
                  Dossier Ref: <span className="font-mono text-sky-400 font-bold">{applicantData.reference_number}</span> • {applicantData.country}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(`/track?ref=${encodeURIComponent(applicantData.reference_number)}`)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Public Tracker
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 px-4 py-2 text-xs font-semibold flex items-center space-x-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Application Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-xs text-slate-400 font-medium mb-1">Verification Status</div>
                <div className="text-lg font-bold text-white flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    applicantData.verification_status === 'Approved' ? 'bg-emerald-400' :
                    applicantData.verification_status === 'Declined' ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                  <span>{applicantData.verification_status}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Submitted on {new Date(applicantData.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-xs text-slate-400 font-medium mb-1">Selected Card Tier</div>
                <div className="text-lg font-bold text-sky-400 truncate">
                  {applicantData.card?.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Category: {applicantData.card?.category}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-xs text-slate-400 font-medium mb-1">Certified Member ID</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {applicantData.card_issued_number || 'Pending Approval'}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  {applicantData.card_issued_number ? 'Active in Fan Registry' : 'Issued upon verification clearance'}
                </div>
              </div>

            </div>

            {/* If Approved: Display Official Membership Fan Card */}
            {applicantData.verification_status === 'Approved' && (
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
                <div className="text-center mb-6">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Verified Digital Fan Pass
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Your Official Credential Card
                  </h3>
                </div>

                <div className="flex justify-center mb-6">
                  <MembershipCardVisual
                    card={applicantData.card}
                    memberName={applicantData.full_name}
                    cardNumber={applicantData.card_issued_number}
                    issuedAt={applicantData.issued_at ? new Date(applicantData.issued_at).toLocaleDateString() : 'Active'}
                    expiresAt={applicantData.expires_at ? new Date(applicantData.expires_at).toLocaleDateString() : 'Active'}
                    isVerified={true}
                  />
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-xs shadow-lg flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Card Pass</span>
                  </button>
                </div>
              </div>
            )}

            {/* Administrator Feedback Message */}
            {applicantData.feedback_message && (
              <div className="rounded-2xl border border-sky-500/30 bg-sky-950/40 p-5 text-xs">
                <div className="font-bold text-sky-400 mb-1 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Review Officer Instructions:</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{applicantData.feedback_message}</p>
              </div>
            )}

            {/* Upload Additional Docs if required */}
            {applicantData.verification_status === 'Additional Information Required' && (
              <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-6">
                <h3 className="text-sm font-bold text-white mb-2">Upload Supplementary File</h3>
                {extraSuccess ? (
                  <div className="text-xs text-emerald-400">✓ Document uploaded. Status updated to Under Review.</div>
                ) : (
                  <form onSubmit={handleUploadAdditional} className="space-y-3">
                    <input
                      type="file"
                      required
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => setExtraFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={uploadingExtra}
                      className="rounded-xl bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center space-x-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingExtra ? 'Uploading...' : 'Submit Extra Document'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Attached Documents Registry */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Verification Documents In Safe Vault
              </h3>
              <div className="space-y-2">
                {applicantData.documents?.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-sky-400" />
                      <div>
                        <span className="font-semibold text-white">{doc.original_filename}</span>
                        <span className="text-slate-500 block text-[10px]">Type: {doc.document_type}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      doc.review_status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                      doc.review_status === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {doc.review_status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
