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
import { Search, Filter, RotateCcw, Eye, Package, History, FileText } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canRecordReceipt: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  }
};

export default function POList() {
  const navigate = useNavigate();
  const purchaseOrders = mockData.purchaseOrders;
  // Get the simple vendors array that has the 'active' property
  const simpleVendors = [
    { id: "V001", name: "ABC Suppliers", active: true },
    { id: "V002", name: "ALD Traders", active: true },
    { id: "V003", name: "XYA Materials", active: true },
    { id: "V004", name: "Steel City Suppliers", active: true },
    { id: "V005", name: "MMT Suppliers", active: true }
  ];
  const boqs = mockData.boqs;
  const isMobile = useIsMobile();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [boqFilter, setBoqFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("created");
  const [sortBy, setSortBy] = useState("lastUpdate");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique values for filters
  const uniqueBoqs = useMemo(() => {
    const boqIds = [...new Set(purchaseOrders.map(po => po.boqId))];
    return boqIds.sort();
  }, [purchaseOrders]);

  const uniqueVendors = useMemo(() => {
    if (currentUser.permissions.canViewVendors) {
      // Get vendors from the simple vendors array used for POs
      return simpleVendors.filter(v => v.active).sort((a, b) => a.name.localeCompare(b.name));
    }
    // For Ops users, show vendor IDs only
    const vendorIds = [...new Set(purchaseOrders.map(po => po.vendorId))];
    return vendorIds.sort().map(id => ({ id, name: id }));
  }, [simpleVendors, purchaseOrders]);

  const uniqueProjects = useMemo(() => {
    const projects = [...new Set(purchaseOrders.map(po => po.project))];
    return projects.sort();
  }, [purchaseOrders]);

  const uniqueEmployees = useMemo(() => {
    const employees = [...new Set([
      ...purchaseOrders.map(po => po.createdBy),
      ...purchaseOrders.filter(po => po.lastReceivedBy).map(po => po.lastReceivedBy)
    ])];
    return employees.sort();
  }, [purchaseOrders]);

  // Filter and sort POs
  const filteredPOs = useMemo(() => {
    let filtered = purchaseOrders.filter(po => {
      // Search filter - matches composite ID, BoQ ID, Vendor ID, or Vendor Name
      const matchesSearch = searchQuery === "" || 
        po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.boqId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (currentUser.permissions.canViewVendors && po.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      
      // Vendor filter
      const matchesVendor = vendorFilter === "all" || 
        po.vendorId === vendorFilter || 
        (currentUser.permissions.canViewVendors && po.vendor === vendorFilter);
      
      // BoQ filter
      const matchesBoq = boqFilter === "all" || po.boqId.startsWith(boqFilter);
      
      // Project filter
      const matchesProject = projectFilter === "all" || po.project === projectFilter;
      
      // Employee filter (Created By or Last Received By)
      const matchesEmployee = employeeFilter === "all" || 
        po.createdBy === employeeFilter || 
        po.lastReceivedBy === employeeFilter;
      
      return matchesSearch && matchesStatus && matchesVendor && matchesBoq && matchesProject && matchesEmployee;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastUpdate":
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
  }, [purchaseOrders, searchQuery, statusFilter, vendorFilter, boqFilter, projectFilter, employeeFilter, sortBy]);

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
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRowActions = (po: any) => {
    if (po.status === "Closed") {
      return [
        <Button 
          key="history" 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/po/${encodeURIComponent(po.id)}?tab=history`)}
        >
          History
        </Button>
      ];
    }

    if ((po.status === "Open" || po.status === "Partial") && currentUser.permissions.canRecordReceipt) {
      return [
        <Button 
          key="receive" 
          size="sm"
          onClick={() => navigate(`/po/${encodeURIComponent(po.id)}`)}
        >
          Details
        </Button>
      ];
    }

    return [];
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setVendorFilter("all");
    setBoqFilter("all");
    setProjectFilter("all");
    setEmployeeFilter("all");
    setSortBy("lastUpdate");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || vendorFilter !== "all" || 
    boqFilter !== "all" || projectFilter !== "all" || employeeFilter !== "all";

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
                placeholder="Search PO ID, BoQ ID, Vendor ID, Vendor Name..."
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
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                          <TabsTrigger value="Open" className="text-xs">Open</TabsTrigger>
                          <TabsTrigger value="Partial" className="text-xs">Partial</TabsTrigger>
                          <TabsTrigger value="Closed" className="text-xs">Closed</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* BoQ Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">BoQ ID</label>
                      <Select value={boqFilter} onValueChange={setBoqFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All BoQs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All BoQs</SelectItem>
                          {uniqueBoqs.map((boqId) => (
                            <SelectItem key={boqId} value={boqId}>
                              {boqId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {currentUser.permissions.canViewVendors ? vendor.name : vendor.id}
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

                    {/* Employee Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Employee</label>
                      <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          {uniqueEmployees.map((employee) => (
                            <SelectItem key={employee} value={employee}>
                              {employee}
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

          {/* Desktop Filter Controls - Single Line */}
          {!isMobile && (
            <div className="flex gap-3 items-end">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="Open" className="text-xs">Open</TabsTrigger>
                    <TabsTrigger value="Partial" className="text-xs">Partial</TabsTrigger>
                    <TabsTrigger value="Closed" className="text-xs">Closed</TabsTrigger>
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
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {currentUser.permissions.canViewVendors ? vendor.name : vendor.id}
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

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastUpdate">Last Updated</SelectItem>
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
          <div className="text-center py-12">
            <div className="bg-card rounded-lg p-8 shadow-card">
              <h3 className="text-lg font-semibold mb-2">No Purchase Orders found</h3>
              <p className="text-muted-foreground mb-4">
                {purchaseOrders.length === 0 
                  ? "No purchase orders have been generated yet"
                  : "Try adjusting your search or filters"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            {isMobile ? (
              <div className="space-y-2">
                {paginatedPOs.map((po) => (
                  <Card key={po.id}>
                    <CardHeader className="p-3 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-mono">{po.id}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(po.status)} text-xs`}>{po.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
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
                        <div className="pt-1 border-t">
                          <span className="text-xs text-muted-foreground">Total Amount:</span>
                          <div className="text-sm font-semibold">₹{po.totalAmount.toLocaleString()}</div>
                        </div>
                      )}

                      <div className="pt-1 border-t">
                        <div className="flex gap-1 flex-wrap">
                          {getRowActions(po)}
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
                      <TableHead>PO #</TableHead>
                      <TableHead>BoQ ID</TableHead>
                      <TableHead>{currentUser.permissions.canViewVendors ? "Vendor" : "Vendor ID"}</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Order Date</TableHead>
                      {currentUser.permissions.canViewPrices && <TableHead>Amount</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPOs.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{po.id}</div>
                          <div className="text-xs text-muted-foreground">
                            Created by {po.createdBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-mono text-sm"
                            onClick={() => navigate(`/indent/${po.boqId}`)}
                          >
                            {po.boqId}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                        </TableCell>
                        <TableCell>{po.project}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <Badge variant="outline">{po.items.length}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        {currentUser.permissions.canViewPrices && (
                          <TableCell className="font-semibold">₹{po.totalAmount.toLocaleString()}</TableCell>
                        )}
                        <TableCell>
                          <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {getRowActions(po)}
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