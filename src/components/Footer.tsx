import React from 'react';
import { ShieldCheck, Lock, Mail, MessageSquare, ExternalLink, FileCheck, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Top Trust Banner */}
        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero-Leak Privacy</h4>
                <p className="text-xs text-slate-400">Encrypted private document storage vault</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cryptographic QR</h4>
                <p className="text-xs text-slate-400">Tamper-proof real-time card validation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Data Minimization</h4>
                <p className="text-xs text-slate-400">Strict zero SSN storage policy</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Telegram Live Bot</h4>
                <p className="text-xs text-slate-400">Instant notification and support dispatch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Column 1: Platform Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white">Membership Fan Card Verification</span>
                <p className="text-xs text-slate-400">“Your Membership. Your Identity. Your Verification.”</p>
              </div>
            </div>
            
            <p className="mt-4 text-xs leading-relaxed text-slate-400 max-w-md">
              An independent, security-first digital accreditation platform engineering verified credentials, authentic fan cards, and secure identity validation pipelines.
            </p>

            <div className="mt-4 text-[11px] text-slate-500 leading-normal max-w-md border-l-2 border-slate-700 pl-3">
              <strong>Anti-Fraud Notice:</strong> This platform operates under strict independent verification standards. We do not impersonate or claim unauthorized affiliation with any celebrity, artist, corporate entity, or sports organization. All card categories represent independent fan accreditation tiers.
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/cards')} className="hover:text-white transition-colors">
                  Membership Card Catalog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/apply')} className="hover:text-white transition-colors">
                  Submit Verification Application
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/track')} className="hover:text-white transition-colors">
                  Application Status Tracker
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/applicant')} className="hover:text-white transition-colors">
                  Applicant Self-Service Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">
                  Administrator Review Gateway
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Security & Trust</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy & Retention Charter
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                  Terms & Verification Agreement
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/support')} className="hover:text-white transition-colors">
                  Contact Support & Telegram Bot
                </button>
              </li>
              <li className="pt-2">
                <span className="block text-[11px] text-slate-500">Official Inquiries:</span>
                <span className="text-xs text-sky-400 font-mono">mprivatepage313@gmail.com</span>
              </li>
              <li>
                <span className="block text-[11px] text-slate-500">Telegram Bot:</span>
                <span className="text-xs text-sky-400 font-mono">@FanCardVerificationBot</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Security note */}
        <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Membership Fan Card Verification Platform. All rights reserved.</p>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">System Operational</span>
            </span>
            <span>•</span>
            <span>SSL 256-Bit TLS</span>
            <span>•</span>
            <span>RLS Protected</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
