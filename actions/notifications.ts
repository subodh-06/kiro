"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
  const { userId } = await auth();
  if (!userId) return [];

  // Get the internal database user ID using the Clerk ID
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return [];

  return await db.notification.findMany({
    where: { 
      userId: user.id,
      isRead: false 
    },
    orderBy: { createdAt: "desc" },
    take: 10, // Only fetch the 10 most recent unread
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/", "layout"); // Refresh the layout to update the bell count
}

export async function markAllAsRead() {
  const { userId } = await auth();
  if (!userId) return;

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return;

  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/", "layout");
}