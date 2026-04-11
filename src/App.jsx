import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Plugins from './pages/Plugins';
import PluginDetail from './pages/PluginDetail';
import Docs from './pages/Docs';
import PluginLogin from './pages/PluginLogin';
import PublishPlugin from './pages/PublishPlugin';
// Add page imports here

const CANONICAL_ORIGIN = "https://beampd.xirako.com";

function upsertHeadTag(tagName, selector, updater) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }
  updater(el);
}

const RouteSeo = () => {
  const location = useLocation();

  useEffect(() => {
    const trimmedPath = location.pathname.replace(/\/+$/, "");
    const normalizedPath = trimmedPath === "" ? "/" : trimmedPath;
    const canonicalUrl = `${CANONICAL_ORIGIN}${normalizedPath}`;

    upsertHeadTag("link", 'link[rel="canonical"]', (el) => {
      el.setAttribute("rel", "canonical");
      el.setAttribute("href", canonicalUrl);
    });

    const noIndexPaths = new Set(["/plugins/login", "/plugins/publish"]);
    const robotsContent = noIndexPaths.has(normalizedPath) ? "noindex, nofollow" : "index, follow";

    upsertHeadTag("meta", 'meta[name="robots"]', (el) => {
      el.setAttribute("name", "robots");
      el.setAttribute("content", robotsContent);
    });
  }, [location.pathname]);

  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/plugins" element={<Plugins />} />
      <Route path="/plugins/:id" element={<PluginDetail />} />
      <Route path="/plugins/login" element={<PluginLogin />} />
      <Route path="/plugins/publish" element={<PublishPlugin />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <RouteSeo />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
