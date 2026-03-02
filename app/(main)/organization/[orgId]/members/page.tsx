import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomMembersUI } from "./_components/custom-members-ui";
import { TopNav } from "@/components/top-nav"; // 🚀 1. Import TopNav
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { userId, orgId, orgSlug } = await auth(); 
  const resolvedParams = await params; 

  if (!userId || !orgId || orgSlug !== resolvedParams.orgId) {
    return redirect("/onboarding");
  }

  return (
    <>
      {/* 🚀 2. Look how clean the navigation is now! */}
      <TopNav>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/organization/${orgSlug}`}>Organization</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Members</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </TopNav>

      <div className="flex flex-1 flex-col p-4 md:p-8 pt-6">
        {/* Render our custom UI instead of Clerk's widget */}
        <CustomMembersUI />
      </div>
    </>
  );
}