import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Search, Filter, RotateCcw, Eye, FileText, CreditCard, AlertTriangle } from "lucide-react";
import mockData from "@/data/mockData.json";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store"; 
import { getVendorList } from "@/store/vendorSlice";


// Define vendor interface with createdDate
interface Vendor {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  outstandingBalance: number;
  createdDate: string;
  paymentHistory: Array<{
    date: string;
    amount: number;
    type: string;
    reference: string;
  }>;
}

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Purchaser",
  permissions: {
    canCreateBoQ: false,
    canRecordGRN: false,
    canApprove: false,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true,
    canManageItems: true,
    canCompareSelect: true,
    canCreateVendors: true,
    canMakePayments: false
  }
};

export default function VendorList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("balance-desc");
  // const [vendors, setVendors] = useState<Vendor[]>([]);
  // const [isLoading, setIsLoading] = useState();
  // const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { vendors, isLoading, error } = useSelector((state: RootState) => state.vendor);

  
  console.log(vendors);
  
  useEffect(() => {
  dispatch(getVendorList() );
}, [dispatch]);


// Fetch vendors from API using Axios
// useEffect(() => {
//   const fetchVendors = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get("http://localhost:8000/api/vendor", {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       // Map API response to Vendor interface
//       const mappedVendors: Vendor[] = response.data.result.map((vendor: any) => ({
//         id: vendor.vendorId,
//         name: vendor.name,
//         contact: vendor.contactPerson,
//         phone: vendor.phone,
//         email: vendor.email,
//         address: vendor.address,
//         status: vendor.status,
//         outstandingBalance: vendor.outstandingBalance || 0, // Default if not provided
//         createdDate: vendor.createdAt,
//         paymentHistory: vendor.paymentHistory || [], // Default if not provided
//       }));
//       setVendors(mappedVendors);
//       setError(null);
//     } catch (error: any) {
//       console.error("Error fetching vendors:", error);
//       const errorMessage = error.response?.data?.error || error.message || "Failed to fetch vendors";
//       setError(errorMessage);
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   fetchVendors();
// }, [toast]);

// Check permissions - Employee should not see this page
  if (!currentUser.permissions.canViewVendors) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Vendor information is not accessible to your role.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

 
  const vendorsWithStats = useMemo(() => {
    return vendors.map(vendor => {
     
      const itemsSupplied = mockData.items.filter(item => item.vendors.some(v => v.vendor === vendor.name)).length;

 
      const vendorPOs = mockData.purchaseOrders.filter(po => po.vendor === vendor.name);
      const totalPOs = vendorPOs.length;
      const openPOs = vendorPOs.filter(po => po.status === "Open" || po.status === "Partial").length;
      return {
        ...vendor,
        itemsSupplied,
        totalPOs,
        openPOs
      };
    });
  }, [vendors]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendorsWithStats;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.phone.toLowerCase().includes(query) ||
        vendor.email.toLowerCase().includes(query)
      );
    }

    // Balance filter
    if (balanceFilter === "outstanding") {
      filtered = filtered.filter(vendor => vendor.outstandingBalance > 0);
    } else if (balanceFilter === "zero") {
      filtered = filtered.filter(vendor => vendor.outstandingBalance === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "balance-desc":
          return b.outstandingBalance - a.outstandingBalance;
        case "balance-asc":
          return a.outstandingBalance - b.outstandingBalance;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    return filtered;
  }, [vendorsWithStats, searchQuery, balanceFilter, sortBy]);

  const handleCreateVendor = () => {
    navigate("/vendors/create");
  };

  const handleViewVendor = (vendorId: string) => {
    navigate(`/vendors/detail?id=${vendorId}`);
  };

  const handleVendorLedger = (vendorId: string) => {
    navigate(`/vendors/ledger?id=${vendorId}`);
  };

  const handleAddPayment = (vendorId: string) => {
    navigate(`/vendors/payment?id=${vendorId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setBalanceFilter("all");
    setSortBy("balance-desc");
  };

  const canCreateVendors = currentUser.permissions.canCreateVendors;
  const canMakePayments = currentUser.permissions.canMakePayments || currentUser.role === "Accountant";

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Action Bar */}
        {canCreateVendors && (
          <div className="mb-6">
            <Button onClick={handleCreateVendor}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Vendor
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar with Mobile Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email"
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
                    {/* Balance Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Balance Filter</label>
                      <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="outstanding">Outstanding Only</SelectItem>
                          <SelectItem value="zero">Zero Balance</SelectItem>
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
                          <SelectItem value="balance-desc">Balance (High to Low)</SelectItem>
                          <SelectItem value="balance-asc">Balance (Low to High)</SelectItem>
                          <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z to A)</SelectItem>
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
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label>Balance Filter:</Label>
                <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="outstanding">Outstanding Only</SelectItem>
                    <SelectItem value="zero">Zero Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Sort By:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance-desc">Balance (High to Low)</SelectItem>
                    <SelectItem value="balance-asc">Balance (Low to High)</SelectItem>
                    <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Clear Filters Button for Desktop */}
          {!isMobile && (searchQuery || balanceFilter !== "all" || sortBy !== "balance-desc") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading vendors...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading vendors</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {vendors.length === 0 ? (
                <>
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No vendors found</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first vendor</p>
                  {canCreateVendors && (
                    <Button onClick={handleCreateVendor}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Vendor
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No vendors match these filters</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : !isLoading && !error && isMobile ? (
          <div className="grid gap-3">
            {filteredVendors.map(vendor => (
              <Card key={vendor.id} className="shadow-card">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-lg font-medium">{vendor.name}</div>
                        <Badge variant="outline" className="text-xs font-mono">{vendor.id}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>Created: {new Date(vendor.createdDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}</p>
                        <p>Status: {vendor.status}</p>
                        <p>Items: {vendor.itemsSupplied}</p>
                        <p>Total POs: {vendor.totalPOs}</p>
                        <p>Open POs: {vendor.openPOs}</p>
                        <p>Outstanding: ₹{vendor.outstandingBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewVendor(vendor.vendorId)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleVendorLedger(vendor.id)}>
                      <FileText className="h-3 w-3 mr-1" />
                      Ledger
                    </Button>
                    {canMakePayments && (
                      <Button size="sm" variant="outline" onClick={() => handleAddPayment(vendor.id)}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Payment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading && !error && (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor ID</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total POs</TableHead>
                  <TableHead>Open POs</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map(vendor => (
                  <TableRow key={vendor.vendorId}>
                    <TableCell className="font-mono text-sm">{vendor.vendorId}</TableCell>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(vendor.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === "active" ? "default" : vendor.status === "inactive" ? "secondary" : "destructive"}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vendor.itemsSupplied}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {vendor.totalPOs}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vendor.openPOs > 0 ? "default" : "outline"}>
                        {vendor.openPOs}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${vendor.outstandingBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                          {/* ₹{vendor.outstandingBalance.toLocaleString()} */}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewVendor(vendor.vendorId)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVendorLedger(vendor.vendorId)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Ledger
                        </Button>
                        {canMakePayments && (
                          <Button size="sm" variant="outline" onClick={() => handleAddPayment(vendor.vendorId)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            Payment
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
