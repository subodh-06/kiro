"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OrgMemberSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function OrgMemberSelector({ value, onChange }: OrgMemberSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // 🚀 Fetch members from the active Clerk Organization
  const { memberships, isLoaded } = useOrganization({
    memberships: { pageSize: 100 },
  });

  if (!isLoaded) {
    return (
      <Button variant="outline" className="w-full justify-start text-muted-foreground h-12" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading team...
      </Button>
    );
  }

  // Find the currently selected member to display their name/avatar on the button
  const selectedMember = memberships?.data?.find(
    (m) => m.publicUserData?.userId === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 bg-background hover:bg-muted/50 transition-colors"
        >
          {selectedMember ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedMember.publicUserData?.imageUrl} />
                <AvatarFallback className="text-[10px]">
                  {selectedMember.publicUserData?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {selectedMember.publicUserData?.firstName} {selectedMember.publicUserData?.lastName}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground font-normal">Select a project manager...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search team members..." className="h-11" />
          <CommandList>
            <CommandEmpty>No team members found.</CommandEmpty>
            <CommandGroup>
              {memberships?.data?.map((member) => {
                const userId = member.publicUserData?.userId;
                if (!userId) return null;

                return (
                  <CommandItem
                    key={userId}
                    // We use the name as the value so the CommandInput can search by it!
                    value={`${member.publicUserData?.firstName} ${member.publicUserData?.lastName}`}
                    onSelect={() => {
                      onChange(userId);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 cursor-pointer py-3"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={member.publicUserData?.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {member.publicUserData?.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.publicUserData?.identifier}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-primary",
                        value === userId ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}