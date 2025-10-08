import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Save, X, Plus, Trash2, AlertTriangle } from "lucide-react";
import { RootState, AppDispatch } from "@/store/store";
import { getItemById, createItem, updateItem } from "@/store/ItemSlice";
import { getVendorList } from "@/store/vendorSlice";

 
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Purchaser",
  permissions: {
    canManageItems: true,
    canViewPrices: true,
    canViewVendors: true,
  },
};
 
const commonUnits = ["bags", "trucks", "pcs", "CBM", "tons", "meters", "sq.ft", "sq.m", "liters", "gallons", "boxes", "rolls", "sheets", "kg", "grams"];

interface VendorPrice {
  vendor: string;
  name: string;
  pricePerUnit: number;
  gstAmount: number;
  totalPrice: number;
  status: "active" | "inactive";
  notes?: string;
}

interface ItemData {
  _id?: string;
  itemId?: string;
  name: string;
  unit: string;
  vendors: VendorPrice[];
  lastUpdated?: string;
}

export default function ItemEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");
  const isEdit = !!itemId;
  const isReadOnly = !currentUser.permissions.canManageItems;

  const dispatch = useDispatch<AppDispatch>();
  // Redux state
  const item = useSelector((state: RootState) => state.item.selectedItem);
  const vendors = useSelector((state: RootState) => state.vendor.vendors);
  const loading = useSelector((state: RootState) => state.loader.isLoading);
  const error = useSelector((state: RootState) => state.item.error || state.vendor.error);

  // Item state
  const [itemData, setItemData] = useState<ItemData>({
    name: "",
    unit: "",
    vendors: [],
  });

  const [newVendor, setNewVendor] = useState({
    vendor: "",
    name: "",
    pricePerUnit: "",
    gstAmount: "",
    status: "active" as "active" | "inactive",
    notes: "",
  });

  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customVendorName, setCustomVendorName] = useState("");
  const [isCreatingNewVendor, setIsCreatingNewVendor] = useState(false);

  useEffect(() => {
    dispatch(getVendorList());
    if (isEdit && itemId) {
      dispatch(getItemById(itemId));
    }
  }, [dispatch, isEdit, itemId]);


  useEffect(() => {
    if (isEdit && item) {
      setItemData({
        _id: item._id,
        itemId: item.itemId,
        name: item.name,
        unit: item.unit,
        vendors: item.vendors?.map((v: any) => ({
          vendor: v.vendor?._id || v.vendor || "",
          name: v.name || v.vendor?.name || "",
          pricePerUnit: v.pricePerUnit || 0,
          gstAmount: v.gstAmount || 0,
          totalPrice: v.totalPrice || (v.pricePerUnit || 0) + (v.gstAmount || 0),
          status: v.status || "active",
          notes: v.notes || "",
        })) || [],
        lastUpdated: item.updatedAt,
      });
    }
  }, [item, isEdit]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const updateItemField = useCallback((field: keyof ItemData, value: any) => {
    setItemData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addVendorPrice = useCallback(() => {
    if (!newVendor.vendor || !newVendor.pricePerUnit) {
      toast({
        title: "Validation Error",
        description: "Please fill all required vendor fields",
        variant: "destructive",
      });
      return;
    }

    const pricePerUnit = parseFloat(newVendor.pricePerUnit);
    if (pricePerUnit <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const gstAmount = parseFloat(newVendor.gstAmount) || 0;
    const totalPrice = pricePerUnit + gstAmount;

    const vendorPrice: VendorPrice = {
      vendor: newVendor.vendor,
      name: newVendor.name,
      pricePerUnit: pricePerUnit,
      gstAmount: gstAmount,
      totalPrice: totalPrice,
      status: newVendor.status,
      notes: newVendor.notes,
    };

    setItemData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, vendorPrice],
    }));

    setNewVendor({
      vendor: "",
      name: "",
      pricePerUnit: "",
      gstAmount: "",
      status: "active",
      notes: "",
    });

    setCustomVendorName("");
    setIsCreatingNewVendor(false);
    setIsAddingVendor(false);
    setHasUnsavedChanges(true);

    toast({
      title: "Success",
      description: "Vendor price added",
    });
  }, [newVendor, toast]);

  const removeVendorPrice = useCallback(
    (index: number) => {
      setItemData((prev) => ({
        ...prev,
        vendors: prev.vendors.filter((_, i) => i !== index),
      }));
      setHasUnsavedChanges(true);

      toast({
        title: "Success",
        description: "Vendor price removed",
      });
    },
    [toast],
  );

  const updateVendorPrice = useCallback((index: number, field: keyof VendorPrice, value: any) => {
    setItemData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((vendor, i) => {
        if (i === index) {
          const updatedVendor = { ...vendor, [field]: value };

          if (field === "pricePerUnit" || field === "gstAmount") {
            updatedVendor.totalPrice = (updatedVendor.pricePerUnit || 0) + (updatedVendor.gstAmount || 0);
          }

          return updatedVendor;
        }
        return vendor;
      }),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!itemData.name.trim()) {
      errors.push("Item name is required");
    }

    if (!itemData.unit.trim()) {
      errors.push("Unit is required");
    }

    // Check for duplicate vendors
    const vendorIds = itemData.vendors.map((v) => v.vendor);
    const duplicates = vendorIds.filter((id, index) => vendorIds.indexOf(id) !== index);

    if (duplicates.length > 0) {
      errors.push("Duplicate vendors are not allowed");
    }

    // Validate vendor prices
    itemData.vendors.forEach((vendor, index) => {
      if (vendor.pricePerUnit <= 0) {
        errors.push(`Vendor ${vendor.name}: Price must be greater than 0`);
      }
    });

    return errors;
  }, [itemData]);

  const saveItem = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    try {
      const itemPayload = {
        name: itemData.name,
        unit: itemData.unit,
        vendors: itemData.vendors.map((v) => ({
          vendor: v.vendor,
          name: v.name,
          pricePerUnit: v.pricePerUnit,
          gstAmount: v.gstAmount,
          totalPrice: v.totalPrice,
          status: v.status,
          notes: v.notes,
        })),
      };

      if (isEdit && itemData._id) {
        await dispatch(updateItem(  itemData._id, itemPayload ));
      } else {
        await dispatch(createItem(itemPayload));
      }

      toast({
        title: "Success",
        description: `Item ${isEdit ? "updated" : "created"} successfully`,
      });

      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save item",
        variant: "destructive",
      });
    }
  }, [dispatch, itemData, isEdit, toast, validateForm]);

  const saveAndClose = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    try {
      const itemPayload = {
        name: itemData.name,
        unit: itemData.unit,
        vendors: itemData.vendors.map((v) => ({
          vendor: v.vendor,
          name: v.name,
          pricePerUnit: v.pricePerUnit,
          gstAmount: v.gstAmount,
          totalPrice: v.totalPrice,
          status: v.status,
          notes: v.notes,
        })),
      };

      if (isEdit && itemData._id) {
        await dispatch(updateItem( itemData._id, itemPayload ));
      } else {
        await dispatch(createItem(itemPayload));
      }

      toast({
        title: "Success",
        description: `Item ${isEdit ? "updated" : "created"} successfully`,
      });

      navigate("/items/list");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save item",
        variant: "destructive",
      });
    }
  }, [dispatch, itemData, isEdit, toast, navigate, validateForm]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/items/list");
      }
    } else {
      navigate("/items/list");
    }
  }, [hasUnsavedChanges, navigate]);

  // Check permissions
  if (isReadOnly) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Only Purchasers and Admins can manage items and vendor prices.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableVendors = vendors.map((v) => ({ id: v._id, name: v.name }));
  const usedVendorIds = itemData.vendors.map((v) => v.vendor);
  const unusedVendors = availableVendors.filter((v) => !usedVendorIds.includes(v.id));

  return (
    <div className={`${isMobile ? "pb-20" : ""}`}>
      <div className={`container mx-auto ${isMobile ? "px-2 py-3" : "px-4 py-6"}`}>
        <div className={`${isMobile ? "space-y-4" : "max-w-4xl mx-auto space-y-6"}`}>
          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={itemData.name}
                    onChange={(e) => updateItemField("name", e.target.value)}
                    placeholder="e.g., Cement, Sand, Bricks"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={itemData.unit} onValueChange={(value) => updateItemField("unit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {commonUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Prices */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {!isAddingVendor && (
                <Button onClick={() => setIsAddingVendor(true)} className="ml-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor Price
                </Button>
              )}
            </div>

            {/* Add New Vendor Row */}
            {isAddingVendor && (
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "md:grid-cols-4"}`}>
                  <div className="space-y-2">
                    <Label>Vendor *</Label>
                    {unusedVendors.length > 0 && !isCreatingNewVendor ? (
                      <div className="flex gap-2">
                        <Select
                          value={newVendor.vendor}
                          onValueChange={(value) => {
                            if (value === "CREATE_NEW") {
                              setIsCreatingNewVendor(true);
                              setNewVendor((prev) => ({ ...prev, vendor: "", name: "" }));
                            } else {
                              const selectedVendor = availableVendors.find((v) => v.id === value);
                              setNewVendor((prev) => ({
                                ...prev,
                                vendor: value,
                                name: selectedVendor?.name || "",
                              }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg z-50">
                            {unusedVendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="CREATE_NEW">+ Create New Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={customVendorName}
                          onChange={(e) => {
                            setCustomVendorName(e.target.value);
                            setNewVendor((prev) => ({
                              ...prev,
                              vendor: e.target.value,
                              name: e.target.value,
                            }));
                          }}
                          placeholder="Enter new vendor name"
                        />
                        {unusedVendors.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsCreatingNewVendor(false);
                              setCustomVendorName("");
                              setNewVendor((prev) => ({ ...prev, vendor: "", name: "" }));
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {isMobile ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price per Unit *</Label>
                        <Input
                          type="number"
                          value={newVendor.pricePerUnit}
                          onChange={(e) => setNewVendor((prev) => ({ ...prev, pricePerUnit: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GST Amount *</Label>
                        <Input
                          type="number"
                          value={newVendor.gstAmount}
                          onChange={(e) => setNewVendor((prev) => ({ ...prev, gstAmount: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Price</Label>
                        <div className="px-3 py-2 bg-muted rounded text-sm">
                          ₹{((parseFloat(newVendor.pricePerUnit) || 0) + (parseFloat(newVendor.gstAmount) || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Price per Unit *</Label>
                        <Input
                          type="number"
                          value={newVendor.pricePerUnit}
                          onChange={(e) => setNewVendor((prev) => ({ ...prev, pricePerUnit: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GST Amount *</Label>
                        <Input
                          type="number"
                          value={newVendor.gstAmount}
                          onChange={(e) => setNewVendor((prev) => ({ ...prev, gstAmount: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Price</Label>
                        <div className="px-3 py-2 bg-muted rounded text-sm">
                          ₹{((parseFloat(newVendor.pricePerUnit) || 0) + (parseFloat(newVendor.gstAmount) || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center pt-2">
                      <Switch
                        checked={newVendor.status === "active"}
                        onCheckedChange={(checked) =>
                          setNewVendor((prev) => ({
                            ...prev,
                            status: checked ? "active" : "inactive",
                          }))
                        }
                      />
                      <span className="ml-2 text-sm">{newVendor.status === "active" ? "Active" : "Inactive"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addVendorPrice}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingVendor(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about this vendor..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Existing Vendor Prices */}
            {itemData.vendors.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-3">No vendor prices configured</p>
                <Button onClick={() => setIsAddingVendor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vendor Price
                </Button>
              </div>
            ) : isMobile ? (
              <div className="space-y-4">
                {itemData.vendors.map((vendor, index) => (
                  <Card key={index} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-base">{vendor.name}</h4>
                          <Badge variant={vendor.status === "active" ? "default" : "secondary"} className="mt-1">
                            {vendor.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeVendorPrice(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Price per Unit</Label>
                            <Input
                              type="number"
                              value={vendor.pricePerUnit}
                              onChange={(e) => updateVendorPrice(index, "pricePerUnit", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">GST Amount</Label>
                            <Input
                              type="number"
                              value={vendor.gstAmount || 0}
                              onChange={(e) => updateVendorPrice(index, "gstAmount", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Total Price</Label>
                          <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                            ₹{vendor.totalPrice.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={vendor.status === "active"}
                              onCheckedChange={(checked) =>
                                updateVendorPrice(index, "status", checked ? "active" : "inactive")
                              }
                            />
                            <span className="text-xs">{vendor.status === "active" ? "Active" : "Inactive"}</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                          <Textarea
                            value={vendor.notes || ""}
                            onChange={(e) => updateVendorPrice(index, "notes", e.target.value)}
                            rows={2}
                            placeholder="Optional notes..."
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price per Unit</TableHead>
                    <TableHead>GST Amount</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemData.vendors.map((vendor, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vendor.pricePerUnit}
                          onChange={(e) => updateVendorPrice(index, "pricePerUnit", parseFloat(e.target.value) || 0)}
                          className="w-24"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vendor.gstAmount || 0}
                          onChange={(e) => updateVendorPrice(index, "gstAmount", parseFloat(e.target.value) || 0)}
                          className="w-24"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-24 px-3 py-2 bg-muted rounded text-sm">
                          ₹{vendor.totalPrice.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={vendor.status === "active"}
                            onCheckedChange={(checked) =>
                              updateVendorPrice(index, "status", checked ? "active" : "inactive")
                            }
                          />
                          <span className="text-xs">{vendor.status === "active" ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={vendor.notes || ""}
                          onChange={(e) => updateVendorPrice(index, "notes", e.target.value)}
                          placeholder="Optional notes..."
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => removeVendorPrice(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className={`${isMobile ? "fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border" : "flex gap-4 justify-end"}`}
          >
            <div className={`${isMobile ? "flex gap-3" : "flex gap-4"}`}>
              <Button variant="outline" onClick={handleCancel} className={isMobile ? "flex-1" : ""}>
                Cancel
              </Button>
              <Button onClick={saveAndClose} className={isMobile ? "flex-1" : ""}>
                <Save className="h-4 w-4 mr-2" />
                Save & Close
              </Button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="text-sm text-amber-600 text-center">You have unsaved changes</div>
          )}
        </div>
      </div>
    </div>
  );
}
