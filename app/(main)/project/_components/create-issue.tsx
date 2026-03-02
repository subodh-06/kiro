"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createIssue } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const issueSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().optional(), 
  dueDate: z.string().optional(),    
});

export function CreateIssue({ projectId, activeSprintId }: { projectId: string, activeSprintId?: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { memberships } = useOrganization({
    memberships: {
      pageSize: 100, 
    },
  });

  const form = useForm<z.infer<typeof issueSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(issueSchema as any),
    defaultValues: { title: "", description: "", priority: "MEDIUM", assigneeId: "", dueDate: "" },
  });

  const onSubmit = async (values: z.infer<typeof issueSchema>) => {
    setIsLoading(true);
    try {
      await createIssue(projectId, {
        title: values.title,
        description: values.description,
        priority: values.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        
        // 🚀 FIX 1: Tell the backend this is a new "TODO" item!
        status: "TODO", 

        // 🚀 FIX 2: Prevent sending the literal string "unassigned" to the database
        assigneeId: values.assigneeId === "unassigned" ? undefined : values.assigneeId,
        
        // 🚀 FIX 3: Ensure date gets sent properly
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined, 
        
        sprintId: activeSprintId,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="What needs to be done?" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Add details..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="assigneeId" render={({ field }) => (
                <FormItem><FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {memberships?.data?.map((member) => (
                        // 🚀 FIX 4: Added ?. to publicUserData so TypeScript doesn't panic
                        <SelectItem key={member.id} value={member.publicUserData?.userId || ""}>
                          {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem><FormLabel>Due Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Issue"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}