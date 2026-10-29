import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Printer,
  Mail,
  ExternalLink
} from 'lucide-react';

interface SuccessPageProps {
  referenceNumber: string;
  cardName: string;
  navigate: (path: string) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  referenceNumber,
  cardName,
  navigate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Success Header Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>

          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-3">
            <span>Application Successfully Submitted</span>
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Verification Dossier Queued
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your membership application for the <strong className="text-white">{cardName}</strong> has been secured in our private verification vault.
          </p>
        </div>

        {/* Reference Number Card */}
        <div className="rounded-3xl border border-sky-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Your Official Application Reference ID
          </div>

          <div className="flex items-center justify-center space-x-3 my-3">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-wider">
              {referenceNumber || 'MFC-2026-PENDING'}
            </span>
            <button
              onClick={handleCopy}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow"
              title="Copy Reference ID"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please record this reference number. You will use it to check your real-time verification progress and download your official Fan Card once approved.
          </p>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/track?ref=${encodeURIComponent(referenceNumber)}`)}
              className="w-full sm:w-auto rounded-xl bg-sky-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Track Application Status</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Submission Receipt</span>
            </button>
          </div>
        </div>

        {/* What Happens Next Section */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-sky-400" />
            <span>Verification Processing Timeline</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Intake & Notification Dispatched</h4>
                <p className="text-xs text-slate-400">
                  Your identity documents have been stored in private storage and real-time alerts were sent to compliance administrators.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Document Forensic Authentication (24–48 Hours)</h4>
                <p className="text-xs text-slate-400">
                  A verification officer validates document legibility, authenticity, and legal eligibility criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-500 text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300">Approval & Digital Card Minting</h4>
                <p className="text-xs text-slate-400">
                  Once approved, your unique Member ID, digital pass, and verification QR code will become active and downloadable.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
