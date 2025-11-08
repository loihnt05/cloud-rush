import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Footer7 } from "./footer2";

export default function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-[#07401F]">Cloud Rush</span>
          </div>
        </header>
        <div className="flex flex-col w-full bg-white p-5 h-full">
            <Outlet />  
        </div>

        <Footer7 />
      </SidebarInset>
    </SidebarProvider>
  );
}
