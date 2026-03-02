"use client";
import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt } from "lucide-react";
import React from "react";

const UserMenu = () => {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonBox:
            "hover:bg-slate-700/50 rounded-lg transition-all duration-200",
          userButtonTrigger:
            "focus:shadow-lg focus:shadow-blue-500/30 rounded-lg",
          userButtonPopoverCard:
            "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700 shadow-xl shadow-slate-950/50",
          userPreviewMainIdentifier: "font-semibold text-white",
          userPreviewSecondaryIdentifier: "text-slate-300",
          avatarBox:
            "h-10 w-10 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/50",
          userButtonPopoverFooter: "border-t border-slate-700 bg-slate-900/50",
          dividerLine: "bg-slate-700/50",
          menuItem:
            "text-white hover:text-white hover:bg-blue-500/10 transition-all duration-200 font-medium rounded-md",
          menuItemIcon: "text-blue-400",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Organizations"
          labelIcon={
            <ChartNoAxesGantt size={16} className="text-blue-400" />
          }
          href="/organizations"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserMenu;