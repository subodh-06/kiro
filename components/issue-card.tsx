"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "./user-avatar";
import { IssueDetailsDialog } from "./issue-details-dialog";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IgnoredDialog = IssueDetailsDialog as any;
// 🚀 1. Import Prisma's dynamic type generator instead of the outdated static type
import { Prisma } from "@prisma/client";

/* ---------------- TYPES ---------------- */

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// 🚀 2. Automatically generate the type straight from your active database schema!
type IssueWithRelations = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
    project: true;
  };
}>;

type IssueCardProps = {
  issue: IssueWithRelations;
  showStatus?: boolean;
  onDelete?: () => void;
  onUpdate?: (issue: IssueWithRelations) => void;
};

/* ---------------- UI ---------------- */

const priorityColor: Record<Priority, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500", 
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default function IssueCard({
  issue,
  showStatus = false,
  onDelete = () => {},
  onUpdate = () => {},
}: IssueCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onDeleteHandler = () => {
    onDelete?.();
  };

  const onUpdateHandler = (updated: IssueWithRelations) => {
    onUpdate?.(updated);
  };

  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        onClick={() => setIsDialogOpen(true)}
        className={`
          cursor-pointer
          bg-card
          border border-border hover:border-primary/50
          rounded-xl
          transition-all duration-300
          hover:shadow-md
          hover:-translate-y-1
          group
          overflow-hidden
        `}
      >
        <div
          className={`h-1.5 w-full ${priorityColor[issue.priority]} transition-all group-hover:h-2`}
        />

        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold tracking-wide text-foreground line-clamp-2 transition-colors">
            {issue.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-2 px-4 pb-3 flex-wrap">
          {showStatus && (
            <Badge variant="secondary" className="text-xs font-medium">
              {issue.status}
            </Badge>
          )}

          <Badge
            variant="outline"
            className="text-xs font-medium"
          >
            {issue.priority}
          </Badge>
          
          {issue.dueDate && (
            <Badge variant="outline" className="text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
          <UserAvatar user={issue.assignee ?? undefined} />

          <span className="text-[11px] text-muted-foreground font-medium">
            {created}
          </span>
        </CardFooter>
      </Card>

  {isDialogOpen && (
        <IgnoredDialog
          onClose={() => setIsDialogOpen(false)}
          issue={issue as any} 
          onDelete={onDeleteHandler}
          onUpdate={onUpdateHandler}
          borderCol={priorityColor[issue.priority]}
        />
      )}
    </>
  );
}