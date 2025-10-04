import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, Edit, Plus, Search, Filter, RotateCcw, Users, FileText, ShoppingCart, AlertTriangle, Calendar } from "lucide-react";
import axios from "axios";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Purchaser",
  permissions: {
    canManageProjects: true,
    canViewAllProjects: true,
    canAssignTeam: true
  }
};

interface TeamMember {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  projectCode:string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  boqCount?: number;
  poCount?: number;
  assignedMembers?: TeamMember[];
}

export default function ProjectList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("updated-desc");
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canManageProjects = currentUser.permissions.canManageProjects;
  const canAssignTeam = currentUser.permissions.canAssignTeam;

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/api/project');
        console.log(response);
        

      

        const data = await response.data;
 
        setProjects(data.map((project: any) => ({
          ...project,
       
          boqCount: Math.floor(Math.random() * 5),
          poCount: Math.floor(Math.random() * 3),
 
          assignedMembers: teamMembers.slice(0, Math.floor(Math.random() * 4) + 1)
        })));
        setIsLoading(false);
      } catch (err) {
        setError('Error fetching projects. Please try again later.');
        setIsLoading(false);
      }
    };

    // Mock team members (in real app, this would come from another API endpoint)
    setTeamMembers([
      { id: "TM-001", name: "John Doe" },
      { id: "TM-002", name: "Jane Smith" },
      { id: "TM-003", name: "Bob Johnson" },
      { id: "TM-004", name: "Alice Brown" },
    ]);

    fetchProjects();
  }, []);

  // Enhanced projects with team assignment and BoQ/PO counts
  const projectsWithStats = useMemo(() => {
    return projects;
  }, [projects, teamMembers]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projectsWithStats;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) || 
        project.id.toLowerCase().includes(query) || 
        project.location.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(project => statusFilter.includes(project.status));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "target-asc":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "target-desc":
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        case "updated-desc":
        default:
          return 0;
      }
    });
    return filtered;
  }, [projectsWithStats, searchQuery, statusFilter, sortBy]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Planning":
        return "secondary";
      case "On Hold":
        return "destructive";
      case "Completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleCreateProject = () => {
    navigate("/team/project-edit");
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/team/project-edit?id=${projectId}`);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/team/project/${projectId}`);
  };

  const handleProjectBoqs = (projectId: string) => {
    navigate(`/indent/list?project=${projectId}`);
  };

  const handleProjectPOs = (projectId: string) => {
    navigate(`/po/list?project=${projectId}`);
  };

  const handleProjectTeam = (projectId: string) => {
    navigate(`/team/list?project=${projectId}`);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSortBy("updated-desc");
  };

  const statusOptions = ["Planning", "Active", "On Hold", "Completed"];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p>Loading projects...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar with Mobile Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects, codes, locations" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-9" 
              />
            </div>
            
            {/* Mobile Filter Button */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Mobile Filter Controls */}
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status Filter</label>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(status => (
                          <Badge 
                            key={status} 
                            variant={statusFilter.includes(status) ? "default" : "outline"} 
                            className="cursor-pointer" 
                            onClick={() => toggleStatusFilter(status)}
                          >
                            {status}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="updated-desc">Last Updated</SelectItem>
                          <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                          <SelectItem value="status-asc">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    <Button variant="ghost" onClick={clearFilters} className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Desktop Filter Controls - Single Line */}
          {!isMobile && (
            <div className="grid grid-cols-2 gap-3">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <Badge 
                      key={status} 
                      variant={statusFilter.includes(status) ? "default" : "outline"} 
                      className="cursor-pointer" 
                      onClick={() => toggleStatusFilter(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated-desc">Last Updated</SelectItem>
                    <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                    <SelectItem value="status-asc">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Clear Filters Button for Desktop */}
          {!isMobile && (searchQuery || statusFilter.length > 0 || sortBy !== "updated-desc") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {projectsWithStats.length === 0 ? (
                <>
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
                  {canManageProjects && (
                    <Button onClick={handleCreateProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No projects match these filters</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="grid gap-3">
            {filteredProjects.map(project => (
              <Card key={project.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-lg font-medium">{project.name}</div>
                      <p className="text-sm text-muted-foreground">{project.id}</p>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <p>{new Date(project.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <p>{new Date(project.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Assigned Team */}
                    <div>
                      <span className="text-muted-foreground text-sm">Assigned Team:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {project.assignedMembers?.slice(0, 3).map((member, index) => (
                          <Avatar key={member.id} className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.assignedMembers && project.assignedMembers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.assignedMembers.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline" onClick={() => handleProjectBoqs(project.id)} className="cursor-pointer">
                        BoQs ({project.boqCount})
                      </Badge>
                      <Badge variant="outline" onClick={() => handleProjectPOs(project.id)} className="cursor-pointer">
                        POs ({project.poCount})
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewProject(project.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleProjectTeam(project._id)}>
                        <Users className="h-3 w-3 mr-1" />
                        Team
                      </Button>
                      {canManageProjects && (
                        <Button size="sm" variant="outline" onClick={() => handleEditProject(project.id)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Team</TableHead>
                  <TableHead>Quick Links</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.projectCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          → {new Date(project.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {project.assignedMembers?.slice(0, 3).map((member, index) => (
                            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {project.assignedMembers && project.assignedMembers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.assignedMembers.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" onClick={() => handleProjectBoqs(project.id)} className="cursor-pointer">
                          <FileText className="h-3 w-3 mr-1" />
                          BoQs ({project.boqCount})
                        </Badge>
                        <Badge variant="outline" onClick={() => handleProjectPOs(project.id)} className="cursor-pointer">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          POs ({project.poCount})
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewProject(project.projectCode)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleProjectTeam(project.projectCode)}>
                          <Users className="h-3 w-3 mr-1" />
                          Team
                        </Button>
                        {canManageProjects && (
                          <Button size="sm" variant="outline" onClick={() => handleEditProject(project.projectCode)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}