import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { service } from "@/shared/_services/api_service";

import boqData from "../../data/boqData.json";

const mockProjects = [
  { id: "PRJ-001", name: "Office Building Phase 1" },
  { id: "PRJ-002", name: "Residential Complex" },
  { id: "PRJ-003", name: "Shopping Mall" }
];

export default function BOQList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [boqs, setBoqs] = useState([])

  useEffect(()=>{
    const getBoq = async ()=>{
    const res = await service.getAllBoq()
    setBoqs(res.data || [])
    
    }
    getBoq()
  },[])

  const filteredBOQs = boqs.filter(boq => {
    const matchesSearch = 
                         boq.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         boq.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !selectedProject || selectedProject === "all" || boq.project === selectedProject;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || boq.status === selectedStatus;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    return status === "Confirmed" ? "default" : "secondary";
  };

  const canEdit = (boq: any) => boq.status === "Draft";
  const canDelete = (boq: any) => boq.status === "Draft"; // Add logic for no indents

  const handleView = (boqId: string) => {
    navigate(`/boq/${boqId}`);
  };

  const handleEdit = (boqId: string) => {
    navigate(`/boq/edit/${boqId}`);
  };

  const handleDelete = (boqId: string) => {
    // Add delete logic
    console.log("Delete BOQ:", boqId);
  };

  if (isMobile) {
    return (
      <div className="container mx-auto p-4 space-y-4">

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search BOQ, Project, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* BOQ Cards */}
        <div className="space-y-3">
          {filteredBOQs.map((boq) => (
            <Card key={boq.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{boq.title}</h3>
                  <p className="text-sm text-muted-foreground">{boq.number}</p>
                </div>
                  <Badge variant={getStatusVariant(boq.status)}>
                    {boq.status}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Project:</span> {mockProjects.find(p => p.id === boq.project)?.name}</p>
                  <p><span className="font-medium">Items:</span> {boq.itemCount}</p>
                  <p><span className="font-medium">Created:</span> {boq.createdOn}</p>
                  <p><span className="font-medium">By:</span> {boq.createdBy}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleView(boq.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {canEdit(boq) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(boq.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canDelete(boq) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(boq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          {/* <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by BOQ name, project, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {mockProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BOQ Table */}
      <Card>
        <CardContent className="p-0">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBOQs.map((boq) => (
                <TableRow key={boq.id}>
                  <TableCell>
              <div>
                <div className="font-medium">{boq.title}</div>
                <div className="text-sm text-muted-foreground">{boq.number}</div>
              </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => navigate(`/team/projects/${boq.project}`)}
                    >
                      {mockProjects.find(p => p.id === boq.project)?.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(boq.status)}>
                      {boq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{boq.itemCount}</TableCell>
                  <TableCell>{boq.indents?.length || 0}</TableCell>
                  <TableCell>{boq.createdOn}</TableCell>
                  <TableCell>{boq.createdBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(boq.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {canEdit(boq) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(boq.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDelete(boq) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(boq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}    