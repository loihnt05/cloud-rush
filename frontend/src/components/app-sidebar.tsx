"use client";

import { useAuth0 } from "@auth0/auth0-react";
import {
  ChartLine,
  Compass,
  Inbox,
  Package,
  Plane,
  Ticket,
} from "lucide-react";
import * as React from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import Profile from "./profile-user";
import { Button } from "./ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  // Check if user has admin role
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    const userWithRoles = user as Record<string, unknown>;
    const roles =
      (userWithRoles["http://localhost:8000/roles"] as string[]) || [];
    return roles.includes("admin");
  }, [user]);

  // Build navigation items based on user role
  const navMainItems = React.useMemo(() => {
    const baseItems = [
      {
        title: "Flight",
        url: "/flight",
        icon: Plane,
      },
      {
        title: "Packages",
        url: "/packages",
        icon: Package,
      },
      {
        title: "Explore",
        url: "/explore",
        icon: Compass,
      },
      {
        title: "My Bookings",
        url: "/my-bookings",
        icon: Ticket,
      },
      {
        title: "My Service Bookings",
        url: "/my-service-bookings",
        icon: Ticket,
      },
      {
        title: "About",
        url: "/about",
        icon: Inbox,
      },
    ];

    // Add admin-only items
    if (isAdmin) {
      baseItems.push({
        title: "Revenue Forecasting",
        url: "/admin/revenue-forecasting",
        icon: ChartLine,
      });
    }

    return baseItems;
  }, [isAdmin]);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex flex-row items-center gap-5 mt-1 ">
          <Button
            className="w-12 h-12 flex items-center rounded-full p-0 cursor-pointer group-data-[collabisble=icon]:justify-center"
            variant={"outline"}
            onClick={() => navigate("/flight")}
          >
            <img
              src="https://pub-08202a6e0a0e4f88a0b3f667d3b8ff4d.r2.dev/Gemini_Generated_Image_rwuccfrwuccfrwuc.png"
              alt="CloudRush Logo"
              className="w-12 h-12 rounded-full"
            />
          </Button>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sidebar-foreground">CloudRush</p>
            <p className="text-xs text-muted-foreground">Time to travel</p>
          </div>
        </div>

        {/* Navigation Items */}
        <NavMain items={navMainItems} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-2 border-t border-sidebar-border">
            <span className="text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Theme
            </span>
            <ModeToggle />
          </div>

          {/* User Profile */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 p-2 border-t border-sidebar-border group-data-[collapsible=icon]:justify-center">
              <Profile />
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
