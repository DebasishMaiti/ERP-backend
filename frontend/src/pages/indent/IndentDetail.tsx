import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ArrowLeft, Eye, Edit, Send, CheckCircle, XCircle, 
  AlertTriangle, Clock, Package, FileText, MessageSquare,
  Plus, Trash2, ShoppingCart
} from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user - in real app this would come from auth context
const currentUser = {
  id: "USR-001",
  name: "John Doe",
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canCreateBoQ: true,
    canEditBoQ: true,
    canSendToAdmin: true,
    canApprove: false,
    canRecordGRN: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  }
};

export default function BoQDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Find the BoQ
  const boq = mockData.boqs.find(b => b.id === id);
  const project = mockData.projects.find(p => p.id === boq?.project);
  
  // Get related POs for approved BoQs
  const relatedPOs = useMemo(() => {
    if (boq?.status !== "Approved") return [];
    return mockData.purchaseOrders.filter(po => po.boqId === boq.id);
  }, [boq?.id, boq?.status]);

  const [comment, setComment] = useState("");
  
  if (!boq) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">BoQ Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested BoQ could not be found.</p>
            <Button onClick={() => navigate("/indent/list")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to BoQ List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Under Review": return "secondary";
      case "Compare Pending": return "outline";
      case "Draft": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-4 w-4" />;
      case "Under Review": return <Clock className="h-4 w-4" />;
      case "Compare Pending": return <Eye className="h-4 w-4" />;
      case "Draft": return <Edit className="h-4 w-4" />;
      // default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const canEdit = () => {
    if (boq.status === "Draft" && currentUser.role === "Employee") return true;
    if (boq.status === "Compare Pending" && currentUser.role === "Purchaser") return true;
    return false;
  };

  const getVisibleColumns = () => {
    const baseColumns = ["item", "unit", "quantity"];
    
    if (currentUser.role === "Employee") {
      // Ops only see basic columns
      if (boq.status === "Approved") {
        return [...baseColumns, "notes"];
      }
      return [...baseColumns, "notes"];
    }
    
    // Purchaser, Admin, Accountant see more based on stage
    if (boq.status === "Draft") {
      return [...baseColumns, "notes"];
    }
    
    if (boq.status === "Compare Pending") {
      return [...baseColumns, "activeVendors", "selectedVendor", "pricePerUnit", "extendedCost", "exceptions", "notes"];
    }
    
    if (boq.status === "Under Review" || boq.status === "Approved") {
      return [...baseColumns, "selectedVendor", "pricePerUnit", "extendedCost", "exceptions", "purchaserReason", "notes"];
    }
    
    return baseColumns;
  };

  const getActionButtons = () => {
    const actions = [];
    
    switch (boq.status) {
      case "Draft":
        if (currentUser.role === "Employee" && currentUser.permissions.canEditBoQ) {
          actions.push(
            <Button key="add-item" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          );
          actions.push(
            <Button key="send-purchaser">
              <Send className="h-4 w-4 mr-2" />
              Send to Purchaser
            </Button>
          );
        }
        break;
        
      case "Compare Pending":
        if (currentUser.role === "Purchaser") {
          actions.push(
            <Button key="compare" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Compare & Select
            </Button>
          );
          actions.push(
            <Button key="send-admin">
              <Send className="h-4 w-4 mr-2" />
              Send to Admin
            </Button>
          );
        }
        break;
        
      case "Under Review":
        if (currentUser.role === "Admin") {
          actions.push(
            <Button key="approve" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Generate POs
            </Button>
          );
          actions.push(
            <Button key="send-back" variant="outline">
              <XCircle className="h-4 w-4 mr-2" />
              Send Back
            </Button>
          );
        }
        if (currentUser.role === "Purchaser") {
          actions.push(
            <Button key="recall" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Recall
            </Button>
          );
        }
        break;
        
      case "Approved":
        // No edit actions, just view
        break;
    }
    
    return actions;
  };

  const visibleColumns = getVisibleColumns();

  return (
    <div className="container mx-auto px-4 py-6">

      <div className="space-y-6">
        {/* Header & Meta */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(boq.status)}
                <div>
                  <CardTitle className="text-xl">{boq.number}</CardTitle>
                  <p className="text-muted-foreground">{boq.title}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(boq.status)} className="text-sm">
                {boq.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Project</span>
                <div className="font-medium cursor-pointer text-primary hover:underline" 
                     onClick={() => navigate(`/team/projects/${project?.id}`)}>
                  {project?.name || boq.project}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Created By</span>
                <div className="font-medium">{boq.createdBy}</div>
                <div className="text-sm text-muted-foreground">{new Date(boq.createdOn).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <div className="font-medium">{new Date(boq.lastUpdate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Items</span>
                <div className="font-medium">{boq.itemCount} items</div>
                {currentUser.permissions.canViewPrices && (
                  <div className="text-sm font-semibold text-primary">₹{boq.totalValue.toLocaleString()}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exception Summary */}
        {(boq.status === "Compare Pending" || boq.status === "Under Review") && boq.exceptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {/* <AlertTriangle className="h-5 w-5" /> */}
                Exception Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {boq.exceptions.nonLowest > 0 && (
                  <Badge variant="destructive">{boq.exceptions.nonLowest} Non-lowest</Badge>
                )}
                {boq.exceptions.missingReason > 0 && (
                  <Badge variant="outline">{boq.exceptions.missingReason} Missing Reason</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <Package className="h-5 w-5" /> */}
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              // Mobile card view
              <div className="space-y-4">
                {boq.items?.map((item, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </div>
                        {visibleColumns.includes("selectedVendor") && item.selectedVendor && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Vendor: </span>
                            {currentUser.permissions.canViewVendors ? item.selectedVendor : "***"}
                          </div>
                        )}
                        {visibleColumns.includes("pricePerUnit") && currentUser.permissions.canViewPrices && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Price: </span>
                            ₹{(item.quantity * 100).toLocaleString()}
                          </div>
                        )}
                        {item.purchaserReason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            {item.purchaserReason}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {!item.isLowest && (
                            <Badge variant="destructive" className="text-xs">Non-lowest</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop table view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    {visibleColumns.includes("activeVendors") && <TableHead>Active Vendors</TableHead>}
                    {visibleColumns.includes("selectedVendor") && <TableHead>Selected Vendor</TableHead>}
                    {visibleColumns.includes("pricePerUnit") && currentUser.permissions.canViewPrices && <TableHead>Price/Unit</TableHead>}
                    {visibleColumns.includes("extendedCost") && currentUser.permissions.canViewPrices && <TableHead>Extended Cost</TableHead>}
                    
                    {visibleColumns.includes("exceptions") && <TableHead>Exceptions</TableHead>}
                    {visibleColumns.includes("purchaserReason") && <TableHead>Purchaser Reason</TableHead>}
                    {visibleColumns.includes("notes") && <TableHead>Notes</TableHead>}
                    {canEdit() && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boq.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      {visibleColumns.includes("activeVendors") && (
                        <TableCell>
                          <Badge variant="outline">3</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes("selectedVendor") && (
                        <TableCell>
                          {currentUser.permissions.canViewVendors 
                            ? item.selectedVendor || "Not selected"
                            : "***"
                          }
                        </TableCell>
                      )}
                      {visibleColumns.includes("pricePerUnit") && currentUser.permissions.canViewPrices && (
                        <TableCell>₹{(100).toLocaleString()}</TableCell>
                      )}
                      {visibleColumns.includes("extendedCost") && currentUser.permissions.canViewPrices && (
                        <TableCell>₹{(item.quantity * 100).toLocaleString()}</TableCell>
                      )}
                      {visibleColumns.includes("exceptions") && (
                        <TableCell>
                          <div className="flex gap-1">
                            {!item.isLowest && (
                              <Badge variant="destructive" className="text-xs">Non-lowest</Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes("purchaserReason") && (
                        <TableCell>{item.purchaserReason || "-"}</TableCell>
                      )}
                      {visibleColumns.includes("notes") && (
                        <TableCell>-</TableCell>
                      )}
                      {canEdit() && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* POs under this BoQ (after approval) */}
        {boq.status === "Approved" && relatedPOs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Orders Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="space-y-4">
                  {relatedPOs.map((po) => (
                    <Card key={po.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-medium">{po.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Vendor: {currentUser.permissions.canViewVendors ? po.vendor : `V${po.vendorId}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Items: {po.items.length}
                          </div>
                          <Badge variant={po.status === "Open" ? "outline" : po.status === "Partial" ? "secondary" : "default"}>
                            {po.status}
                          </Badge>
                          {po.status === "Closed" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate(`/po/${po.id}`)}
                              className="w-full"
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              History
                            </Button>
                          ) : (
                            currentUser.permissions.canRecordGRN && (
                              <Button 
                                size="sm" 
                                onClick={() => navigate(`/po/${po.id}?tab=receive`)}
                                className="w-full"
                              >
                                <Package className="h-3 w-3 mr-2" />
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedPOs.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.id}</TableCell>
                        <TableCell>
                          {currentUser.permissions.canViewVendors ? po.vendor : `V${po.vendorId}`}
                        </TableCell>
                        <TableCell>{po.items.length} items</TableCell>
                        <TableCell>
                          <Badge variant={po.status === "Open" ? "outline" : po.status === "Partial" ? "secondary" : "default"}>
                            {po.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {po.status === "Closed" ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate(`/po/${po.id}`)}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              History
                            </Button>
                          ) : (
                            currentUser.permissions.canRecordGRN && (
                              <Button 
                                size="sm" 
                                onClick={() => navigate(`/po/${po.id}?tab=receive`)}
                              >
                                <Package className="h-3 w-3 mr-2" />
                                Receive
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity & Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* <MessageSquare className="h-5 w-5" /> */}
              Activity & Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Timeline */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <div className="font-medium">BoQ Created</div>
                    <div className="text-muted-foreground">by {boq.createdBy} on {new Date(boq.createdOn).toLocaleDateString()}</div>
                  </div>
                </div>
                {boq.submittedBy && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                    <div>
                      <div className="font-medium">Sent for Review</div>
                      <div className="text-muted-foreground">by {boq.submittedBy} on {new Date(boq.submittedOn || boq.lastUpdate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {boq.status === "Approved" && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div>
                      <div className="font-medium">Approved & POs Generated</div>
                      <div className="text-muted-foreground">by Admin on {new Date(boq.lastUpdate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Add Comment */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Add Comment</label>
                <Textarea
                  placeholder="Add a comment or note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button size="sm" disabled={!comment.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}