import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Save, Send, RotateCcw, Wand2, ExternalLink, AlertTriangle, DollarSign, ChevronRight, ArrowLeft, Truck } from "lucide-react";
import axios from "axios";

// Mock current user role
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

// Type definitions based on API responses
interface Vendor {
  vendor: string; // Vendor ID
  name: string; // Vendor name
  pricePerUnit: number;
  gstAmount: number;
  totalPrice: number;
  status: string;
  notes: string;
  _id: string;
}

interface Item {
  _id: string;
  name: string;
  unit: string;
  status: string;
  vendors: Vendor[];
  createdAt: string;
  updatedAt: string;
  itemId: string;
  __v: number;
}

interface IndentItem {
  itemId: string; // Matches Item._id
  quantity: number;
  remarks: string;
  _id: string;
}

interface Indent {
  _id: string;
  title: string;
  project: string;
  boq: string;
  boqId: string;
  projectId: string;
  location: string;
  neededBy: string;
  requester: string;
  notes: string;
  items: IndentItem[];
  status: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface VendorOption {
  vendor: string;
  price: number;
  gstAmount: number;
  totalPrice: number;
  active: boolean;
  extendedCost: number;
  extendedGst: number;
  grandTotal: number;
  isLowest: boolean;
}

interface BoQItemComparison {
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  vendorOptions: VendorOption[];
  selectedVendor: string | null;
  overrideReason: string;
  hasActiveVendors: boolean;
}

interface POPreview {
  vendor: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    gstAmount: number;
    totalPrice: number;
    extendedCost: number;
    extendedGst: number;
    grandTotal: number;
  }>;
  vendorTotal: number;
  vendorGst: number;
  vendorGrandTotal: number;
  fleetCost: number;
  fleetGst: number;
  finalTotal: number;
}

export default function BoQCompare() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<"queue" | "detail">("queue");
  const [indents, setIndents] = useState<Indent[]>([]);
  const [indent, setIndent] = useState<Indent | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const indentId = searchParams.get("indentId");

  // Fetch all indents for queue view
  useEffect(() => {
    const getIndents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/indent/compare');
        setIndents(response.data);
      } catch (err) {
        setError("Failed to fetch indents");
        toast({
          title: "Error",
          description: "Failed to fetch indents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (currentView === "queue") {
      getIndents();
    }
  }, [currentView, toast]);

  // Fetch specific indent details
  useEffect(() => {
    if (indentId && currentView === "detail") {
      const getIndentDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8000/api/indent/${indentId}`);
          setIndent(response.data);
        } catch (err) {
          setError("Failed to fetch indent details");
          toast({
            title: "Error",
            description: "Failed to fetch indent details",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      getIndentDetails();
    }
  }, [indentId, currentView, toast]);

  // Fetch items
  useEffect(() => {
    const getItems = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/item');
        setItems(response.data);
      } catch (err) {
        setError("Failed to fetch items");
        toast({
          title: "Error",
          description: "Failed to fetch items",
          variant: "destructive",
        });
      }
    };
    getItems();
  }, [toast]);

  // Filter indents that are ready for comparison
  const comparePendingBoqs = useMemo(() => {
    return indents.filter(b => b.status === "compare" || b.status === "Compare & Select");
  }, [indents]);

  // Check permissions
  if (!currentUser.permissions.canViewPrices || !currentUser.permissions.canViewVendors) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              This page is only accessible to Purchasers, Admins, and Accountants.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReadOnly = currentUser.role !== "Purchaser";

  // Prepare comparison data
  const comparisonData = useMemo(() => {
    if (!indent) return [];
    return indent.items.map((boqItem: IndentItem) => {
      const itemMaster = items.find(item => item._id === boqItem.itemId);
      if (!itemMaster) {
        return {
          itemId: `missing-${boqItem.itemId}`,
          itemName: `Unknown Item (${boqItem.itemId})`,
          unit: "N/A",
          quantity: boqItem.quantity,
          vendorOptions: [],
          selectedVendor: null,
          overrideReason: "",
          hasActiveVendors: false,
        };
      }
      const activeVendors = itemMaster.vendors.filter(v => v.status === "active");
      const vendorOptions: VendorOption[] = activeVendors.map(vendor => {
        const gstAmount = vendor.gstAmount || 0;
        const totalPrice = vendor.totalPrice || vendor.pricePerUnit + gstAmount;
        const extendedCost = boqItem.quantity * vendor.pricePerUnit;
        const extendedGst = boqItem.quantity * gstAmount;
        const grandTotal = boqItem.quantity * totalPrice;
        return {
          vendor: vendor.name, // Use vendor.name instead of vendor.vendor (ID)
          price: vendor.pricePerUnit,
          gstAmount,
          totalPrice,
          active: vendor.status === "active",
          extendedCost,
          extendedGst,
          grandTotal,
          isLowest: false,
        };
      }).sort((a, b) => a.totalPrice - b.totalPrice);

      if (vendorOptions.length > 0) {
        vendorOptions[0].isLowest = true;
      }
      return {
        itemId: itemMaster._id,
        itemName: itemMaster.name,
        unit: itemMaster.unit,
        quantity: boqItem.quantity,
        vendorOptions,
        selectedVendor: null,
        overrideReason: "",
        hasActiveVendors: activeVendors.length > 0,
      };
    });
  }, [indent, items]);

  const [selections, setSelections] = useState<BoQItemComparison[]>(comparisonData);
  const [fleetCosts, setFleetCosts] = useState<{
    [vendor: string]: { cost: number; gst: number };
  }>({});
  const [fleetCostEditing, setFleetCostEditing] = useState<{
    [vendor: string]: boolean;
  }>({});

  useEffect(() => {
    setSelections(comparisonData);
  }, [comparisonData]);

  // Auto-select lowest for all items
  const autoSelectLowest = useCallback(() => {
    setSelections(prev =>
      prev.map(item => ({
        ...item,
        selectedVendor: item.vendorOptions.length > 0 ? item.vendorOptions[0].vendor : null,
        overrideReason: "",
      }))
    );
    toast({
      title: "Auto-selected",
      description: "Lowest price vendors selected for all items",
    });
  }, [toast]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelections(prev =>
      prev.map(item => ({
        ...item,
        selectedVendor: null,
        overrideReason: "",
      }))
    );
    toast({
      title: "Cleared",
      description: "All vendor selections cleared",
    });
  }, [toast]);

  // Update vendor selection
  const updateSelection = useCallback((itemIndex: number, vendor: string) => {
    setSelections(prev =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, selectedVendor: vendor, overrideReason: "" } : item
      )
    );
  }, []);

  // Update override reason
  const updateOverrideReason = useCallback((itemIndex: number, reason: string) => {
    setSelections(prev =>
      prev.map((item, index) => (index === itemIndex ? { ...item, overrideReason: reason } : item))
    );
  }, []);

  // Update fleet cost for a vendor
  const updateFleetCost = useCallback((vendor: string, cost: number, gst: number) => {
    setFleetCosts(prev => ({
      ...prev,
      [vendor]: { cost: cost || 0, gst: gst || 0 },
    }));
  }, []);

  // Toggle fleet cost editing mode
  const toggleFleetCostEditing = useCallback((vendor: string) => {
    setFleetCostEditing(prev => ({
      ...prev,
      [vendor]: !prev[vendor],
    }));
  }, []);

  // Save fleet cost and exit editing mode
  const saveFleetCost = useCallback(
    (vendor: string) => {
      setFleetCostEditing(prev => ({
        ...prev,
        [vendor]: false,
      }));
      toast({
        title: "Fleet cost saved",
        description: `Fleet cost updated for ${vendor}`,
      });
    },
    [toast]
  );

  // Generate PO Preview
  const poPreview = useMemo(() => {
    const vendorGroups: { [vendor: string]: POPreview } = {};
    selections.forEach(item => {
      if (!item.selectedVendor) return;
      const selectedOption = item.vendorOptions.find(v => v.vendor === item.selectedVendor);
      if (!selectedOption) return;
      if (!vendorGroups[item.selectedVendor]) {
        const fleetData = fleetCosts[item.selectedVendor] || { cost: 0, gst: 0 };
        vendorGroups[item.selectedVendor] = {
          vendor: item.selectedVendor,
          items: [],
          vendorTotal: 0,
          vendorGst: 0,
          vendorGrandTotal: 0,
          fleetCost: fleetData.cost,
          fleetGst: fleetData.gst,
          finalTotal: 0,
        };
      }
      const poItem = {
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: selectedOption.price,
        gstAmount: selectedOption.gstAmount,
        totalPrice: selectedOption.totalPrice,
        extendedCost: selectedOption.extendedCost,
        extendedGst: selectedOption.extendedGst,
        grandTotal: selectedOption.grandTotal,
      };
      vendorGroups[item.selectedVendor].items.push(poItem);
      vendorGroups[item.selectedVendor].vendorTotal += selectedOption.extendedCost;
      vendorGroups[item.selectedVendor].vendorGst += selectedOption.extendedGst;
      vendorGroups[item.selectedVendor].vendorGrandTotal += selectedOption.grandTotal;
    });

    Object.values(vendorGroups).forEach(vendor => {
      vendor.finalTotal = vendor.vendorGrandTotal + vendor.fleetCost + vendor.fleetGst;
    });
    return Object.values(vendorGroups);
  }, [selections, fleetCosts]);

  const totalAmount = poPreview.reduce((sum, vendor) => sum + vendor.finalTotal, 0);

  // Validation function
  const validateSelections = () => {
    const errors: string[] = [];
    selections.forEach((item, index) => {
      if (!item.hasActiveVendors) return;
      if (!item.selectedVendor) {
        errors.push(`Please select a vendor for ${item.itemName}`);
        return;
      }
      const selectedOption = item.vendorOptions.find(v => v.vendor === item.selectedVendor);
      if (!selectedOption) return;
      if (!selectedOption.isLowest && !item.overrideReason.trim()) {
        errors.push(`Please provide a reason for not selecting lowest price for ${item.itemName}`);
      }
    });
    return errors;
  };

  const hasValidationErrors = useMemo(() => validateSelections().length > 0, [selections]);

  const saveSelections = useCallback(() => {
    const errors = validateSelections();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Saved",
      description: "Vendor selections saved successfully",
    });
  }, [selections, toast]);

  const proceedToApproval = useCallback(() => {
    const errors = validateSelections();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: "BoQ sent to Admin for approval",
    });
    setCurrentView("queue");
    setSearchParams({});
  }, [selections, toast, setSearchParams]);

  const openCompareDetail = useCallback(
    (indentId: string) => {
      setSearchParams({ indentId });
      setCurrentView("detail");
    },
    [setSearchParams]
  );

  const backToQueue = useCallback(() => {
    setCurrentView("queue");
    setSearchParams({});
    setIndent(null);
  }, [setSearchParams]);

  // Calculate coverage for an indent
  const getBoqCoverage = useCallback(
    (boq: Indent) => {
      const itemsWithVendors = boq.items.filter((boqItem: IndentItem) => {
        const itemMaster = items.find(item => item._id === boqItem.itemId);
        return itemMaster && itemMaster.vendors.some((v: Vendor) => v.status === "active");
      });
      return {
        covered: itemsWithVendors.length,
        total: boq.items.length,
        percentage: Math.round((itemsWithVendors.length / boq.items.length) * 100),
      };
    },
    [items]
  );

  // Render Compare Queue (List View)
  const renderCompareQueue = () => (
    <div className="container mx-auto px-4 py-6">
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Loading indents...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => setCurrentView("queue")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : comparePendingBoqs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No BoQs are waiting for comparison</h3>
            <p className="text-muted-foreground">BoQs that are "Sent to Compare" will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-2">
              {comparePendingBoqs.map(boq => {
                const coverage = getBoqCoverage(boq);
                const missingPriceCount = coverage.total - coverage.covered;
                return (
                  <Card
                    key={boq._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openCompareDetail(boq._id)}
                  >
                    <CardContent className="p-2">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-medium text-sm">{boq.boqId}</h4>
                          <p className="text-xs text-muted-foreground">{boq.title}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Project:</span>
                          <span className="font-medium">{boq.projectId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items:</span>
                          <span>{boq.items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coverage:</span>
                          <div className="flex items-center gap-1">
                            <span>{coverage.covered}/{coverage.total}</span>
                            <Badge variant={coverage.percentage === 100 ? "default" : "secondary"} className="text-xs">
                              {coverage.percentage}%
                            </Badge>
                          </div>
                        </div>
                        {missingPriceCount > 0 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Missing price for {missingPriceCount} items</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex justify-start">
                        <Button size="sm" className="px-6">
                          Compare
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Table className="rounded-md border bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead>BoQ #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created By / On</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparePendingBoqs.map(boq => {
                  const coverage = getBoqCoverage(boq);
                  const missingPriceCount = coverage.total - coverage.covered;
                  return (
                    <TableRow
                      key={boq._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openCompareDetail(boq._id)}
                    >
                      <TableCell className="font-medium">{boq.boqId}</TableCell>
                      <TableCell>{boq.projectId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{boq.requester || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(boq.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{boq.items.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{coverage.covered}/{coverage.total}</span>
                          <Badge variant={coverage.percentage === 100 ? "default" : "secondary"} className="text-xs">
                            {coverage.percentage}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {missingPriceCount > 0 && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Missing price for {missingPriceCount} items</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              openCompareDetail(boq._id);
                            }}
                          >
                            Compare
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );

  // Show queue view or detail view based on current state
  if (currentView === "queue" || !indentId) {
    return renderCompareQueue();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Loading indent details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !indent) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive">{error || "Please check the Indent ID and try again."}</p>
            <Button onClick={backToQueue} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Compare Detail View
  return (
    <div>
      <div className="container mx-auto px-2 sm:px-4 pt-4">
        <Button variant="outline" onClick={backToQueue} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className={`${isMobile ? "space-y-4" : "grid grid-cols-3 gap-6"}`}>
          <div className={isMobile ? "" : "col-span-2"}>
            {!isReadOnly && (
              <div className={`${isMobile ? "grid grid-cols-2 gap-2 mb-4" : "flex flex-wrap gap-2 mb-6"}`}>
                <Button
                  variant="outline"
                  onClick={autoSelectLowest}
                  size={isMobile ? "sm" : "default"}
                  className={isMobile ? "text-xs" : ""}
                >
                  <Wand2 className="h-4 w-4 mr-1" />
                  {isMobile ? "Auto-select" : "Auto-select Lowest (All)"}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllSelections}
                  size={isMobile ? "sm" : "default"}
                  className={isMobile ? "text-xs" : ""}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {isMobile ? "Clear All" : "Clear All Selections"}
                </Button>
              </div>
            )}

            <div className={`${isMobile ? "space-y-3" : "space-y-6"}`}>
              {selections.map((item, itemIndex) => (
                <Card key={item.itemId} className="shadow-card overflow-hidden">
                  <CardHeader className={isMobile ? "pb-3" : ""}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`${isMobile ? "text-base" : "text-lg"} line-clamp-2`}>
                          {item.itemName}
                        </CardTitle>
                        <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      {item.selectedVendor && (
                        <Badge variant="outline" className={`${isMobile ? "text-xs ml-2 shrink-0" : ""}`}>
                          {isMobile ? item.selectedVendor : `Selected: ${item.selectedVendor}`}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={isMobile ? "pt-0" : ""}>
                    {!item.hasActiveVendors ? (
                      <div className={`text-center ${isMobile ? "py-4" : "py-6"}`}>
                        <AlertTriangle className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground mx-auto mb-2`} />
                        <p className={`text-muted-foreground mb-3 ${isMobile ? "text-sm" : ""}`}>
                          No vendor price configured
                        </p>
                        {currentUser.permissions.canManageItems && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Edit Item Master
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
                        <RadioGroup
                          value={item.selectedVendor || ""}
                          onValueChange={vendor => !isReadOnly && updateSelection(itemIndex, vendor)}
                          disabled={isReadOnly}
                        >
                          {item.vendorOptions.map((option, optionIndex) => {
                            const needsReason = !option.isLowest;
                            const isSelected = item.selectedVendor === option.vendor;
                            return (
                              <div key={option.vendor} className="space-y-2">
                                <div className={`flex items-start space-x-3 ${isMobile ? "p-2" : "p-3"} rounded-lg border`}>
                                  <RadioGroupItem
                                    value={option.vendor}
                                    id={`${item.itemId}-${option.vendor}`}
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor={`${item.itemId}-${option.vendor}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className={`${isMobile ? "space-y-2" : "flex justify-between items-center"}`}>
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`font-medium ${isMobile ? "text-sm" : ""}`}>
                                            {option.vendor}
                                          </span>
                                          {option.isLowest && (
                                            <Badge variant="default" className="text-xs">
                                              Lowest
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className={`${isMobile ? "space-y-1 text-xs" : "text-right"}`}>
                                        <div className={`${isMobile ? "flex justify-between" : "font-semibold"}`}>
                                          {isMobile && <span className="text-muted-foreground">Rate:</span>}
                                          <span className={isMobile ? "" : "font-semibold"}>
                                            ₹{option.price.toLocaleString()}/{item.unit}
                                          </span>
                                        </div>
                                        <div className={`${isMobile ? "flex justify-between" : "text-xs text-muted-foreground"}`}>
                                          {isMobile && <span className="text-muted-foreground">GST:</span>}
                                          <span className={isMobile ? "" : "text-xs text-muted-foreground"}>
                                            {isMobile ? "" : "GST: "}₹{option.gstAmount.toLocaleString()}/{item.unit}
                                          </span>
                                        </div>
                                        <div
                                          className={`${isMobile ? "flex justify-between font-medium" : "text-sm font-medium text-primary"}`}
                                        >
                                          {isMobile && <span>Total:</span>}
                                          <span className={isMobile ? "" : "text-sm font-medium text-primary"}>
                                            {isMobile ? "" : "Total: "}₹{option.totalPrice.toLocaleString()}/{item.unit}
                                          </span>
                                        </div>
                                        <div
                                          className={`${isMobile ? "flex justify-between text-primary" : "text-sm text-muted-foreground"}`}
                                        >
                                          {isMobile && <span>Extended:</span>}
                                          <span className={isMobile ? "" : "text-sm text-muted-foreground"}>
                                            {isMobile ? "" : "Extended: "}₹{option.grandTotal.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                                {isSelected && needsReason && !isReadOnly && (
                                  <div className={`${isMobile ? "ml-0 mt-2" : "ml-6"} space-y-2`}>
                                    <Label
                                      className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground font-medium`}
                                    >
                                      Reason for not selecting lowest price *
                                    </Label>
                                    <Textarea
                                      value={item.overrideReason}
                                      onChange={e => updateOverrideReason(itemIndex, e.target.value)}
                                      placeholder="Enter reason for override..."
                                      rows={2}
                                      className={`${isMobile ? "text-sm min-h-[60px]" : "text-sm"}`}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {isMobile && !isReadOnly && (
              <div className="sticky bottom-20 bg-background p-3 border rounded-lg shadow-lg space-y-2 mx-2">
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" onClick={saveSelections} size="sm" disabled={hasValidationErrors}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Selections
                  </Button>
                  <Button onClick={proceedToApproval} size="sm" disabled={hasValidationErrors}>
                    <Send className="h-4 w-4 mr-2" />
                    Send for Approval
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className={isMobile ? "mt-4" : "col-span-1"}>
            <Card className={`${isMobile ? "" : "sticky top-6"}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-lg" : ""}`}>
                  <DollarSign className="h-5 w-5" />
                  PO Preview
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
                {poPreview.length === 0 ? (
                  <p className={`text-muted-foreground ${isMobile ? "text-sm" : "text-sm"}`}>
                    Select vendors to see PO preview
                  </p>
                ) : (
                  <>
                    {poPreview.map((vendor, index) => (
                      <div key={vendor.vendor} className={`${isMobile ? "space-y-2" : "space-y-3"}`}>
                        <div className="flex items-center justify-between">
                          <div className={`font-medium ${isMobile ? "text-base" : "text-sm"}`}>{vendor.vendor}</div>
                          <Badge variant="outline" className="text-xs">
                            {vendor.items.length} items
                          </Badge>
                        </div>
                        <div className={`${isMobile ? "space-y-1" : "space-y-1"}`}>
                          {vendor.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`${isMobile ? "py-1 border-b border-muted last:border-0" : ""} flex justify-between ${isMobile ? "text-xs" : "text-xs"}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`${isMobile ? "font-medium text-xs line-clamp-1" : "text-muted-foreground"}`}
                                >
                                  {isMobile ? item.itemName : `${item.itemName} (${item.quantity} ${item.unit})`}
                                </div>
                                {isMobile && (
                                  <div className="text-xs text-muted-foreground">
                                    {item.quantity} {item.unit} × ₹{item.totalPrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                              <div className={`text-right ${isMobile ? "ml-2" : ""}`}>
                                <div className={`${isMobile ? "font-medium text-xs" : ""}`}>
                                  ₹{item.grandTotal.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`${isMobile ? "space-y-2 p-2" : "space-y-2 p-2"} bg-muted/30 rounded-md`}>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-xs"} font-medium`}>
                              <Truck className="h-3 w-3" />
                              Fleet Cost
                            </div>
                            {!isReadOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFleetCostEditing(vendor.vendor)}
                                className={`${isMobile ? "h-6 px-2 text-xs" : "h-6 px-2 text-xs"}`}
                              >
                                {fleetCostEditing[vendor.vendor]
                                  ? "Cancel"
                                  : vendor.fleetCost > 0 || vendor.fleetGst > 0
                                  ? "Edit"
                                  : "+ Add"}
                              </Button>
                            )}
                          </div>
                          {!isReadOnly && fleetCostEditing[vendor.vendor] ? (
                            <div className="space-y-2">
                              <div className={`${isMobile ? "grid grid-cols-2 gap-2" : "flex gap-2"}`}>
                                <div className="flex-1">
                                  <Label htmlFor={`fleet-cost-${vendor.vendor}`} className="text-xs">
                                    Amount
                                  </Label>
                                  <Input
                                    id={`fleet-cost-${vendor.vendor}`}
                                    type="number"
                                    placeholder="0"
                                    value={fleetCosts[vendor.vendor]?.cost || ""}
                                    onChange={e =>
                                      updateFleetCost(
                                        vendor.vendor,
                                        parseFloat(e.target.value) || 0,
                                        fleetCosts[vendor.vendor]?.gst || 0
                                      )
                                    }
                                    className={`${isMobile ? "h-8 text-xs" : "h-7 text-xs"}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`fleet-gst-${vendor.vendor}`} className="text-xs">
                                    GST
                                  </Label>
                                  <Input
                                    id={`fleet-gst-${vendor.vendor}`}
                                    type="number"
                                    placeholder="0"
                                    value={fleetCosts[vendor.vendor]?.gst || ""}
                                    onChange={e =>
                                      updateFleetCost(
                                        vendor.vendor,
                                        fleetCosts[vendor.vendor]?.cost || 0,
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className={`${isMobile ? "h-8 text-xs" : "h-7 text-xs"}`}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateFleetCost(vendor.vendor, 0, 0)}
                                  className={`${isMobile ? "h-8 text-xs flex-1" : "h-6 text-xs flex-1"}`}
                                >
                                  Set as Free
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveFleetCost(vendor.vendor)}
                                  className={`${isMobile ? "h-8 text-xs flex-1" : "h-6 text-xs flex-1"}`}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (vendor.fleetCost > 0 || vendor.fleetGst > 0) && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Fleet Amount:</span>
                                <span>₹{vendor.fleetCost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Fleet GST:</span>
                                <span>₹{vendor.fleetGst.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`${isMobile ? "space-y-1 pt-1" : "space-y-1 pt-1"} border-t`}>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Subtotal:</span>
                            <span>₹{vendor.vendorTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Items GST:</span>
                            <span>₹{vendor.vendorGst.toLocaleString()}</span>
                          </div>
                          {(vendor.fleetCost > 0 || vendor.fleetGst > 0) && (
                            <>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Fleet Cost:</span>
                                <span>₹{vendor.fleetCost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Fleet GST:</span>
                                <span>₹{vendor.fleetGst.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          <div
                            className={`flex justify-between ${isMobile ? "text-sm font-medium text-primary" : "text-sm font-medium"}`}
                          >
                            <span>Final Total:</span>
                            <span>₹{vendor.finalTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        {index < poPreview.length - 1 && <Separator />}
                      </div>
                    ))}
                    <div className={`${isMobile ? "pt-2" : "pt-2"} border-t`}>
                      <div
                        className={`flex justify-between ${isMobile ? "text-lg font-bold text-primary" : "font-semibold"}`}
                      >
                        <span>Overall Total:</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
                {!isMobile && !isReadOnly && (
                  <div className="space-y-2 pt-4 border-t">
                    <Button variant="outline" onClick={saveSelections} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Selections
                    </Button>
                    <Button onClick={proceedToApproval} className="w-full" disabled={hasValidationErrors}>
                      <Send className="h-4 w-4 mr-2" />
                      Proceed to Admin Approval
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}