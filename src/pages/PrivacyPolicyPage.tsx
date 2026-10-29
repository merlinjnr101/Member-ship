import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  navigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyProps> = ({ navigate }) => {
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
            <Lock className="h-3.5 w-3.5" />
            <span>Cybersecurity & Privacy Standard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy & Data Retention Charter
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Last Updated: October 2026 • Official Platform Security Standards
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Commitment to Applicant Privacy</h2>
            <p>
              Membership Fan Card Verification operates as an independent identity authentication service. We consider the privacy and security of your personal records paramount. We collect only the information required to authenticate fan credentials and issue your verifiable digital Membership Fan Card.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Strict Zero Full-SSN Storage Policy</h2>
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-4 text-xs text-sky-200">
              <strong>Mandatory Compliance Principle:</strong> Our platform strictly refuses to store full Social Security numbers or raw national tax ID numbers in website databases, unencrypted logs, email dispatches, or Telegram notifications. Any verification requiring government cross-referencing relies exclusively on authorized visual inspection of uploaded identity documents in isolated private storage.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">Identity Details:</strong> Full legal name, father’s name, mother’s name, residential address, country, email address, and phone number.</li>
              <li><strong className="text-slate-200">Portrait Image:</strong> Clear facial photograph for card issuance and visual accreditation.</li>
              <li><strong className="text-slate-200">Verification Files:</strong> Government-issued identity document, driver's license, or applicable verification certificates.</li>
              <li><strong className="text-slate-200">Telemetry & Logs:</strong> Application submission timestamps, IP address during action submission, and reference codes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Isolated Private Storage Architecture</h2>
            <p>
              Uploaded identity documents are never placed in public storage directories or accessible via static URLs. Every document is stored in an encrypted file directory with cryptographically randomized filenames. Document access is restricted solely to authenticated compliance officers using short-lived, authorization-bound tokens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">5. Notification Channels & Privacy</h2>
            <p>
              We integrate Telegram Bot API and transactional email services solely for dispatching non-sensitive status alerts (Reference ID, card category, review status, and direct login URLs). Under no circumstances are applicant names, home addresses, or identity document images transmitted across external notification channels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">6. Data Retention & Right to Erasure (GDPR / CCPA)</h2>
            <p>
              Applicants have the right to request full erasure of their personal identity files and submitted documents once verification is concluded. To request complete permanent removal of your submitted identity files, submit a ticket via our <button onClick={() => navigate('/support')} className="text-sky-400 underline">Support Portal</button> or email our privacy desk at <code className="text-sky-300 font-mono">mprivatepage313@gmail.com</code>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};
