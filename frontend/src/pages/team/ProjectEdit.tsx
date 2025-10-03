import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Save, X, Plus, Trash2, UserPlus, AlertTriangle, Loader2 } from "lucide-react";

// Types based on your backend schema
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other employee fields as needed
}

interface ProjectTeamMember {
  id: string;
  name: string;
  systemRole: string;
  assignedDate: string;
}

interface ProjectData {
  id: string;
  name: string;
  code: string;
  location: string;
  startDate: string;
  targetCompletionDate: string;
  status: string;
  notes: string;
  teamMembers: ProjectTeamMember[];
}

interface BoQ {
  id: string;
  number: string;
  title: string;
  createdBy: string;
  createdOn: string;
  status: string;
  itemCount: number;
  totalValue: number;
  project: string;
}

const statusOptions = ["planned", "in progress", "on hold", "completed"];

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Admin",
  permissions: {
    canManageProjects: true,
    canAssignTeam: true
  }
};

// API endpoints
const API_BASE_URL = "http://localhost:8000/api";

export default function ProjectEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEdit = !!projectId;
  const isReadOnly = mode === "view" || !currentUser.permissions.canManageProjects;

  const [projectData, setProjectData] = useState<ProjectData>({
    id: "",
    name: "",
    code: "",
    location: "",
    startDate: "",
    targetCompletionDate: "",
    status: "planned",
    notes: "",
    teamMembers: []
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [boqs, setBoqs] = useState<BoQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");

  // Fetch project data, employees, and BOQs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all employees
        const employeesResponse = await fetch(`${API_BASE_URL}/team`);
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData);
        }

        // Fetch project data if editing
        if (isEdit && projectId) {
          const projectResponse = await fetch(`${API_BASE_URL}/project/${projectId}`);
          if (projectResponse.ok) {
            const project = await projectResponse.json();
            
            // Transform backend data to frontend format
            setProjectData({
              id: project._id,
              name: project.name,
              code: project.projectCode,
              location: project.location,
              startDate: project.startDate.split('T')[0],
              targetCompletionDate: project.targetCompletionDate.split('T')[0],
              status: project.status,
              notes: project.notes || "",
              teamMembers: project.employees ? project.employees.map((emp: any) => ({
                id: emp._id,
                name: emp.name,
                systemRole: emp.role || "Team Member",
                assignedDate: new Date().toISOString().split('T')[0] // You might want to store this in backend
              })) : []
            });

            // Fetch BOQs for this project
            // Note: You'll need to implement a BOQ API endpoint that filters by project
            // For now, using mock BOQ data as placeholder
            setBoqs([]); // Replace with actual API call when available
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, isEdit, toast]);

  // Get available non-admin members not already assigned
  const availableMembers = employees.filter(employee => 
    employee.role !== "Admin" && !projectData.teamMembers.some(pm => pm.id === employee._id)
  );

  const updateProjectField = useCallback((field: keyof ProjectData, value: any) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const addTeamMember = useCallback(async () => {
    if (!selectedMember) {
      toast({
        title: "Validation Error",
        description: "Please select a team member",
        variant: "destructive"
      });
      return;
    }

    const member = employees.find(m => m._id === selectedMember);
    if (!member) return;

    const newTeamMember: ProjectTeamMember = {
      id: member._id,
      name: member.name,
      systemRole: member.role,
      assignedDate: new Date().toISOString().split('T')[0]
    };

    setProjectData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newTeamMember]
    }));

    setSelectedMember("");
    setIsAddingMember(false);
    setHasUnsavedChanges(true);

    toast({
      title: "Success",
      description: `${member.name} assigned to project`
    });
  }, [selectedMember, employees, toast]);

  const removeTeamMember = useCallback((memberId: string) => {
    const member = projectData.teamMembers.find(m => m.id === memberId);
    setProjectData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== memberId)
    }));
    setHasUnsavedChanges(true);
    
    toast({
      title: "Success",
      description: `${member?.name} removed from project`
    });
  }, [projectData.teamMembers, toast]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!projectData.name.trim()) {
      errors.push("Project name is required");
    }

    if (!projectData.code.trim()) {
      errors.push("Project code is required");
    }

    // Validate dates
    if (projectData.startDate && projectData.targetCompletionDate) {
      if (new Date(projectData.startDate) > new Date(projectData.targetCompletionDate)) {
        errors.push("Start date cannot be after target completion date");
      }
    }

    return errors;
  };

  const saveProject = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Transform data for backend
      const projectPayload = {
        name: projectData.name,
        projectCode: projectData.code,
        location: projectData.location,
        startDate: projectData.startDate,
        targetCompletionDate: projectData.targetCompletionDate,
        status: projectData.status,
        notes: projectData.notes,
        employees: projectData.teamMembers.map(member => member.id)
      };

      let response;
      if (isEdit) {
        // Update existing project
        response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectPayload)
        });
      } else {
        // Create new project
        response = await fetch(`${API_BASE_URL}/project`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectPayload)
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${isEdit ? 'updated' : 'created'} successfully`
        });
        setHasUnsavedChanges(false);
        
        // If it's a new project, update the ID
        if (!isEdit) {
          const newProject = await response.json();
          setProjectData(prev => ({ ...prev, id: newProject._id }));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save project');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectData, isEdit, projectId, toast]);

  const saveAndClose = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Transform data for backend
      const projectPayload = {
        name: projectData.name,
        projectCode: projectData.code,
        location: projectData.location,
        startDate: projectData.startDate,
        targetCompletionDate: projectData.targetCompletionDate,
        status: projectData.status,
        notes: projectData.notes,
        employees: projectData.teamMembers.map(member => member.id)
      };

      let response;
      if (isEdit) {
        response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectPayload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/project`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectPayload)
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${isEdit ? 'updated' : 'created'} successfully`
        });
        navigate("/team/projects");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save project');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectData, isEdit, projectId, toast, navigate]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges && !isReadOnly) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/team/projects");
      }
    } else {
      navigate("/team/projects");
    }
  }, [hasUnsavedChanges, isReadOnly, navigate]);

  if (loading && !projectData.name) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading project data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isReadOnly && mode !== "view") {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Only Admins and Purchasers can manage projects.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isEdit && !projectData.id) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Project not found. Please check the project ID and try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isReadOnly && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-muted/50 border rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              You are viewing this project in read-only mode. Contact an administrator to make changes.
            </p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={projectData.name}
                    onChange={(e) => updateProjectField("name", e.target.value)}
                    placeholder="Enter project name"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectCode">Project Code *</Label>
                  <Input
                    id="projectCode"
                    value={projectData.code}
                    onChange={(e) => updateProjectField("code", e.target.value)}
                    placeholder="e.g., PRJ-0012"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={projectData.location}
                  onChange={(e) => updateProjectField("location", e.target.value)}
                  placeholder="Project site/location"
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={projectData.startDate}
                    onChange={(e) => updateProjectField("startDate", e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Completion Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={projectData.targetCompletionDate}
                    onChange={(e) => updateProjectField("targetCompletionDate", e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={projectData.status} 
                    onValueChange={(value) => updateProjectField("status", value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={projectData.notes}
                  onChange={(e) => updateProjectField("notes", e.target.value)}
                  placeholder="Project description and notes..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employee Assignment */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Employee Assignment</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Assign employees who can create BoQs and record receipts for this project
                  </p>
                </div>
                {!isReadOnly && currentUser.permissions.canAssignTeam && availableMembers.length > 0 && !isAddingMember && (
                  <Button onClick={() => setIsAddingMember(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Member Form */}
              {isAddingMember && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Employee *</Label>
                        <Select value={selectedMember} onValueChange={setSelectedMember}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg z-50">
                            {availableMembers.map((member) => (
                              <SelectItem key={member._id} value={member._id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Only Employees can be assigned to projects. Purchasers, Admins, and Accountants have access to all projects.
                        </p>
                      </div>
                      <div className="space-y-2 flex items-end">
                        <div className="flex gap-2 w-full">
                          <Button onClick={addTeamMember}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Employee Members List */}
              {projectData.teamMembers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-3">No employees assigned to this project</p>
                  <p className="text-sm text-muted-foreground">
                    Assign employees who will create BoQs and record receipts for this project
                  </p>
                  {!isReadOnly && currentUser.permissions.canAssignTeam && availableMembers.length > 0 && (
                    <Button onClick={() => setIsAddingMember(true)} className="mt-3">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Employee
                    </Button>
                  )}
                  {availableMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      All available employees are already assigned to this project.
                    </p>
                  )}
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {projectData.teamMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                System Role: {member.systemRole}
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && currentUser.permissions.canAssignTeam && (
                            <Button size="sm" variant="outline" onClick={() => removeTeamMember(member.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                         <div className="space-y-3">
                           <div>
                             <Label>System Role</Label>
                             <Badge variant="outline">{member.systemRole}</Badge>
                           </div>
                          <div className="text-sm text-muted-foreground">
                            Assigned: {new Date(member.assignedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>System Role</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectData.teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.systemRole}</Badge>
                        </TableCell>
                        <TableCell>{new Date(member.assignedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {!isReadOnly && currentUser.permissions.canAssignTeam && (
                            <Button size="sm" variant="outline" onClick={() => removeTeamMember(member.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {availableMembers.length === 0 && !isAddingMember && !isReadOnly && (
                <p className="text-sm text-muted-foreground text-center">
                  All team members have been assigned to this project.
                </p>
              )}
            </CardContent>
          </Card>

          {/* BOQ List */}
          <Card>
            <CardHeader>
              <CardTitle>Bill of Quantities (BoQs)</CardTitle>
              <p className="text-sm text-muted-foreground">
                List of all BoQs created for this project
              </p>
            </CardHeader>
            <CardContent>
              {boqs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-3">No BoQs created for this project yet</p>
                  <p className="text-sm text-muted-foreground">
                    BoQs will appear here once they are created by assigned employees
                  </p>
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {boqs.map((boq) => (
                    <Card key={boq.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{boq.number}</h4>
                              <p className="text-sm text-muted-foreground">{boq.title}</p>
                            </div>
                            <Badge variant={
                              boq.status === "Approved" ? "default" : 
                              boq.status === "Compare" ? "secondary" : 
                              "outline"
                            }>
                              {boq.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Created By:</span>
                              <p className="font-medium">{boq.createdBy}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created On:</span>
                              <p className="font-medium">{new Date(boq.createdOn).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Items:</span>
                              <p className="font-medium">{boq.itemCount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Value:</span>
                              <p className="font-medium">₹{boq.totalValue.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>BoQ Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boqs.map((boq) => (
                      <TableRow key={boq.id}>
                        <TableCell className="font-medium">{boq.number}</TableCell>
                        <TableCell>{boq.title}</TableCell>
                        <TableCell>{boq.createdBy}</TableCell>
                        <TableCell>{new Date(boq.createdOn).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            boq.status === "Approved" ? "default" : 
                            boq.status === "Compare" ? "secondary" : 
                            "outline"
                          }>
                            {boq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{boq.itemCount}</TableCell>
                        <TableCell>₹{boq.totalValue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={saveProject} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
              <Button onClick={saveAndClose} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save & Close
              </Button>
            </div>
          )}

          {hasUnsavedChanges && !isReadOnly && (
            <div className="text-sm text-amber-600 text-center">
              You have unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}