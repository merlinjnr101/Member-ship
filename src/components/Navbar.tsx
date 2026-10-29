import React, { useState } from 'react';
import { ShieldCheck, Search, Lock, UserCheck, Menu, X, CreditCard, HelpCircle, FileText } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchRef, setSearchRef] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      navigate(`/track?ref=${encodeURIComponent(searchRef.trim())}`);
      setSearchRef('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Membership Cards', path: '/cards' },
    { label: 'Apply for Verification', path: '/apply' },
    { label: 'Status Tracker', path: '/track' },
    { label: 'Support & Bot', path: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        
        {/* Brand Logo & Name */}
        <div
          onClick={() => navigate('/')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-sky-300 transition-colors">
                Membership Fan Card
              </span>
              <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest hidden sm:inline-block">
                Verification
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden md:block">
              Your Membership. Your Identity. Your Verification.
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Reference Tracker Input & Portals */}
        <div className="hidden md:flex items-center space-x-3">
          <form onSubmit={handleQuickSearch} className="relative">
            <input
              type="text"
              placeholder="Track Ref # (e.g. MFC-...)"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="w-44 lg:w-52 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </form>

          {/* Applicant Portal button */}
          <button
            onClick={() => navigate('/applicant')}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Applicant Self-Service Portal"
          >
            <UserCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>Applicant</span>
          </button>

          {/* Admin Login button */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-indigo-500 transition-all"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => navigate('/track')}
            className="p-2 text-slate-300 hover:text-white"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 lg:hidden animate-in slide-in-from-top duration-200">
          <form onSubmit={handleQuickSearch} className="mb-4 relative">
            <input
              type="text"
              placeholder="Search Reference # (MFC-2026-...)"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium text-left ${
                  currentPath === link.path
                    ? 'bg-sky-500/15 text-sky-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                navigate('/applicant');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-700"
            >
              <UserCheck className="h-4 w-4 text-sky-400" />
              <span>Applicant Portal</span>
            </button>

            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Lock className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
