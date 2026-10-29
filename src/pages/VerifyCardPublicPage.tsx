import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Award, Lock, Sparkles } from 'lucide-react';

interface VerifyCardPublicProps {
  cardNumber: string;
  navigate: (path: string) => void;
}

export const VerifyCardPublicPage: React.FC<VerifyCardPublicProps> = ({ cardNumber, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardNumber) return;
    setLoading(true);
    fetch(`/api/verify/card/${encodeURIComponent(cardNumber)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Card not found or inactive');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
      })
      .finally(() => setLoading(false));
  }, [cardNumber]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Homepage</span>
        </button>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-12 text-center shadow-2xl">
            <div className="h-10 w-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-xs font-semibold text-slate-400">
              Validating cryptographic credential against registry...
            </p>
          </div>
        ) : error || !data?.verified ? (
          <div className="rounded-3xl border border-rose-500/40 bg-slate-900/90 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/30">
              <XCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Unverified Credential</h2>
            <p className="text-xs text-slate-400 mb-4">
              Card number <code className="text-rose-300 font-mono">{cardNumber}</code> could not be validated. It may be expired, declined, or unregistered.
            </p>
            <button
              onClick={() => navigate('/apply')}
              className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500"
            >
              Apply for Authentic Verification
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-2xl relative overflow-hidden">
            
            {/* Holographic accent glow */}
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-9 w-9 animate-pulse" />
              </div>

              <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>OFFICIAL VERIFIED CREDENTIAL</span>
              </span>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Valid Membership Fan Card
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Authenticity validated through official digital registry check.
              </p>
            </div>

            {/* Credential Data Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Card Registry ID:</span>
                <span className="font-mono font-bold text-sky-400">{data.card_issued_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Verified Cardholder:</span>
                <span className="font-bold text-white uppercase">{data.holder_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Membership Tier:</span>
                <span className="font-semibold text-emerald-400">{data.card_name} ({data.tier})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Country of Accreditation:</span>
                <span className="font-semibold text-slate-200">{data.country}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Issue Date:</span>
                <span className="text-slate-300">{new Date(data.issued_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Expiry Date:</span>
                <span className="text-slate-300">{new Date(data.expires_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Cryptographic Signature: {data.authenticity_seal}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
