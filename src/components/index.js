/**
 * DigiLocal Components Master Index
 * 
 * Provides centralized, categorized barrel exports for all application components.
 * Developers can import directly from this file or from specific sub-directories:
 * 
 * Example:
 *   import { Navbar, Footer, LoginModal, HeroSearchComponent } from '../components';
 *   // or
 *   import Navbar from '../components/layout/Navbar';
 *   import LoginModal from '../components/modals/LoginModal';
 */

// ==========================================
// 1. LAYOUT COMPONENTS
// ==========================================
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';
export { default as FooterReveal } from './layout/FooterReveal';
export { default as FloatingCartBar } from './layout/FloatingCartBar';

// ==========================================
// 2. MODAL DIALOGS & OVERLAYS
// ==========================================
export { default as LoginModal } from './modals/LoginModal';
export { default as SupportDeskModal } from './modals/SupportDeskModal';
export { default as BlockedAccountModal } from './modals/BlockedAccountModal';
export { default as UserStrikeWarningModal } from './modals/UserStrikeWarningModal';
export { default as LiveOrderTrackerModal } from './modals/LiveOrderTrackerModal';
export { default as ResidentOrderCheckoutModal } from './modals/ResidentOrderCheckoutModal';
export { default as DeliveryAddressModal } from './modals/DeliveryAddressModal';
export { default as DeliveryLocationModal } from './modals/DeliveryLocationModal';
export { default as DummyPaymentModal } from './modals/DummyPaymentModal';
export { default as DirectVendorPaymentModal } from './modals/DirectVendorPaymentModal';
export { default as NotificationModal } from './modals/NotificationModal';
export { default as UserLocationPromptModal } from './modals/UserLocationPromptModal';

// ==========================================
// 3. UI ELEMENTS & FORM CONTROLS
// ==========================================
export { default as HeroSearchComponent } from './ui/HeroSearchComponent';
export { default as CategoryPicker } from './ui/CategoryPicker';
export { default as CountryCodePicker } from './ui/CountryCodePicker';
export { default as VendorStatusBanner } from './ui/VendorStatusBanner';
export { default as VendorCoverageMap } from './ui/VendorCoverageMap';
export { default as LiveOrderTrackerToast } from './ui/LiveOrderTrackerToast';
export { 
  VendorCardSkeleton, 
  ProductCardSkeleton, 
  DashboardSkeleton, 
  TableRowSkeleton 
} from './ui/Skeletons';
export { default as BuildingStrokeIllustration } from './ui/BuildingStrokeIllustration';
export { default as ShopStrokeIllustration } from './ui/ShopStrokeIllustration';
export { default as ZordialLogo } from './ui/ZordialLogo';

// ==========================================
// 4. ANIMATIONS & VISUAL EFFECTS
// ==========================================
export { default as AccordionGallery } from './animations/AccordionGallery';
export { default as CircularGallery } from './animations/CircularGallery';
export { default as FloatingDoodles } from './animations/FloatingDoodles';
export { default as MaskedHeading } from './animations/MaskedHeading';
export { default as ScrollStoryAnimation } from './animations/ScrollStoryAnimation';
export { default as StrokeText } from './animations/StrokeText';
export { default as TextType } from './animations/TextType';

// ==========================================
// 5. VENDOR WORKFLOW COMPONENTS
// ==========================================
export { default as VendorOnboardingStepper } from './vendor/VendorOnboardingStepper';

// ==========================================
// 6. COMMON & UTILITY COMPONENTS
// ==========================================
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as AnimatedIcon } from './common/AnimatedIcon';
export { default as ScrollTextReveal } from './common/ScrollTextReveal';
