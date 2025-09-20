import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Eye, Package, FileText } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role
const currentUser = {
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canRecordReceipt: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  }
};

export default function BoQPOsView() {
  const { boqId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Find BoQ and related POs
  const boq = mockData.boqs.find(b => b.id === boqId);
  const relatedPOs = mockData.purchaseOrders.filter(po => po.boqId === boqId);

  if (!boq) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">The requested BoQ could not be found.</p>
              <Button onClick={() => navigate("/indent/list")} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to BoQ List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-800";
      case "Partial": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getItemsCovered = (po: any) => {
    return po.items.map((item: any) => item.name).join(", ");
  };

  const getRowActions = (po: any) => {
    if (po.status === "Closed") {
      return [
        <Button 
          key="history" 
          size="sm" 
          variant="outline"
          onClick={() => navigate(`/po/${encodeURIComponent(po.id)}`)}
        >
          <FileText className="h-3 w-3 mr-1" />
          History
        </Button>
      ];
    }

    if ((po.status === "Open" || po.status === "Partial") && currentUser.permissions.canRecordReceipt) {
      return [
        <Button 
          key="receive" 
          size="sm"
          onClick={() => navigate(`/po/${encodeURIComponent(po.id)}?tab=receive`)}
        >
          <Package className="h-3 w-3 mr-1" />
          Receive
        </Button>
      ];
    }

    return [];
  };

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* BoQ Summary */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{boq.number}: {boq.title}</CardTitle>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <div>Project: {boq.project}</div>
                  <div>Created by: {boq.createdBy}</div>
                  <div>Items: {boq.itemCount}</div>
                  <div>Status: <Badge variant="outline">{boq.status}</Badge></div>
                </div>
              </div>
              {currentUser.permissions.canViewPrices && (
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{boq.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total BoQ Value</div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Generated POs */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedPOs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No purchase orders have been generated from this BoQ yet.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/indent/approval/${boqId}`)} 
                  className="mt-4"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View BoQ Details
                </Button>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-4">
                    {relatedPOs.map((po) => (
                      <Card key={po.id} className="shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm font-mono">{po.id}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                              </p>
                            </div>
                            <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm">
                            <div className="font-medium mb-1">Items Covered:</div>
                            <div className="text-muted-foreground">{getItemsCovered(po)}</div>
                          </div>
                          
                          {currentUser.permissions.canViewPrices && (
                            <div className="pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Total Amount:</span>
                              <div className="text-lg font-semibold">₹{po.totalAmount.toLocaleString()}</div>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <div className="flex gap-2 flex-wrap">
                              {getRowActions(po)}
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
                        <TableHead>PO #</TableHead>
                        <TableHead>{currentUser.permissions.canViewVendors ? "Vendor" : "Vendor ID"}</TableHead>
                        <TableHead>Items Covered</TableHead>
                        <TableHead>Status</TableHead>
                        {currentUser.permissions.canViewPrices && <TableHead>Total Amount</TableHead>}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell>
                            <div className="font-mono text-sm">{po.id}</div>
                            <div className="text-xs text-muted-foreground">
                              Order Date: {new Date(po.orderDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {currentUser.permissions.canViewVendors ? po.vendor : po.vendorId}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="text-sm truncate" title={getItemsCovered(po)}>
                              {getItemsCovered(po)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {po.items.length} item(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                          </TableCell>
                          {currentUser.permissions.canViewPrices && (
                            <TableCell className="font-semibold">₹{po.totalAmount.toLocaleString()}</TableCell>
                          )}
                          <TableCell>
                            <div className="flex gap-1">
                              {getRowActions(po)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{relatedPOs.length}</div>
                      <div className="text-sm text-muted-foreground">Total POs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{relatedPOs.filter(po => po.status === "Open").length}</div>
                      <div className="text-sm text-muted-foreground">Open POs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{relatedPOs.filter(po => po.status === "Partial").length}</div>
                      <div className="text-sm text-muted-foreground">Partial POs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{relatedPOs.filter(po => po.status === "Closed").length}</div>
                      <div className="text-sm text-muted-foreground">Closed POs</div>
                    </div>
                  </div>
                  
                  {currentUser.permissions.canViewPrices && (
                    <div className="mt-4 text-center">
                      <div className="text-3xl font-bold">
                        ₹{relatedPOs.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total PO Value</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}