import LoginButton from "@/components/login-button";
import LogoutButton from "@/components/logout-button";
import Profile from "@/components/profile-user";
import { useAuth0 } from "@auth0/auth0-react";

export default function About() {
  const { isAuthenticated } = useAuth0();
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome back!</p>
          <LogoutButton />
          <p>Your profile US</p>
          <Profile />
        </div>
      ) : (
        <div>
          <p>Please log in.</p>
          <LoginButton />
        </div>
      )}
    </div>
  )
}
