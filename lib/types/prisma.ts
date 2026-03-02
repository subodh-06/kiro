import type { Prisma } from "@/lib/generated/prisma/client";

/* ---------- SHARED PRISMA TYPES ---------- */

export type IssueWithAssignee = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
  };
}>;

export type IssueWithRelations = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
  };
}>;

export type UserBasic = Prisma.UserGetPayload<Record<string, never>>;
export type UserMinimal = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    imageUrl: true;
  };
}>;
export type IssueFull = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    reporter: true;
    project: true;
    sprint: true;
  };
}>;


export type Project = Prisma.ProjectGetPayload<Record<string, never>>;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    issues: true;
    sprints: true;
  };
}>;