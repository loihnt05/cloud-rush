import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import authConfig from "./auth-config.ts";
import Layout from "./components/layout/layout.tsx";
import About from "./pages/about.tsx";
import BookingDetails from "./pages/booking-details.tsx";
import ETicket from "./pages/e-ticket.tsx";
import Explore from "./pages/explore.tsx";
import FlightSearch from "./pages/flight/flight-search.tsx";
import Flight from "./pages/flight/flight.tsx";
import MyBookings from "./pages/my-bookings.tsx";
import PassengerInformation from "./pages/passenger-infomation.tsx";
import Payment from "./pages/payment.tsx";
import SeatSelection from "./pages/seat-selection.tsx";
import CarRentals from "./pages/services/car-rental.tsx";
import Hotels from "./pages/services/hotels.tsx";
import Packages from "./pages/services/packages.tsx";
import Places from "./pages/services/places.tsx";
import TempPackages from "./pages/tempPackages.tsx";
import useSettingStore from "./stores/setting-store";
import "./styles/index.css";

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
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/flight" element={<Flight />} />
                <Route path="/about" element={<About />} />
                <Route path="/flights/search" element={<FlightSearch />} />
                <Route
                  path="/passenger-information"
                  element={<PassengerInformation />}
                />
                <Route path="/packages" element={<Packages />} />
                <Route path="/places" element={<Places />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/test" element={<TempPackages />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route
                  path="/my-bookings/:bookingId"
                  element={<BookingDetails />}
                />
                <Route path="/e-ticket/:bookingId" element={<ETicket />} />
                <Route
                  path="/flights/seat-selection"
                  element={<SeatSelection />}
                />

                <Route path="/car-rentals" element={<CarRentals />} />
                <Route path="/hotels" element={<Hotels />} />
              </Route>
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </AccessTokenProvider>
    </Auth0Provider>
  </StrictMode>
);
