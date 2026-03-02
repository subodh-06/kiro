import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { ProjectSettingsForm } from "../../_components/project-settings-form";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = await params;
  const { projectId } = resolvedParams;

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

  return (
    <>
      {/* 🚀 2. Replaced the manual header with your clean TopNav */}
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
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your project configuration and danger zone settings.
          </p>
        </div>

        {/* Client Component handles the form and interactivity */}
        <ProjectSettingsForm project={project} orgSlug={orgSlug as string} />
      </div>
    </>
  );
}