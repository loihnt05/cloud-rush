interface AuthConfig {
  domain: string;
  clientId: string;
  audience?: string;
}

const authConfig: AuthConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
  audience: import.meta.env.VITE_AUTH0_API_AUDIENCE as string,
};

export default authConfig;
