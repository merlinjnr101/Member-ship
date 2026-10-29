import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Search,
  Sparkles,
  CreditCard,
  FileCheck2,
  Award,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { MembershipCardVisual } from '../components/MembershipCardVisual';
import { MembershipCard } from '../types';

interface HomePageProps {
  navigate: (path: string) => void;
  cards: MembershipCard[];
  onSelectCard: (card: MembershipCard) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, cards, onSelectCard }) => {
  const [quickRef, setQuickRef] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(quickRef.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-500 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Accreditation & Verification Gateway</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Your Membership. <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Your Identity.
              </span> <br />
              Your Verification.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Obtain your authenticated, tamper-proof digital Membership Fan Card. Our secure verification system validates fan identity with multi-factor document checks, high-security QR accreditation, and encrypted private storage.
            </p>

            {/* Quick Status Check Widget */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 backdrop-blur shadow-xl max-w-lg">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Already applied? Check your verification status:</span>
                <span className="text-[11px] text-sky-400 font-mono">Real-time Tracker</span>
              </div>
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={quickRef}
                    onChange={(e) => setQuickRef(e.target.value)}
                    placeholder="Enter Reference # (e.g. MFC-2026-X8R4P9)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 uppercase font-mono"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 transition-colors shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <span>Track Status</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/cards')}
                className="rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Explore Membership Cards</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/apply')}
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center space-x-2"
              >
                <span>Start Direct Application</span>
              </button>
            </div>

            {/* Metrics Counter */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">99.8%</div>
                <div className="text-[11px] text-slate-400 font-medium">Security Clearance</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-400">24-48h</div>
                <div className="text-[11px] text-slate-400 font-medium">Avg Review Speed</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">256-Bit</div>
                <div className="text-[11px] text-slate-400 font-medium">Encrypted Vault</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Card Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer w-full flex justify-center">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-30 blur-2xl group-hover:opacity-60 transition duration-500" />
              <MembershipCardVisual
                card={{
                  name: 'Platinum VIP Fan Pass',
                  category: 'VIP Fan Pass',
                  tier: 'Platinum',
                  badge_color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }}
                memberName="SAMPLE VERIFIED FAN"
                cardNumber="MFC-2026-VIP789"
                isVerified={true}
                interactive={true}
              />
            </div>
            <p className="mt-4 text-center text-xs text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Hover & tilt card to preview dynamic holographic sheen</span>
            </p>
          </div>

        </div>
      </section>

      {/* Verification Process Pipeline (4-step workflow) */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Structured Accreditation Lifecycle
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              How the Verification Process Works
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Every fan application is audited through our rigorous multi-stage identification protocol to ensure authentic registry integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-4 border border-sky-500/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Step 01</div>
                <h3 className="text-base font-bold text-white mb-2">Select Membership Card</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose from Platinum VIP, Black Obsidian Elite, Gold Legend, or Titanium Silver based on your fan tier and privileges.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-500">
                Card design saved with profile
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Step 02</div>
                <h3 className="text-base font-bold text-white mb-2">Submit Identity Data</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fill in personal identity information and upload a clear portrait photo, government ID, or driver’s license.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-500">
                Encrypted private storage
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Step 03</div>
                <h3 className="text-base font-bold text-white mb-2">Administrative Forensic Review</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compliance officers inspect document authenticity, cross-reference records, and verify fraud deterrence checks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-500">
                Instant Telegram dispatch
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Step 04</div>
                <h3 className="text-base font-bold text-white mb-2">Card Issuance & QR Seal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon approval, receive your unique Member ID, signed digital card, and instant verification QR code for physical or digital presentation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] text-slate-500">
                Verifiable 24/7 online
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Membership Cards Carousel/Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Certified Tiers
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Available Membership Cards
            </h2>
            <p className="mt-2 text-slate-400 text-sm max-w-xl">
              Select your preferred card before completing the application. Each tier includes distinct identity accreditation levels.
            </p>
          </div>

          <button
            onClick={() => navigate('/cards')}
            className="mt-4 md:mt-0 flex items-center space-x-2 text-sky-400 hover:text-sky-300 font-semibold text-sm transition-colors"
          >
            <span>View All Card Tiers</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.slice(0, 4).map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-sky-500/40 hover:bg-slate-900 transition-all duration-300 group"
            >
              <div>
                <div className="mb-4">
                  <MembershipCardVisual
                    card={card}
                    memberName="VERIFIED MEMBER"
                    cardNumber={`MFC-${card.tier.toUpperCase()}`}
                    compact={true}
                    interactive={false}
                  />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                    {card.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badge_color}`}>
                    {card.tier}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {card.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  {card.benefits.slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="h-3 w-3 text-sky-400 shrink-0" />
                      <span className="truncate">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectCard(card);
                  navigate('/apply');
                }}
                className="w-full rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-semibold py-2.5 text-xs transition-colors flex items-center justify-center space-x-2 group-hover:bg-sky-600 shadow-md"
              >
                <span>Select & Apply</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Security Architecture & Anti-Fraud Guarantee */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <Lock className="h-3.5 w-3.5" />
                <span>Security & Compliance Framework</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Zero Compromise On Applicant Privacy
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Our verification protocol is engineered in strict accordance with modern cybersecurity, data minimization, and identity standards.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No Full SSN Storage</h4>
                    <p className="text-xs text-slate-400">
                      We never store raw SSN digits in databases, email notifications, or Telegram messages. Only relevant identity documents are examined.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Private Storage Vaults</h4>
                    <p className="text-xs text-slate-400">
                      All uploaded identification documents are kept in isolated private directories accessible exclusively via authorized administrator tokens.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Immutable Administrative Audit Logs</h4>
                    <p className="text-xs text-slate-400">
                      Every administrative view, review decision, note addition, or status transition is timestamped and permanently logged.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Verification Trust Charter</h3>
                  <p className="text-xs text-slate-400">Audited Compliance Standards</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                By submitting an application on this platform, you are verified through authorized cryptographic signatures. We guarantee that your personal files are strictly protected from public indexing, unauthorized viewing, and unauthorized third-party resale.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Administrator Support</div>
                  <div className="text-xs text-sky-400 font-mono">mprivatepage313@gmail.com</div>
                </div>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-xs font-semibold text-slate-300 hover:text-white underline underline-offset-4"
                >
                  Read Privacy Policy
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
