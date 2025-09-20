import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, Eye, Package, FileText, RotateCcw, Filter } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role
const currentUser = {
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canRecordReceipt: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  }
};

export default function PODetail() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Filter to show only non-closed POs
  const activePOs = mockData.purchaseOrders.filter(po => po.status !== "Closed");
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("orderDate");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Get unique values for filters (only from active POs)
  const uniqueVendors = useMemo(() => {
    if (currentUser.permissions.canViewVendors) {
      const vendors = [...new Set(activePOs.map(po => po.vendor))];
      return vendors.sort();
    }
    const vendorIds = [...new Set(activePOs.map(po => po.vendorId))];
    return vendorIds.sort();
  }, [activePOs]);

  const uniqueProjects = useMemo(() => {
    const projects = [...new Set(activePOs.map(po => po.project))];
    return projects.sort();
  }, [activePOs]);

  // Filter and sort active POs
  const filteredPOs = useMemo(() => {
    let filtered = activePOs.filter(po => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.boqId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (currentUser.permissions.canViewVendors && po.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter (only Open and Partial available)
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      
      // Vendor filter
      const matchesVendor = vendorFilter === "all" || 
        po.vendorId === vendorFilter || 
        (currentUser.permissions.canViewVendors && po.vendor === vendorFilter);
      
      // Project filter
      const matchesProject = projectFilter === "all" || po.project === projectFilter;
      
      return matchesSearch && matchesStatus && matchesVendor && matchesProject;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "orderDate":
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "vendor":
          return currentUser.permissions.canViewVendors 
            ? a.vendor.localeCompare(b.vendor)
            : a.vendorId.localeCompare(b.vendorId);
        case "project":
          return a.project.localeCompare(b.project);
        case "poId":
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activePOs, searchQuery, statusFilter, vendorFilter, projectFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenPO = (po: any) => {
    navigate(`/po/${encodeURIComponent(po.id)}`);
  };

  const handleReceivePO = (po: any) => {
    navigate(`/po/${encodeURIComponent(po.id)}/receipt`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setVendorFilter("all");
    setProjectFilter("all");
    setSortBy("orderDate");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || vendorFilter !== "all" || projectFilter !== "all";

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
                placeholder="Search PO ID, BoQ ID, Vendor..."
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
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Mobile Filter Controls */}
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                          <TabsTrigger value="Open" className="text-xs">Open</TabsTrigger>
                          <TabsTrigger value="Partial" className="text-xs">Partial</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Vendor Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {currentUser.permissions.canViewVendors ? "Vendor" : "Vendor ID"}
                      </label>
                      <Select value={vendorFilter} onValueChange={setVendorFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Vendors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          {uniqueVendors.map((vendor) => (
                            <SelectItem key={vendor} value={vendor}>
                              {vendor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                            <SelectItem key={project} value={project}>
                              {project}
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
                          <SelectItem value="orderDate">Order Date</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="poId">PO Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters} className="w-full">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Filter Controls */}
          {!isMobile && (
            <div className="flex gap-3 items-end">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="Open" className="text-xs">Open</TabsTrigger>
                    <TabsTrigger value="Partial" className="text-xs">Partial</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {currentUser.permissions.canViewVendors ? "Vendor" : "Vendor ID"}
                </label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {uniqueVendors.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orderDate">Order Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="poId">PO Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="mb-0">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {filteredPOs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Active Purchase Orders</h3>
              <p className="text-muted-foreground mb-4">
                {activePOs.length === 0 
                  ? "No open or partial purchase orders found"
                  : "Try adjusting your search or filters"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="space-y-3">
                {paginatedPOs.map((po) => (
                  <Card key={po.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-mono text-sm">{po.id}</div>
                          <p className="text-sm text-muted-foreground">
                            {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                          </p>
                        </div>
                        <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-muted-foreground">BoQ:</span>
                          <div className="font-medium">{po.boqId}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Project:</span>
                          <div className="font-medium">{po.project}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <div className="font-medium">{po.items.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Order Date:</span>
                          <div className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      {currentUser.permissions.canViewPrices && (
                        <div className="pt-2 border-t mb-2">
                          <span className="text-sm text-muted-foreground">Total Amount:</span>
                          <div className="text-lg font-semibold">₹{po.totalAmount.toLocaleString()}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {po.status === "Closed" ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenPO(po)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            History
                          </Button>
                        ) : (
                          currentUser.permissions.canRecordReceipt && (
                            <Button 
                              size="sm"
                              onClick={() => handleReceivePO(po)}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Receive
                            </Button>
                          )
                        )}
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
                      <TableHead>PO #</TableHead>
                      <TableHead>BoQ ID</TableHead>
                      <TableHead>{currentUser.permissions.canViewVendors ? "Vendor" : "Vendor ID"}</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Order Date</TableHead>
                      {currentUser.permissions.canViewPrices && <TableHead>Total Amount</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPOs.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{po.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{po.boqId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                          </div>
                        </TableCell>
                        <TableCell>{po.project}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{po.items.length}</Badge>
                        </TableCell>
                        <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        {currentUser.permissions.canViewPrices && (
                          <TableCell className="font-medium">₹{po.totalAmount.toLocaleString()}</TableCell>
                        )}
                        <TableCell>
                          <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {po.status === "Closed" ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenPO(po)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                History
                              </Button>
                            ) : (
                              currentUser.permissions.canRecordReceipt && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleReceivePO(po)}
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Receive
                                </Button>
                              )
                            )}
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
                  <span>
                    {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredPOs.length)} of {filteredPOs.length}
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