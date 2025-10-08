import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Edit, Trash2, Plus, Eye } from "lucide-react";

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
  const [boq, setBoq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch BOQ data from API
  useEffect(() => {
    const fetchBOQ = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/boq/${boqId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch BOQ: ${response.status}`);
        }
        
        const data = await response.json();
        setBoq(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching BOQ:", err);
      } finally {
        setLoading(false);
      }
    };

    if (boqId) {
      fetchBOQ();
    }
  }, [boqId]);

  const relatedIndents = useMemo(() => {
    return boq?.indents || mockIndents.filter(indent => indent.boqId === boqId);
  }, [boq, boqId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading BOQ...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we fetch the BOQ details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error Loading BOQ</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => navigate("/boq/list")} className="mt-4">
            Back to BOQ List
          </Button>
        </div>
      </div>
    );
  }

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

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
        return "default";
      case "draft":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getIndentStatusVariant = (status) => {
    switch (status) {
      case "Approved": return "default";
      case "Pending": return "secondary";
      case "Completed": return "outline";
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };

  const canEdit = boq.status === "Draft";
  const canDelete = boq.status === "Draft";
  const canCreateIndent = boq.status === "Confirmed" || boq.status === "Approved";

  if (isMobile) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/boq/list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">BOQ Details</h1>
        </div>

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
                onClick={() => navigate(`/team/projects/${boq.projectId || boq.project}`)}
              >
                {mockProjects.find(p => p.id === (boq.projectId || boq.project))?.name || boq.projectName}
              </Button>
            </div>
            
            <div><span className="font-medium">Created:</span> {boq.createdOn || boq.createdDate}</div>
            <div><span className="font-medium">Created By:</span> {boq.createdBy}</div>
            <div><span className="font-medium">Total Items:</span> {boq.items?.length || 0}</div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {canEdit && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estimated Items */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Items</CardTitle>
          </CardHeader>
          <CardContent>
            {!boq.items || boq.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items found in this BOQ.
              </p>
            ) : (
              <div className="space-y-3">
                {boq.items.map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium">{item.name || item.itemName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Planned:</span>
                        <span className="ml-1 font-medium">{item.plannedQuantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consumed:</span>
                        <span className="ml-1 font-medium">{item.consumedQuantity || 0} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="ml-1 font-medium">{item.balanceQuantity || item.plannedQuantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remark:</span>
                        <span className="ml-1 font-medium">{item.remark || "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Indents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Indents under this BOQ</CardTitle>
            {canCreateIndent && (
              <Button 
                size="sm" 
                onClick={() => navigate(`/indent/create?boqId=${boq.id}`)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Indent
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {relatedIndents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No indents created yet.</p>
                {canCreateIndent && (
                  <Button 
                    onClick={() => navigate(`/indent/create?boqId=${boq.id}`)} 
                    className="mt-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Indent
                  </Button>
                )}
              </div>
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
                    <p className="text-sm">{indent.title || indent.itemsSummary}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{indent.createdBy || indent.requestingEmployee}</span>
                      <span>{indent.createdOn || indent.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Items: {indent.itemCount || "N/A"}</span>
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
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/boq/list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">BOQ Details</h1>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit BOQ
            </Button>
          )}
          {canDelete && (
            <Button variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete BOQ
            </Button>
          )}
        </div>
      </div>

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
                  onClick={() => navigate(`/team/projects/${boq.projectId || boq.project}`)}
                >
                  {mockProjects.find(p => p.id === (boq.projectId || boq.project))?.name || boq.projectName}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="mt-1">
                {new Date(boq.createdAt).toLocaleDateString("en-GB")}
              </p>
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
          {!boq.items || boq.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items found in this BOQ.</p>
            </div>
          ) : (
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
                  <TableRow key={item.id || index}>
                    <TableCell className="font-medium">{item.name || item.itemName}</TableCell>
                    <TableCell>{item.plannedQty}</TableCell>
                    <TableCell>{item.consumedQuantity || 0}</TableCell>
                    <TableCell>{item.balanceQuantity || item.plannedQuantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.remark || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Indents under this BOQ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Indents under this BOQ</CardTitle>
          {canCreateIndent && (
            <Button onClick={() => navigate(`/indent/create?boqId=${boq.id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Indent
            </Button>
          )}
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
                    <TableCell>{indent.title || indent.itemsSummary}</TableCell>
                    <TableCell>{indent.createdBy || indent.requestingEmployee}</TableCell>
                    <TableCell>{indent.createdOn || indent.date}</TableCell>
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