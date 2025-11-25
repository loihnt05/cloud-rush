import Home from "@/pages/home";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  useEffect(() => {
    // If not authenticated and not on home page, redirect to login
    if (!isLoading && !isAuthenticated && !isHomePage) {
      loginWithRedirect({
        appState: { returnTo: location.pathname }
      });
    }
  }, [isLoading, isAuthenticated, isHomePage, location.pathname, loginWithRedirect]);
  
  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // For non-authenticated users on home page, show landing page
  if (!isAuthenticated && isHomePage) {
    return <Home />;
  }

  // For non-authenticated users on other pages, show nothing (they'll be redirected by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // For authenticated users, render the protected content
  return <>{children}</>;
}
