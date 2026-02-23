import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from './utils/toast'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Cart from './components/Cart'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import InstallPrompt from './components/InstallPrompt'
import FloatingCallButton from './components/FloatingCallButton'

// Main page (eagerly loaded for fast initial render)
import Home from './pages/Home'

// Lazy-loaded pages (code splitting for smaller initial bundle)
const Menu = lazy(() => import('./pages/Menu'))
const Deals = lazy(() => import('./pages/Deals'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Checkout = lazy(() => import('./pages/Checkout'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const TrackOrderLookup = lazy(() => import('./pages/TrackOrderLookup'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Account = lazy(() => import('./pages/Account'))
const Kitchen = lazy(() => import('./pages/Kitchen'))
const TakeawayLimerick = lazy(() => import('./pages/TakeawayLimerick'))
const PizzaDeliveryLimerick = lazy(() => import('./pages/PizzaDeliveryLimerick'))
const BestTakeawayKnocklong = lazy(() => import('./pages/BestTakeawayKnocklong'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const WhyNimos = lazy(() => import('./pages/WhyNimos'))
const ChickenBoxLimerick = lazy(() => import('./pages/ChickenBoxLimerick'))

// Admin layout + pages (lazy loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminMenuManager = lazy(() => import('./pages/admin/MenuManager'))
const AdminPromos = lazy(() => import('./pages/admin/Promos'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminMessages = lazy(() => import('./pages/admin/Messages'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col" role="status" aria-label="Loading page">
      {/* Skeleton navbar */}
      <div className="h-16 bg-[#0f0f0f] border-b border-white/5 flex items-center px-6 gap-4">
        <div className="w-8 h-8 rounded-full bg-[#1a1a2e] animate-pulse" />
        <div className="h-4 w-24 rounded bg-[#1a1a2e] animate-pulse" />
        <div className="ml-auto flex gap-4">
          <div className="h-4 w-14 rounded bg-[#1a1a2e] animate-pulse" />
          <div className="h-4 w-14 rounded bg-[#1a1a2e] animate-pulse hidden sm:block" />
          <div className="h-4 w-14 rounded bg-[#1a1a2e] animate-pulse hidden sm:block" />
        </div>
      </div>
      {/* Centered spinner */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#e94560] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
              Skip to main content
            </a>
            <ToastContainer />
            <OfflineBanner />
            <InstallPrompt />
            <FloatingCallButton />
            <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Kitchen: fullscreen, no Navbar/Footer */}
                <Route path="/kitchen" element={
                  <ProtectedRoute roles={['admin', 'kitchen']}>
                    <Kitchen />
                  </ProtectedRoute>
                } />

                {/* Admin routes: fullscreen with admin sidebar layout */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="menu" element={<AdminMenuManager />} />
                  <Route path="promos" element={<AdminPromos />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Main site with Navbar + Footer */}
                <Route path="*" element={
                  <div className="flex flex-col min-h-screen bg-[#080808] text-white font-sans">
                    <Navbar />
                    <Cart />
                    <main id="main-content" className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/checkout" element={
                          <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/order-confirmed/:id" element={<OrderConfirmation />} />
                        <Route path="/track-order" element={<TrackOrderLookup />} />
                        <Route path="/track/:id" element={<TrackOrder />} />
                        <Route path="/account" element={
                          <ProtectedRoute><Account /></ProtectedRoute>
                        } />
                        <Route path="/takeaway-limerick" element={<TakeawayLimerick />} />
                        <Route path="/pizza-delivery-limerick" element={<PizzaDeliveryLimerick />} />
                        <Route path="/best-takeaway-knocklong" element={<BestTakeawayKnocklong />} />
                        <Route path="/why-nimos" element={<WhyNimos />} />
                        <Route path="/chicken-box-limerick" element={<ChickenBoxLimerick />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="*" element={
                          <div className="min-h-screen flex items-center justify-center pt-20">
                            <div className="text-center">
                              <h1 className="text-7xl font-bold text-[#e94560] mb-4">404</h1>
                              <p className="text-[#e0e0e0]/70 text-lg mb-6">Page not found</p>
                              <a href="/" className="bg-[#e94560] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d13350] transition-colors">Go Home</a>
                            </div>
                          </div>
                        } />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
