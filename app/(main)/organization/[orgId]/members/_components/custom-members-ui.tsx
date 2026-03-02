"use client";

import { useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { toast } from "sonner"; // 🚀 1. Import Sonner Toast
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MoreHorizontal, Shield, User as UserIcon, X } from "lucide-react";

export function CustomMembersUI() {
  const { user } = useUser();
  const { isLoaded, organization, memberships, invitations } = useOrganization({
    memberships: { pageSize: 50 },
    invitations: { pageSize: 50 },
  });

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"org:admin" | "org:member">("org:member");
  const [isInviting, setIsInviting] = useState(false);

  if (!isLoaded || !organization) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  // 🚀 FIX: Added ?. to safely access publicUserData for TypeScript
  const currentMembership = memberships?.data?.find(m => m.publicUserData?.userId === user?.id);
  const isAdmin = currentMembership?.role === "org:admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await organization.inviteMember({ emailAddress: inviteEmail, role: inviteRole });
      setIsInviteOpen(false);
      setInviteEmail("");
      
      // 🚀 FIX: Instantly refresh the pending invites list in the background!
      if (invitations?.revalidate) {
        await invitations.revalidate();
      }

      // 🚀 FIX: Use modern toast instead of ugly alert
      toast.success("Invitation sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your Influcraft workspace members and invitations.
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Organization</DialogTitle>
                <DialogDescription>
                  Send an email invitation to add a new member to {organization.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="colleague@example.com" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={(val: "org:admin" | "org:member") => setInviteRole(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org:member">Member (Can manage issues)</SelectItem>
                      <SelectItem value="org:admin">Admin (Can manage projects & team)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isInviting}>
                  {isInviting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Send Invitation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Members ({memberships?.data?.length || 0})</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="pending">Pending Invites ({invitations?.data?.length || 0})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="border rounded-lg bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                {isAdmin && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships?.data?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {/* 🚀 FIX: Safely accessing publicUserData with ?. */}
                      <AvatarImage src={member.publicUserData?.imageUrl} />
                      <AvatarFallback>{member.publicUserData?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                        {user?.id === member.publicUserData?.userId && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.publicUserData?.identifier}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === "org:admin" ? "default" : "secondary"} className="flex w-fit items-center gap-1">
                      {member.role === "org:admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                      {member.role === "org:admin" ? "Admin" : "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {/* 🚀 FIX: Safely checking ID */}
                      {user?.id !== member.publicUserData?.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => member.update({ role: "org:admin" })} disabled={member.role === "org:admin"}>
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => member.update({ role: "org:member" })} disabled={member.role === "org:member"}>
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => member.destroy()} className="text-destructive focus:text-destructive">
                              Remove from Org
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="pending" className="border rounded-lg bg-card text-card-foreground shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No pending invitations.
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations?.data?.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium text-sm">{invite.emailAddress}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invite.role === "org:admin" ? "Admin" : "Member"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            await invite.revoke();
                            // 🚀 Also refresh when revoking!
                            if (invitations?.revalidate) await invitations.revalidate();
                            toast.success("Invitation revoked");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}