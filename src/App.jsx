import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
import { lazy, Suspense, useEffect } from "react";
import Layout from "@/components/Layout";
import { ProgressProvider } from "@/lib/ProgressContext";
import Landing from "@/pages/Landing";
import {
  ROUTE_IMPORTERS,
  lazyWithRetry,
  prefetchPrimaryRoutes,
} from "@/lib/routePrefetch";

// Code splitting with retry + idle/hover prefetching so navigation never hangs on stale or slow chunks
const Home = lazyWithRetry(ROUTE_IMPORTERS["/atlas"]);
const Learn = lazyWithRetry(ROUTE_IMPORTERS["/learn"]);
const FlagFragments = lazyWithRetry(() => import("@/pages/FlagFragments"));
const SpeedRun = lazyWithRetry(() => import("@/pages/SpeedRun"));
const Recall = lazyWithRetry(() => import("@/pages/Recall"));
const FlagBuilder = lazyWithRetry(() => import("@/pages/FlagBuilder"));
const ModePicker = lazyWithRetry(ROUTE_IMPORTERS["/play"]);
const ReviewDeck = lazyWithRetry(ROUTE_IMPORTERS["/review"]);
const Dashboard = lazyWithRetry(ROUTE_IMPORTERS["/dashboard"]);
const Battle = lazyWithRetry(ROUTE_IMPORTERS["/battle"]);
const WorldQuiz = lazyWithRetry(() => import("@/pages/WorldQuiz"));
const Login = lazyWithRetry(() => import("@/pages/Login"));
const Register = lazyWithRetry(() => import("@/pages/Register"));
const ForgotPassword = lazyWithRetry(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("@/pages/ResetPassword"));
const OAuthConsent = lazyWithRetry(() => import("@/pages/OAuthConsent"));

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-muted border-t-forest rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  useEffect(() => {
    prefetchPrimaryRoutes();
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Auth pages — rendered outside the Layout shell (no nav/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />

        {/* Main app — wrapped in Layout (header + footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/atlas" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/atleast" element={<Navigate to="/atlas" replace />} />
          <Route path="/play/fragments" element={<FlagFragments />} />
          <Route path="/play/speed" element={<SpeedRun />} />
          <Route path="/play/recall" element={<Recall />} />
          <Route path="/play/builder" element={<FlagBuilder />} />
          <Route path="/play/world-quiz" element={<WorldQuiz />} />
          <Route path="/play/go-berserk" element={<WorldQuiz />} />
          <Route path="/play" element={<ModePicker />} />
          <Route path="/review" element={<ReviewDeck />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ProgressProvider>
          <AuthenticatedApp />
        </ProgressProvider>
      </Router>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
