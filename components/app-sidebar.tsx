"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Frame,
  PieChart,
  Settings2,
  House,
  FolderKanban,
  ShieldHalf
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { NavBrand } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Import Clerk Hooks
import { useUser, useOrganization } from "@clerk/nextjs"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { organization } = useOrganization()

  const pathname = usePathname()
  const isProjectRoute = pathname.startsWith("/project/")
  const projectId = isProjectRoute ? pathname.split("/")[2] : null

  

  // 2. Define your main navigation (Dynamic based on organization)
  // ... (inside your AppSidebar component)

  const navMain = [
    {
      title: "Dashboard",
      url: organization ? `/organization/${organization.slug}` : "/onboarding",
      icon: House,
      // Exact match so it doesn't stay highlighted when you go to /projects or /members
      isActive: pathname === (organization ? `/organization/${organization.slug}` : "/onboarding"),
    },
    {
      title: "Projects",
      url: organization ? `/organization/${organization.slug}/projects` : "#",
      icon: FolderKanban,
      // Highlights if the URL contains "/projects"
      isActive: pathname.includes("/projects"),
    },
    {
      title: "Analytics",
  url: organization ? `/organization/${organization.slug}/analytics` : "#",
      icon: BookOpen,
     isActive: pathname === `/organization/${organization?.slug}/analytics`,
    },
    {
      title: "Members",
      url: organization ? `/organization/${organization.slug}/members` : "#",
      icon: ShieldHalf,
      isActive: pathname.includes("/members"),
    },
  ];

  const projects = [
    {
      name: "Current Sprint",
      url: projectId ? `/project/${projectId}` : "#",
      icon: Frame,
      // Exact match for the project root
      isActive: pathname === `/project/${projectId}`,
    },
    {
      name: "Backlog",
      url: projectId ? `/project/${projectId}/backlog` : "#",
      icon: PieChart,
      isActive: pathname === `/project/${projectId}/backlog`,
    },
    {
      name: "Analytics",
      url: projectId ? `/project/${projectId}/analytics` : "#", 
      icon: BookOpen,
      isActive: pathname === `/project/${projectId}/analytics`,
    },
    {
      name: "Settings",
      url: projectId ? `/project/${projectId}/settings` : "#",
      icon: Settings2,
      isActive: pathname === `/project/${projectId}/settings`,
    },
  ];

  // Avoid rendering the sidebar if Clerk hasn't loaded yet
  if (!user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* You can pass the organization data to NavBrand here */}
        <NavBrand />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        {projectId && <NavProjects projects={projects} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}