import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CardsPage } from './pages/CardsPage';
import { ApplyPage } from './pages/ApplyPage';
import { SuccessPage } from './pages/SuccessPage';
import { TrackPage } from './pages/TrackPage';
import { ApplicantPortalPage } from './pages/ApplicantPortalPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactSupportPage } from './pages/ContactSupportPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { VerifyCardPublicPage } from './pages/VerifyCardPublicPage';
import { MembershipCard } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<string>(() => {
    return window.location.search || '';
  });

  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MembershipCard | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{ reference_number: string; card_name: string }>({
    reference_number: '',
    card_name: '',
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('fancard_admin_token');
  });

  // Fetch active cards from backend API
  const loadCards = async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        if (data.cards?.length > 0 && !selectedCard) {
          setSelectedCard(data.cards[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load membership cards:', e);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Browser history synchronization
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithQuery: string) => {
    const [path, query] = pathWithQuery.split('?');
    const fullPath = query ? `${path}?${query}` : path;
    window.history.pushState({}, '', fullPath);
    setCurrentPath(path);
    setSearchParams(query ? `?${query}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('fancard_admin_token');
    setAdminToken(null);
    navigate('/admin');
  };

  // Extract reference number from URL if query param ?ref=... is present
  const queryParams = new URLSearchParams(searchParams);
  const refFromQuery = queryParams.get('ref') || '';

  // Check if route is public card verification: /verify/:cardNumber
  const isVerifyRoute = currentPath.startsWith('/verify/');
  const verifyCardNumber = isVerifyRoute ? currentPath.replace('/verify/', '') : '';

  // Determine current page to render
  const renderContent = () => {
    if (isVerifyRoute) {
      return <VerifyCardPublicPage cardNumber={verifyCardNumber} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return (
          <HomePage
            navigate={navigate}
            cards={cards}
            onSelectCard={(c) => setSelectedCard(c)}
          />
        );

      case '/cards':
        return (
          <CardsPage
            cards={cards}
            selectedCard={selectedCard}
            onSelectCard={(c) => setSelectedCard(c)}
            navigate={navigate}
          />
        );

      case '/apply':
        return (
          <ApplyPage
            cards={cards}
            selectedCard={selectedCard}
            onSelectCard={(c) => setSelectedCard(c)}
            navigate={navigate}
            onSubmissionSuccess={(res) => setSubmissionResult(res)}
          />
        );

      case '/success':
        return (
          <SuccessPage
            referenceNumber={submissionResult.reference_number || refFromQuery}
            cardName={submissionResult.card_name || selectedCard?.name || 'Membership Fan Card'}
            navigate={navigate}
          />
        );

      case '/track':
        return (
          <TrackPage
            initialRef={refFromQuery || submissionResult.reference_number}
            navigate={navigate}
          />
        );

      case '/applicant':
        return <ApplicantPortalPage navigate={navigate} />;

      case '/admin':
        if (adminToken) {
          return (
            <AdminDashboardPage
              token={adminToken}
              onLogout={handleAdminLogout}
              navigate={navigate}
            />
          );
        }
        return (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            navigate={navigate}
          />
        );

      case '/admin/dashboard':
        if (!adminToken) {
          return (
            <AdminLoginPage
              onLoginSuccess={handleAdminLoginSuccess}
              navigate={navigate}
            />
          );
        }
        return (
          <AdminDashboardPage
            token={adminToken}
            onLogout={handleAdminLogout}
            navigate={navigate}
          />
        );

      case '/support':
        return <ContactSupportPage navigate={navigate} />;

      case '/privacy':
        return <PrivacyPolicyPage navigate={navigate} />;

      case '/terms':
        return <TermsPage navigate={navigate} />;

      default:
        return (
          <HomePage
            navigate={navigate}
            cards={cards}
            onSelectCard={(c) => setSelectedCard(c)}
          />
        );
    }
  };

  const isAdminView = currentPath.startsWith('/admin/dashboard') && adminToken;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {!isAdminView && <Navbar currentPath={currentPath} navigate={navigate} />}
      <main className="flex-1">{renderContent()}</main>
      {!isAdminView && <Footer navigate={navigate} />}
    </div>
  );
}
