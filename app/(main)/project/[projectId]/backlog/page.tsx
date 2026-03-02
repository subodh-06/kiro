import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { CreateIssue } from "../../_components/create-issue";
import { SprintAssigner } from "../../_components/sprint-assigner";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ListTodo } from "lucide-react";

export default async function BacklogPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = await params;
  const { projectId } = resolvedParams;

  const { userId, orgId, orgSlug } = await auth();
  if (!userId || !orgId) return redirect("/sign-in");

  const project = await db.project.findUnique({
    where: { id: projectId, organizationId: orgId },
  });

  if (!project) return notFound();

  // Fetch Backlog Issues
  const backlogIssues = await db.issue.findMany({
    where: { projectId: project.id, sprintId: null },
    include: { assignee: true },
    orderBy: { createdAt: "desc" }, 
  });

  // Fetch available sprints (Only Active or Planned, never Completed)
  const availableSprints = await db.sprint.findMany({
    where: { 
      projectId: project.id,
      status: { in: ["PLANNED", "ACTIVE"] } 
    },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* 🚀 2. Look how minimal the top nav is now! */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/project/${project.id}`}>{project.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Backlog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backlog</h1>
            <p className="text-muted-foreground mt-1 text-sm">Plan and prioritize your upcoming work.</p>
          </div>
          <CreateIssue projectId={project.id} />
        </div>

        <div className="flex flex-col gap-2">
          {backlogIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/10">
              <ListTodo className="h-10 w-10 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Your backlog is empty</h3>
              <p className="text-muted-foreground mb-4 text-sm max-w-sm">
                Add issues here to plan your future sprints and track upcoming features.
              </p>
            </div>
          ) : (
            backlogIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* 🚀 Removed the long ID substring here, but you can add it back if you prefer */}
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">{issue.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="font-medium hidden sm:inline-flex">{issue.priority}</Badge>

                  <SprintAssigner issueId={issue.id} sprints={availableSprints} />

                  <div className="w-8 flex justify-end">
                    {issue.assignee?.name ? (
                      <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0" title={issue.assignee.name}>
                        {issue.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border border-dashed flex items-center justify-center shrink-0" title="Unassigned">
                        <span className="text-[10px] text-muted-foreground">?</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </>
  );
}