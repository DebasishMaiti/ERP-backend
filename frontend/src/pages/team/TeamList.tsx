import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import mockData from "@/data/mockData.json";
import { Search, Filter, Plus, Eye, Edit, MoreVertical, Power, PowerOff, RotateCcw, Mail } from "lucide-react";

export default function TeamList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const teamMembers = mockData.teamMembers;
  
  // Current user role for permissions
  const currentUserRole = "Admin"; // This would come from auth context
  const canManageTeam = currentUserRole === "Admin";
  const canViewDetails = ["Admin", "Purchaser"].includes(currentUserRole);

  const filteredAndSortedMembers = useMemo(() => {
    return teamMembers
      .filter(member => {
        const matchesSearch = 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || member.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "lastLogin":
            return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [teamMembers, searchTerm, statusFilter, sortBy]);

  const getAccessLevel = (member: any) => {
    if (member.isAdmin) return "Admin";
    const projectCount = member.permissions?.projects?.length || 0;
    const moduleAccess = Object.values(member.permissions?.modules || {}).filter((m: any) => m.read || m.write).length;
    return `${projectCount}P/${moduleAccess}M`;
  };

  const getAccessColor = (member: any) => {
    if (member.isAdmin) return "destructive";
    const projectCount = member.permissions?.projects?.length || 0;
    if (projectCount >= 3) return "default";
    if (projectCount >= 1) return "secondary";
    return "outline";
  };

  const handleToggleStatus = (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    console.log(`Toggling status for ${memberId} to ${newStatus}`);
    toast({
      title: `Member ${newStatus.toLowerCase()}`,
      description: `User has been ${newStatus.toLowerCase()}.`,
    });
  };

  const handleResetPassword = (memberEmail: string) => {
    console.log(`Sending password reset to ${memberEmail}`);
    toast({
      title: "Password reset sent",
      description: `Password reset email sent to ${memberEmail}`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortBy("name");
  };

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters - Mobile */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters & Sort
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Filters & Sort</SheetTitle>
                  <SheetDescription>
                    Filter and sort team members
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A→Z)</SelectItem>
                        <SelectItem value="lastLogin">Last Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || statusFilter !== "All") && (
                    <Button variant="outline" onClick={clearFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            /* Filters - Desktop */
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A→Z)</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "All") && (
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}

              {/* Add Member */}
              {canManageTeam && (
                <Button onClick={() => navigate("/team/edit")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {filteredAndSortedMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <p className="text-lg font-medium text-muted-foreground">
                {teamMembers.length === 0 ? "No team members found" : "No results found"}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamMembers.length === 0 
                  ? "Add your first team member to get started." 
                  : "Try adjusting your search or filters."}
              </p>
              {teamMembers.length === 0 && canManageTeam ? (
                <Button onClick={() => navigate("/team/edit")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : isMobile ? (
          <>
            {/* Mobile Add Button */}
            {canManageTeam && (
              <div className="mb-4">
                <Button onClick={() => navigate("/team/edit")} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            )}
            
            {/* Mobile Cards */}
            <div className="space-y-4">
              {filteredAndSortedMembers.map((member) => (
                <Card key={member.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant={getAccessColor(member)}>{getAccessLevel(member)}</Badge>
                        <Badge variant={member.status === "Active" ? "default" : "destructive"}>
                          {member.status}
                        </Badge>
                        {member.permissions && (
                          <span className="text-xs text-muted-foreground">
                            {member.permissions.projects.length} projects
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Joined: {member.joinDate}
                      </div>
                      {(canViewDetails || canManageTeam) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canViewDetails && (
                              <DropdownMenuItem onClick={() => navigate(`/team/edit?id=${member.id}&mode=view`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            )}
                            {canManageTeam && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/team/edit?id=${member.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(member.id, member.status)}>
                                  {member.status === "Active" ? (
                                    <>
                                      <PowerOff className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Power className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(member.email)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Desktop Table */
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getAccessColor(member)}>{getAccessLevel(member)}</Badge>
                          {member.permissions && (
                            <span className="text-xs text-muted-foreground">
                              ({member.permissions.projects.length} projects)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === "Active" ? "default" : "destructive"}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                      <TableCell>
                        {(canViewDetails || canManageTeam) && (
                          <div className="flex items-center justify-end gap-2">
                            {canViewDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/team/edit?id=${member.id}&mode=view`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {canManageTeam && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/team/edit?id=${member.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleToggleStatus(member.id, member.status)}>
                                      {member.status === "Active" ? (
                                        <>
                                          <PowerOff className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <Power className="mr-2 h-4 w-4" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(member.email)}>
                                      <Mail className="mr-2 h-4 w-4" />
                                      Reset Password
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}