import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
// Add page imports here
import Layout from "@/components/Layout";
import { ProgressProvider } from "@/lib/ProgressContext";
import Home from "@/pages/Home";
import FlagFragments from "@/pages/FlagFragments";
import SpeedRun from "@/pages/SpeedRun";
import Recall from "@/pages/Recall";
import FlagBuilder from "@/pages/FlagBuilder";
import ReviewDeck from "@/pages/ReviewDeck";
import Dashboard from "@/pages/Dashboard";
import Battle from "@/pages/Battle";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/play/fragments" element={<FlagFragments />} />
        <Route path="/play/speed" element={<SpeedRun />} />
        <Route path="/play/recall" element={<Recall />} />
        <Route path="/play/builder" element={<FlagBuilder />} />
        <Route path="/review" element={<ReviewDeck />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
