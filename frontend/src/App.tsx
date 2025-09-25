import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/home';

function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((token) => {
        localStorage.setItem('access_token', token);
      });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  
  return <Home />;
}

export default App
