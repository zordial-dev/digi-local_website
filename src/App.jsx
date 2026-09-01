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
import ZordialPartnerPage from './pages/ZordialPartnerPage';
import LoginModal from './components/LoginModal';
import SupportDeskModal from './components/SupportDeskModal';
import BlockedAccountModal from './components/BlockedAccountModal';
import FloatingCartBar from './components/FloatingCartBar';
import { api } from './services/api';

function getRouteFromPath(path = window.location.pathname) {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  const parts = cleanPath.split('/').filter(Boolean);

  if (cleanPath === '/vendors' || cleanPath === '/all-vendors' || cleanPath === '/all') {
    return { page: 'societyVendors', societyId: 'all' };
  }
  if (cleanPath === '/login' || cleanPath === '/user-login' || cleanPath === '/userlogin') {
    return { page: 'login', accountType: 'resident' };
  }
  if (cleanPath === '/vendor-login' || cleanPath === '/vendorlogin' || cleanPath === '/vendor-portal') {
    return { page: 'login', accountType: 'vendor' };
  }
  if (cleanPath === '/register' || cleanPath === '/signup') {
    return { page: 'register' };
  }
  if (cleanPath === '/profile' || cleanPath === '/user-profile' || cleanPath === '/account' || cleanPath === '/my-profile') {
    return { page: 'profile' };
  }
  if (cleanPath === '/admin' || cleanPath === '/admin-dashboard') {
    return { page: 'admin' };
  }
  if (cleanPath === '/registervendor' || cleanPath === '/registervender' || cleanPath === '/register-vendor' || cleanPath === '/vendor-register') {
    return { page: 'vendorRegister' };
  }
  if (cleanPath === '/privacy-policy') {
    return { page: 'info', tab: 'privacy-policy' };
  }
  if (cleanPath === '/refund-policy' || cleanPath === '/refund' || cleanPath === '/refunds' || cleanPath === '/cancellation-policy') {
    return { page: 'info', tab: 'refund-policy' };
  }
  if (cleanPath === '/child-security') {
    return { page: 'info', tab: 'child-security' };
  }
  if (cleanPath === '/terms-conditions' || cleanPath === '/terms-and-conditions' || cleanPath === '/terms') {
    return { page: 'info', tab: 'terms-and-conditions' };
  }
  if (cleanPath === '/help-support' || cleanPath === '/help' || cleanPath === '/faqs' || cleanPath === '/faq') {
    return { page: 'info', tab: 'help-support' };
  }
  if (cleanPath === '/how-it-works' || cleanPath === '/howitworks') {
    return { page: 'info', tab: 'how-it-works' };
  }
  if (cleanPath === '/about-us' || cleanPath === '/about' || cleanPath === '/our-story') {
    return { page: 'info', tab: 'about-us' };
  }
  if (cleanPath === '/zordial' || cleanPath === '/zordial-technologies' || cleanPath === '/partner/zordial') {
    return { page: 'zordial' };
  }
  if (cleanPath === '/safety-standards') {
    return { page: 'info', tab: 'safety-standards' };
  }
  if (cleanPath === '/contact-support' || cleanPath === '/contact') {
    return { page: 'info', tab: 'contact-support' };
  }
  if (parts[0] === 'vendorpanel' && parts[1]) {
    return { page: 'vendorDashboard', vendorId: parts[1] };
  }
  if (parts[0] === 'storefront' && parts[1] && parts[2]) {
    return { page: 'vendorStorefront', societyId: parts[1], vendorId: parts[2] };
  }
  if (parts.length === 2) {
    return { page: 'vendorStorefront', societyId: parts[0], vendorId: parts[1] };
  }
  if (parts.length === 1 && parts[0] !== 'home') {
    return { page: 'societyVendors', societyId: parts[0] };
  }
  if (cleanPath === '' || cleanPath === '/' || cleanPath === '/home') {
    return { page: 'home' };
  }

  // Fallback to session stored route if path matches
  try {
    const saved = sessionStorage.getItem('digilocal_active_route');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.page) return parsed;
    }
  } catch (_) { }

  return { page: 'home' };
}

function getPathFromRoute(route) {
  switch (route.page) {
    case 'home':
      return '/';
    case 'login':
      return route.accountType === 'vendor' || route.tab === 'vendor' ? '/vendor-login' : '/login';
    case 'register':
      return '/register';
    case 'profile':
      return '/profile';
    case 'societyVendors':
      return (!route.societyId || route.societyId === 'all') ? '/vendors' : `/${route.societyId}`;
    case 'vendorStorefront':
      return `/${route.societyId || 1}/${route.vendorId}`;
    case 'vendorRegister':
      return '/vendor-register';
    case 'vendorDashboard':
      return `/vendorPanel/${route.vendorId}`;
    case 'admin':
      return '/admin';
    case 'zordial':
      return '/zordial';
    case 'info':
      return `/${route.tab || 'help-support'}`;
    default:
      return '/';
  }
}

export default function App() {
  const [route, setRouteState] = useState(() => getRouteFromPath());
  const [activeVendor, setActiveVendor] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupportDeskOpen, setIsSupportDeskOpen] = useState(false);
  const [platformConfig, setPlatformConfig] = useState(null);
  const [blockedAccountInfo, setBlockedAccountInfo] = useState(null);

  // Restore Active User & Vendor sessions on mount & check status ONCE
  useEffect(() => {
    const initialRoute = getRouteFromPath();
    setRouteState(initialRoute);
    const path = getPathFromRoute(initialRoute);
    window.history.replaceState(initialRoute, '', path);

    // Fetch Global Platform Config
    api.getPlatformConfig().then(cfg => {
      if (cfg) setPlatformConfig(cfg);
    }).catch(() => { });

    // 1. Check & Guard Resident User Session (CALL ONLY ONCE on mount)
    try {
      let savedUser = null;
      let userToken = localStorage.getItem('accessToken') || localStorage.getItem('userToken') || null;
      const userSessionStr = localStorage.getItem('digilocal_user_session');
      if (userSessionStr) {
        const parsed = JSON.parse(userSessionStr);
        if (parsed && (parsed.user || parsed.name) && (!parsed.expiresAt || parsed.expiresAt > Date.now())) {
          savedUser = parsed.user || parsed;
          userToken = parsed.token || parsed.accessToken || userToken;
        }
      } else {
        const residentSessionStr = localStorage.getItem('digilocal_resident_session');
        if (residentSessionStr) {
          const parsedRes = JSON.parse(residentSessionStr);
          if (parsedRes) savedUser = parsedRes.user || parsedRes;
        }
      }

      if (savedUser) {
        setActiveUser(savedUser);
        const userId = savedUser.user_id || savedUser.id || savedUser.phone;
        // Call status check API ONCE on app launch
        api.checkUserStatus(userId, userToken).then(statusRes => {
          if (statusRes?.is_blocked || statusRes?.code === 'USER_BLOCKED' || statusRes?.action === 'logout') {
            console.warn('⚠️ Resident account blocked by admin. Purging local storage and logging out...');
            localStorage.removeItem('digilocal_user_session');
            localStorage.removeItem('digilocal_resident_session');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('resident_profile');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userToken');
            setActiveUser(null);
            setBlockedAccountInfo({
              accountType: 'resident',
              code: statusRes.code || 'USER_BLOCKED',
              title: 'Resident Account Blocked',
              error: statusRes.error || statusRes.message,
              message: statusRes.message || 'Your resident user account has been blocked by administrator.',
              blockReason: statusRes.block_reason || 'Violation of community rules'
            });
            setRoute({ page: 'login', accountType: 'resident' });
          } else if (statusRes && (statusRes.success || statusRes.name || statusRes.user)) {
            // Sync complete v2.5.0 profile & address attributes
            const uData = statusRes.user || statusRes;
            const freshName = uData.name;
            const freshPhone = uData.phone;
            const freshEmail = uData.email;
            const freshFlat = uData.flat;
            const freshArea = uData.area || uData.society_name;
            const freshCity = uData.city;
            const freshPincode = uData.pincode;
            const freshAddress = uData.address;

            setActiveUser(prev => {
              if (
                prev &&
                freshName && prev.name === freshName &&
                (!freshPhone || prev.phone === freshPhone) &&
                (!freshFlat || prev.flat === freshFlat) &&
                (!freshArea || (prev.area || prev.society_name) === freshArea)
              ) {
                return prev;
              }
              const updated = {
                ...(prev || {}),
                ...(uData || {}),
                ...(freshName ? { name: freshName } : {}),
                ...(freshPhone ? { phone: freshPhone } : {}),
                ...(freshEmail ? { email: freshEmail } : {}),
                ...(freshFlat ? { flat: freshFlat } : {}),
                ...(freshArea ? { area: freshArea, society_name: freshArea } : {}),
                ...(freshCity ? { city: freshCity } : {}),
                ...(freshPincode ? { pincode: freshPincode } : {}),
                ...(freshAddress ? { address: freshAddress } : {})
              };

              try {
                const sessionStr = localStorage.getItem('digilocal_user_session');
                if (sessionStr) {
                  const parsed = JSON.parse(sessionStr);
                  localStorage.setItem('digilocal_user_session', JSON.stringify({ ...parsed, user: updated }));
                }
                localStorage.setItem('digilocal_resident_session', JSON.stringify(updated));
              } catch (_) {}

              return updated;
            });
          }
        }).catch(() => {});
      }
    } catch (_) { }

    // 2. Check & Guard Vendor Session (CALL ONLY ONCE on mount)
    try {
      const savedVendorStr = localStorage.getItem('digilocal_vendor_session');
      if (savedVendorStr) {
        const parsedV = JSON.parse(savedVendorStr);
        if (parsedV && parsedV.vendor && (!parsedV.expiresAt || parsedV.expiresAt > Date.now())) {
          const vendor = parsedV.vendor;
          const vendorToken = parsedV.token || parsedV.accessToken || localStorage.getItem('digilocal_vendor_token') || null;
          setActiveVendor(vendor);
          const vendorId = vendor.vendor_id || vendor.id;
          // Call status check API ONCE on portal launch
          api.checkVendorStatus(vendorId, vendorToken).then(statusRes => {
            if (statusRes?.is_blocked || statusRes?.code === 'VENDOR_BLOCKED' || statusRes?.action === 'logout') {
              console.warn('⚠️ Vendor account blocked by admin. Purging local storage and logging out...');
              localStorage.removeItem('digilocal_vendor_session');
              localStorage.removeItem('digilocal_vendor_token');
              localStorage.removeItem('vendorToken');
              localStorage.removeItem('accessToken');
              setActiveVendor(null);
              setBlockedAccountInfo({
                accountType: 'vendor',
                code: statusRes.code || 'VENDOR_BLOCKED',
                title: 'Vendor Store Account Blocked',
                error: statusRes.error || statusRes.message,
                message: statusRes.message || 'Your vendor store account has been blocked by administrator.',
                blockReason: statusRes.block_reason || 'Policy violation'
              });
              setRoute({ page: 'login', accountType: 'vendor' });
            }
          }).catch(() => {});
        }
      }
    } catch (_) { }
  }, []);

  // Sync route state with URL pathname, browser history & sessionStorage
  const setRoute = (newRoute, replace = false) => {
    setRouteState(newRoute);
    try {
      sessionStorage.setItem('digilocal_active_route', JSON.stringify(newRoute));
    } catch (_) { }
    const path = getPathFromRoute(newRoute);
    if (replace) {
      window.history.replaceState(newRoute, '', path);
    } else {
      window.history.pushState(newRoute, '', path);
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
    localStorage.removeItem('user_profile');
    localStorage.removeItem('resident_profile');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('digilocal_saved_addresses');
    localStorage.removeItem('digilocal_user_location');
    localStorage.removeItem('digilocal_active_order');
    localStorage.removeItem('digilocal_guest_address');
    window.dispatchEvent(new CustomEvent('digilocal_saved_addresses_updated', { detail: [] }));
    window.dispatchEvent(new CustomEvent('digilocal_location_changed', { detail: null }));
    setActiveUser(null);
    setRoute({ page: 'home' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Global Maintenance Mode Banner (Workflow 5) */}
      {platformConfig?.maintenance_mode && (
        <div className="bg-[#8C2323] text-white py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>DigiLocal is currently undergoing scheduled platform maintenance. Services & orders are temporarily paused.</span>
        </div>
      )}

      {route.page !== 'login' && route.page !== 'vendorRegister' && route.page !== 'register' && (
        <Navbar
          currentRoute={route}
          setRoute={setRoute}
          activeVendor={activeVendor}
          onVendorLogout={handleVendorLogout}
          activeUser={activeUser}
          onUserLogout={handleUserLogout}
          onOpenLogin={() => setRoute({ page: 'login' })}
          onOpenSupportDesk={() => setIsSupportDeskOpen(true)}
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
          <RegisterPage currentRoute={route} setRoute={setRoute} setActiveUser={setActiveUser} setActiveVendor={setActiveVendor} />
        )}

        {route.page === 'profile' && (
          <UserProfilePage
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            setRoute={setRoute}
            onLogout={handleUserLogout}
            onOpenSupportDesk={() => setIsSupportDeskOpen(true)}
          />
        )}

        {route.page === 'societyVendors' && (
          <SocietyVendorsPage
            societyId={route.societyId}
            setRoute={setRoute}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {route.page === 'vendorStorefront' && (
          <VendorStorefrontPage
            currentRoute={route}
            societyId={route.societyId}
            vendorId={route.vendorId}
            setRoute={setRoute}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            activeUser={activeUser}
          />
        )}

        {route.page === 'vendorRegister' && (
          <VendorRegisterPage currentRoute={route} setRoute={setRoute} setActiveVendor={setActiveVendor} setActiveUser={setActiveUser} />
        )}

        {route.page === 'vendorDashboard' && (
          <VendorDashboardPage
            vendorId={route.vendorId}
            setRoute={setRoute}
            setActiveVendor={setActiveVendor}
            onVendorLogout={handleVendorLogout}
            onOpenSupportDesk={() => setIsSupportDeskOpen(true)}
          />
        )}

        {route.page === 'admin' && (
          <AdminDashboardPage setRoute={setRoute} />
        )}

        {route.page === 'zordial' && (
          <ZordialPartnerPage setRoute={setRoute} />
        )}

        {route.page === 'info' && (
          <InfoPages currentRoute={route} tab={route.tab} setRoute={setRoute} onOpenSupportDesk={() => setIsSupportDeskOpen(true)} />
        )}

        {!['home', 'login', 'register', 'profile', 'societyVendors', 'vendorStorefront', 'vendorRegister', 'vendorDashboard', 'admin', 'zordial', 'info'].includes(route.page) && (
          <HomePage currentRoute={route} setRoute={setRoute} onOpenLogin={() => setRoute({ page: 'login' })} />
        )}
      </main>

      {route.page !== 'login' && route.page !== 'vendorRegister' && route.page !== 'register' && (
        <Footer setRoute={setRoute} onOpenSupportDesk={() => setIsSupportDeskOpen(true)} />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        setRoute={setRoute}
        setActiveVendor={setActiveVendor}
        setActiveUser={setActiveUser}
      />

      <SupportDeskModal
        isOpen={isSupportDeskOpen}
        onClose={() => setIsSupportDeskOpen(false)}
        userType={activeVendor ? 'vendor' : 'user'}
        initialEmail={activeVendor?.email || activeUser?.email}
        initialName={activeVendor?.vendor_name || activeUser?.name}
        entityName={activeVendor?.store_name || activeUser?.flat}
      />

      <BlockedAccountModal
        isOpen={Boolean(blockedAccountInfo)}
        onClose={() => setBlockedAccountInfo(null)}
        onOpenSupport={() => {
          setBlockedAccountInfo(null);
          setIsSupportDeskOpen(true);
        }}
        blockInfo={blockedAccountInfo}
      />

      {/* Floating Bottom Cart Bar (Sticky View Cart Bar) */}
      <FloatingCartBar currentRoute={route} setRoute={setRoute} />
    </div>
  );
}
