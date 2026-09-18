import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import { ProgressProvider } from "@/lib/ProgressContext";

// Code splitting via React.lazy — ensures game modes and auth screens are only loaded when navigated to
const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home"));
const FlagFragments = lazy(() => import("@/pages/FlagFragments"));
const SpeedRun = lazy(() => import("@/pages/SpeedRun"));
const Recall = lazy(() => import("@/pages/Recall"));
const FlagBuilder = lazy(() => import("@/pages/FlagBuilder"));
const ModePicker = lazy(() => import("@/pages/ModePicker"));
const ReviewDeck = lazy(() => import("@/pages/ReviewDeck"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Battle = lazy(() => import("@/pages/Battle"));
const WorldQuiz = lazy(() => import("@/pages/WorldQuiz"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const OAuthConsent = lazy(() => import("@/pages/OAuthConsent"));

const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-muted border-t-forest rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

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
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ProgressProvider>
            <AuthenticatedApp />
          </ProgressProvider>
        </Router>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
