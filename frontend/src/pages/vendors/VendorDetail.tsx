import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, ArrowUpDown, Save, RotateCcw, Trash2, AlertTriangle, Edit, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import Redux actions
import { getVendorById, updateVendor } from "@/store/vendorSlice";
 
const currentUser = {
  role: "Purchaser",
  permissions: {
    canManageVendors: true,
    canEditItems: true,
    canViewPrices: true
  }
};

interface VendorItem {
  itemId: string;
  itemName: string;
  unit: string;
  price: number;
  moq: number;
  active: boolean;
  notes: string;
  lastUpdated: string;
  lastUpdatedBy?: string;
  removed?: boolean;
  removedAt?: string;
  removedBy?: string;
}

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
  lastUpdated?: string;
  gstin?: string;
  taxId?: string;
}

interface EditingState {
  [key: string]: {
    price?: number;
    moq?: number;
    notes?: string;
    active?: boolean;
  };
}

export default function VendorDetail() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { selectedVendor, isLoading, error } = useSelector((state: RootState) => state.vendor);
  const globalLoading = useSelector((state: RootState) => state.loader.isLoading);

  const [vendorItems, setVendorItems] = useState<VendorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("item");
  const [editingVendor, setEditingVendor] = useState(false);
  const [editingItems, setEditingItems] = useState<EditingState>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [vendorData, setVendorData] = useState<Vendor | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check permissions
  const isEmployee = currentUser.role === "Employee";
  const canEdit = currentUser.role === "Purchaser" || currentUser.role === "Admin";
  const canViewPrices = currentUser.permissions.canViewPrices;

  // Fetch vendor data using Redux thunk
  useEffect(() => {
    if (!id || isEmployee) {
      if (isEmployee) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view vendor details.",
          variant: "destructive",
        });
        navigate("/vendors/list");
      }
      return;
    }

    dispatch(getVendorById(id));
  }, [id, isEmployee, navigate, toast, dispatch]);

  console.log(selectedVendor);
  
 
useEffect(() => {
  if (selectedVendor) {
    const vendorResult = selectedVendor.result;
    
    const mappedVendor: Vendor = {
      id: vendorResult.vendorId, // Use vendorId directly from result
      name: vendorResult.name,
      contact: vendorResult.contactPerson,
      phone: vendorResult.phone,
      email: vendorResult.email,
      address: vendorResult.address,
      status: vendorResult.status,
      outstandingBalance: vendorResult.outstandingBalance || 0, // Default to 0 if missing
      createdDate: vendorResult.createdAt,
      lastUpdated: vendorResult.updatedAt,
      gstin: vendorResult.gstin,
      taxId: vendorResult.gstin, // Using gstin for taxId as it's not in response
    };

    setVendorData(mappedVendor);

    // Extract vendor items from the response
    const items: VendorItem[] = [];
    if (selectedVendor.item) {
      selectedVendor.item.forEach((item: any) => {
        const vendorInfo = item.vendors.find((v: any) => v.vendor === vendorResult._id);
        if (vendorInfo) {
          items.push({
            itemId: item.itemId,                   
            itemName: item.name,
            unit: item.unit,
            price: vendorInfo.pricePerUnit,    
            moq: vendorInfo.moq || 0, // Default to 0 if missing
            active: vendorInfo.status === "active",
            notes: vendorInfo.notes || "",
            lastUpdated: item.updatedAt,       
            lastUpdatedBy: vendorInfo.lastUpdatedBy || "System", // Default value
          });
        }
      });
    }
    setVendorItems(items);
  }
}, [selectedVendor]);

  // Handle errors from Redux
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      navigate("/vendors/list");
    }
  }, [error, toast, navigate]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = vendorItems.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.itemId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && item.active) ||
                           (statusFilter === "inactive" && !item.active) ||
                           (statusFilter === "removed" && item.removed);
      
      return matchesSearch && matchesStatus && !item.removed;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "item":
          return a.itemName.localeCompare(b.itemName);
        case "price":
          return a.price - b.price;
        case "moq":
          return a.moq - b.moq;
        case "updated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [vendorItems, searchTerm, statusFilter, sortBy]);

  const startEditingItem = (itemId: string, field: string, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveItemChanges = (itemId: string) => {
    const changes = editingItems[itemId];
    if (!changes) return;

    setVendorItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, ...changes, lastUpdated: new Date().toISOString() } : item
    ));

    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });

    if (Object.keys(editingItems).length === 1) {
      setHasUnsavedChanges(false);
    }

    toast({
      title: "Changes Saved",
      description: "Item details updated successfully.",
    });
  };

  const cancelItemChanges = (itemId: string) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });

    if (Object.keys(editingItems).length === 1) {
      setHasUnsavedChanges(false);
    }
  };

  const saveAllChanges = () => {
    Object.keys(editingItems).forEach(itemId => {
      saveItemChanges(itemId);
    });
  };

  const discardAllChanges = () => {
    setEditingItems({});
    setHasUnsavedChanges(false);
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded.",
    });
  };

  const removeItem = (itemId: string, itemName: string) => {
    setVendorItems(prev => prev.map(item => 
      item.itemId === itemId 
        ? { 
            ...item, 
            removed: true, 
            active: false,
            removedAt: new Date().toISOString(),
            removedBy: currentUser.role
          } 
        : item
    ));

    toast({
      title: "Item Removed",
      description: `${itemName} has been removed from this vendor's catalog.`,
    });
  };

  const updateVendorField = (field: string, value: any) => {
    if (!vendorData) return;
    setVendorData(prev => prev ? { ...prev, [field]: value } : null);
    setHasUnsavedChanges(true);
  };

  // Update vendor using Redux thunk
  const saveVendorChanges = async () => {
    if (!vendorData || !id) return;
    
    setIsSaving(true);
    try {
      // Prepare the data for the API call
      const updateData = {
        name: vendorData.name,
        contactPerson: vendorData.contact,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address,
        status: vendorData.status,
        gstin: vendorData.gstin,
      };

      // Dispatch the update thunk
      await dispatch(updateVendor(id, updateData ))
      
      // If successful, the Redux state will be updated automatically
      setEditingVendor(false);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Vendor Updated",
        description: "Vendor information has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      const errorMessage = error?.message || "Failed to update vendor";
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

const cancelVendorChanges = () => {
  // Reset to the original vendor data from Redux
  if (selectedVendor) {
    const vendorResult = selectedVendor.result;
    
    const mappedVendor: Vendor = {
      id: vendorResult.vendorId,
      name: vendorResult.name,
      contact: vendorResult.contactPerson,
      phone: vendorResult.phone,
      email: vendorResult.email,
      address: vendorResult.address,
      status: vendorResult.status,
      outstandingBalance: vendorResult.outstandingBalance || 0,
      createdDate: vendorResult.createdAt,
      lastUpdated: vendorResult.updatedAt,
      gstin: vendorResult.gstin,
      taxId: vendorResult.gstin,
    };
    setVendorData(mappedVendor);
  }
  setEditingVendor(false);
  setHasUnsavedChanges(false);
};

  if (isLoading || globalLoading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading vendor details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !selectedVendor) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Vendor Not Found</h3>
              <p className="text-muted-foreground mb-4">{error || "The requested vendor could not be found."}</p>
              <Button onClick={() => navigate("/vendors/list")}>
                Back to Vendor List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isEmployee) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-card rounded-lg p-6 shadow-card">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>You don't have permission to view vendor details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Vendor Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vendor Information</CardTitle>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingVendor ? cancelVendorChanges() : setEditingVendor(true)}
                disabled={isSaving}
              >
                {editingVendor ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {editingVendor ? "Cancel" : "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                {editingVendor && canEdit ? (
                  <Select value={vendorData?.status} onValueChange={(value) => updateVendorField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <Badge variant={vendorData?.status === "active" ? "default" : vendorData?.status === "inactive" ? "secondary" : "destructive"}>
                      {vendorData?.status ? vendorData.status.charAt(0).toUpperCase() + vendorData.status.slice(1) : "Unknown"}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                {editingVendor && canEdit ? (
                  <Input
                    value={vendorData?.contact || ""}
                    onChange={(e) => updateVendorField('contact', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium">{vendorData?.contact}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                {editingVendor && canEdit ? (
                  <Input
                    value={vendorData?.phone || ""}
                    onChange={(e) => updateVendorField('phone', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium">{vendorData?.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                {editingVendor && canEdit ? (
                  <Input
                    value={vendorData?.email || ""}
                    onChange={(e) => updateVendorField('email', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-medium">{vendorData?.email}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                {editingVendor && canEdit ? (
                  <Textarea
                    value={vendorData?.address || ""}
                    onChange={(e) => updateVendorField('address', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 font-medium">{vendorData?.address}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Outstanding Balance */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Outstanding Balance</label>
                <p className="mt-1 text-lg font-bold text-primary">₹{vendorData?.outstandingBalance?.toLocaleString('en-IN') || 0}</p>
              </div>

              {/* Created Date */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="mt-1 font-medium">{vendorData?.createdDate ? new Date(vendorData.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}</p>
              </div>

              {/* Last Updated */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1 font-medium">{vendorData?.lastUpdated ? new Date(vendorData.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not updated'}</p>
              </div>
            </div>

            {editingVendor && canEdit && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={cancelVendorChanges} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={saveVendorChanges} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Supplied */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle>Items Supplied by This Vendor</CardTitle>
              {hasUnsavedChanges && canEdit && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={discardAllChanges}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Discard Changes
                  </Button>
                  <Button size="sm" onClick={saveAllChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item">Item Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="moq">MOQ</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items Table/Cards */}
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items linked to this vendor.</p>
                <p className="text-sm mt-1">To add items, go to Items → Add/Edit Item → Vendor Prices and add this vendor.</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => {
                  const isEditing = editingItems[item.itemId];
                  return (
                    <Card key={item.itemId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.itemName}</h4>
                            <p className="text-sm text-muted-foreground">{item.itemId}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => cancelItemChanges(item.itemId)}>
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={() => saveItemChanges(item.itemId)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              </>
                            ) : canEdit ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Remove this vendor's price for {item.itemName}? Existing POs stay unchanged; this item will not appear in future comparisons.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeItem(item.itemId, item.itemName)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : null}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Unit:</span>
                            <span className="text-sm">{item.unit}</span>
                          </div>
                          {canViewPrices && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Price/Unit:</span>
                              {isEditing && canEdit ? (
                                <Input
                                  type="number"
                                  value={isEditing.price ?? item.price}
                                  onChange={(e) => startEditingItem(item.itemId, 'price', Number(e.target.value))}
                                  className="w-20 h-6 text-sm"
                                />
                              ) : canEdit ? (
                                <span 
                                  className="text-sm font-medium cursor-pointer hover:bg-muted/50 p-1 rounded"
                                  onClick={() => startEditingItem(item.itemId, 'price', item.price)}
                                >
                                  ₹{item.price.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-sm font-medium">₹{item.price.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">MOQ:</span>
                            {isEditing && canEdit ? (
                              <Input
                                type="number"
                                value={isEditing.moq ?? item.moq}
                                onChange={(e) => startEditingItem(item.itemId, 'moq', Number(e.target.value))}
                                className="w-20 h-6 text-sm"
                              />
                            ) : canEdit ? (
                              <span 
                                className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                                onClick={() => startEditingItem(item.itemId, 'moq', item.moq)}
                              >
                                {item.moq}
                              </span>
                            ) : (
                              <span className="text-sm">{item.moq}</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Active:</span>
                            {isEditing && canEdit ? (
                              <Switch
                                checked={isEditing.active ?? item.active}
                                onCheckedChange={(checked) => startEditingItem(item.itemId, 'active', checked)}
                              />
                            ) : (
                              <Badge variant={item.active ? "default" : "secondary"}>
                                {item.active ? "Yes" : "No"}
                              </Badge>
                            )}
                          </div>
                          {item.notes && (
                            <div>
                              <span className="text-sm text-muted-foreground">Notes:</span>
                              {isEditing && canEdit ? (
                                <Textarea
                                  value={isEditing.notes ?? item.notes}
                                  onChange={(e) => startEditingItem(item.itemId, 'notes', e.target.value)}
                                  className="mt-1"
                                  rows={2}
                                />
                              ) : (
                                <p className="text-sm mt-1">{item.notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    {canViewPrices && <TableHead>Price/Unit (₹)</TableHead>}
                    <TableHead>MOQ</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Last Updated</TableHead>
                    {canEdit && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedItems.map((item) => {
                    const isEditing = editingItems[item.itemId];
                    return (
                      <TableRow key={item.itemId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-sm text-muted-foreground">{item.itemId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        {canViewPrices && (
                          <TableCell>
                            {isEditing && canEdit ? (
                              <Input
                                type="number"
                                value={isEditing.price ?? item.price}
                                onChange={(e) => startEditingItem(item.itemId, 'price', Number(e.target.value))}
                                className="w-24"
                              />
                            ) : canEdit ? (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                                onClick={() => startEditingItem(item.itemId, 'price', item.price)}
                              >
                                ₹{item.price.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              `₹${item.price.toLocaleString('en-IN')}`
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          {isEditing && canEdit ? (
                            <Input
                              type="number"
                              value={isEditing.moq ?? item.moq}
                              onChange={(e) => startEditingItem(item.itemId, 'moq', Number(e.target.value))}
                              className="w-20"
                            />
                          ) : canEdit ? (
                            <div 
                              className="cursor-pointer hover:bg-muted/50 p-1 rounded"
                              onClick={() => startEditingItem(item.itemId, 'moq', item.moq)}
                            >
                              {item.moq}
                            </div>
                          ) : (
                            item.moq
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing && canEdit ? (
                            <Switch
                              checked={isEditing.active ?? item.active}
                              onCheckedChange={(checked) => startEditingItem(item.itemId, 'active', checked)}
                            />
                          ) : (
                            <Badge variant={item.active ? "default" : "secondary"}>
                              {item.active ? "Yes" : "No"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing && canEdit ? (
                            <Textarea
                              value={isEditing.notes ?? item.notes}
                              onChange={(e) => startEditingItem(item.itemId, 'notes', e.target.value)}
                              className="min-w-[200px]"
                              rows={1}
                            />
                          ) : (
                            <span className="text-sm">{item.notes || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(item.lastUpdated).toLocaleDateString('en-IN')}</div>
                            <div className="text-muted-foreground">{item.lastUpdatedBy}</div>
                          </div>
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex space-x-1">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => cancelItemChanges(item.itemId)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" onClick={() => saveItemChanges(item.itemId)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Remove this vendor's price for {item.itemName}? Existing POs stay unchanged; this item will not appear in future comparisons.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeItem(item.itemId, item.itemName)}>
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}