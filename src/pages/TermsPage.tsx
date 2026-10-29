import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  navigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Official Legal Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service & Verification Agreement
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Governing the application, document verification, and issuance of digital Membership Fan Cards.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          {/* Original Branding & Disclaimer */}
          <section className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Independent Platform & Non-Affiliation Declaration</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Membership Fan Card Verification operates with original branding as an independent fan accreditation service. We do not claim, represent, or imply official affiliation, endorsement, or authorized partnership with any celebrity, musical artist, sports franchise, or corporate entity without express documented authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Verification Eligibility</h2>
            <p>
              Applicants must be at least 18 years of age or possess legal parental/guardian consent to submit government-issued identification files. All information provided in the verification application must be complete, accurate, and verifiably true.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Anti-Fraud & False Representation</h2>
            <p>
              The submission of altered, fabricated, stolen, or expired identification documents is strictly prohibited. Any application exhibiting tampering, digital forgery, or identity impersonation will be immediately rejected with a permanent blacklisting in our verification registry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Issuance & Validity of Digital Fan Cards</h2>
            <p>
              Upon successful administrative review and document approval, applicants are issued a non-transferable, uniquely numbered digital Membership Fan Card equipped with a cryptographic QR validation link. Cards remain active for a 3-year certification period from the date of issuance unless revoked for cause.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Administrative Review Discretion</h2>
            <p>
              Our verification compliance team reserves the right to request additional supporting documentation or decline applications that fail to meet security and authenticity thresholds.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
