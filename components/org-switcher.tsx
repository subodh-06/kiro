"use client";

// import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";

export function OrgSwitcher() {
  // const pathname = usePathname();

  return (
    <OrganizationSwitcher
      hidePersonal
      afterCreateOrganizationUrl="/project/create"
      afterSelectOrganizationUrl="/organization/:slug"
      afterLeaveOrganizationUrl="/onboarding"
      appearance={{
        elements: {
          rootBox: "flex items-center justify-center",
          organizationSwitcherTrigger:
            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors",
        },
      }}
    />
  );
}