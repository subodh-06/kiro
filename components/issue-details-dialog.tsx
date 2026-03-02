"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { closeIssueDialog } from "@/lib/store/slices/uiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function IssueDetailsDialog() {
  const dispatch = useAppDispatch();
  // Read from our single source of truth
  const { isIssueDialogOpen, selectedIssueId } = useAppSelector((state) => state.ui);

  // When selectedIssueId is present, you would typically use SWR, React Query, 
  // or a Server Action here to fetch the full issue details (comments, history, etc.)
  // const { data: issue, isLoading } = useFetchIssueDetails(selectedIssueId);

  return (
    <Dialog 
      open={isIssueDialogOpen} 
      onOpenChange={(open) => {
        // Only dispatch the close action if the dialog is trying to close
        // This prevents the infinite loop of state updates
        if (!open) dispatch(closeIssueDialog());
      }}
    >
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selectedIssueId ? `Issue ${selectedIssueId.substring(0, 8)}` : "Loading..."}
          </DialogTitle>
          <DialogDescription>
            View and modify issue details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="rounded-md bg-muted/30 p-4 border text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Architectural Win:</p>
            This dialog is now strictly controlled by the Redux `uiSlice`. You can safely click any card on the board, and it will open instantly without triggering Next.js router hydration loops.
          </div>
          
          {/* Form fields, rich text editor, and comments will go here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}