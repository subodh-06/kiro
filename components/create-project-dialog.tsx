"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/actions/projects";
import { OrgMemberSelector } from "@/components/org-member-selector"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters."),
  key: z.string().min(2, "Project key must be at least 2 characters.").max(10).toUpperCase(),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function CreateProjectDialog() {
  const router = useRouter();
  const { organization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [managerId, setManagerId] = useState<string>("");

  const form = useForm<ProjectFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(projectSchema as any),
    defaultValues: { name: "", key: "", description: "" },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val);
    if (!form.getValues("key")) {
      const autoKey = val.split(" ").map(w => w[0]).join("").substring(0, 4).toUpperCase();
      form.setValue("key", autoKey);
    }
  };

  const onSubmitStep1 = async () => {
    setStep(2);
  };

  const handleSkipAndCreate = async () => {
    setIsLoading(true);
    try {
      const orgId = organization?.id;
      if (!orgId) return;

      const values = form.getValues();
      
      const result = await createProject({
        name: values.name,
        key: values.key,
        description: values.description,
        orgId,
      });

      if (!result.success) {
        console.error(result.error);
        return;
      }

      // Reset state, close dialog, and route to the new project!
      setOpen(false);
      setStep(1);
      form.reset();
      router.push(`/project/${result.projectId}`);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 1 ? "Create a new project" : "Set up your team"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Give your project a name and a unique key to get started." 
              : "Assign a project manager and add members from your organization."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Platform Overhaul" {...field} onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Key</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. INFL" {...field} maxLength={10} />
                    </FormControl>
                    <FormDescription>
                      This will be used as the prefix for your issue trackers (e.g., INFL-1).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is this project about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit">Continue to Team Setup</Button>
              </div>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    Assign Project Manager
  </label>
  <OrgMemberSelector 
    value={managerId} 
    onChange={setManagerId} 
  />
</div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleSkipAndCreate} disabled={isLoading}>
                {isLoading ? "Creating..." : "Save & Create Project"}
              </Button>
              <Button variant="ghost" onClick={handleSkipAndCreate} disabled={isLoading}>
                Skip for now (Assign myself as Manager)
              </Button>
              <Button variant="link" onClick={() => setStep(1)} disabled={isLoading} className="text-xs">
                Back to details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}