import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { IssueCharts } from "../../_components/issue-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CheckCircle2, ListTodo, Frame } from "lucide-react";

export default async function AnalyticsPage({
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

  // 1. Fetch grouped stats directly from the database!
  const statusGroup = await db.issue.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { id: true },
  });

  const priorityGroup = await db.issue.groupBy({
    by: ['priority'],
    where: { projectId },
    _count: { id: true },
  });

  const totalSprints = await db.sprint.count({
    where: { projectId }
  });

  // 2. Format the data for Recharts
  const statusData = statusGroup.map(item => ({
    status: item.status,
    count: item._count.id
  }));

  const priorityData = priorityGroup.map(item => ({
    priority: item.priority,
    count: item._count.id
  }));

  // 3. Calculate Quick Stats
  const totalIssues = statusData.reduce((acc, curr) => acc + curr.count, 0);
  const doneIssues = statusData.find(s => s.status === 'DONE')?.count || 0;
  const completionRate = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  return (
    <>
      {/* 🚀 2. Replaced the manual header with TopNav */}
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
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Overview of issue distribution and project velocity.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
              <ListTodo className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{doneIssues} of {totalIssues} issues completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sprints</CardTitle>
              <Frame className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSprints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Charts */}
        <IssueCharts statusData={statusData} priorityData={priorityData} />
      </div>
    </>
  );
}