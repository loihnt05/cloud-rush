import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Footer } from "./footer";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
        <SidebarInset>
          <div className="flex flex-col w-full bg-white p-5 h-full">
            <Outlet />
          </div>
          <Footer />
        </SidebarInset>
    </SidebarProvider>
  );
};
