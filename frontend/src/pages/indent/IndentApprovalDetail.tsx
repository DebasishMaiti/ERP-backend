import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Save, Send, RotateCcw, ExternalLink, AlertTriangle, DollarSign, ArrowLeft, CheckCircle, XCircle, Truck } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role - Admin for approval
const currentUser = {
  id: "ADMIN-001",
  name: "Admin User",
  role: "Admin",
  permissions: {
    canCreateBoQ: true,
    canRecordGRN: true,
    canApprove: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true,
    canManageItems: true,
    canCompareSelect: true
  }
};
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
  // Admin-specific fields
  adminDecision: "approve" | "request_change" | "override";
  adminComment: string;
  adminOverrideVendor: string | null;
  adminOverrideReason: string;
  // Track original purchaser selections
  originalPurchaserVendor: string | null;
  originalPurchaserReason: string;
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
export default function BoQApprovalDetail() {
  const {
    boqId
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();

  // Find the BoQ from JSON data
  const boq = boqId ? mockData.boqs.find(b => b.id === boqId) : null;
  const items = mockData.items;
  const projects = mockData.projects || [];
  const project = projects.find(p => p.id === boq?.project);

  // Prepare comparison data with purchaser selections
  const comparisonData = useMemo(() => {
    if (!boq) return [];
    return boq.items.map(boqItem => {
      const itemMaster = items.find(item => item.id === boqItem.itemId || item.name === boqItem.name);
      if (!itemMaster) {
        return {
          itemId: `missing-${boqItem.name}`,
          itemName: boqItem.name,
          unit: boqItem.unit,
          quantity: boqItem.quantity,
          vendorOptions: [],
          selectedVendor: null,
          overrideReason: "",
          hasActiveVendors: false,
          adminDecision: "approve" as const,
          adminComment: "",
          adminOverrideVendor: null,
          adminOverrideReason: "",
          originalPurchaserVendor: null,
          originalPurchaserReason: ""
        };
      }
      const activeVendors = itemMaster.vendors.filter(v => v.active);
      const vendorOptions: VendorOption[] = activeVendors.map(vendor => {
        const gstAmount = (vendor as any).gstAmount || 0;
        const totalPrice = vendor.price + gstAmount;
        const extendedCost = boqItem.quantity * vendor.price;
        const extendedGst = boqItem.quantity * gstAmount;
        const grandTotal = boqItem.quantity * totalPrice;
        return {
          vendor: vendor.vendor,
          // This is the vendor name
          price: vendor.price,
          gstAmount,
          totalPrice,
          active: vendor.active,
          extendedCost,
          extendedGst,
          grandTotal,
          isLowest: false
        };
      }).sort((a, b) => a.totalPrice - b.totalPrice);

      // Mark lowest price
      if (vendorOptions.length > 0) {
        vendorOptions[0].isLowest = true;
      }
      return {
        itemId: itemMaster.id,
        itemName: boqItem.name,
        unit: boqItem.unit,
        quantity: boqItem.quantity,
        vendorOptions,
        selectedVendor: boqItem.selectedVendor || null,
        // Current admin selection (starts with purchaser's)
        overrideReason: "",
        // Clear this for admin's fresh input
        hasActiveVendors: activeVendors.length > 0,
        adminDecision: "approve" as const,
        adminComment: "",
        adminOverrideVendor: null,
        adminOverrideReason: "",
        // Keep track of original purchaser selection
        originalPurchaserVendor: boqItem.selectedVendor || null,
        originalPurchaserReason: boqItem.purchaserReason || ""
      };
    });
  }, [boq, items]);
  const [selections, setSelections] = useState<BoQItemComparison[]>(comparisonData);
  const [fleetCosts, setFleetCosts] = useState<{
    [vendor: string]: {
      cost: number;
      gst: number;
    };
  }>({});
  const [fleetCostEditing, setFleetCostEditing] = useState<{
    [vendor: string]: boolean;
  }>({});
  const [overallComment, setOverallComment] = useState("");
  useEffect(() => {
    console.log("Setting selections with comparison data:", comparisonData);
    setSelections(comparisonData);
  }, [comparisonData]);

  // Update vendor selection (like in Compare page)
  const updateSelection = useCallback((itemIndex: number, vendor: string) => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      selectedVendor: vendor,
      // Clear reason when changing vendor (admin gets fresh input)
      overrideReason: ""
    } : item));
  }, []);

  // Update admin decision
  const updateAdminDecision = useCallback((itemIndex: number, decision: "approve" | "request_change" | "override") => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      adminDecision: decision,
      adminComment: decision === "request_change" ? item.adminComment : "",
      adminOverrideVendor: decision === "override" ? item.adminOverrideVendor : null,
      adminOverrideReason: decision === "override" ? item.adminOverrideReason : ""
    } : item));
  }, []);

  // Update override reason (same as Compare page)
  const updateOverrideReason = useCallback((itemIndex: number, reason: string) => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      overrideReason: reason
    } : item));
  }, []);

  // Update admin comment
  const updateAdminComment = useCallback((itemIndex: number, comment: string) => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      adminComment: comment
    } : item));
  }, []);

  // Update admin override vendor
  const updateAdminOverrideVendor = useCallback((itemIndex: number, vendor: string) => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      adminOverrideVendor: vendor,
      adminOverrideReason: ""
    } : item));
  }, []);

  // Update admin override reason
  const updateAdminOverrideReason = useCallback((itemIndex: number, reason: string) => {
    setSelections(prev => prev.map((item, index) => index === itemIndex ? {
      ...item,
      adminOverrideReason: reason
    } : item));
  }, []);

  // Update fleet cost for a vendor
  const updateFleetCost = useCallback((vendor: string, cost: number, gst: number) => {
    setFleetCosts(prev => ({
      ...prev,
      [vendor]: {
        cost: cost || 0,
        gst: gst || 0
      }
    }));
  }, []);

  // Toggle fleet cost editing mode
  const toggleFleetCostEditing = useCallback((vendor: string) => {
    setFleetCostEditing(prev => ({
      ...prev,
      [vendor]: !prev[vendor]
    }));
  }, []);

  // Save fleet cost and exit editing mode
  const saveFleetCost = useCallback((vendor: string) => {
    setFleetCostEditing(prev => ({
      ...prev,
      [vendor]: false
    }));
    toast({
      title: "Fleet cost saved",
      description: `Fleet cost updated for ${vendor}`
    });
  }, [toast]);

  // Generate PO Preview (uses admin's current selections)
  const poPreview = useMemo(() => {
    const vendorGroups: {
      [vendor: string]: POPreview;
    } = {};
    selections.forEach(item => {
      if (!item.hasActiveVendors || !item.selectedVendor) return;
      const selectedOption = item.vendorOptions.find(v => v.vendor === item.selectedVendor);
      if (!selectedOption) return;
      if (!vendorGroups[item.selectedVendor]) {
        const fleetData = fleetCosts[item.selectedVendor] || {
          cost: 0,
          gst: 0
        };
        vendorGroups[item.selectedVendor] = {
          vendor: item.selectedVendor,
          items: [],
          vendorTotal: 0,
          vendorGst: 0,
          vendorGrandTotal: 0,
          fleetCost: fleetData.cost,
          fleetGst: fleetData.gst,
          finalTotal: 0
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
        grandTotal: selectedOption.grandTotal
      };
      vendorGroups[item.selectedVendor].items.push(poItem);
      vendorGroups[item.selectedVendor].vendorTotal += selectedOption.extendedCost;
      vendorGroups[item.selectedVendor].vendorGst += selectedOption.extendedGst;
      vendorGroups[item.selectedVendor].vendorGrandTotal += selectedOption.grandTotal;
    });

    // Calculate final totals including fleet cost
    Object.values(vendorGroups).forEach(vendor => {
      vendor.finalTotal = vendor.vendorGrandTotal + vendor.fleetCost + vendor.fleetGst;
    });
    return Object.values(vendorGroups);
  }, [selections, fleetCosts]);
  const totalAmount = poPreview.reduce((sum, vendor) => sum + vendor.finalTotal, 0);

  // Get blockers - only for NON-LOWEST selections without reasons
  const getBlockers = () => {
    const blockers = [];
    selections.forEach(item => {
      if (!item.hasActiveVendors) return;
      if (!item.selectedVendor) {
        blockers.push(`${item.itemName}: No vendor selected`);
        return;
      }
      const selectedOption = item.vendorOptions.find(v => v.vendor === item.selectedVendor);

      // Only require reason if vendor is NOT lowest
      if (selectedOption && !selectedOption.isLowest) {
        // Need reason if: different vendor than purchaser OR no original purchaser reason
        const needsAdminReason = item.selectedVendor !== item.originalPurchaserVendor || !item.originalPurchaserReason;
        if (needsAdminReason && !item.overrideReason.trim()) {
          blockers.push(`${item.itemName}: Reason required for not selecting lowest price`);
        }
      }
    });
    return blockers;
  };
  const blockers = getBlockers();
  const handleApprove = () => {
    if (blockers.length > 0) {
      toast({
        title: "Cannot approve",
        description: `Please resolve ${blockers.length} blocker(s) first`,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "BoQ Approved",
      description: "Purchase orders have been generated successfully"
    });
    navigate("/indent/approval");
  };
  const handleSendBack = () => {
    if (!overallComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please provide a comment for sending back the BoQ",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "BoQ Sent Back",
      description: "The BoQ has been sent back for rework"
    });
    navigate("/indent/approval");
  };
  const handleSaveReview = () => {
    toast({
      title: "Review saved",
      description: "Your progress has been saved"
    });
  };
  if (!boq) {
    return <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">The requested BoQ could not be found.</p>
              <Button onClick={() => navigate("/indent/approval")} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Approval Queue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div>
      
      {/* Back Button */}
      <div className="container mx-auto px-2 sm:px-4 pt-2 sm:pt-4">
        <Button variant="outline" onClick={() => navigate("/indent/approval")} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Approval Queue
        </Button>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-6">
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-6'}`}>
          {/* Main Content */}
          <div className={isMobile ? '' : 'col-span-2'}>
            {/* Items Comparison */}
            <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
              {selections.map((item, itemIndex) => <Card key={item.itemId} className={`${isMobile ? 'shadow-sm overflow-hidden' : 'shadow-card'}`}>
                  <CardHeader className={isMobile ? 'p-3 pb-2' : ''}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`${isMobile ? 'text-base line-clamp-2' : 'text-lg'}`}>{item.itemName}</CardTitle>
                        <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className={`flex gap-1 flex-wrap ${isMobile ? 'ml-2 shrink-0' : ''}`}>
                        {item.selectedVendor && <Badge variant="outline" className={isMobile ? 'text-xs px-1 py-0' : ''}>
                            {isMobile ? item.selectedVendor : `Purchaser Selected: ${item.selectedVendor}`}
                          </Badge>}
                        {(() => {
                      const selectedOption = item.vendorOptions.find(v => v.vendor === item.selectedVendor);
                      if (selectedOption && !selectedOption.isLowest) {
                        return <Badge variant="outline" className={isMobile ? 'text-xs px-1 py-0' : ''}>Non-lowest</Badge>;
                      }
                      return null;
                    })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
                    {!item.hasActiveVendors ? <div className={`text-center ${isMobile ? 'py-4' : 'py-6'}`}>
                        <AlertTriangle className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground mx-auto mb-2`} />
                        <p className={`text-muted-foreground mb-3 ${isMobile ? 'text-sm' : ''}`}>No vendor price configured</p>
                        {currentUser.permissions.canManageItems && <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Edit Item Master
                          </Button>}
                      </div> : <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                        {/* Vendor Selection */}
                        <div>
                          <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm' : ''}`}>Vendor Selection</h4>
                          <RadioGroup value={item.selectedVendor || ""} onValueChange={vendor => updateSelection(itemIndex, vendor)}>
                            {item.vendorOptions.map((option, optionIndex) => {
                        const needsReason = !option.isLowest;
                        const isSelected = item.selectedVendor === option.vendor;
                        const isLowest = optionIndex === 0;
                        return <div key={option.vendor} className={isMobile ? 'space-y-2' : 'space-y-2'}>
                                  <div className={`flex items-start space-x-2 ${isMobile ? 'p-2' : 'p-3'} rounded-lg border ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                                    <RadioGroupItem value={option.vendor} id={`${item.itemId}-${option.vendor}`} className="mt-1" />
                                    <Label htmlFor={`${item.itemId}-${option.vendor}`} className="flex-1 cursor-pointer">
                                      <div className={`${isMobile ? 'space-y-2' : 'flex justify-between items-center'}`}>
                                        <div>
                                          <div className="flex items-center gap-1 flex-wrap mb-1">
                                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{option.vendor}</span>
                                            {isLowest && <Badge variant="default" className="text-xs">
                                                Lowest
                                              </Badge>}
                                            {isSelected && <Badge variant="outline" className="text-xs">
                                                {isMobile ? 'Selected' : 'Purchaser Selected'}
                                              </Badge>}
                                          </div>
                                        </div>
                                         <div className={`${isMobile ? 'space-y-1 text-xs' : 'text-right'}`}>
                                           <div className={`${isMobile ? 'flex justify-between' : 'font-semibold'}`}>
                                             {isMobile && <span className="text-muted-foreground">Rate:</span>}
                                             <span className={isMobile ? '' : 'font-semibold'}>₹{option.price.toLocaleString()}/{item.unit}</span>
                                           </div>
                                           <div className={`${isMobile ? 'flex justify-between' : 'text-xs text-muted-foreground'}`}>
                                             {isMobile && <span className="text-muted-foreground">GST:</span>}
                                             <span className={isMobile ? '' : 'text-xs text-muted-foreground'}>
                                               {isMobile ? '' : 'GST: '}₹{option.gstAmount.toLocaleString()}/{item.unit}
                                             </span>
                                           </div>
                                           <div className={`${isMobile ? 'flex justify-between font-medium' : 'text-sm font-medium text-primary'}`}>
                                             {isMobile && <span>Total:</span>}
                                             <span className={isMobile ? '' : 'text-sm font-medium text-primary'}>
                                               {isMobile ? '' : 'Total: '}₹{option.totalPrice.toLocaleString()}/{item.unit}
                                             </span>
                                           </div>
                                           <div className={`${isMobile ? 'flex justify-between text-primary' : 'text-sm text-muted-foreground'}`}>
                                             {isMobile && <span>Extended:</span>}
                                             <span className={isMobile ? '' : 'text-sm text-muted-foreground'}>
                                               {isMobile ? '' : 'Extended: '}₹{option.grandTotal.toLocaleString()}
                                             </span>
                                           </div>
                                         </div>
                                      </div>
                                    </Label>
                                  </div>

                                   {/* Show purchaser's reason if current selection matches original AND vendor is not lowest */}
                                   {isSelected && item.selectedVendor === item.originalPurchaserVendor && item.originalPurchaserReason && !option.isLowest && <div className={`${isMobile ? 'ml-0 p-2' : 'ml-6 p-3'} bg-green-50 border border-green-200 rounded-lg`}>
                                       <Label className={`font-medium text-green-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>Purchaser's Reason:</Label>
                                       <p className={`text-green-700 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{item.originalPurchaserReason}</p>
                                     </div>}

                                   {/* Admin reason input - only when selecting different vendor than purchaser OR when no original reason */}
                                   {isSelected && !option.isLowest && (item.selectedVendor !== item.originalPurchaserVendor || !item.originalPurchaserReason) && <div className={`${isMobile ? 'ml-0 space-y-1' : 'ml-6 space-y-2'}`}>
                                       <Label className={`text-muted-foreground font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                         Reason for not selecting lowest price *
                                       </Label>
                                       <Textarea 
                                         value={item.overrideReason} 
                                         onChange={e => updateOverrideReason(itemIndex, e.target.value)} 
                                         placeholder="Enter reason for not selecting lowest price..." 
                                         rows={isMobile ? 2 : 2} 
                                         className={`${isMobile ? 'text-sm min-h-[60px]' : 'text-sm'}`} 
                                       />
                                     </div>}
                                </div>;
                      })}
                          </RadioGroup>
                        </div>

                        {/* Alert if no vendor selected by purchaser */}
                        {!item.selectedVendor && <div className={`${isMobile ? 'p-2' : 'p-3'} bg-red-50 border border-red-200 rounded-lg`}>
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>No vendor selected by purchaser - please select one</span>
                            </div>
                          </div>}
                      </div>}
                  </CardContent>
                </Card>)}
            </div>

            {/* Send Back Section */}
            <Card className={`${isMobile ? 'mt-4' : 'mt-6'}`}>
              <CardHeader className={isMobile ? 'p-3' : ''}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Send Back for Rework</CardTitle>
              </CardHeader>
              <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
                <Label htmlFor="overall-comment" className={isMobile ? 'text-sm' : ''}>Overall Comment</Label>
                <Textarea 
                  id="overall-comment" 
                  placeholder="Provide feedback for rework (required if sending back)..." 
                  value={overallComment} 
                  onChange={e => setOverallComment(e.target.value)} 
                  className={`mt-1 ${isMobile ? 'text-sm min-h-[80px]' : ''}`} 
                />
              </CardContent>
            </Card>

            {/* Mobile Action Buttons */}
            {isMobile && <div className="sticky bottom-20 bg-background p-3 border rounded-lg shadow-lg space-y-2 mx-2">
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={handleSaveReview} variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Review
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    disabled={blockers.length > 0} 
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Generate PO
                  </Button>
                  <Button 
                    onClick={handleSendBack} 
                    variant="destructive" 
                    disabled={!overallComment.trim()} 
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Send Back for Rework
                  </Button>
                </div>
              </div>}
          </div>

          {/* Right Sidebar */}
          <div className={isMobile ? 'mt-4' : 'col-span-1'}>
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              {/* Blockers */}
              {blockers.length > 0 && <Card>
                  <CardHeader className={isMobile ? 'p-3' : ''}>
                    <CardTitle className={`${isMobile ? 'text-sm' : 'text-sm'} flex items-center gap-2 text-destructive`}>
                      <XCircle className="w-4 h-4" />
                      Blockers ({blockers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
                    <ul className={`${isMobile ? 'text-xs' : 'text-xs'} space-y-1`}>
                      {blockers.map((blocker, index) => <li key={index} className="text-destructive">{blocker}</li>)}
                    </ul>
                  </CardContent>
                </Card>}

              {/* PO Preview */}
              <Card>
                <CardHeader className={isMobile ? 'p-3' : ''}>
                  <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                    <DollarSign className="h-5 w-5" />
                    PO Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-3 pt-0 space-y-3' : 'space-y-4'}`}>
                  {poPreview.length === 0 ? <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                      No valid selections to preview
                    </p> : <>
                       {poPreview.map((vendor, index) => <div key={vendor.vendor} className={`${isMobile ? 'space-y-2' : 'space-y-2'}`}>
                           <div className="flex items-center justify-between">
                             <div className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>{vendor.vendor}</div>
                             <Badge variant="outline" className="text-xs">
                               {vendor.items.length} items
                             </Badge>
                           </div>
                           <div className={`${isMobile ? 'space-y-1' : 'space-y-1'}`}>
                             {vendor.items.map((item, itemIndex) => <div key={itemIndex} className={`${isMobile ? 'py-1 border-b border-muted last:border-0' : ''} flex justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                 <div className="flex-1 min-w-0">
                                   <div className={`${isMobile ? 'font-medium text-xs line-clamp-1' : 'text-muted-foreground'}`}>
                                     {isMobile ? item.itemName : `${item.itemName} (${item.quantity} ${item.unit})`}
                                   </div>
                                   {isMobile && (
                                     <div className="text-xs text-muted-foreground">
                                       {item.quantity} {item.unit} × ₹{item.totalPrice.toLocaleString()}
                                     </div>
                                   )}
                                 </div>
                                 <div className={`text-right ${isMobile ? 'ml-2' : ''}`}>
                                   <div className={`${isMobile ? 'font-medium text-xs' : ''}`}>₹{item.grandTotal.toLocaleString()}</div>
                                 </div>
                               </div>)}
                           </div>
                           
                           {/* Fleet Cost Section */}
                           <div className={`${isMobile ? 'space-y-2 p-2' : 'space-y-2 p-2'} bg-muted/30 rounded-md`}>
                             <div className="flex items-center justify-between">
                               <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-xs'} font-medium`}>
                                 <Truck className="h-3 w-3" />
                                 Fleet Cost
                               </div>
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => toggleFleetCostEditing(vendor.vendor)} 
                                 className={`${isMobile ? 'h-6 px-2 text-xs' : 'h-6 px-2 text-xs'}`}
                               >
                                 {fleetCostEditing[vendor.vendor] ? 'Cancel' : 
                                  (vendor.fleetCost > 0 || vendor.fleetGst > 0) ? 'Edit' : 'Add Fleet Cost'}
                               </Button>
                             </div>
                             
                             {fleetCostEditing[vendor.vendor] ? <div className="space-y-2">
                                 <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex gap-2'}`}>
                                   <div className="flex-1">
                                     <Label htmlFor={`fleet-cost-${vendor.vendor}`} className="text-xs">Amount</Label>
                                     <Input 
                                       id={`fleet-cost-${vendor.vendor}`} 
                                       type="number" 
                                       placeholder="0" 
                                       value={fleetCosts[vendor.vendor]?.cost || ''} 
                                       onChange={e => updateFleetCost(vendor.vendor, parseFloat(e.target.value) || 0, fleetCosts[vendor.vendor]?.gst || 0)} 
                                       className={`${isMobile ? 'h-8 text-xs' : 'h-7 text-xs'}`} 
                                     />
                                   </div>
                                   <div className="flex-1">
                                     <Label htmlFor={`fleet-gst-${vendor.vendor}`} className="text-xs">GST</Label>
                                     <Input 
                                       id={`fleet-gst-${vendor.vendor}`} 
                                       type="number" 
                                       placeholder="0" 
                                       value={fleetCosts[vendor.vendor]?.gst || ''} 
                                       onChange={e => updateFleetCost(vendor.vendor, fleetCosts[vendor.vendor]?.cost || 0, parseFloat(e.target.value) || 0)} 
                                       className={`${isMobile ? 'h-8 text-xs' : 'h-7 text-xs'}`} 
                                     />
                                   </div>
                                 </div>
                                 <div className="flex gap-2">
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => updateFleetCost(vendor.vendor, 0, 0)} 
                                     className={`${isMobile ? 'h-8 text-xs flex-1' : 'h-6 text-xs flex-1'}`}
                                   >
                                     Set as Free
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     onClick={() => saveFleetCost(vendor.vendor)} 
                                     className={`${isMobile ? 'h-8 text-xs flex-1' : 'h-6 text-xs flex-1'}`}
                                   >
                                     Save
                                   </Button>
                                 </div>
                               </div> : (vendor.fleetCost > 0 || vendor.fleetGst > 0) && <div className="space-y-1">
                                   <div className="flex justify-between text-xs">
                                     <span>Fleet Amount:</span>
                                     <span>₹{vendor.fleetCost.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between text-xs">
                                     <span>Fleet GST:</span>
                                     <span>₹{vendor.fleetGst.toLocaleString()}</span>
                                   </div>
                                 </div>}
                           </div>
                           
                           <div className={`${isMobile ? 'space-y-1 pt-1' : 'space-y-1 pt-1'} border-t`}>
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>Subtotal:</span>
                               <span>₹{vendor.vendorTotal.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>Items GST:</span>
                               <span>₹{vendor.vendorGst.toLocaleString()}</span>
                             </div>
                             {(vendor.fleetCost > 0 || vendor.fleetGst > 0) && <>
                                 <div className="flex justify-between text-xs text-muted-foreground">
                                   <span>Fleet Cost:</span>
                                   <span>₹{vendor.fleetCost.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-muted-foreground">
                                   <span>Fleet GST:</span>
                                   <span>₹{vendor.fleetGst.toLocaleString()}</span>
                                 </div>
                               </>}
                             <div className={`flex justify-between ${isMobile ? 'text-sm font-medium text-primary' : 'text-sm font-medium'}`}>
                               <span>Final Total:</span>
                               <span>₹{vendor.finalTotal.toLocaleString()}</span>
                             </div>
                           </div>
                          {index < poPreview.length - 1 && <Separator />}
                        </div>)}
                      
                      <div className={`${isMobile ? 'pt-2' : 'pt-2'} border-t`}>
                        <div className={`flex justify-between ${isMobile ? 'text-lg font-bold text-primary' : 'font-semibold'}`}>
                          <span>Overall Total:</span>
                          <span>₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </>}
                </CardContent>
              </Card>

              {/* Desktop Actions */}
              {!isMobile && <div className="space-y-2">
                <Button onClick={handleApprove} disabled={blockers.length > 0} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Generate POs
                </Button>
                
                <Button variant="destructive" onClick={handleSendBack} disabled={!overallComment.trim()} className="w-full">
                  <XCircle className="w-4 h-4 mr-2" />
                  Send Back for Rework
                </Button>
                
                <Button variant="outline" onClick={handleSaveReview} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Review
                </Button>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}