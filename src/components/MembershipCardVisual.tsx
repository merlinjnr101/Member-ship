import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, Award, Sparkles, Cpu, CheckCircle } from 'lucide-react';
import { MembershipCard } from '../types';

interface CardVisualProps {
  card?: Partial<MembershipCard>;
  memberName?: string;
  cardNumber?: string;
  status?: string;
  issuedAt?: string;
  expiresAt?: string;
  isVerified?: boolean;
  compact?: boolean;
  interactive?: boolean;
}

export const MembershipCardVisual: React.FC<CardVisualProps> = ({
  card = {
    name: 'Platinum VIP Fan Pass',
    category: 'VIP Fan Pass',
    tier: 'Platinum',
    badge_color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accent_gradient: 'from-slate-200 via-sky-300 to-indigo-300'
  },
  memberName = 'ALEXANDER M. VANCE',
  cardNumber = 'MFC-88492019',
  status = 'Active & Verified',
  issuedAt = '10/2026',
  expiresAt = '10/2029',
  isVerified = true,
  compact = false,
  interactive = true
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${cardNumber}`
    : `https://verification.fancard.org/verify/${cardNumber}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [verificationUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -6,
      y: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Tier styles
  const isObsidian = card.tier?.toLowerCase().includes('obsidian') || card.name?.toLowerCase().includes('obsidian');
  const isGold = card.tier?.toLowerCase().includes('gold') || card.name?.toLowerCase().includes('gold');
  const isPlatinum = card.tier?.toLowerCase().includes('platinum') || card.name?.toLowerCase().includes('platinum');

  const bgStyle = isObsidian
    ? 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-amber-950/70 border-amber-500/40'
    : isGold
    ? 'bg-gradient-to-br from-amber-950/80 via-yellow-950/60 to-zinc-900 border-amber-400/50'
    : isPlatinum
    ? 'bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-950 border-sky-400/40'
    : 'bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 border-slate-400/30';

  const sheenGradient = isObsidian
    ? 'from-amber-400/20 via-yellow-200/10 to-transparent'
    : isGold
    ? 'from-yellow-400/25 via-amber-300/15 to-transparent'
    : isPlatinum
    ? 'from-cyan-400/25 via-sky-200/15 to-transparent'
    : 'from-white/15 via-slate-200/10 to-transparent';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className={`relative select-none overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${bgStyle} ${
        compact ? 'w-full max-w-sm p-4' : 'w-full max-w-md p-6'
      }`}
    >
      {/* Background Holographic Sheen & Geometric Mesh */}
      <div
        className={`pointer-events-none absolute -inset-full bg-gradient-to-r ${sheenGradient} opacity-60 mix-blend-overlay blur-md`}
        style={{
          transform: `translate(${tilt.y * 5}px, ${tilt.x * 5}px) rotate(25deg)`,
        }}
      />
      
      {/* Subtle security pattern lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Hologram security ribbon */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-emerald-400/20 via-sky-400/20 to-purple-500/20 blur-xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <ShieldCheck className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Official Fan Registry
            </div>
            <div className="text-sm font-extrabold tracking-tight text-white drop-shadow-sm">
              MEMBERSHIP VERIFIED
            </div>
          </div>
        </div>

        {/* Tier badge */}
        <div className="flex items-center space-x-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>{card.tier || 'VIP'}</span>
        </div>
      </div>

      {/* Security Chip & NFC Symbol */}
      <div className="relative z-10 mt-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Metallic EMV Chip graphic */}
          <div className="relative h-9 w-11 rounded-md border border-amber-400/50 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-md">
            <div className="h-full w-full rounded border border-amber-800/40 flex flex-col justify-between p-0.5">
              <div className="h-[1px] w-full bg-amber-900/40" />
              <div className="flex justify-between">
                <div className="h-2 w-[1px] bg-amber-900/40" />
                <div className="h-2 w-[1px] bg-amber-900/40" />
              </div>
              <div className="h-[1px] w-full bg-amber-900/40" />
            </div>
          </div>

          {/* Contactless / NFC waves */}
          <div className="flex space-x-0.5 text-slate-400/70">
            <svg className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
        </div>

        {/* Hologram security stamp */}
        <div className="flex items-center space-x-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="tracking-wider uppercase">AUTHENTICATED</span>
        </div>
      </div>

      {/* Card Title & Category */}
      <div className="relative z-10 mt-5">
        <h3 className="text-xl font-black tracking-tight text-white drop-shadow">
          {card.name || 'Membership Fan Card'}
        </h3>
        <p className="text-xs font-medium text-slate-300/80">
          {card.category || 'Official Certified Membership'}
        </p>
      </div>

      {/* Card Number */}
      <div className="relative z-10 mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Certified Member ID
        </div>
        <div className="font-mono text-base font-bold tracking-widest text-sky-200 drop-shadow">
          {cardNumber}
        </div>
      </div>

      {/* Card Footer: Member Name, Validity, and Verifier QR Code */}
      <div className="relative z-10 mt-5 flex items-end justify-between border-t border-white/10 pt-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Cardholder
          </div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-white">
            {memberName}
          </div>

          <div className="mt-1.5 flex items-center space-x-4 text-[10px] text-slate-400">
            <div>
              <span className="text-slate-500">ISSUED: </span>
              <span className="font-semibold text-slate-300">{issuedAt}</span>
            </div>
            <div>
              <span className="text-slate-500">EXPIRES: </span>
              <span className="font-semibold text-slate-300">{expiresAt}</span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        {qrDataUrl && (
          <div className="flex flex-col items-center">
            <div className="overflow-hidden rounded-md border border-white/30 bg-white p-1 shadow-md">
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="h-12 w-12 object-contain"
              />
            </div>
            <span className="mt-1 text-[8px] font-bold tracking-tight text-slate-400">
              SCAN TO VERIFY
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
