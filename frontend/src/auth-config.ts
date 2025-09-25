interface AuthConfig {
  domain: string;
  clientId: string;
  audience: string;
}

const authConfig: AuthConfig = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN as string,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID as string,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE as string,
};

export default authConfig;
