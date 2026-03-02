import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Prisma } from "@/lib/generated/prisma/client";

/* ---------------- TYPES ---------------- */

type AvatarUser = Prisma.UserGetPayload<Record<string, never>>;

/* ---------------- COMPONENT ---------------- */
                        
const UserAvatar = ({ user }: { user?: AvatarUser | null }) => {
  return (
    <div className="flex items-center space-x-2 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={user?.imageUrl ?? undefined}
          alt={user?.name ?? "User"}
        />
        <AvatarFallback className="capitalize">
          {user?.name?.[0] ?? "?"}
        </AvatarFallback>
      </Avatar>

      <span className="text-xs text-slate-300">
        {user?.name ?? "Unassigned"}
      </span>
    </div>
  );
};

export default UserAvatar;
    