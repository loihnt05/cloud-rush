import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Outlet, useLocation} from "react-router-dom";
import Header from "./Header";
import { Footer } from "./Footer";
// import { useAuth0 } from "@auth0/auth0-react";
// import Home from "@/pages/home";
// import { useEffect } from "react";

export default function Layout() {

  // For authenticated users, show full layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar/>
        <SidebarInset>
          <Header />
          <div className="flex flex-col w-full bg-white p-5 h-full">
            <Outlet />
          </div>
          <Footer />
        </SidebarInset>
    </SidebarProvider>
  );
};
