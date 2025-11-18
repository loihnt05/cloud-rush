"use client";

import * as React from "react";
import {
  Plane,
  Package,
  MapPin,
  Compass,
  Ticket,
  Inbox,
  ChartLine,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Profile from "./profile-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth0();
  
  // Check if user has admin role
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    const userWithRoles = user as Record<string, unknown>;
    const roles = (userWithRoles["http://localhost:8000/roles"] as string[]) || [];
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
        title: "Places",
        url: "/places",
        icon: MapPin,
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
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 px-2 py-4 border-b border-sidebar-border group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-sky-500 to-blue-600 shrink-0">
            <img
              src="https://pub-08202a6e0a0e4f88a0b3f667d3b8ff4d.r2.dev/Gemini_Generated_Image_rwuccfrwuccfrwuc.png"
              alt="CloudRush Logo"
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-bold bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              CloudRush
            </h1>
            <p className="text-xs text-muted-foreground">Travel Management</p>
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
        <div className="flex items-center gap-2 p-2 border-t border-sidebar-border group-data-[collapsible=icon]:justify-center">
          {isAuthenticated ? (
            <>
              <Profile />
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
            </>
            ):(
              <div></div>
            )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
