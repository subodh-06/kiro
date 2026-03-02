"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUnreadNotifications, markNotificationAsRead, markAllAsRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: Date;
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications when the component loads
  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await getUnreadNotifications();
      setNotifications(data);
    };
    fetchNotifs();
    
    // Optional: Set up a simple polling interval to check for new notifications every minute
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id: string, link: string | null) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await markNotificationAsRead(id);
    
    setIsOpen(false);
    if (link) {
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    await markAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {notifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary">
              <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground space-y-3">
              <Bell className="h-8 w-8 opacity-20" />
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="flex flex-col gap-1 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleRead(notif.id, notif.link)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-foreground">{notif.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}