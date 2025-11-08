import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import Flight from "./pages/flight/flight";

function App() {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then((token) => {
          localStorage.setItem("access_token", token);
        })
        .catch((err) => {
          // Dev-friendly diagnostics when token acquisition fails
          // Keep this non-blocking but surface details in console and localStorage for quick inspection
          console.error("Failed to get access token silently", err);
          try {
            localStorage.setItem(
              "auth_error",
              JSON.stringify({
                message: err?.message ?? String(err),
                stack: err?.stack,
              })
            );
          } catch (e) {
            // ignore storage errors
            console.error("Failed to store auth error in localStorage", e);
          }
        });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return (
      <div>
        <h1>Authentication Error</h1>
        <p>{error.message}</p>
        <details style={{ whiteSpace: "pre-wrap" }}>
          <summary>Raw error (click to expand)</summary>
          <pre>
            {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
          </pre>
        </details>
        <p>Please check your Auth0 configuration.</p>
      </div>
    );
  }

  return <Flight />;
}

export default App;
