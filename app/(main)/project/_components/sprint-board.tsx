"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateIssueOrder, deleteIssue } from "@/actions/issues"; // 🚀 Import deleteIssue
import { EditIssueDialog } from "./edit-issue-dialog";
import { ViewIssueDialog } from "./view-issue-dialog"; // 🚀 Import new dialog
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator, // 🚀 Import Separator
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Eye, Trash, Calendar } from "lucide-react"; // 🚀 Import new icons

// 🚀 Make sure priority is in the type so the View dialog can use it!
type Issue = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: string; 
  order: number;
  dueDate?: Date | null;
  assignee?: { name: string | null; clerkUserId: string } | null;
};

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

interface SprintBoardProps {
  initialIssues: Issue[];
  sprintId: string;
  sprintStatus: string;
}

export function SprintBoard({ initialIssues, sprintId, sprintStatus }: SprintBoardProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null); // 🚀 New state for View Dialog

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  if (typeof window === "undefined") return null;

  // 🚀 Handle immediate visual deletion
  const handleDelete = async (issueId: string) => {
    // 1. Optimistic UI: Remove it from the board instantly
    setIssues((current) => current.filter((issue) => issue.id !== issueId));
    
    // 2. Background Sync: Tell the database to delete it
    try {
      await deleteIssue(issueId);
    } catch (error) {
      console.error("Failed to delete issue", error);
      // Revert if it fails
      setIssues(initialIssues);
      alert("Failed to delete issue. You may not have permission.");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (sprintStatus === "COMPLETED") return;
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newIssues = [...issues];
    const draggedIssueIndex = newIssues.findIndex(i => i.id === draggableId);
    if (draggedIssueIndex === -1) return;
    const [draggedItem] = newIssues.splice(draggedIssueIndex, 1);
    
    const newStatus = destination.droppableId as Issue["status"];
    draggedItem.status = newStatus;
    
    const destinationIssues = newIssues.filter(i => i.status === newStatus).sort((a, b) => a.order - b.order);
    destinationIssues.splice(destination.index, 0, draggedItem);
    destinationIssues.forEach((issue, index) => { issue.order = index * 1000; });
    
    const otherIssues = newIssues.filter(i => i.status !== newStatus);
    setIssues([...otherIssues, ...destinationIssues]);

    try {
      await updateIssueOrder(destinationIssues.map(issue => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: issue.id, status: issue.status as any, order: issue.order,
      })));
    } catch {
      setIssues(issues); 
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnIssues = issues
              .filter((issue) => issue.status === column.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-muted-foreground">{column.title}</h3>
                  <Badge variant="secondary">{columnIssues.length}</Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-xl p-2 transition-colors min-h-[150px] ${
                        snapshot.isDraggingOver ? "bg-muted/50" : "bg-muted/20"
                      }`}
                    >
                      {columnIssues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id} index={index} isDragDisabled={sprintStatus === "COMPLETED"}>
                          {(provided, snapshot) => (
                            
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  // 🚀 Clicking the card directly opens the view details dialog!
                                  onClick={() => setViewingIssue(issue)}
                                  className={`mb-3 cursor-grab hover:ring-2 hover:ring-primary/50 transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg rotate-2" : "shadow-sm"
                                  }`}
                                >
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium leading-tight">
                                      {issue.title}
                                    </CardTitle>
                                  </CardHeader>

                                  <CardContent className="p-4 pt-0 flex flex-col gap-3">
                                    {issue.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {issue.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="flex flex-col gap-1.5">
                                        
                                        
                                        {/* 🚀 Upgraded Due Date UI */}
                                        {issue.dueDate && (
                                          <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded font-medium w-fit">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {issue.assignee?.name && (
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md h-fit">
                                          <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[8px] font-bold">
                                            {issue.assignee.name.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="text-xs font-medium text-foreground">
                                            {issue.assignee.name.split(" ")[0]} {/* Shows just the first name to save space */}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </ContextMenuTrigger>

                              {/* 🚀 Expanded Right Click Menu */}
                              <ContextMenuContent className="w-48">
                                <ContextMenuItem onClick={() => setViewingIssue(issue)}>
                                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                  View Details
                                </ContextMenuItem>
                                
                                <ContextMenuItem onClick={() => setEditingIssue(issue)}>
                                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Edit Issue
                                </ContextMenuItem>
                                
                                <ContextMenuSeparator />
                                
                                <ContextMenuItem 
                                  onClick={() => handleDelete(issue.id)}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Issue
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>

                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Render the Modals */}
      <EditIssueDialog 
        issue={editingIssue} 
        isOpen={!!editingIssue} 
        onClose={() => setEditingIssue(null)} 
      />
      <ViewIssueDialog 
        issue={viewingIssue} 
        isOpen={!!viewingIssue} 
        onClose={() => setViewingIssue(null)} 
      />
    </>
  );
}