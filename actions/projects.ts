"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma"; // Assuming your Prisma client is exported as 'db' from here
import { revalidatePath } from "next/cache";


// Define the expected input based on our zod schema from Step 3
interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  orgId: string;
}

export async function createProject(data: CreateProjectInput) {
  try {
    const { userId, orgId } = await auth();

    // 1. Security Check: Ensure the user is logged in and matches the org
    if (!userId || !orgId) {
      throw new Error("Unauthorized. You must be logged in to an organization.");
    }

    if (orgId !== data.orgId) {
      throw new Error("Organization mismatch.");
    }

    // 2. Data Validation: Ensure required fields are present
    if (!data.name || !data.key) {
      throw new Error("Project name and key are required.");
    }

    // 3. Database Write: Create the project in NeonDB
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
        adminIds: [userId], // Automatically set the creator as an admin
      },
    });

    // 4. Cache Invalidation: Tell Next.js to refresh the organization dashboard
    revalidatePath(`/organization/${orgId}`);

    // Return plain data (not the full Prisma object) to the client
    return { 
      success: true, 
      projectId: project.id 
    };

  } catch (error: unknown) {
    console.error("Failed to create project:", error);
    // Return a safe error message to the client
     if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }
   return {
    success: false,
    error: "An unexpected error occurred.",
  };
  }
}

export async function updateProject(
  projectId: string,
  data: { name: string; key: string; description?: string }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  // Verify the project belongs to this organization before updating
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found or unauthorized");
  }

  const updatedProject = await db.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      key: data.key,
      description: data.description,
    },
  });

  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/organization/${orgId}/projects`);
  
  return { success: true, project: updatedProject };
}

export async function deleteProject(projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found or unauthorized");
  }

  // Prisma will cascade delete all sprints and issues linked to this project 
  // because we set onDelete: Cascade in the schema!
  await db.project.delete({
    where: { id: projectId },
  });

  revalidatePath(`/organization/${orgId}`);
  revalidatePath(`/organization/${orgId}/projects`);
  
  return { success: true };
}

