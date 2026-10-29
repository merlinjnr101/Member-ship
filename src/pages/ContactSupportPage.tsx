import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ContactSupportProps {
  navigate: (path: string) => void;
}

export const ContactSupportPage: React.FC<ContactSupportProps> = ({ navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [subject, setSubject] = useState('Verification Inquiry');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          reference_number: refNumber.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');

      setSentSuccess(true);
      setName('');
      setEmail('');
      setRefNumber('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Error sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-3">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Dedicated Support & Telegram Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Verification Support
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Need assistance with your application, document re-upload, or card accreditation? Our verification officers respond promptly.
          </p>
        </div>

        {/* 2-Column Layout: Form & Telegram Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Support Form */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur">
            <h3 className="text-lg font-bold text-white mb-2">Send an Official Support Inquiry</h3>
            <p className="text-xs text-slate-400 mb-6">
              Inquiries are logged in our compliance database and simultaneously dispatched to the administrative Telegram channel.
            </p>

            {sentSuccess ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Successfully Transmitted</h4>
                <p className="text-xs text-emerald-200">
                  Your ticket has been registered and our compliance administrators have received the notification. We will respond to your email shortly.
                </p>
                <button
                  onClick={() => setSentSuccess(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-200 hover:text-white mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Reference Number (If Applicable)
                    </label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      placeholder="MFC-2026-XXXXX"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white uppercase font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                    >
                      <option value="Verification Inquiry">Verification Status Inquiry</option>
                      <option value="Document Re-Upload">Document Re-Upload Assistance</option>
                      <option value="Card Benefit Question">Membership Card Privilege Question</option>
                      <option value="Technical Support">Technical Platform Support</option>
                      <option value="Data Deletion Request">Data Deletion Request (GDPR/CCPA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or question..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? 'Transmitting Ticket...' : 'Submit Support Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Telegram Official Bot Card */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg">
                  TG
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Official Telegram Bot</h3>
                  <p className="text-xs text-emerald-400 flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time Broadcast Active</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Our automated Telegram Bot dispatches instantaneous encrypted notifications to the administrative verification desk and handles direct support inquiries.
              </p>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Telegram Bot:</span>
                  <span className="font-mono text-sky-400 font-bold">@FanCardVerificationBot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Administrative Chat ID:</span>
                  <span className="font-mono text-slate-300">6724972542</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Notification SLA:</span>
                  <span className="text-emerald-400 font-semibold">&lt; 3 Seconds</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>• Inquiries sent here are automatically logged.</div>
                <div>• Zero PII transmitted without authorized tokens.</div>
              </div>
            </div>

            {/* Email Support Info */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-white text-sm flex items-center space-x-2">
                <Mail className="h-4 w-4 text-sky-400" />
                <span>Email Support Dispatch</span>
              </div>
              <p>Direct official communications:</p>
              <div className="font-mono text-sky-400 font-semibold select-all">
                mprivatepage313@gmail.com
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
