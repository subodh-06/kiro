"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { updateIssue } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditIssueDialog({ 
  issue, 
  isOpen, 
  onClose 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  issue: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { memberships } = useOrganization({ memberships: { pageSize: 100 } });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "unassigned",
      dueDate: "",
    },
  });

  // Pre-fill the form when the modal opens
  useEffect(() => {
    if (issue) {
      form.reset({
        title: issue.title || "",
        description: issue.description || "",
        priority: issue.priority || "MEDIUM",
        assigneeId: issue.assignee?.clerkUserId || "unassigned",
        dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : "",
      });
    }
  }, [issue, form]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    if (!issue) return;
    setIsLoading(true);
    try {
      await updateIssue(issue.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        // 🚀 FIX: Prevent sending the literal string "unassigned" to the database
        assigneeId: values.assigneeId === "unassigned" ? null : values.assigneeId,
        // 🚀 FIX: Ensure the updated date gets sent properly, or cleared if removed
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update issue", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Issue</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="resize-none" {...field} /></FormControl></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="assigneeId" render={({ field }) => (
                <FormItem><FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {memberships?.data?.map((m) => (
                        // 🚀 FIX: Added optional chaining (?.) to publicUserData
                        <SelectItem key={m.id} value={m.publicUserData?.userId || ""}>
                          {m.publicUserData?.firstName} {m.publicUserData?.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
            )} />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}