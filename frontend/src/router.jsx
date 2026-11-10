import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { CustomerLayout } from './layouts/CustomerLayout.jsx';
import { OwnerLayout } from './layouts/OwnerLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Error Page
import NotFoundPage from './pages/errors/NotFoundPage.jsx';

// Public Pages
import HomePage from './pages/public/HomePage.jsx';
import SearchPage from './pages/public/SearchPage.jsx';
import FacilityListPage from './pages/public/FacilityListPage.jsx';
import FacilityDetailPage from './pages/public/FacilityDetailPage.jsx';
import CourtDetailPage from './pages/public/CourtDetailPage.jsx';
import CategoryCourtsPage from './pages/public/CategoryCourtsPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import FaqPage from './pages/public/FaqPage.jsx';
import TermsPage from './pages/public/TermsPage.jsx';
import PrivacyPage from './pages/public/PrivacyPage.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Customer Pages
import AccountOverviewPage from './pages/customer/AccountOverviewPage.jsx';
import ProfilePage from './pages/customer/ProfilePage.jsx';
import BookingsPage from './pages/customer/BookingsPage.jsx';
import BookingDetailPage from './pages/customer/BookingDetailPage.jsx';
import FavoritesPage from './pages/customer/FavoritesPage.jsx';
import NotificationsPage from './pages/customer/NotificationsPage.jsx';
import ReviewsPage from './pages/customer/ReviewsPage.jsx';
import CreateReviewPage from './pages/customer/CreateReviewPage.jsx';
import ComplaintsPage from './pages/customer/ComplaintsPage.jsx';
import CreateComplaintPage from './pages/customer/CreateComplaintPage.jsx';
import ComplaintDetailPage from './pages/customer/ComplaintDetailPage.jsx';
import CheckoutPage from './pages/customer/CheckoutPage.jsx';
import PaymentPage from './pages/customer/PaymentPage.jsx';
import PaymentResultPage from './pages/customer/PaymentResultPage.jsx';
import OwnerApplicationPage from './pages/customer/OwnerApplicationPage.jsx';
import CustomerSessionsPage from './pages/customer/CustomerSessionsPage.jsx';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage.jsx';
import OwnerFacilitiesPage from './pages/owner/OwnerFacilitiesPage.jsx';
import OwnerFacilityFormPage from './pages/owner/OwnerFacilityFormPage.jsx';
import OwnerCourtsPage from './pages/owner/OwnerCourtsPage.jsx';
import OwnerCourtFormPage from './pages/owner/OwnerCourtFormPage.jsx';
import OwnerOperatingHoursPage from './pages/owner/OwnerOperatingHoursPage.jsx';
import OwnerPricingPage from './pages/owner/OwnerPricingPage.jsx';
import OwnerPriceRuleFormPage from './pages/owner/OwnerPriceRuleFormPage.jsx';
import OwnerBlockedSlotsPage from './pages/owner/OwnerBlockedSlotsPage.jsx';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage.jsx';
import OwnerBookingDetailPage from './pages/owner/OwnerBookingDetailPage.jsx';
import OwnerCalendarPage from './pages/owner/OwnerCalendarPage.jsx';
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage.jsx';
import OwnerComplaintsPage from './pages/owner/OwnerComplaintsPage.jsx';
import OwnerRevenuePage from './pages/owner/OwnerRevenuePage.jsx';
import OwnerProfilePage from './pages/owner/OwnerProfilePage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminOwnerApplicationsPage from './pages/admin/AdminOwnerApplicationsPage.jsx';
import AdminOwnerAppDetailPage from './pages/admin/AdminOwnerAppDetailPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage.jsx';
import AdminComplaintDetailPage from './pages/admin/AdminComplaintDetailPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';

export const router = createBrowserRouter([
  // Public Routes (wrapped in PublicLayout)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'facilities', element: <FacilityListPage /> },
      { path: 'facilities/:id', element: <FacilityDetailPage /> },
      { path: 'courts', element: <CategoryCourtsPage /> },
      { path: 'courts/:id', element: <CourtDetailPage /> },
      { path: 'sports/:code', element: <CategoryCourtsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },

      // Checkout & Booking flow (Customer must be logged in, but uses public header/footer)
      { path: 'checkout/:courtId', element: <CheckoutPage /> },
      { path: 'payment/:bookingId', element: <PaymentPage /> },
      { path: 'payment-result/:bookingId', element: <PaymentResultPage /> }
    ]
  },

  // Auth Routes (wrapped in AuthLayout)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> }
    ]
  },

  // Customer Portal (wrapped in CustomerLayout)
  {
    path: '/account',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <AccountOverviewPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'bookings/:id', element: <BookingDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/new/:bookingId', element: <CreateReviewPage /> },
      { path: 'complaints', element: <ComplaintsPage /> },
      { path: 'complaints/new', element: <CreateComplaintPage /> },
      { path: 'complaints/:id', element: <ComplaintDetailPage /> },
      { path: 'owner-application', element: <OwnerApplicationPage /> },
      { path: 'sessions', element: <CustomerSessionsPage /> }
    ]
  },

  // Owner Portal (wrapped in OwnerLayout)
  {
    path: '/owner',
    element: <OwnerLayout />,
    children: [
      { index: true, element: <OwnerDashboardPage /> },
      { path: 'facilities', element: <OwnerFacilitiesPage /> },
      { path: 'facilities/new', element: <OwnerFacilityFormPage /> },
      { path: 'facilities/:id', element: <OwnerFacilityFormPage /> },
      { path: 'facilities/:id/edit', element: <OwnerFacilityFormPage /> },
      { path: 'courts', element: <OwnerCourtsPage /> },
      { path: 'courts/new', element: <OwnerCourtFormPage /> },
      { path: 'courts/:id', element: <OwnerCourtFormPage /> },
      { path: 'courts/:id/edit', element: <OwnerCourtFormPage /> },
      { path: 'operating-hours', element: <OwnerOperatingHoursPage /> },
      { path: 'pricing', element: <OwnerPricingPage /> },
      { path: 'pricing/new', element: <OwnerPriceRuleFormPage /> },
      { path: 'blocked-slots', element: <OwnerBlockedSlotsPage /> },
      { path: 'bookings', element: <OwnerBookingsPage /> },
      { path: 'bookings/:id', element: <OwnerBookingDetailPage /> },
      { path: 'calendar', element: <OwnerCalendarPage /> },
      { path: 'reviews', element: <OwnerReviewsPage /> },
      { path: 'complaints', element: <OwnerComplaintsPage /> },
      { path: 'revenue', element: <OwnerRevenuePage /> },
      { path: 'profile', element: <OwnerProfilePage /> }
    ]
  },

  // Admin Portal (wrapped in AdminLayout)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'users/:id', element: <AdminUsersPage /> },
      { path: 'owner-applications', element: <AdminOwnerApplicationsPage /> },
      { path: 'owner-applications/:id', element: <AdminOwnerAppDetailPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'complaints', element: <AdminComplaintsPage /> },
      { path: 'complaints/:id', element: <AdminComplaintDetailPage /> },
      { path: 'settings', element: <AdminSettingsPage /> }
    ]
  },

  // 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

