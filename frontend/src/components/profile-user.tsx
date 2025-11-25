import { useAuth0 } from "@auth0/auth0-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
  FaEnvelope,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const nav = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { logout } = useAuth0();
  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated &&
    user && (
      <Tooltip>
        {/* asChild lets the trigger use the native element (img/span) instead of Radix wrapping it */}
        <TooltipTrigger asChild>
          {isLoading ? (
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
          ) : user?.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? "Profile"}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            // fallback: initials avatar
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "U"}
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent className="mr-5 z-50" sideOffset={8}>
          <div className="bg-card border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden w-100">
            {/* Header with gradient background */}
            <div className="bg-linear-to-br from-[#07401F] via-[#224A33] to-[#357D52] p-6">
              <div className="flex items-center gap-4">
                {user?.picture ? (
                  <img
                    src={user?.picture}
                    alt={user?.name ?? "Profile"}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                      : "U"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-white text-lg mb-1">
                    {user?.name || "Guest User"}
                  </p>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <FaEnvelope className="text-xs" />
                    <p>{user?.email || "No email"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 bg-muted/30">
              <button
                onClick={() => nav("/about")}
                className="hover:cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <FaQuestionCircle className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Ask for Help</p>
                  <p className="text-xs text-muted-foreground">Get support</p>
                </div>
              </button>
              <button
                onClick={() => nav("/profile")}
                className="hover:cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <FaUser className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Profile</p>
                  <p className="text-xs text-muted-foreground">
                    View and edit your profile
                  </p>
                </div>
              </button>
            </div>

            {/* Logout Section */}
            <div className="p-3 border-t border-border">
              <button
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold transition-all duration-200"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  );
};

export default Profile;
