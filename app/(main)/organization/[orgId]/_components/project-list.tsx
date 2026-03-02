import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@prisma/client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {project.key}
                </span>
            </div>
            <CardDescription className="line-clamp-2 h-10">
              {project.description || "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between text-sm text-muted-foreground border-t bg-muted/10 py-3">
            <span>
              Updated {formatDistanceToNow(new Date(project.updatedAt))} ago
            </span>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
                <Link href={`/project/${project.id}`}>
                    View Board <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}