import LoginButton from "@/components/login-button";
import LogoutButton from "@/components/logout-button";
import Profile from "@/components/profile-user";
import appAxios from "@/services/AxiosClient";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { isAuthenticated } = useAuth0();
  const { data, isLoading, error } = useQuery({
    queryKey: ["pets"], 
    queryFn: async () => {
      const res = await appAxios.get("/pets/");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error instanceof Error) return <p>Error: {error.message}</p>;
  return (
    <div>
      <h1>Home Page</h1>
      <h2>Pets List</h2>
      <ul>
        {data && data.length > 0 ? (
          data.map((pet: { id: number; name: string }) => (
            <li key={pet.id}>{pet.name}</li>
          ))
        ) : (
          <li>No pets found.</li>
        )}
      </ul>
      {isAuthenticated ? (
        <div>
          <p>Welcome back!</p>
          <LogoutButton />
          <p>Your profile</p>
          <Profile />
        </div>
      ) : (
        <div>
          <p>Please log in.</p>
          <LoginButton />
        </div>
      )}

    </div>
  );
}
