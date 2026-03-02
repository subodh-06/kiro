"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProject, deleteProject } from "@/actions/projects";
import { Project } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  key: z.string().min(2, "Project key must be at least 2 characters.").max(10).toUpperCase(),
  description: z.string().optional(),
});

export function ProjectSettingsForm({ project, orgSlug }: { project: Project, orgSlug: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof projectSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(projectSchema as any),
    defaultValues: {
      name: project.name,
      key: project.key,
      description: project.description || "",
    },
  });

  const onUpdate = async (values: z.infer<typeof projectSchema>) => {
    setIsUpdating(true);
    try {
      const res = await updateProject(project.id, values);
      if (res.success) {
        alert("Project updated successfully!");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update project.");
    } finally {
      setIsUpdating(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProject(project.id);
      if (res.success) {
        // Redirect back to the organization projects directory
        router.push(`/organization/${orgSlug}/projects`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete project.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Update Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Update your project&apos;s name, key, and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="key" render={({ field }) => (
                <FormItem><FormLabel>Project Key</FormLabel><FormControl><Input {...field} maxLength={10} /></FormControl>
                  <FormDescription>Used as the prefix for all issues (e.g., INFL-1).</FormDescription><FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all of its sprints, issues, and data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  <span className="font-bold text-foreground mx-1">{project.name}</span> 
                  project and wipe all its data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes, delete project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}