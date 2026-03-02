import { Suspense } from "react";
import { getUserIssues } from "@/actions/issues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCard from "@/components/issue-card";
import type { Prisma } from "@/lib/generated/prisma/client"; // Kept your custom Prisma path
import { ListTodo } from "lucide-react";

/* ---------------- TYPES ---------------- */

type UserIssuesProps = {
  userId: string;
};

type IssueWithRelations = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
    project: true;
  };
}>;

type IssueGridProps = {
  issues: IssueWithRelations[];
};

/* ---------------- COMPONENT ---------------- */

export default async function UserIssues({ userId }: UserIssuesProps) {
  const issues: IssueWithRelations[] = await getUserIssues(userId);

  if (!issues.length) return null;

  const assignedIssues = issues.filter(
    (issue) => issue.assignee?.clerkUserId === userId
  );

  const reportedIssues = issues.filter(
    (issue) => issue.reporter.clerkUserId === userId
  );

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* 🚀 Sleek, SaaS-standard Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Tasks</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Issues assigned to you or reported by you across all workspaces.
        </p>
      </div>

      <Tabs defaultValue="assigned" className="w-full">
        {/* Added mb-6 to give the cards room to breathe */}
        <TabsList className="mb-6">
          <TabsTrigger value="assigned">Assigned to You</TabsTrigger>
          <TabsTrigger value="reported">Reported by You</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-0">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading issues...</div>}>
            <IssueGrid issues={assignedIssues} />
          </Suspense>
        </TabsContent>

        <TabsContent value="reported" className="mt-0">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading issues...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- GRID ---------------- */

function IssueGrid({ issues }: IssueGridProps) {
  // 🚀 Added a clean empty state so the UI doesn't look broken if a tab is empty
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/10 h-40">
        <ListTodo className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No issues found in this category.</p>
      </div>
    );
  }

  return (
    // Increased gap to gap-6 for better grid spacing
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {issues.map((issue) => (
        <IssueCard 
            key={issue.id} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            issue={issue as any} 
            showStatus 
          />
      ))}
    </div>
  );
}