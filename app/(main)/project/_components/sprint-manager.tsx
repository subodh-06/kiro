"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprint } from "@prisma/client";
import { CreateSprint } from "./create-sprint";
import { CreateIssue } from "./create-issue";
import { updateSprintStatus } from "@/actions/sprints"; // 🚀 Import the action
import { Play, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SprintManagerProps {
  sprints: Sprint[];
  projectId: string;
  activeSprintId?: string;
}

export function SprintManager({ sprints, projectId, activeSprintId }: SprintManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(false);

  const activeSprint = sprints.find(s => s.id === activeSprintId);

  const handleSprintChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sprint", value);
    router.push(`/project/${projectId}?${params.toString()}`);
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "COMPLETED") => {
    if (!activeSprintId) return;
    
    setIsUpdating(true);
    try {
      const result = await updateSprintStatus(activeSprintId, newStatus);
      if (!result.success) {
        // You can replace this with a proper toast notification library like sonner
        alert(result.error); 
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update sprint status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to get nice badge colors based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default"; // Usually primary color
      case "COMPLETED": return "outline";
      default: return "secondary"; // PLANNED
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Sprint Selector & Badge */}
      <div className="flex items-center gap-3">
        {sprints.length > 0 ? (
          <>
            <Select value={activeSprintId} onValueChange={handleSprintChange}>
              <SelectTrigger className="w-[250px] font-semibold text-lg bg-transparent border-none shadow-none focus:ring-0 px-0 hover:bg-muted/50 transition-colors">
                <SelectValue placeholder="Select a sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeSprint && (
              <Badge variant={getBadgeVariant(activeSprint.status)}>
                {activeSprint.status}
              </Badge>
            )}
          </>
        ) : (
          <h2 className="text-lg font-semibold text-muted-foreground">Sprint Planning</h2>
        )}
      </div>

    {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Dynamic Status Button */}
        {activeSprint?.status === "PLANNED" && (
          <Button 
            onClick={() => handleStatusChange("ACTIVE")} 
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            {isUpdating ? "Starting..." : "Start Sprint"}
          </Button>
        )}
        
        {activeSprint?.status === "ACTIVE" && (
          <Button 
            onClick={() => handleStatusChange("COMPLETED")} 
            disabled={isUpdating}
            variant="destructive"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isUpdating ? "Completing..." : "Complete Sprint"}
          </Button>
        )}

        <CreateSprint projectId={projectId} />

        {/* 🚀 NEW: Only show 'Create Issue' if the sprint is NOT completed */}
        {activeSprint?.status !== "COMPLETED" && (
          <CreateIssue projectId={projectId} activeSprintId={activeSprintId} />
        )}
      </div>
    </div>
  );
}