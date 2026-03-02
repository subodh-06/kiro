"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSprint(projectId: string, data: { name: string; startDate: Date; endDate: Date }) {
  // ... your existing createSprint logic ...
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const sprint = await db.sprint.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      projectId: projectId,
      status: "PLANNED",
    },
  });

  revalidatePath(`/project/${projectId}`);
  return { success: true, sprint };
}

// 🚀 NEW: Update Sprint Status Action
export async function updateSprintStatus(
  sprintId: string,
  newStatus: "PLANNED" | "ACTIVE" | "COMPLETED"
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint || sprint.project.organizationId !== orgId) {
    throw new Error("Sprint not found or unauthorized");
  }

  // Agile Rule: Prevent starting a sprint if another one is already active
  if (newStatus === "ACTIVE") {
    const activeSprint = await db.sprint.findFirst({
      where: { projectId: sprint.projectId, status: "ACTIVE" },
    });
    
    if (activeSprint) {
      return { success: false, error: "Another sprint is already active. Please complete it first." };
    }
  }

  const updatedSprint = await db.sprint.update({
    where: { id: sprintId },
    data: { status: newStatus },
  });

  revalidatePath(`/project/${sprint.projectId}`);
  return { success: true, sprint: updatedSprint };
}