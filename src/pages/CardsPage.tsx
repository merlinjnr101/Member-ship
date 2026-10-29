import React, { useState } from 'react';
import { MembershipCardVisual } from '../components/MembershipCardVisual';
import { MembershipCard } from '../types';
import { ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Filter, Info } from 'lucide-react';

interface CardsPageProps {
  cards: MembershipCard[];
  selectedCard: MembershipCard | null;
  onSelectCard: (card: MembershipCard) => void;
  navigate: (path: string) => void;
}

export const CardsPage: React.FC<CardsPageProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  navigate,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  const tiers = ['all', ...Array.from(new Set(cards.map(c => c.tier)))];

  const filteredCards = selectedTierFilter === 'all'
    ? cards
    : cards.filter(c => c.tier.toLowerCase() === selectedTierFilter.toLowerCase());

  const handleChooseAndApply = (card: MembershipCard) => {
    onSelectCard(card);
    navigate('/apply');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tiered Identity Accreditation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Select Your Membership Fan Card
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Choose your preferred membership card tier before submitting your identity documents. Each card features unique holographic styling, digital QR validation, and verified fan privileges.
          </p>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTierFilter(tier)}
              className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all ${
                selectedTierFilter === tier
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tier === 'all' ? 'All Membership Cards' : `${tier} Tier`}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {filteredCards.map((card) => {
            const isCurrentlySelected = selectedCard?.id === card.id;

            return (
              <div
                key={card.id}
                className={`flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${
                  isCurrentlySelected
                    ? 'border-sky-500 bg-slate-900 shadow-2xl shadow-sky-500/20 ring-1 ring-sky-500'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  {/* Card 3D Preview */}
                  <div className="flex justify-center mb-6">
                    <MembershipCardVisual
                      card={card}
                      memberName="YOUR NAME HERE"
                      cardNumber={`MFC-${card.tier.toUpperCase()}-2026`}
                      interactive={true}
                    />
                  </div>

                  {/* Header & Badges */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {card.category}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-0.5">
                        {card.name}
                      </h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badge_color}`}>
                      {card.tier} Tier
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {card.description}
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-2.5 mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Included Card Privileges:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {card.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium text-slate-200">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection Action Button */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Info className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span>Selected card will be linked to your verification dossier.</span>
                  </div>

                  <button
                    onClick={() => handleChooseAndApply(card)}
                    className={`w-full sm:w-auto shrink-0 rounded-xl px-6 py-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-lg ${
                      isCurrentlySelected
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                        : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/30'
                    }`}
                  >
                    <span>{isCurrentlySelected ? 'Selected • Proceed to Apply' : 'Select This Card & Apply'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
