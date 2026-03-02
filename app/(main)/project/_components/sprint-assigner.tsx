"use client";

import { useState } from "react";
import { updateIssue } from "@/actions/issues";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function SprintAssigner({ 
  issueId, 
  sprints 
}: { 
  issueId: string;
  sprints: { id: string; name: string }[];
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAssign = async (sprintId: string) => {
    setIsUpdating(true);
    try {
      await updateIssue(issueId, { sprintId });
    } catch (error) {
      console.error(error);
      alert("Failed to assign sprint.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (sprints.length === 0) {
    return <span className="text-xs text-muted-foreground italic">No active sprints</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      <Select onValueChange={handleAssign} disabled={isUpdating}>
        <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/30">
          <SelectValue placeholder="Add to Sprint" />
        </SelectTrigger>
        <SelectContent>
          {sprints.map((s) => (
            <SelectItem key={s.id} value={s.id} className="text-xs">
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}