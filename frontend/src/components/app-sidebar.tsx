"use client";

import * as React from "react";
import {
  Plane,
  Package,
  MapPin,
  Home,
  Calendar,
  Settings2,
  MessageCircleQuestion,
  Search,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import Profile from "@/components/profile-user";
import LoginButton from "@/components/login-button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

// Navigation data
const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
      isActive: false,
    },
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
  ],
  // navSecondary: [
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: Search,
  //   },
  //   {
  //     title: "Calendar",
  //     url: "#",
  //     icon: Calendar,
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: Settings2,
  //   },
  //   {
  //     title: "Help",
  //     url: "#",
  //     icon: MessageCircleQuestion,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth0();

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-sidebar-border">
          <Link to="/home" className="flex items-center gap-3 group">
            <img 
              src="https://pub-08202a6e0a0e4f88a0b3f667d3b8ff4d.r2.dev/Gemini_Generated_Image_rwuccfrwuccfrwuc.png" 
              alt="Cloud Rush Logo" 
              className="w-10 h-10 rounded-full overflow-hidden transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-bold text-sidebar-foreground">Cloud Rush</span>
              <span className="text-xs text-muted-foreground">Travel with us</span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <NavMain items={data.navMain} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Secondary Navigation */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      {/* User Profile/Login at Footer */}
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
          ) : (
            <div className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <LoginButton />
            </div>
          )}
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
