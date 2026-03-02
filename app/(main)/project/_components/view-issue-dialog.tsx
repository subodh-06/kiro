"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ViewIssueDialog({ 
  issue, 
  isOpen, 
  onClose 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  issue: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!issue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight leading-tight">
            {issue.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 pt-2">
          {/* Description Box */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1.5">Description</h4>
            <div className="text-sm bg-muted/30 p-3 rounded-md min-h-[80px] border border-border/50 text-foreground whitespace-pre-wrap">
              {issue.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </div>
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/10 p-4 rounded-lg border border-border/50">
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Status</h4>
              <Badge variant="outline" className="font-semibold">{issue.status}</Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Priority</h4>
              <Badge variant="secondary" className="font-semibold">{issue.priority}</Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Assignee</h4>
              <div className="flex items-center gap-2 mt-1">
                {issue.assignee?.name ? (
                  <>
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                      {issue.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium">{issue.assignee.name}</p>
                  </>
                ) : (
                  <p className="font-medium text-muted-foreground">Unassigned</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-muted-foreground mb-1">Due Date</h4>
              <p className="font-medium text-foreground">
                {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : <span className="text-muted-foreground">No due date</span>}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}