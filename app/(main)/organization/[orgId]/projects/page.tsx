import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FolderKanban, LayoutDashboard, ListTodo } from "lucide-react";

export default async function ProjectsDirectoryPage({
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

  // Fetch projects WITH relationship counts for stats!
  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { 
          issues: true, 
          sprints: true 
        }
      }
    }
  });

  return (
    <>
      {/* 🚀 2. Replaced the manual header with TopNav */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>Organization</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>All Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-8 p-4 pt-6 md:p-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and access all workspaces within your organization.
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/10 h-64">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground mb-4 text-sm max-w-sm">
              You haven&apos;t created any projects yet. Get started by creating your first workspace.
            </p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {project.key}
                      </Badge>
                      <FolderKanban className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {project.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  
                  <div className="flex-1" /> 
                  
                  <CardFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between text-xs text-muted-foreground rounded-b-xl">
                    <div className="flex items-center gap-1.5">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span>{project._count.sprints} Sprints</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5" />
                      <span>{project._count.issues} Issues</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}