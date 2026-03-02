import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { SprintBoard } from "../_components/sprint-board";
import { SprintManager } from "../_components/sprint-manager";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ProjectPage({
  params,
  searchParams, 
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ sprint?: string }>; 
}) {
  const resolvedParams = await params;
  const { projectId } = resolvedParams;
  
  // Await and extract the sprint ID from the URL (if it exists)
  const resolvedSearchParams = await searchParams;
  const selectedSprintId = resolvedSearchParams.sprint;

  const { userId, orgId, orgSlug } = await auth();
  if (!userId || !orgId) {
    return redirect("/sign-in");
  }

  const project = await db.project.findUnique({
    where: { 
      id: projectId,
      organizationId: orgId, 
    },
  });

  if (!project) return notFound();

  const sprints = await db.sprint.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  // Smart Sprint Selection Logic
  let currentSprint;
  if (selectedSprintId) {
    // If user selected a sprint via dropdown, use that one
    currentSprint = sprints.find(s => s.id === selectedSprintId);
  }
  if (!currentSprint) {
    // Fallback: Use the ACTIVE sprint, or the most recently created one
    currentSprint = sprints.find((s) => s.status === "ACTIVE") || sprints[0];
  }
  
  const issues = currentSprint 
    ? await db.issue.findMany({
        where: { 
          projectId: project.id,
          sprintId: currentSprint.id 
        },
        include: { assignee: true },
        orderBy: { order: "asc" },
      })
    : [];

  return (
    <>
      {/* 🚀 2. Look how clean the top navigation is now! */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col h-full space-y-6 p-4 md:p-8 pt-6">
        
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              Project Key: {project.key}
            </p>
          </div>
        </div>

        {/* Pass the currentSprint ID to the Manager */}
        <div className="flex items-center justify-between">
           <SprintManager 
             sprints={sprints} 
             projectId={project.id} 
             activeSprintId={currentSprint?.id} 
           />
        </div>

       <div className="flex-1 w-full overflow-x-auto pb-4">
          {currentSprint ? (
            <SprintBoard initialIssues={issues} sprintId={currentSprint.id} sprintStatus={currentSprint.status} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl bg-muted/10 p-8 text-center">
              <h3 className="text-lg font-semibold">No active sprint</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Create a sprint to start organizing your issues and tracking your project&apos;s progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}