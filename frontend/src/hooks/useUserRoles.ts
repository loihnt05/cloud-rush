import { useAuth0 } from "@auth0/auth0-react";

/**
 * Hook to extract and check user roles from Auth0 token
 */
export function useUserRoles() {
  const { user } = useAuth0();

  // Extract roles from Auth0 user object
  const userWithRoles = user as Record<string, unknown>;
  const roles = (userWithRoles?.["http://localhost:8000/roles"] as string[]) || [];

  return {
    roles,
    isAdmin: roles.includes("admin"),
    isAgent: roles.includes("agent"),
    isAgentOrAdmin: roles.includes("agent") || roles.includes("admin"),
  };
}
