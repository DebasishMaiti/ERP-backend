import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Filter, RotateCcw, Plus, Eye, Bell, History, FileText } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canCreateBoQ: true,
    canRecordGRN: true,
    canApprove: false,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  },
  assignedProjects: ["PRJ-001", "PRJ-002"] // For Employee role project filtering
};

export default function BoQList() {
  const navigate = useNavigate();
  const boqs = mockData.boqs;
  const projects = mockData.projects || [];
  const isMobile = useIsMobile();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdate");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Create project mapping for ID to name conversion
  const projectMap = useMemo(() => {
    const map = new Map();
    projects.forEach(project => {
      map.set(project.id, project.name);
    });
    return map;
  }, [projects]);

  // Get unique projects for filter (using project names)
  const uniqueProjects = useMemo(() => {
    const projectIds = [...new Set(boqs.map(boq => boq.project))];
    const projectsWithNames = projectIds.map(id => ({
      id,
      name: projectMap.get(id) || id
    })).sort((a, b) => a.name.localeCompare(b.name));
    return projectsWithNames;
  }, [boqs, projectMap]);

  // Filter and sort BoQs
  const filteredBoqs = useMemo(() => {
    let filtered = boqs.filter(boq => {
      // Role-based filtering for Employees
      if (currentUser.role === "Employee" && currentUser.assignedProjects.length > 0) {
        if (!currentUser.assignedProjects.includes(boq.project)) {
          return false;
        }
      }
      
      // Search filter
      const matchesSearch = searchQuery === "" || 
        boq.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        boq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        boq.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        boq.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || boq.status === statusFilter;
      
      // Project filter
      const matchesProject = projectFilter === "all" || boq.project === projectFilter;
      
      return matchesSearch && matchesStatus && matchesProject;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastUpdate":
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        case "createdOn":
          return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
        case "number":
          return a.number.localeCompare(b.number);
        default:
          return 0;
      }
    });

    return filtered;
  }, [boqs, searchQuery, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBoqs.length / itemsPerPage);
  const paginatedBoqs = filteredBoqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Pending Approval": return "secondary";
      case "Draft": return "outline";
      case "Ordered": return "default";
      default: return "outline";
    }
  };

  const getNextStepActions = (boq: any) => {
    const baseActions = [];
    
    if (boq.status === "Draft" && currentUser.permissions.canCreateBoQ) {
      baseActions.push(
        <Button 
          key="open" 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/indent/edit/${boq.id}`)}
        >
          
          Open
        </Button>
      );
    } else {
      baseActions.push(
        <Button 
          key="view" 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/indent/${boq.id}`)}
        >
          
          View
        </Button>
      );
    }
    
    return baseActions;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProjectFilter("all");
    setSortBy("lastUpdate");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || projectFilter !== "all";

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar - Always visible */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search BoQ#, project, creator, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="Draft">Draft</TabsTrigger>
                          <TabsTrigger value="Approved">Approved</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Project Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project</label>
                      <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {uniqueProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastUpdate">Last Updated</SelectItem>
                          <SelectItem value="createdOn">Created Date</SelectItem>
                          <SelectItem value="number">BoQ Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Desktop Filters - Single line */}
          {!isMobile && (
            <div className="flex gap-3 items-center">
              {/* Status Filter */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                <TabsList className="grid w-auto grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Draft">Draft</TabsTrigger>
                  <TabsTrigger value="Compare">Compare</TabsTrigger>
                  <TabsTrigger value="Approval">Approval</TabsTrigger>
                  <TabsTrigger value="Approved">Approved</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Project Filter */}
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdate">Last Updated</SelectItem>
                  <SelectItem value="createdOn">Created Date</SelectItem>
                  <SelectItem value="number">BoQ Number</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {filteredBoqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg p-8 shadow-card">
              {boqs.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">No BoQs yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first BoQ to get started</p>
                  {currentUser.permissions.canCreateBoQ && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New BoQ
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No BoQs match these filters</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="space-y-2">
                {paginatedBoqs.map((boq) => (
                  <Card key={boq.id}>
                    <CardHeader className="p-3 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{boq.number}</CardTitle>
                          <p className="text-xs text-muted-foreground">{boq.title}</p>
                        </div>
                        <Badge variant={getStatusVariant(boq.status)} className="text-xs">
                          {boq.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Project:</span>
                            <div className="font-medium">{projectMap.get(boq.project) || boq.project}</div>
                          </div>
                         <div>
                           <span className="text-muted-foreground">Items:</span>
                           <div className="font-medium">{boq.itemCount}</div>
                         </div>
                         <div>
                           <span className="text-muted-foreground">Created by:</span>
                           <div className="font-medium">{boq.createdBy}</div>
                         </div>
                         <div>
                           <span className="text-muted-foreground">Created:</span>
                           <div className="font-medium">{new Date(boq.createdOn).toLocaleDateString()}</div>
                         </div>
                       </div>
                      
                      {currentUser.permissions.canViewPrices && (
                        <div className="pt-1 border-t">
                          <span className="text-xs text-muted-foreground">Total Value:</span>
                          <div className="text-sm font-semibold">₹{boq.totalValue.toLocaleString()}</div>
                        </div>
                      )}

                      <div className="pt-1 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Next Step: {boq.nextStep}</div>
                        <div className="flex gap-1 flex-wrap">
                          {getNextStepActions(boq)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="rounded-md border bg-white">
                <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>BoQ #</TableHead>
                       <TableHead>Project</TableHead>
                       <TableHead>Created On</TableHead>
                       <TableHead>Created By</TableHead>
                       <TableHead>Items</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Next Step</TableHead>
                       <TableHead>Last Update</TableHead>
                       <TableHead>Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {paginatedBoqs.map((boq) => (
                      <TableRow key={boq.id}>
                         <TableCell>
                           <div>
                             <div className="font-medium">{boq.number}</div>
                             <div className="text-sm text-muted-foreground">{boq.title}</div>
                             {currentUser.permissions.canViewPrices && (
                               <div className="text-sm font-medium text-primary">
                                 ₹{boq.totalValue.toLocaleString()}
                               </div>
                             )}
                           </div>
                         </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">{projectMap.get(boq.project) || boq.project}</span>
                          </TableCell>
                         <TableCell>{new Date(boq.createdOn).toLocaleDateString()}</TableCell>
                        <TableCell>{boq.createdBy}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <Badge variant="outline">{boq.itemCount}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(boq.status)}>
                            {boq.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {boq.nextStep}
                        </TableCell>
                        <TableCell>{new Date(boq.lastUpdate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {getNextStepActions(boq)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredBoqs.length)} of {filteredBoqs.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}