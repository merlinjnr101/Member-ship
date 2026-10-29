import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Eye
} from 'lucide-react';
import { MembershipCard } from '../types';

interface ApplyPageProps {
  cards: MembershipCard[];
  selectedCard: MembershipCard | null;
  onSelectCard: (card: MembershipCard) => void;
  navigate: (path: string) => void;
  onSubmissionSuccess: (result: { reference_number: string; card_name: string }) => void;
}

export const ApplyPage: React.FC<ApplyPageProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  navigate,
  onSubmissionSuccess,
}) => {
  // Wizard steps: 1 = Personal Details, 2 = Identity Documents, 3 = Review & Consent
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [country, setCountry] = useState('United States');
  const [activeCardId, setActiveCardId] = useState<string>(selectedCard?.id || cards[0]?.id || '');

  // File Upload States
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [driversLicenseFile, setDriversLicenseFile] = useState<File | null>(null);
  const [ssnLicenseFile, setSsnLicenseFile] = useState<File | null>(null);

  // Consent & Agreement
  const [consentGiven, setConsentGiven] = useState(false);
  const [antiFraudConfirmed, setAntiFraudConfirmed] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCard = cards.find(c => c.id === activeCardId) || selectedCard || cards[0];

  // Countries list
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'Netherlands', 'Sweden', 'Norway', 'Singapore', 'New Zealand',
    'South Africa', 'United Arab Emirates', 'India', 'Other International'
  ];

  // Handle Profile Photo Upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Profile photograph must be an image file (JPG or PNG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Profile photo exceeds 10MB limit.');
      return;
    }

    setErrorMessage(null);
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generic document validator
  const validateDocFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Invalid file format. Only JPG, PNG, and PDF files are accepted.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds the maximum limit of 10MB.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!fatherName.trim()) return "Father's Name is required.";
    if (!motherName.trim()) return "Mother's Name is required.";
    if (!email.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please provide a valid email format.';
    if (!phoneNumber.trim()) return 'Phone number is required.';
    if (!residentialAddress.trim()) return 'Full residential address is required.';
    if (!country.trim()) return 'Country is required.';
    if (!profilePhoto) return 'A clear profile portrait photograph is required.';
    if (!activeCardId) return 'Please select a membership card tier.';
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!govIdFile) return 'Government-issued identity document is required for verification.';
    return null;
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setStep(3);
    }
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!consentGiven) {
      setErrorMessage('You must review and agree to the identity verification consent.');
      return;
    }

    if (!antiFraudConfirmed) {
      setErrorMessage('Please confirm the anti-fraud declaration.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('father_name', fatherName.trim());
      formData.append('mother_name', motherName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone_number', phoneNumber.trim());
      formData.append('residential_address', residentialAddress.trim());
      formData.append('country', country.trim());
      formData.append('membership_card_id', activeCardId);
      formData.append('consent', 'true');

      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      if (govIdFile) {
        formData.append('government_id', govIdFile);
      }
      if (driversLicenseFile) {
        formData.append('drivers_license', driversLicenseFile);
      }
      if (ssnLicenseFile) {
        formData.append('ssn_license', ssnLicenseFile);
      }

      setUploadProgress(45);

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setUploadProgress(100);

      // Successfully submitted
      onSubmissionSuccess({
        reference_number: data.reference_number,
        card_name: data.card_name || activeCard?.name || 'Membership Fan Card',
      });
      navigate(`/success?ref=${encodeURIComponent(data.reference_number)}`);

    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting application. Please try again.');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official Fan Accreditation Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Membership Application & Verification
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Please provide accurate identity information for your official digital fan card. All documents are stored in private encrypted vaults.
          </p>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            
            {/* Step 1 indicator */}
            <div className="flex items-center space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= 1 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className={`text-xs font-semibold ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
                Personal Data
              </span>
            </div>

            <div className={`h-0.5 w-12 sm:w-20 transition-colors ${step >= 2 ? 'bg-sky-500' : 'bg-slate-800'}`} />

            {/* Step 2 indicator */}
            <div className="flex items-center space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= 2 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
              </div>
              <span className={`text-xs font-semibold ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>
                Identity Docs
              </span>
            </div>

            <div className={`h-0.5 w-12 sm:w-20 transition-colors ${step >= 3 ? 'bg-sky-500' : 'bg-slate-800'}`} />

            {/* Step 3 indicator */}
            <div className="flex items-center space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= 3 ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </div>
              <span className={`text-xs font-semibold ${step >= 3 ? 'text-white' : 'text-slate-500'}`}>
                Consent & Submit
              </span>
            </div>

          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start space-x-3 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Verification Error: </span>
              {errorMessage}
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur">
          
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in-50 duration-200">
              
              {/* Selected Card Selector Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Selected Membership Fan Card
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveCardId(c.id);
                        onSelectCard(c);
                      }}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        activeCardId === c.id
                          ? 'border-sky-500 bg-sky-950/40 shadow-md ring-1 ring-sky-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate">{c.name}</span>
                        {activeCardId === c.id && <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.tier} Tier</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="border-t border-slate-800/80 pt-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Clear Profile Portrait Photograph <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-4">
                  Upload a clear, front-facing portrait photo (JPG or PNG) for official identification and card issuance.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Photo Preview Container */}
                  <div className="relative h-28 w-28 shrink-0 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <label className="cursor-pointer inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors shadow">
                      <Upload className="h-4 w-4 text-sky-400" />
                      <span>{profilePhoto ? 'Change Photograph' : 'Choose Photo File (JPG / PNG)'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {profilePhoto && (
                      <p className="mt-2 text-xs text-emerald-400 font-medium">
                        ✓ {profilePhoto.name} ({(profilePhoto.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Maximum file size: 10MB. Must show full face clearly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details Fields */}
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Personal Identity Records
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Michael Doe"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Father's Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Robert Doe"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mother's Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="e.g. Eleanor Doe"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="applicant@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Country of Residence <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Residential Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Residential Address <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      placeholder="Street address, apartment/suite, city, state/province, postal code"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-6 border-t border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-xl bg-sky-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Continue to Identity Documents</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Identity Documents Upload */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in-50 duration-200">
              
              <div>
                <h3 className="text-base font-bold text-white">
                  Identity Verification Document Uploads
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Accepted formats: JPG, PNG, PDF. Files must be clear, uncropped, and under 10MB.
                </p>
              </div>

              {/* Data Minimization Security Notice */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-4 flex items-start space-x-3 text-xs text-sky-200">
                <Lock className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Strict Privacy & Data Minimization:</strong> Your documents are deposited directly into an isolated, server-side private storage bucket. Documents are never made public or attached to emails. We do not collect or store full Social Security numbers.
                </div>
              </div>

              {/* 1. Government-Issued Identity Document (Mandatory) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Government-Issued Identity Document</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Required
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Official National Identity Card, Passport photo page, or State Identity Document.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-6 hover:border-sky-500 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-white">
                      {govIdFile ? govIdFile.name : 'Click or Drag to Upload Government ID'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      JPG, PNG, or PDF up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && validateDocFile(file)) {
                          setGovIdFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {govIdFile && (
                    <div className="mt-2 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>✓ Ready: {govIdFile.name} ({(govIdFile.size / 1024).toFixed(1)} KB)</span>
                      <button onClick={() => setGovIdFile(null)} className="text-rose-400 hover:text-white">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Driver's License Upload (Optional/Applicable) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Driver’s License Upload</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Optional / Where Applicable
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Driver’s license front/back image or PDF document.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-colors">
                    <FileText className="h-6 w-6 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-300">
                      {driversLicenseFile ? driversLicenseFile.name : 'Upload Driver’s License Document'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">JPG, PNG, or PDF</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && validateDocFile(file)) {
                          setDriversLicenseFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {driversLicenseFile && (
                    <div className="mt-2 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>✓ Selected: {driversLicenseFile.name}</span>
                      <button onClick={() => setDriversLicenseFile(null)} className="text-rose-400 hover:text-white">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. SSN / Tax Verification Document (Where legally required) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>SSN / Tax Identification License Document</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Where Legally Applicable
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      SSN license document or official tax jurisdiction card. Only stored as private verified document, never exposed in plaintext.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-300">
                      {ssnLicenseFile ? ssnLicenseFile.name : 'Upload SSN / Tax Verification Document'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">JPG, PNG, or PDF</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && validateDocFile(file)) {
                          setSsnLicenseFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {ssnLicenseFile && (
                    <div className="mt-2 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>✓ Selected: {ssnLicenseFile.name}</span>
                      <button onClick={() => setSsnLicenseFile(null)} className="text-rose-400 hover:text-white">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Personal Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-sky-500 shadow-lg shadow-sky-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Review & Consent</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Review, Consent & Submit */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-50 duration-200">
              
              <div>
                <h3 className="text-base font-bold text-white">
                  Review Application & Legal Consent
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Please confirm your submitted records and authorize the identity verification process.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    {profilePhotoPreview && (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile"
                        className="h-12 w-12 rounded-xl object-cover border border-slate-700"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">{fullName}</h4>
                      <p className="text-xs text-slate-400">{email} • {country}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeCard?.badge_color}`}>
                    {activeCard?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Father's Name:</span>
                    <span className="text-slate-200 font-medium">{fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mother's Name:</span>
                    <span className="text-slate-200 font-medium">{motherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone Number:</span>
                    <span className="text-slate-200 font-medium">{phoneNumber}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-500 block">Residential Address:</span>
                    <span className="text-slate-200 font-medium">{residentialAddress}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded bg-emerald-950/60 text-emerald-400 px-2 py-1 border border-emerald-500/30">
                    ✓ Gov ID Attached: {govIdFile?.name}
                  </span>
                  {driversLicenseFile && (
                    <span className="rounded bg-slate-800 text-slate-300 px-2 py-1">
                      ✓ Driver's License: {driversLicenseFile.name}
                    </span>
                  )}
                  {ssnLicenseFile && (
                    <span className="rounded bg-slate-800 text-slate-300 px-2 py-1">
                      ✓ Tax / SSN Doc: {ssnLicenseFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-6">
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Consent to Verification Process: </strong>
                    I hereby authorize the Membership Fan Card Verification platform and its designated compliance administrators to inspect and verify my submitted personal documents strictly for the purpose of validating membership accreditation and issuing my official Fan Card.
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer pt-3 border-t border-slate-800">
                  <input
                    type="checkbox"
                    checked={antiFraudConfirmed}
                    onChange={(e) => setAntiFraudConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Truthfulness & Anti-Fraud Acknowledgment: </strong>
                    I certify that all identification documents uploaded are authentic and belong legally to me. I acknowledge that submitting fraudulent or altered documents will lead to immediate rejection and permanent blacklisting.
                  </div>
                </label>

              </div>

              {/* Progress Indicator */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Securing and encrypting application files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Step 3 Actions */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Documents</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !consentGiven || !antiFraudConfirmed}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Submit For Verification</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
