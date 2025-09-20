import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Calendar, MapPin, AlertTriangle, Users, FileText, Eye, Edit2, Trash2 } from "lucide-react";
import mockData from "@/data/mockData.json";

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
export default function ProjectDetail() {
  const navigate = useNavigate();
  const {
    id
  } = useParams();
  const isMobile = useIsMobile();

  // Find the project
  const project = mockData.projects.find(p => p.id === id);
  if (!project) {
    return <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Please check the project ID and try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Get project BOQs - handle both PRJ-001 format and 001 format
  const projectId = id?.startsWith('PRJ-') ? id : `PRJ-${id?.padStart(3, '0')}`;
  const projectBoqs = mockData.boqs.filter(boq => boq.project === projectId);

  // Get indents count for each BOQ (mock data for now)
  const getIndentsCount = (boqId: string) => {
    // Mock indents count based on BOQ status and ID
    if (boqId === "BOQ-001") return 3;
    if (boqId === "BQ-0021") return 0;
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

  // Get project team members (in real app, this would come from project team data)
  const projectTeamMembers = mockData.teamMembers.filter(member => !member.isAdmin // For demo, showing non-admin members
  );
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
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
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

            
          </div>

          {/* Project Description */}
          {/* {project.description} */}

          {/* Assigned Team Members */}
          <Card>
            <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
              <div className="flex items-center gap-2">
                {/* <Users className="h-4 w-4" /> */}
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
                    <Card key={member.id} className="border-l-primary/20">
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
                          <span className="text-xs text-muted-foreground">Access Level:</span>
                          <Badge variant="outline" className="text-xs">
                            {member.isAdmin ? "Admin" : `${member.permissions?.projects?.length || 0}P/${Object.values(member.permissions?.modules || {}).filter((m: any) => m.read || m.write).length}M`}
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
                    {projectTeamMembers.map(member => <TableRow key={member.id}>
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
                          <Badge variant="outline">
                            {member.isAdmin ? "Admin" : `${member.permissions?.projects?.length || 0}P/${Object.values(member.permissions?.modules || {}).filter((m: any) => m.read || m.write).length}M`}
                          </Badge>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* BOQ List */}
          <Card>
            <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
              <div className="flex items-center gap-2">
                {/* <FileText className="h-4 w-4" /> */}
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
                              variant={boq.status === "Approved" ? "default" : boq.status === "Compare" ? "secondary" : "outline"}
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
                    {projectBoqs.map(boq => <TableRow key={boq.id}>
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
                            {boq.status === 'Draft' && <>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/boq/edit/${boq.id}`)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => console.log('Delete BOQ:', boq.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>}
                          </div>
                        </TableCell>
                      </TableRow>)}
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