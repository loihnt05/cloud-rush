// main.tsx
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import authConfig from "./auth-config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/layout/layout.tsx";
import About from "./pages/about.tsx";

const queryClient = new QueryClient();
export function AccessTokenProvider({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently, user } = useAuth0();

  useEffect(() => {
    if (user?.sub) {
      getAccessTokenSilently().then((token) => {
        console.log("Access token:", token);
      });
    }
  }, [user?.sub, getAccessTokenSilently]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
    >
      <AccessTokenProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Layout />} >
                <Route path="/home" element={<App />} />
                <Route path="/about" element={<About />} />
              </Route>
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </AccessTokenProvider>
    </Auth0Provider>
  </StrictMode>
);
