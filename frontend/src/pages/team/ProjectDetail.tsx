import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Calendar, MapPin, AlertTriangle, Users, FileText, Eye, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Admin",
  // Employee, Purchaser, Admin, Accountant
  permissions: {
    canManageProjects: true,
    // Admin/Purchaser: true, others: false
    canAssignTeam: true // Admin only: true
  }
};

// Types
interface Project {
  id: string;
  name: string;
  startDate?: string;
  targetCompletionDate?: string;
  location?: string;
  description?: string;
  status?: string;
  teamMembers?: string[]; // Array of team member IDs
}

interface BOQ {
  id: string;
  number: string;
  title: string;
  project: string;
  status: string;
  itemCount: number;
  totalValue: number;
  createdBy: string;
  createdOn: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  permissions?: {
    projects?: string[];
    modules?: any;
  };
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectBoqs, setProjectBoqs] = useState<BOQ[]>([]);
  const [projectTeamMembers, setProjectTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch team members by their IDs
  const fetchTeamMembers = async (teamMemberIds: string[]) => {
    try {
      const teamMembersPromises = teamMemberIds.map(async (memberId) => {
        try {
          const response = await axios.get(`http://localhost:8000/api/team/byId/${memberId}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching team member ${memberId}:`, error);
          return null;
        }
      });

      const teamMembersData = await Promise.all(teamMembersPromises);
      const validTeamMembers = teamMembersData.filter(member => member !== null) as TeamMember[];
      
      setProjectTeamMembers(validTeamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setProjectTeamMembers([]);
    }
  };

  // Function to fetch BOQs for the project
  const fetchProjectBOQs = async (projectId: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/boq/project/${projectId}`);
      const boqsData = response.data;
      console.log(boqsData,'ghg');
      
      // Transform the API response to match our BOQ interface
      const formattedBoqs: BOQ[] = boqsData.map((boq: any) => ({
        id: boq._id || boq.id,
        number: boq.boqNumber || boq.number || `BOQ-${boq._id}`,
        title: boq.name || boq.boqTitle || 'Untitled BOQ',
        project: boq.project || projectId,
        status: boq.status || 'Draft',
        itemCount: boq.items ? boq.items.length : 0,
        totalValue: boq.totalValue || boq.totalAmount || 0,
        createdBy: boq.createdBy || boq.creator?.name || 'Unknown',
        createdOn: boq.createdAt || boq.createdOn || new Date().toISOString()
      }));
      
      setProjectBoqs(formattedBoqs);
    } catch (error) {
      console.error('Error fetching BOQs:', error);
      // If API fails, set empty array instead of showing error for BOQs
      setProjectBoqs([]);
    }
  };

  // Fetch project data, team members and BOQs from API
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);     
        
        // Fetch project details using Axios
        const response = await axios.get(`http://localhost:8000/api/project/${id}`);
        const projectData = response.data;
        const projectId = projectData._id;
        
        // Ensure the project has the correct ID format for display
        const formattedProject = {
          ...projectData,
    
        };
        
        setProject(formattedProject);

        // Fetch team members if project has team member IDs
        if (projectData.employees && projectData.employees.length > 0) {
          await fetchTeamMembers(projectData.employees);
        } else {
          setProjectTeamMembers([]);
        }

        // Fetch BOQs for this project using the real API
        await fetchProjectBOQs(projectId);

      } catch (error) {
        console.error('Error fetching project:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError('Project not found');
          } else {
            setError(`Failed to load project: ${error.response?.data?.message || error.message}`);
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Get indents count for each BOQ (mock data for now since we don't have indent API)
  const getIndentsCount = (boqId: string) => {
    // Mock indents count based on BOQ status and ID
    // In a real app, you would fetch this from an API
    if (boqId.includes("001")) return 3;
    if (boqId.includes("002")) return 0;
    return Math.floor(Math.random() * 4); // Random for demo
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'compare':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'outline';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'on hold':
        return 'destructive';
      case 'planned':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper function to get display name for team member role
  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employee';
      case 'purchaser':
        return 'Purchaser';
      case 'accountant':
        return 'Accountant';
      default:
        return role || 'Employee';
    }
  };

  // Helper function to check if team member is admin based on role
  const isTeamMemberAdmin = (member: TeamMember) => {
    return member.role?.toLowerCase() === 'admin';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6'}`}>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading project details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6'}`}>
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
              <p className="text-muted-foreground mb-4">{error || "Please check the project ID and try again."}</p>
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6'}`}>
        <div className={`${isMobile ? 'space-y-4' : 'max-w-6xl mx-auto space-y-6'}`}>
          {/* Project Header */}
          {isMobile && (
            <div className="bg-card border rounded-lg p-4 mb-4">
              <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{project.id}</p>
            </div>
          )}
          
          {/* Project Overview */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            <Card>
              <CardContent className={isMobile ? "p-4" : "pt-6"}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-primary/10 rounded-lg ${isMobile ? 'flex-shrink-0' : ''}`}>
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className={`font-medium ${isMobile ? 'text-sm' : ''} truncate`}>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className={isMobile ? "p-4" : "pt-6"}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-primary/10 rounded-lg ${isMobile ? 'flex-shrink-0' : ''}`}>
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Target Completion</p>
                    <p className={`font-medium ${isMobile ? 'text-sm' : ''} truncate`}>
                      {project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className={isMobile ? "p-4" : "pt-6"}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-primary/10 rounded-lg ${isMobile ? 'flex-shrink-0' : ''}`}>
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className={`font-medium ${isMobile ? 'text-sm' : ''} truncate`}>
                      {project.location || 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className={isMobile ? "p-4" : "pt-6"}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-primary/10 rounded-lg ${isMobile ? 'flex-shrink-0' : ''}`}>
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={getStatusColor(project.status)} className="mt-1">
                      {project.status || 'Not specified'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Description */}
          {project.description && (
            <Card>
              <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Description</CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? "p-4 pt-0" : ""}>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Assigned Team Members */}
          <Card>
            <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <CardTitle className={isMobile ? "text-base" : ""}>Team Members</CardTitle>
              </div>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Employees assigned to create BoQs and record receipts for this project
                </p>
              )}
            </CardHeader>
            <CardContent className={isMobile ? "p-4 pt-0" : ""}>
              {projectTeamMembers.length === 0 ? (
                <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} border-2 border-dashed rounded-lg`}>
                  <AlertTriangle className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground mx-auto mb-2`} />
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''} mb-3`}>
                    No employees assigned to this project
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contact an administrator to assign employees to this project
                  </p>
                </div>
              ) : isMobile ? (
                <div className="space-y-3">
                  {projectTeamMembers.map(member => (
                    <Card key={member._id} className="border-l-primary/20">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">{member.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Role:</span>
                          <Badge variant={isTeamMemberAdmin(member) ? "default" : "outline"} className="text-xs">
                            {getRoleDisplayName(member.role)}
                          </Badge>
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
                      <TableHead>Email</TableHead>
                      <TableHead>System Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTeamMembers.map(member => (
                      <TableRow key={member._id}>
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
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={isTeamMemberAdmin(member) ? "default" : "outline"}>
                            {getRoleDisplayName(member.role)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* BOQ List */}
          <Card>
            <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <CardTitle className={isMobile ? "text-base" : ""}>BoQs</CardTitle>
              </div>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  List of all BoQs created for this project
                </p>
              )}
            </CardHeader>
            <CardContent className={isMobile ? "p-4 pt-0" : ""}>
              {projectBoqs.length === 0 ? (
                <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} border-2 border-dashed rounded-lg`}>
                  <AlertTriangle className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground mx-auto mb-2`} />
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''} mb-3`}>
                    No BoQs created for this project yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    BoQs will appear here once they are created by assigned employees
                  </p>
                </div>
              ) : isMobile ? (
                <div className="space-y-3">
                  {projectBoqs.map(boq => (
                    <Card key={boq.id} className="border-l-primary/20">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{boq.number}</h4>
                              <p className="text-xs text-muted-foreground truncate">{boq.title}</p>
                            </div>
                            <Badge 
                              variant={getStatusVariant(boq.status)}
                              className="text-xs flex-shrink-0"
                            >
                              {boq.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Created By:</span>
                              <p className="font-medium truncate">{boq.createdBy}</p>
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
                          <div className="flex gap-2 pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 h-8 text-xs"
                              onClick={() => navigate(`/boq/detail/${boq.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {boq.status === 'Draft' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2"
                                  onClick={() => navigate(`/boq/edit/${boq.id}`)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-destructive hover:text-destructive"
                                  onClick={() => console.log('Delete BOQ:', boq.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
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
                      <TableHead>BOQ Name</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Indents</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectBoqs.map(boq => (
                      <TableRow key={boq.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{boq.title}</div>
                            <div className="text-sm text-muted-foreground">{boq.number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {project.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(boq.status)}>
                            {boq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{boq.itemCount}</TableCell>
                        <TableCell>{getIndentsCount(boq.id)}</TableCell>
                        <TableCell>{new Date(boq.createdOn).toLocaleDateString()}</TableCell>
                        <TableCell>{boq.createdBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/boq/detail/${boq.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {boq.status === 'Draft' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/boq/edit/${boq.id}`)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => console.log('Delete BOQ:', boq.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}