import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Footer7 } from "./footer2";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col w-full bg-gray-400 p-5 h-full">
            <Outlet />  
        </div>
              <Footer7></Footer7>
      </SidebarInset>

    </SidebarProvider>
  );
}
