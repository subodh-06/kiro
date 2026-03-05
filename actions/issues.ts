"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { IssueStatus, IssuePriority } from "@prisma/client";
import { revalidatePath } from "next/cache";

/* ---------------- TYPES ---------------- */
type CreateIssueInput = {
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  sprintId?: string | null;
  assigneeId?: string | null;
  dueDate?: string;
};

type UpdatedIssueOrder = {
  id: string;
  status: IssueStatus;
  order: number;
};

/* ---------------- ACTIONS ---------------- */

export async function getIssuesForSprint(sprintId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function updateIssueOrder(
  updatedIssues: UpdatedIssueOrder[]
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // 🚀 NEW: Security Check - Prevent moving issues in a completed sprint
  if (updatedIssues.length > 0) {
    const firstIssue = await db.issue.findUnique({
      where: { id: updatedIssues[0].id },
      include: { sprint: true }
    });

    if (firstIssue?.sprint?.status === "COMPLETED") {
      throw new Error("Cannot move issues in a completed sprint.");
    }
  }

  await Promise.all(
    updatedIssues.map((issue) =>
      db.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      })
    )
  );

  return { success: true };
}


export async function deleteIssue(issueId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (
    issue.reporterId !== user.id &&
    !issue.project.adminIds.includes(user.id)
  ) {
    throw new Error("You don't have permission to delete this issue");
  }

  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

export async function updateIssue(
  issueId: string,
  data: {
    title?: string;
    description?: string;
    priority?: IssuePriority; // 🚀 FIXED: Replaced 'any' with the proper Prisma Enum
    assigneeId?: string | null;
    dueDate?: string | null;
    sprintId?: string | null;
  }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue || issue.project.organizationId !== orgId) {
    throw new Error("Issue not found or unauthorized");
  }

  // Safely look up the new assignee's database ID using their Clerk ID
  let dbAssigneeId: string | null | undefined = undefined;
  if (data.assigneeId !== undefined) {
    if (data.assigneeId === "unassigned" || data.assigneeId === null) {
      dbAssigneeId = null;
    } else {
      const assigneeUser = await db.user.findUnique({
        where: { clerkUserId: data.assigneeId },
      });
      dbAssigneeId = assigneeUser?.id || null;
    }
  }
  const existingIssue = await db.issue.findUnique({ where: { id: issueId } });
  
  const updatedIssue = await db.issue.update({
    where: { id: issueId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority && { priority: data.priority }),
      ...(dbAssigneeId !== undefined && { assigneeId: dbAssigneeId }),
      ...(data.dueDate !== undefined && { 
        dueDate: data.dueDate ? new Date(data.dueDate) : null 
      }),
      ...(data.sprintId !== undefined && { sprintId: data.sprintId }),
    },
  });
  
  if (dbAssigneeId && existingIssue?.assigneeId !== dbAssigneeId) {
    await db.notification.create({
      data: {
        userId: dbAssigneeId,
        title: "Task Assigned to You",
        message: `You are now the owner of: ${updatedIssue.title}`,
        link: `/project/${updatedIssue.projectId}`,
      }
    });
  }

  revalidatePath(`/project/${issue.projectId}`);
  revalidatePath(`/project/${issue.projectId}/backlog`);
  return updatedIssue;
}

export async function getUserIssues(userId: string){
  const {orgId} = await auth();

  if(!orgId || !userId){
    throw new Error("Unauthorized");
  }
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if(!user){
    throw new Error("User not found");
  }

  const issues = await db.issue.findMany({
    where: {
      OR : [
        { assigneeId: user.id },
        { reporterId: user.id },
      ],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: {
      updatedAt: "desc",
    }
  });
  return issues;
}

export async function createIssue(
  projectId: string,
  data: CreateIssueInput
) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  if (data.sprintId) {
    const sprint = await db.sprint.findUnique({
      where: { id: data.sprintId },
    });
    if (sprint && sprint.status === "COMPLETED") {
      throw new Error("Cannot add new issues to a completed sprint.");
    }
  }

  // Look up the assignee's database ID using their Clerk ID
  let dbAssigneeId = null;
  if (data.assigneeId && data.assigneeId !== "unassigned") {
    const assigneeUser = await db.user.findUnique({
      where: { clerkUserId: data.assigneeId },
    });
    if (assigneeUser) {
      dbAssigneeId = assigneeUser.id;
    }
  }

  const issueStatus = data.status || "TODO";

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: issueStatus },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1000 : 1000;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: issueStatus, 
      priority: data.priority,
      projectId,
      sprintId: data.sprintId ?? null,
      reporterId: user.id,
      assigneeId: dbAssigneeId, 
      order: newOrder,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });
  
  if (dbAssigneeId) {
      await db.notification.create({
        data: {
          userId: dbAssigneeId,
          title: "New Task Assigned",
          message: `You have been assigned to: ${issue.title}`,
          link: `/project/${issue.projectId}`, 
        }
      });
    }

  revalidatePath(`/project/${projectId}`);

  return issue;
}