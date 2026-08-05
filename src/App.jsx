import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SocietyVendorsPage from './pages/SocietyVendorsPage';
import VendorStorefrontPage from './pages/VendorStorefrontPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import InfoPages from './pages/InfoPages';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginModal from './components/LoginModal';
import { ShieldCheck } from 'lucide-react';

function getRouteFromPath(path = window.location.pathname) {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  const parts = cleanPath.split('/').filter(Boolean);

  if (cleanPath === '' || cleanPath === '/') {
    return { page: 'home' };
  }
  if (cleanPath === '/login') {
    return { page: 'login' };
  }
  if (cleanPath === '/register' || cleanPath === '/signup') {
    return { page: 'register' };
  }
  if (cleanPath === '/profile' || cleanPath === '/user-profile' || cleanPath === '/account' || cleanPath === '/my-profile') {
    return { page: 'profile' };
  }
  if (cleanPath === '/admin') {
    return { page: 'admin' };
  }
  if (cleanPath === '/registervendor' || cleanPath === '/registervender') {
    return { page: 'vendorRegister' };
  }
  if (cleanPath === '/privacy-policy') {
    return { page: 'info', tab: 'privacy-policy' };
  }
  if (cleanPath === '/child-security') {
    return { page: 'info', tab: 'child-security' };
  }
  if (cleanPath === '/terms-and-conditions' || cleanPath === '/terms') {
    return { page: 'info', tab: 'terms-and-conditions' };
  }
  if (cleanPath === '/help-support' || cleanPath === '/help') {
    return { page: 'info', tab: 'help-support' };
  }
  if (cleanPath === '/safety-standards') {
    return { page: 'info', tab: 'safety-standards' };
  }
  if (cleanPath === '/contact-support' || cleanPath === '/contact') {
    return { page: 'info', tab: 'contact-support' };
  }
  if (cleanPath === '/faqs' || cleanPath === '/faq') {
    return { page: 'info', tab: 'faqs' };
  }
  if (parts[0] === 'vendorpanel' && parts[1]) {
    return { page: 'vendorDashboard', vendorId: parts[1] };
  }
  if (parts.length === 1 && !isNaN(parts[0])) {
    return { page: 'societyVendors', societyId: parts[0] };
  }
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { page: 'vendorStorefront', societyId: parts[0], vendorId: parts[1] };
  }
  return { page: 'home' };
}

function getPathFromRoute(route) {
  switch (route.page) {
    case 'home':
      return '/';
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'profile':
      return '/profile';
    case 'societyVendors':
      return `/${route.societyId}`;
    case 'vendorStorefront':
      return `/${route.societyId}/${route.vendorId}`;
    case 'vendorRegister':
      return '/registerVendor';
    case 'vendorDashboard':
      return `/vendorPanel/${route.vendorId}`;
    case 'admin':
      return '/admin';
    case 'info':
      return `/${route.tab || 'privacy-policy'}`;
    default:
      return '/';
  }
}

export default function App() {
  const [route, setRouteState] = useState(() => getRouteFromPath());
  const [activeVendor, setActiveVendor] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Restore Active User & Vendor sessions on mount
  useEffect(() => {
    try {
      const savedVendor = localStorage.getItem('digilocal_vendor_session');
      if (savedVendor) {
        const parsed = JSON.parse(savedVendor);
        if (parsed && parsed.vendor && parsed.expiresAt > Date.now()) {
          setActiveVendor(parsed.vendor);
        }
      }
    } catch (_) {}

    try {
      const savedUser = localStorage.getItem('digilocal_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.user || parsed.name) && parsed.expiresAt > Date.now()) {
          setActiveUser(parsed.user || parsed);
        }
      } else {
        const savedRes = localStorage.getItem('digilocal_resident_session');
        if (savedRes) {
          const parsedRes = JSON.parse(savedRes);
          if (parsedRes) setActiveUser(parsedRes.user || parsedRes);
        }
      }
    } catch (_) {}
  }, []);

  // Sync route state with URL pathname & browser history
  const setRoute = (newRoute, replace = false) => {
    setRouteState(newRoute);
    const path = getPathFromRoute(newRoute);
    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState(newRoute, '', path);
      } else {
        window.history.pushState(newRoute, '', path);
      }
    }
  };

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route.page, route.vendorId, route.societyId, route.tab]);

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setRouteState(e.state);
      } else {
        setRouteState(getRouteFromPath());
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleVendorLogout = () => {
    localStorage.removeItem('digilocal_vendor_session');
    localStorage.removeItem('digilocal_active_order');
    setActiveVendor(null);
    setRoute({ page: 'home' });
  };

  const handleUserLogout = () => {
    localStorage.removeItem('digilocal_user_session');
    localStorage.removeItem('digilocal_resident_session');
    localStorage.removeItem('digilocal_active_order');
    setActiveUser(null);
    setRoute({ page: 'home' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {route.page !== 'login' && route.page !== 'vendorRegister' && route.page !== 'register' && (
        <Navbar 
          currentRoute={route} 
          setRoute={setRoute} 
          activeVendor={activeVendor}
          onVendorLogout={handleVendorLogout}
          activeUser={activeUser}
          onUserLogout={handleUserLogout}
          onOpenLogin={() => setRoute({ page: 'login' })}
        />
      )}

      <main className="flex-1">
        {route.page === 'home' && (
          <HomePage currentRoute={route} setRoute={setRoute} onOpenLogin={() => setRoute({ page: 'login' })} />
        )}

        {route.page === 'login' && (
          <LoginPage currentRoute={route} setRoute={setRoute} setActiveVendor={setActiveVendor} setActiveUser={setActiveUser} />
        )}

        {route.page === 'register' && (
          <RegisterPage setRoute={setRoute} setActiveUser={setActiveUser} />
        )}

        {route.page === 'profile' && (
          <UserProfilePage 
            activeUser={activeUser} 
            setActiveUser={setActiveUser} 
            setRoute={setRoute} 
            onLogout={handleUserLogout} 
          />
        )}

        {route.page === 'societyVendors' && (
          <SocietyVendorsPage societyId={route.societyId} setRoute={setRoute} />
        )}

        {route.page === 'vendorStorefront' && (
          <VendorStorefrontPage societyId={route.societyId} vendorId={route.vendorId} setRoute={setRoute} />
        )}

        {route.page === 'vendorRegister' && (
          <VendorRegisterPage currentRoute={route} setRoute={setRoute} setActiveVendor={setActiveVendor} />
        )}

        {route.page === 'vendorDashboard' && (
          <VendorDashboardPage vendorId={route.vendorId} setRoute={setRoute} />
        )}

        {route.page === 'admin' && (
          <AdminDashboardPage setRoute={setRoute} />
        )}

        {route.page === 'info' && (
          <InfoPages tab={route.tab} setRoute={setRoute} />
        )}
      </main>

      {route.page !== 'login' && route.page !== 'vendorRegister' && route.page !== 'register' && <Footer setRoute={setRoute} />}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        setRoute={setRoute} 
        setActiveVendor={setActiveVendor}
        setActiveUser={setActiveUser}
      />
    </div>
  );
}
