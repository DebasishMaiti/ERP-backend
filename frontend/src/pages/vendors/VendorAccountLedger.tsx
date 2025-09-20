import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Search, Filter, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import mockData from "@/data/mockData.json";

interface VendorLedgerSummary {
  id: string;
  name: string;
  vendorId: string;
  createdDate: string;
  status: "Active" | "Inactive" | "Blocked";
  totalPOs: number;
  openPOs: number;
  outstanding: number;
  lastActivity: string;
}

export default function VendorAccountLedger() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [balanceFilter, setBalanceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("outstanding-desc");

  // Check permissions
  const currentUser = mockData.users[0]; // In real app, get from auth context
  const canView = ["Purchaser", "Admin", "Accountant"].includes(currentUser.role);

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-6 shadow-card text-center">
          <p className="text-destructive">Access denied. You don't have permission to view vendor account ledgers.</p>
        </div>
      </div>
    );
  }

  // Calculate vendor summaries with financial data
  const vendorSummaries = useMemo(() => {
    return mockData.vendors.map(vendor => {
      // Get ledger entries for this vendor
      const ledgerEntries = mockData.vendorLedgerEntries.filter(entry => entry.vendorId === vendor.id);
      
      // Calculate outstanding balance
      const outstanding = ledgerEntries.reduce((acc, entry) => {
        return acc + (entry.debit || 0) - (entry.credit || 0);
      }, 0);

      // Get PO counts
      const poEntries = ledgerEntries.filter(entry => entry.type === "PO Add");
      const totalPOs = poEntries.length;
      
      // For open POs, we'll simulate some being closed
      const openPOs = Math.max(0, totalPOs - Math.floor(totalPOs * 0.6));

      // Get last activity
      const lastActivity = ledgerEntries.length > 0 
        ? ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : vendor.createdDate;

      return {
        id: vendor.id,
        name: vendor.name,
        vendorId: vendor.id,
        createdDate: vendor.createdDate,
        status: vendor.status as "Active" | "Inactive" | "Blocked",
        totalPOs,
        openPOs,
        outstanding,
        lastActivity
      };
    });
  }, []);

  // Filter and sort vendors
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendorSummaries;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(query) ||
        vendor.vendorId.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    // Apply balance filter
    if (balanceFilter === "Outstanding > 0") {
      filtered = filtered.filter(vendor => vendor.outstanding > 0);
    } else if (balanceFilter === "Settled (0)") {
      filtered = filtered.filter(vendor => vendor.outstanding === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "outstanding-desc":
          return b.outstanding - a.outstanding;
        case "outstanding-asc":
          return a.outstanding - b.outstanding;
        case "activity-desc":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "activity-asc":
          return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [vendorSummaries, searchQuery, statusFilter, balanceFilter, sortBy]);

  const handleOpenLedger = (vendorId: string) => {
    navigate(`/vendors/ledger-detail?id=${vendorId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setBalanceFilter("All");
    setSortBy("outstanding-desc");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Blocked": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTotalOutstanding = () => {
    return filteredAndSortedVendors.reduce((sum, vendor) => sum + vendor.outstanding, 0);
  };

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Summary Cards - Mobile Optimized */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Row 1: Total Vendors, Outstanding Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Total Vendors</div>
                <div className="text-lg font-bold">{filteredAndSortedVendors.length}</div>
              </div>
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Outstanding Balance</div>
                <div className={cn("text-lg font-bold", getTotalOutstanding() > 0 ? "text-red-600" : "text-green-600")}>
                  {formatCurrency(getTotalOutstanding())}
                </div>
              </div>
            </div>
            
            {/* Row 2: Vendors with Outstanding and Settled */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Vendors with Outstanding</div>
                <div className="text-lg font-bold">
                  {filteredAndSortedVendors.filter(v => v.outstanding > 0).length}
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Settled Vendors</div>
                <div className="text-lg font-bold text-green-600">
                  {filteredAndSortedVendors.filter(v => v.outstanding === 0).length}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredAndSortedVendors.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", getTotalOutstanding() > 0 ? "text-red-600" : "text-green-600")}>
                  {formatCurrency(getTotalOutstanding())}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vendors with Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredAndSortedVendors.filter(v => v.outstanding > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Settled Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredAndSortedVendors.filter(v => v.outstanding === 0).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        {isMobile ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Vendor name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Vendors</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Balance</label>
                    <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Outstanding > 0">Outstanding &gt; 0</SelectItem>
                        <SelectItem value="Settled (0)">Settled (0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outstanding-desc">Outstanding (High→Low)</SelectItem>
                        <SelectItem value="outstanding-asc">Outstanding (Low→High)</SelectItem>
                        <SelectItem value="activity-desc">Last Activity (Recent)</SelectItem>
                        <SelectItem value="activity-asc">Last Activity (Oldest)</SelectItem>
                        <SelectItem value="name-asc">Name (A→Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z→A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Search */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Vendor name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="min-w-[120px]">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Balance Filter */}
                <div className="min-w-[140px]">
                  <label className="text-sm font-medium mb-2 block">Balance</label>
                  <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Outstanding > 0">Outstanding &gt; 0</SelectItem>
                      <SelectItem value="Settled (0)">Settled (0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="min-w-[140px]">
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outstanding-desc">Outstanding (High→Low)</SelectItem>
                      <SelectItem value="outstanding-asc">Outstanding (Low→High)</SelectItem>
                      <SelectItem value="activity-desc">Last Activity (Recent)</SelectItem>
                      <SelectItem value="activity-asc">Last Activity (Oldest)</SelectItem>
                      <SelectItem value="name-asc">Name (A→Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z→A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendors Content */}
        {filteredAndSortedVendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No vendors found matching your criteria.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : isMobile ? (
          <div className="space-y-2">
            {filteredAndSortedVendors.map((vendor) => (
              <div key={vendor.id} className="bg-background p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{vendor.name}</div>
                    <div className="text-xs text-muted-foreground">{vendor.vendorId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getStatusColor(vendor.status))}>
                      {vendor.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenLedger(vendor.id)}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">POs (Total)</span>
                    <div className="font-medium">{vendor.totalPOs}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Open POs</span>
                    <div className="font-medium">{vendor.openPOs}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Outstanding</span>
                    <div className={cn("font-medium", 
                      vendor.outstanding > 0 ? "text-red-600" : 
                      vendor.outstanding === 0 ? "text-green-600" : "text-blue-600"
                    )}>
                      {formatCurrency(vendor.outstanding)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Last Activity: {formatDate(vendor.lastActivity)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">POs (Total)</TableHead>
                      <TableHead className="text-right">Open POs</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor.vendorId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(vendor.createdDate)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{vendor.totalPOs}</TableCell>
                        <TableCell className="text-right">{vendor.openPOs}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-medium",
                            vendor.outstanding > 0 ? "text-red-600" : 
                            vendor.outstanding === 0 ? "text-green-600" : "text-blue-600"
                          )}>
                            {formatCurrency(vendor.outstanding)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(vendor.lastActivity)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLedger(vendor.id)}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}