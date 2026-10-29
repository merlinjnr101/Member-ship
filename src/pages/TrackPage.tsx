import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Upload,
  Download,
  Printer,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { MembershipCardVisual } from '../components/MembershipCardVisual';
import { ApplicationStatus } from '../types';

interface TrackPageProps {
  initialRef?: string;
  navigate: (path: string) => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({ initialRef = '', navigate }) => {
  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Additional doc upload state
  const [extraFile, setExtraFile] = useState<File | null>(null);
  const [extraEmail, setExtraEmail] = useState('');
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [extraUploadSuccess, setExtraUploadSuccess] = useState(false);

  const fetchStatus = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/track/${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to locate application.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error checking verification status.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim()) {
      fetchStatus(refInput.trim());
    }
  };

  const handleUploadAdditional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraFile || !extraEmail) return;
    setUploadingExtra(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('additional_document', extraFile);
      formData.append('email', extraEmail.trim());

      const res = await fetch(`/api/applications/${encodeURIComponent(result.reference_number)}/upload-additional`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setExtraUploadSuccess(true);
      setExtraFile(null);
      // Refresh status
      await fetchStatus(result.reference_number);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingExtra(false);
    }
  };

  // Determine timeline progress based on status
  const getStepProgress = (status: ApplicationStatus) => {
    switch (status) {
      case 'Pending Review':
        return 1;
      case 'Under Review':
        return 2;
      case 'Additional Information Required':
        return 2;
      case 'Approved':
      case 'Declined':
        return 4;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>VERIFIED & APPROVED</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            <span>VERIFICATION DECLINED</span>
          </span>
        );
      case 'Additional Information Required':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>ACTION REQUIRED: MORE INFO</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/30">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            <span>UNDER FORENSIC REVIEW</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400 border border-yellow-500/30">
            <Clock className="h-3.5 w-3.5" />
            <span>PENDING INTAKE REVIEW</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-3">
            <Search className="h-3.5 w-3.5" />
            <span>Real-time Status Tracking Component</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Track Verification Progress
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
            Enter your official Application Reference Number to check current review stages, auditor feedback, and access your digital membership card.
          </p>
        </div>

        {/* Search Bar */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur mb-10">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Enter Reference # (e.g. MFC-2026-X8R4P9)"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-11 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 uppercase font-mono tracking-wider"
              />
              <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Lookup Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-5 text-sm text-rose-200 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Lookup Unsuccessful</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Lookup Result Display */}
        {result && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            
            {/* Top Status Overview Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Application Reference
                  </div>
                  <div className="text-2xl font-black font-mono text-sky-400 tracking-wider mt-0.5">
                    {result.reference_number}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Applicant: <span className="text-slate-200 font-semibold">{result.masked_name}</span> • {result.country}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div className="text-xs text-slate-400 mb-1">Current Verification Status:</div>
                  {getStatusBadge(result.verification_status)}
                </div>
              </div>

              {/* Multi-step Visual Progress Timeline */}
              <div className="pt-8">
                <div className="grid grid-cols-4 gap-2 relative">
                  
                  {/* Step 1: Intake */}
                  <div className="text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-xs font-bold mb-2 shadow-lg shadow-emerald-500/20">
                      ✓
                    </div>
                    <div className="text-xs font-bold text-white">Intake Queued</div>
                    <div className="text-[10px] text-slate-500 hidden sm:block">Docs Registered</div>
                  </div>

                  {/* Step 2: Forensic Check */}
                  <div className="text-center">
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold mb-2 transition-colors ${
                      getStepProgress(result.verification_status) >= 2
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {getStepProgress(result.verification_status) > 2 ? '✓' : '2'}
                    </div>
                    <div className={`text-xs font-bold ${getStepProgress(result.verification_status) >= 2 ? 'text-white' : 'text-slate-500'}`}>
                      Document Review
                    </div>
                    <div className="text-[10px] text-slate-500 hidden sm:block">Identity Cross-Check</div>
                  </div>

                  {/* Step 3: Security Clearance */}
                  <div className="text-center">
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold mb-2 transition-colors ${
                      getStepProgress(result.verification_status) >= 3
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {getStepProgress(result.verification_status) >= 4 ? '✓' : '3'}
                    </div>
                    <div className={`text-xs font-bold ${getStepProgress(result.verification_status) >= 3 ? 'text-white' : 'text-slate-500'}`}>
                      Security Clearance
                    </div>
                    <div className="text-[10px] text-slate-500 hidden sm:block">Fraud Prevention</div>
                  </div>

                  {/* Step 4: Decision */}
                  <div className="text-center">
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold mb-2 transition-colors ${
                      result.verification_status === 'Approved'
                        ? 'bg-emerald-500 text-slate-950'
                        : result.verification_status === 'Declined'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {result.verification_status === 'Approved' ? '✓' : result.verification_status === 'Declined' ? '✕' : '4'}
                    </div>
                    <div className={`text-xs font-bold ${getStepProgress(result.verification_status) >= 4 ? 'text-white' : 'text-slate-500'}`}>
                      {result.verification_status === 'Declined' ? 'Declined' : 'Card Issuance'}
                    </div>
                    <div className="text-[10px] text-slate-500 hidden sm:block">QR Authenticated</div>
                  </div>

                </div>
              </div>

              {/* Feedback or Reviewer Message */}
              {result.feedback_message && (
                <div className="mt-8 rounded-2xl border border-sky-500/30 bg-sky-950/40 p-4 text-xs">
                  <div className="font-bold text-sky-400 mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Administrator Feedback / Instructions:</span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">{result.feedback_message}</div>
                </div>
              )}

            </div>

            {/* IF STATUS IS APPROVED: Render Digital Membership Fan Card! */}
            {result.verification_status === 'Approved' && (
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Official Authenticated Fan Card Generated</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Your Digital Fan Pass Is Ready
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Your identity has been fully verified and recorded in the fan registry.
                  </p>
                </div>

                {/* 3D Card Display */}
                <div className="flex justify-center mb-8">
                  <MembershipCardVisual
                    card={result.card}
                    memberName={result.masked_name}
                    cardNumber={result.card_issued_number}
                    status="Verified & Active"
                    issuedAt={result.issued_at ? new Date(result.issued_at).toLocaleDateString() : 'Active'}
                    expiresAt={result.expires_at ? new Date(result.expires_at).toLocaleDateString() : 'Active'}
                    isVerified={true}
                    interactive={true}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => window.print()}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Official Credential</span>
                  </button>

                  <button
                    onClick={() => navigate(`/verify/${result.card_issued_number}`)}
                    className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 text-xs sm:text-sm transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4 text-sky-400" />
                    <span>Open Public QR Verification Page</span>
                  </button>
                </div>
              </div>
            )}

            {/* IF STATUS IS ADDITIONAL INFORMATION REQUIRED: Show upload box */}
            {result.verification_status === 'Additional Information Required' && (
              <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Upload Requested Documentation</h3>
                    <p className="text-xs text-slate-400">
                      Submit the requested supplementary files to resume verification.
                    </p>
                  </div>
                </div>

                {extraUploadSuccess ? (
                  <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-4 text-xs text-emerald-300">
                    ✓ Your additional document has been received. Your application is now marked <strong>Under Review</strong>.
                  </div>
                ) : (
                  <form onSubmit={handleUploadAdditional} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Your Application Email:
                      </label>
                      <input
                        type="email"
                        required
                        value={extraEmail}
                        onChange={(e) => setExtraEmail(e.target.value)}
                        placeholder="Enter email used when applying"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Select Document (JPG, PNG, or PDF):
                      </label>
                      <input
                        type="file"
                        required
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => setExtraFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingExtra}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 text-xs transition-colors flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploadingExtra ? 'Uploading Document...' : 'Submit Extra Document'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
