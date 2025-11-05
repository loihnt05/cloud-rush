import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import authConfig from "./auth-config.ts";
import Layout from "./components/layout/layout.tsx";
import About from "./pages/about.tsx";
import Flight from "./pages/Flight.tsx";
import Packages from "./pages/Packages.tsx";
import TempPackages from "./pages/tempPackages.tsx";
import PassengerInformation from "./pages/PassengerInfomation.tsx";
import Places from "./pages/Places.tsx";
import useSettingStore from "./stores/setting-store";
import "./styles/index.css";
import FlightSearch from "./pages/flight/flight-search.tsx";
import SeatSelection from "./pages/SeatSelection.tsx";
import Payment from "./pages/Payment.tsx";

const queryClient = new QueryClient();
export function AccessTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const { setAccessToken } = useSettingStore();

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      getAccessTokenSilently()
        .then((token) => {
          console.log("Access Token:", token);
          setAccessToken(token);
        })
        .catch((err) => {
          console.error("Error getting access token:", err);
          setAccessToken(null);
        });
    } else {
      setAccessToken(null);
    }
  }, [user?.sub, getAccessTokenSilently, isAuthenticated, setAccessToken]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: authConfig.audience,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
    >
      <AccessTokenProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/home" element={<App />} />
                <Route path="/flight" element={<Flight />} />
                <Route path="/about" element={<About />} />
                <Route path="/flight/search" element={<FlightSearch />} />
                <Route
                  path="/passenger-information"
                  element={<PassengerInformation />}
                />
                <Route path="/packages" element={<Packages />} />
                <Route path="/places" element={<Places />} />
                <Route path="/test" element={<TempPackages />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/seat-selection" element={<SeatSelection />} />
              </Route>
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </AccessTokenProvider>
    </Auth0Provider>
  </StrictMode>
);
