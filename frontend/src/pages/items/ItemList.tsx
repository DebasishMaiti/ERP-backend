import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Edit, Eye, Search, Filter, RotateCcw } from "lucide-react";
import { RootState, AppDispatch } from "@/store/store";
import { getItemList } from "@/store/ItemSlice";

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
  },
};

export default function ItemList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const items = useSelector((state: RootState) => state.item.items);
  const loading = useSelector((state: RootState) => state.loader.isLoading);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // Check permissions
  const canManageItems = currentUser.permissions.canManageItems;
  const canViewPrices = currentUser.permissions.canViewPrices;
  const canViewVendors = currentUser.permissions.canViewVendors;

  // For Employee role - hide pricing and vendor details
  const isEmployee = currentUser.role === "Employee";

  // Fetch items using Redux thunk
  useEffect(() => {
    dispatch(getItemList());
  }, [dispatch]);

  const handleCreateItem = () => {
    navigate("/items/create");
  };
  const handleEditItem = (itemId: string) => {
    navigate(`/items/edit?id=${itemId}`);
  };
  const handleViewItem = (itemId: string) => {
    navigate(`/items/view?id=${itemId}`);
  };

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item._id.toLowerCase().includes(query) ||
        item.unit.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "unit-asc":
          return a.unit.localeCompare(b.unit);
        case "unit-desc":
          return b.unit.localeCompare(a.unit);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("name-asc");
  };

  if (loading) {
    return <div className="p-6 text-center">Loading items...</div>;
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
                placeholder="Search items by name, ID, or unit..."
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
                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                          <SelectItem value="unit-asc">Unit (A to Z)</SelectItem>
                          <SelectItem value="unit-desc">Unit (Z to A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || sortBy !== "name-asc") && (
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

          {/* Clear Filters Button for Desktop */}
          {!isMobile && (searchQuery || sortBy !== "name-asc") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {items.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first item</p>
                  {canManageItems && (
                    <Button onClick={handleCreateItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No items match your search</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-lg font-medium">{item.name}</div>
                      <p className="text-muted-foreground">Unit: {item.unit}</p>
                      <p className="text-sm text-muted-foreground">ID: {item._id}</p>
                      {canViewVendors && !isEmployee && (
                        <p className="text-sm text-muted-foreground">
                          Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {canViewVendors && !isEmployee && (
                        <Badge variant="outline">{item.vendors.length} Vendors</Badge>
                      )}
                      <div className="flex gap-1">
                        {canManageItems ? (
                          <Button size="sm" variant="outline" onClick={() => handleEditItem(item._id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleViewItem(item._id)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {canViewVendors && canViewPrices && !isEmployee && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Vendor Prices:</div>
                      {item.vendors.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No vendor prices configured</p>
                      ) : (
                        item.vendors.map((vendor: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-secondary rounded"
                          >
                            <div>
                              <span className="font-medium">
                                {vendor.vendor?.name || "Unnamed Vendor"}
                              </span>
                              <span
                                className={`ml-2 text-xs px-2 py-1 rounded ${
                                  vendor.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {vendor.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ₹{vendor.pricePerUnit.toLocaleString()}/{item.unit}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Unit</TableHead>
                  {canViewVendors && !isEmployee && <TableHead>Vendors</TableHead>}
                  {canViewPrices && !isEmployee && <TableHead>Best Price</TableHead>}
                  {canViewPrices && !isEmployee && <TableHead>Price Range</TableHead>}
                  {canViewVendors && !isEmployee && <TableHead>Last Updated</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const activePrices =
                    item.vendors?.filter((v: any) => v.status === "active").map((v: any) => v.pricePerUnit) || [];
                  const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
                  const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : 0;
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      {canViewVendors && !isEmployee && (
                        <TableCell>
                          <Badge variant="outline">
                            {item.vendors.length} Vendor{item.vendors.length !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                      )}
                      {canViewPrices && !isEmployee && (
                        <TableCell className="font-semibold">
                          {activePrices.length > 0 ? `₹${minPrice.toLocaleString()}/${item.unit}` : "No prices"}
                        </TableCell>
                      )}
                      {canViewPrices && !isEmployee && (
                        <TableCell>
                          {activePrices.length > 1
                            ? `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`
                            : activePrices.length === 1
                            ? `₹${minPrice.toLocaleString()}`
                            : "N/A"}
                        </TableCell>
                      )}
                      {canViewVendors && !isEmployee && (
                        <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                      )}
                      <TableCell>
                        {canManageItems ? (
                          <Button size="sm" variant="outline" onClick={() => handleEditItem(item.itemId)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleViewItem(item.itemId)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}