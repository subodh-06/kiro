import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { ProjectList } from "./_components/project-list";
import UserIssues from "./_components/user-issues";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import our new TopNav
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { userId, orgId, orgSlug } = await auth(); 
  
  const resolvedParams = await params; 

  // Security Check
  if (!userId || !orgId || orgSlug !== resolvedParams.orgId) {
    return redirect("/onboarding");
  }

  // Fetch projects for this organization
  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* 🚀 2. Look how beautifully clean this header is now! */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>
                Organization Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-8 p-4 pt-6 md:p-8">
        
        {/* Page Title & Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Overview of your projects and recent activity.
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Projects Grid Container */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/10">
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-muted-foreground mb-4 text-sm max-w-sm">
                Get started by creating your first project to track issues and sprints for your organization.
              </p>
              {/* 🚀 3. Uses the Dialog here too instead of a basic link */}
              <CreateProjectDialog />
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </div>

        {/* User's Assigned Issues */}
        <div className="pt-2">
          {/* 🚀 4. Removed the duplicate heading! */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <UserIssues userId={userId} />
          </div>
        </div>
      </div>
    </>
  );
}