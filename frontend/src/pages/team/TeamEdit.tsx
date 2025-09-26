import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PermissionsManager } from "@/components/PermissionsManager";
import mockData from "@/data/mockData.json";
import { ArrowLeft, RotateCcw, Power, PowerOff, Mail } from "lucide-react";
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional()
});
type FormData = z.infer<typeof formSchema>;
interface ModulePermission {
  read: boolean;
  write: boolean;
}
interface Permissions {
  projects: string[];
  modules: {
    [key: string]: ModulePermission;
  };
}
export default function TeamEdit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const memberId = searchParams.get("id");
  const isViewMode = searchParams.get("mode") === "view";
  const isEditMode = !!memberId && !isViewMode;
  const isCreateMode = !memberId;

  // Current user role for permissions
  const currentUserRole = "Admin"; // This would come from auth context
  const canEdit = currentUserRole === "Admin" && !isViewMode;

  // Find existing member data
  const existingMember = memberId ? mockData.teamMembers.find(m => m.id === memberId) : null;

  // Permissions state
  const [permissions, setPermissions] = useState<Permissions>(() => {
    return existingMember?.permissions || {
      projects: [],
      modules: {
        boq: {
          read: false,
          write: false
        },
        indent: {
          read: false,
          write: false
        },
        po: {
          read: false,
          write: false
        },
        vendors: {
          read: false,
          write: false
        },
        items: {
          read: false,
          write: false
        },
        team: {
          read: false,
          write: false
        }
      }
    };
  });
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingMember?.name || "",
      email: existingMember?.email || "",
      phone: existingMember?.phone || "",
      status: existingMember?.status as "active" | "inactive" || "active",
      notes: ""
    }
  });
  const selectedStatus = form.watch("status");
  const currentStatus = existingMember?.status || "active";
const onSubmit = async (data: FormData) => {
  const memberData = {
    ...data,
    permissions,
  };

  try {
    const url = isCreateMode
      ? "http://localhost:8000/api/team"
      : `http://localhost:8000/api/team/${memberId}`;

    const method = isCreateMode ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Something went wrong");
    }

    const result = await res.json();

    toast({
      title: isCreateMode
        ? "Member added successfully"
        : "Member updated successfully",
      description: isCreateMode
        ? "New team member has been added to the system with custom permissions"
        : "Team member information and permissions have been updated",
    });

    console.log("API Response:", result);

    navigate("/team/list");
  } catch (error: any) {
    console.error("API Error:", error.message);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

  const getRoleDescription = () => {
    // Since roles are removed, return permissions-based description
    const projectCount = permissions.projects.length;
    const moduleCount = Object.values(permissions.modules).filter(m => m.read || m.write).length;
    return `Access to ${projectCount} projects and ${moduleCount} modules`;
  };
  const handleSaveAndClose = () => {
    form.handleSubmit(onSubmit)();
  };
  const handleSaveAndInvite = () => {
    form.handleSubmit(data => {
      onSubmit(data);
      console.log(`Sending invite to ${data.email}`);
      toast({
        title: "Invite sent",
        description: `Invitation email sent to ${data.email}`
      });
    })();
  };
  const handleToggleStatus = () => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    form.setValue("status", newStatus as "active" | "inactive");
    console.log(`Status toggled to ${newStatus}`);
    toast({
      title: `Member ${newStatus.toLowerCase()}`,
      description: `User has been ${newStatus.toLowerCase()}.`
    });
  };
  const handleResetPassword = () => {
    if (existingMember?.email) {
      console.log(`Sending password reset to ${existingMember.email}`);
      toast({
        title: "Password reset sent",
        description: `Password reset email sent to ${existingMember.email}`
      });
    }
  };
  const getPageTitle = () => {
    if (isCreateMode) return "Add New Member";
    if (isEditMode) return "Edit Member";
    return "Member Details";
  };
  const getPageSubtitle = () => {
    if (isCreateMode) return "Add a new team member to the system";
    if (isEditMode) return `Edit ${existingMember?.name || "member"} information`;
    return `View ${existingMember?.name || "member"} details`;
  };
  return <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      

      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <Button variant="ghost" onClick={() => navigate("/team/list")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Button>
          </div>

          <Card className="border-0 md:border shadow-none md:shadow-sm">
            <CardHeader className="hidden md:block">
              <CardTitle className="flex items-center gap-2">
                {isCreateMode && "Add New Member"}
                {isEditMode && "Edit Member"}
                {isViewMode && "Member Details"}
                {isViewMode && !canEdit && <Badge variant="secondary">Read Only</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Identity Section */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold">Identity</h3>
                    
                    <FormField control={form.control} name="name" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" disabled={!canEdit} />
                          </FormControl>
                          <FormDescription>
                            Used as login username
                          </FormDescription>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="phone" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <Separator />

                  {/* Access & Status Section */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold">Access & Status</h3>
                    
                    {/* Show current access summary */}
                    {(isEditMode || isViewMode) && <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Current Access</p>
                        <p className="text-sm text-muted-foreground">
                          {getRoleDescription()}
                        </p>
                      </div>}

                    <FormField control={form.control} name="status" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canEdit}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="notes" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} disabled={!canEdit} className="min-h-[80px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  {/* Permissions Section */}
                  {canEdit && <>
                      <Separator />
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold">Access Control & Permissions</h3>
                        <PermissionsManager permissions={permissions} onChange={setPermissions} disabled={!canEdit} />
                      </div>
                    </>}

                  {/* Login Section (Edit Mode Only) */}
                  {(isEditMode || isViewMode) && <>
                      <Separator />
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold">Login Information</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                            <span className="text-sm font-medium">Last Login</span>
                            <span className="text-sm text-muted-foreground">
                              {existingMember?.joinDate || "Never"}
                            </span>
                          </div>
                          
                          {canEdit && <div className="flex flex-col sm:flex-row gap-2">
                              <Button type="button" variant="outline" onClick={handleResetPassword} className="flex-1">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset Password
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button type="button" variant="outline" className="flex-1">
                                    {currentStatus === "active" ? <>
                                        <PowerOff className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </> : <>
                                        <Power className="mr-2 h-4 w-4" />
                                        Activate
                                      </>}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {currentStatus === "active" ? "Deactivate" : "Activate"} User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {currentStatus === "active" ? "User will lose access to the system. Continue?" : "User will regain access to the system. Continue?"}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleToggleStatus}>
                                      {currentStatus === "active" ? "Deactivate" : "Activate"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>}
                        </div>
                      </div>
                    </>}

                  {/* Actions */}
                  <Separator className="hidden md:block" />
                  
                  {/* Mobile Action Buttons */}
                  <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-background border-t">
                    <div className="flex gap-2">
                      {canEdit ? <>
                          <Button type="submit" className="flex-1">
                            Save
                          </Button>
                          <Button type="button" variant="outline" onClick={() => navigate("/team/list")} className="flex-1">
                            Cancel
                          </Button>
                        </> : <Button type="button" variant="outline" onClick={() => navigate("/team/list")} className="w-full">
                          Back to List
                        </Button>}
                    </div>
                    
                    {/* Additional actions for create mode */}
                    {canEdit && isCreateMode && <Button type="button" variant="ghost" onClick={handleSaveAndInvite} className="w-full mt-2">
                        <Mail className="mr-2 h-4 w-4" />
                        Save & Send Invite
                      </Button>}
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="hidden md:flex flex-col sm:flex-row gap-3 pt-4">
                    {canEdit && <>
                        <Button type="submit" className="flex-1">
                          Save
                        </Button>
                        
                        {isCreateMode && <Button type="button" variant="outline" onClick={handleSaveAndInvite} className="flex-1">
                            <Mail className="mr-2 h-4 w-4" />
                            Save & Send Invite
                          </Button>}
                        
                        <Button type="button" variant="outline" onClick={handleSaveAndClose} className="flex-1">
                          Save & Close
                        </Button>
                      </>}
                    
                    <Button type="button" variant="ghost" onClick={() => navigate("/team/list")} className={canEdit ? "flex-1" : "w-full"}>
                      {canEdit ? "Cancel" : "Back to List"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}