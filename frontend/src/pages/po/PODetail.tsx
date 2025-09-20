import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Receipt, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import mockData from "@/data/mockData.json";

// Mock current user role
const currentUser = {
  role: "Purchaser",
  permissions: {
    canRecordReceipt: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  }
};

export default function PODetail() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Find the PO by ID
  const po = mockData.purchaseOrders.find(p => p.id === poId);
  
  if (!po) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">PO Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The purchase order "{poId}" could not be found.
              </p>
              <Button onClick={() => navigate("/po/list")}>
                Back to PO List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get vendor name
  const getVendorName = () => {
    if (currentUser.permissions.canViewVendors) {
      return po.vendor;
    }
    return po.vendorId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleRecordReceipt = () => {
    navigate(`/po/${encodeURIComponent(po.id)}/receipt`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/po/list")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-lg">PO Details</h1>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Desktop Back Button */}
        {!isMobile && (
          <Button 
            variant="ghost" 
            onClick={() => navigate("/po/list")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PO List
          </Button>
        )}

        {/* PO Header Information */}
        <Card>
          <CardContent className="p-4 md:p-6">
            {isMobile ? (
              // Mobile Layout
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{po.id}</h3>
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                    {currentUser.permissions.canViewPrices && (
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{po.totalAmount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  {currentUser.permissions.canViewPrices && (
                    <div className="text-xs text-muted-foreground mb-4">
                      Unit prices locked on Admin approval
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">From BoQ:</span>
                    <div className="font-medium">{po.boqId}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Project:</span>
                    <div className="font-medium">{po.project}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Order Date:</span>
                    <div className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">Approved by:</span>
                    <div className="font-medium">Admin User on {new Date(po.orderDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop Layout
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{po.id}</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">From BoQ:</span>
                      <div className="font-medium">{po.boqId}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <div className="font-medium">{po.project}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Order Date:</span>
                      <div className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Approved by:</span>
                      <div className="font-medium">Admin User on {new Date(po.orderDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-1 lg:col-span-3 text-right">
                  <div className="flex justify-end items-start gap-4">
                    <div>
                      <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                    </div>
                    {currentUser.permissions.canViewPrices && (
                      <div>
                        <div className="text-2xl font-bold">₹{po.totalAmount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Unit prices locked on Admin approval</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ordered Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Ordered Items</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isMobile ? (
              // Mobile Card Layout
              <div className="space-y-3">
                {po.items.map((item, index) => {
                  const received = item.received || 0;
                  const pending = item.pending || (item.quantity - received);
                  const lineValue = currentUser.permissions.canViewPrices ? item.extendedCost : 0;
                  
                  return (
                    <Card key={index} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-base">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.itemId}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Unit:</span>
                              <div className="font-medium">{item.unit}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ordered:</span>
                              <div className="font-medium">{item.quantity}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Received:</span>
                              <div className="font-medium">{received}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pending:</span>
                              <div className="font-medium">{pending}</div>
                            </div>
                            {currentUser.permissions.canViewPrices && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Unit Price:</span>
                                  <div className="font-medium">₹{item.unitPrice}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Line Value:</span>
                                  <div className="font-medium">₹{lineValue.toLocaleString()}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Desktop Table Layout
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    {currentUser.permissions.canViewPrices && (
                      <>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Line Value</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items.map((item, index) => {
                    const received = item.received || 0;
                    const pending = item.pending || (item.quantity - received);
                    const lineValue = currentUser.permissions.canViewPrices ? item.extendedCost : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.itemId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{received}</TableCell>
                        <TableCell className="text-right">{pending}</TableCell>
                        {currentUser.permissions.canViewPrices && (
                          <>
                            <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                            <TableCell className="text-right">₹{lineValue.toLocaleString()}</TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delivery History & Invoices */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg md:text-xl">Delivery</CardTitle>
              {po.status !== "Closed" && currentUser.permissions.canRecordReceipt && (
                <Button onClick={handleRecordReceipt} size={isMobile ? "sm" : "default"}>
                  <Package className="h-3 w-3 mr-2" />
                  Record Receipt
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="text-center py-8 text-muted-foreground">
              No deliveries recorded yet
            </div>
          </CardContent>
        </Card>

        {/* Mobile Bottom Padding */}
        {isMobile && <div className="h-20" />}
      </div>
    </div>
  );
}