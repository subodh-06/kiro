import { checkUser } from "@/lib/checkUser";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar"; 

export default async function Layout({ children }: { children: React.ReactNode }) {
  // 🚀 Force Next.js to check Clerk and sync the user to NeonDB
  await checkUser();

  return (
    <SidebarProvider>
      {/* Render the Global Sidebar */}
      <AppSidebar />

      {/* 🚀 SidebarInset automatically handles the resizing and main content wrapper! */}
      <SidebarInset className="w-full min-w-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}