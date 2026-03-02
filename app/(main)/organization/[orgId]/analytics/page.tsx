import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { IssueCharts } from "../../../project/_components/issue-charts"; // Reusing our awesome charts!
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CheckCircle2, ListTodo, FolderKanban, ShieldAlert } from "lucide-react";

export default async function OrganizationAnalyticsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const resolvedParams = await params;

  // Extract orgRole to verify admin status
  const { userId, orgId, orgSlug, orgRole } = await auth();

  if (!userId || !orgId || orgSlug !== resolvedParams.orgId) {
    return redirect("/onboarding");
  }

  // Security Check: Block non-admins!
  if (orgRole !== "org:admin") {
    return (
      <>
        {/* 🚀 2. Clean TopNav for the Access Denied state */}
        <TopNav>
          <span className="font-semibold text-sm">Access Denied</span>
        </TopNav>
        
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4 opacity-80" />
          <h2 className="text-2xl font-bold tracking-tight">Admin Access Required</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Only organization administrators can view org-wide analytics. If you need access, please contact your workspace owner.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/organization/${orgSlug}`}>Return to Dashboard</Link>
          </Button>
        </div>
      </>
    );
  }

  // Fetch Org-Wide Data
  const statusGroup = await db.issue.groupBy({
    by: ['status'],
    where: {
      project: { organizationId: orgId }
    },
    _count: { id: true },
  });

  const priorityGroup = await db.issue.groupBy({
    by: ['priority'],
    where: {
      project: { organizationId: orgId }
    },
    _count: { id: true },
  });

  const totalProjects = await db.project.count({
    where: { organizationId: orgId }
  });

  // Format the data for Recharts
  const statusData = statusGroup.map(item => ({
    status: item.status,
    count: item._count.id
  }));

  const priorityData = priorityGroup.map(item => ({
    priority: item.priority,
    count: item._count.id
  }));

  // Calculate Quick Stats
  const totalIssues = statusData.reduce((acc, curr) => acc + curr.count, 0);
  const doneIssues = statusData.find(s => s.status === 'DONE')?.count || 0;
  const completionRate = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  return (
    <>
      {/* 🚀 3. Clean TopNav for the Main Analytics state */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>Organization</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            High-level overview of all projects and issues across your entire workspace.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <FolderKanban className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues (All Projects)</CardTitle>
              <ListTodo className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Org Completion Rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{doneIssues} of {totalIssues} issues completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Reusing our charts from the project level! */}
        {totalIssues > 0 ? (
          <IssueCharts statusData={statusData} priorityData={priorityData} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/10 mt-6">
            <h3 className="text-lg font-semibold">No data available</h3>
            <p className="text-muted-foreground text-sm mt-1">Create projects and issues to see your analytics.</p>
          </div>
        )}
      </div>
    </>
  );
}