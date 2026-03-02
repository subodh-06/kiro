import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notification-bell"; // 🚀 1. Import the Bell!

export function TopNav({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between transition-[width,height] border-b bg-background/95 backdrop-blur border-border/50 px-4">
      
      {/* Left Side: Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/* Your dynamic breadcrumbs will render here */}
        <div className="flex items-center">
          {children}
        </div>
      </div>

      {/* Right Side: Global Actions */}
      <div className="flex items-center gap-4">
        {/* 🚀 2. Drop the bell right here! */}
        <NotificationBell />
        
        {/* (Optional) If you ever want to move your Clerk <UserButton /> 
            out of the sidebar and into the top nav, it would go perfectly right here too! */}
      </div>

    </header>
  );
}