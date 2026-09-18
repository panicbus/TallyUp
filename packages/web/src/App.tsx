import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { Card } from './pages/Card';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Onboarding } from './pages/Onboarding';
import { Join } from './pages/Join';
import { Settings } from './pages/Settings';
import { Customers } from './pages/Customers';
import { StaffManagement } from './pages/StaffManagement';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

// Vercel Analytics' automatic pageview collection is excluded from
// /checkin/:slug and /card on purpose: those are the two screens where a
// customer types a phone number, and the privacy policy promises no visitor
// analytics runs there. The two explicit PostHog counters in lib/analytics.ts
// (button clicks, no properties, no identity) are unaffected by this — they
// aren't Vercel Analytics and aren't gated on the route.
function RouteScopedAnalytics() {
  const { pathname } = useLocation();
  const excluded = pathname.startsWith('/checkin/') || pathname === '/card';
  return excluded ? null : <Analytics />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/join" element={<Join />} />
        <Route path="/dashboard/:slug" element={<Dashboard />} />
        <Route path="/dashboard/:slug/customers" element={<Customers />} />
        <Route path="/dashboard/:slug/settings" element={<Settings />} />
        <Route path="/dashboard/:slug/staff" element={<StaffManagement />} />
        <Route path="/checkin/:slug" element={<CheckIn />} />
        <Route path="/card" element={<Card />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <RouteScopedAnalytics />
    </BrowserRouter>
  );
}
