import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Edit, Trash2, Plus, Eye } from "lucide-react";

import boqData from "../../data/boqData.json";

const mockProjects = [
  { id: "PRJ-001", name: "Office Building Phase 1" },
  { id: "PRJ-002", name: "Residential Complex" },
  { id: "PRJ-003", name: "Shopping Mall" }
];

const mockIndents = [
  {
    id: "IND001",
    number: "IND-2024-001",
    boqId: "BOQ001",
    itemsSummary: "Cement (100 bags), Steel bars (2 tons)",
    requestingEmployee: "Mike Johnson",
    date: "2024-01-20",
    status: "Approved"
  },
  {
    id: "IND002", 
    number: "IND-2024-002",
    boqId: "BOQ001",
    itemsSummary: "Steel bars (4 tons), Bricks (25000 nos)",
    requestingEmployee: "Sarah Wilson",
    date: "2024-01-25",
    status: "Pending"
  }
];

export default function BOQDetail() {
  const { boqId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const boq = useMemo(() => {
    return boqData.boqs.find(b => b.id === boqId);
  }, [boqId]);

  const relatedIndents = useMemo(() => {
    return boq?.indents || [];
  }, [boq]);

  if (!boq) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">BOQ Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested BOQ could not be found.</p>
          <Button onClick={() => navigate("/boq/list")} className="mt-4">
            Back to BOQ List
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    return status === "Confirmed" ? "default" : "secondary";
  };

  const getIndentStatusVariant = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Pending": return "secondary";
      case "Completed": return "outline";
      default: return "secondary";
    }
  };

  const canEdit = boq.status === "Draft";
  const canDelete = boq.status === "Draft";
  const canCreateIndent = boq.status === "Confirmed";

  if (isMobile) {
    return (
      <div className="container mx-auto p-4 space-y-4">

        {/* BOQ Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              <Badge variant={getStatusVariant(boq.status)}>
                {boq.status}
              </Badge>
            </div>
            
            <div>
              <span className="font-medium">Project: </span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-left"
                onClick={() => navigate(`/team/projects/${boq.project}`)}
              >
                {mockProjects.find(p => p.id === boq.project)?.name}
              </Button>
            </div>
            
            <div><span className="font-medium">Created:</span> {boq.createdOn}</div>
            <div><span className="font-medium">Created By:</span> {boq.createdBy}</div>
            <div><span className="font-medium">Total Items:</span> {boq.items.length}</div>
            
          </CardContent>
        </Card>

        {/* Estimated Items */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {boq.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Planned:</span>
                      <span className="ml-1 font-medium">{item.plannedQuantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consumed:</span>
                      <span className="ml-1 font-medium">{item.consumedQuantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="ml-1 font-medium">{item.balanceQuantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remark:</span>
                      <span className="ml-1 font-medium">{item.remark}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Indents */}
        <Card>
          <CardHeader>
            <CardTitle>Indents under this BOQ</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedIndents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No indents created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {relatedIndents.map((indent) => (
                  <div key={indent.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{indent.number}</span>
                      <Badge variant={getIndentStatusVariant(indent.status)}>
                        {indent.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{indent.title}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{indent.createdBy}</span>
                      <span>{indent.createdOn}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Items: {indent.itemCount}</span>
                      {indent.totalValue && <span>₹{indent.totalValue.toLocaleString()}</span>}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/indent/approval/${indent.id}`)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* BOQ Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>BOQ Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(boq.status)}>
                  {boq.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <div className="mt-1">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-left"
                  onClick={() => navigate(`/team/projects/${boq.project}`)}
                >
                  {mockProjects.find(p => p.id === boq.project)?.name}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="mt-1">{boq.createdOn}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created By</label>
              <p className="mt-1">{boq.createdBy}</p>
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* Estimated Items */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Planned Quantity</TableHead>
                <TableHead>Consumed Quantity</TableHead>
                <TableHead>Balance Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boq.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.plannedQuantity}</TableCell>
                  <TableCell>{item.consumedQuantity}</TableCell>
                  <TableCell>{item.balanceQuantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Indents under this BOQ */}
      <Card>
        <CardHeader>
          <CardTitle>Indents under this BOQ</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedIndents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No indents created yet.</p>
              {canCreateIndent && (
                <Button onClick={() => navigate(`/indent/create?boqId=${boq.id}`)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Indent
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indent Number</TableHead>
                  <TableHead>Items Requested</TableHead>
                  <TableHead>Requesting Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedIndents.map((indent) => (
                  <TableRow key={indent.id}>
                    <TableCell className="font-medium">{indent.number}</TableCell>
                    <TableCell>{indent.title}</TableCell>
                    <TableCell>{indent.createdBy}</TableCell>
                    <TableCell>{indent.createdOn}</TableCell>
                    <TableCell>
                      <Badge variant={getIndentStatusVariant(indent.status)}>
                        {indent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/indent/approval/${indent.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}