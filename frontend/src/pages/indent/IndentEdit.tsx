import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Copy, Trash2, ChevronUp, ChevronDown, Save, Send, X } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-001",
  name: "Admin",
  role: "Admin",
  permissions: {
    canCreateBoQ: true,
    canRecordGRN: true,
    canApprove: true,
    canViewPrices: true,
    canViewVendors: true,
    canViewFinancials: true
  },
  assignedProjects: []
};

interface BoQLineItem {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number | "";
  remark: string;
}

interface BoQData {
  id: string;
  number?: string;
  title: string;
  project: string;
  location: string;
  neededBy: string;
  requester: string;
  notes: string;
  status: string;
  createdBy: string;
  createdOn: string;
  items: {
    itemId: string;
    itemName: string;
    unit: string;
    quantity: number;
    remarks: string;
  }[];
}

export default function BoQEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const items = mockData.items;
  const projects = mockData.projects;

  // Form state
  const [boqData, setBoqData] = useState<BoQData | null>(null);
  const [lineItems, setLineItems] = useState<BoQLineItem[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Project selection logic
  const getAvailableProjects = useCallback(() => {
    if (currentUser.role === "Employee") {
      return projects.filter(p => currentUser.assignedProjects.includes(p.id));
    }
    return projects;
  }, [projects]);

  const availableProjects = getAvailableProjects();

  // Fetch BoQ data
  useEffect(() => {
    const fetchBoQ = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Invalid BoQ ID",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8000/api/indent/${id}`);
        const data: BoQData = response.data;

        setBoqData({
          id: data.id,
          number: data.number,
          title: data.title || "",
          project: data.project || "",
          location: data.location || "",
          neededBy: data.neededBy || "",
          requester: data.requester || currentUser.name,
          notes: data.notes || "",
          status: data.status || "draft",
          createdBy: data.createdBy || currentUser.name,
          createdOn: data.createdOn || new Date().toISOString(),
          items: data.items || []
        });

        const existingLineItems: BoQLineItem[] = (data.items || []).map((item, index) => ({
          id: `line-${item.itemId}-${index}`,
          itemId: item.itemId,
          itemName: item.itemName,
          unit: item.unit,
          quantity: item.quantity,
          remark: item.remarks || ""
        }));
        setLineItems(existingLineItems);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch BoQ data. Please try again.",
          variant: "destructive"
        });
        setBoqData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoQ();
  }, [id, toast]);

  // Define all hooks before any conditional logic
  const updateBoqData = useCallback((field: string, value: string) => {
    setBoqData(prev => (prev ? { ...prev, [field]: value } : prev));
    setHasUnsavedChanges(true);
  }, []);

  const addItem = useCallback((item: typeof items[0]) => {
    const newLineItem: BoQLineItem = {
      id: `line-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      quantity: "",
      remark: ""
    };
    setLineItems(prev => [...prev, newLineItem]);
    setIsItemDialogOpen(false);
    setItemSearchQuery("");
    setHasUnsavedChanges(true);
  }, []);

  const updateLineItem = useCallback((index: number, field: keyof BoQLineItem, value: any) => {
    setLineItems(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasUnsavedChanges(true);
  }, []);

  const deleteLineItem = useCallback((index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  }, []);

  const duplicateLineItem = useCallback((index: number) => {
    const item = lineItems[index];
    const duplicatedItem: BoQLineItem = {
      ...item,
      id: `line-${Date.now()}`,
      quantity: "",
      remark: item.remark
    };
    setLineItems(prev => {
      const newItems = [...prev];
      newItems.splice(index + 1, 0, duplicatedItem);
      return newItems;
    });
    setHasUnsavedChanges(true);
  }, [lineItems]);

  const moveLineItem = useCallback((index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === lineItems.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    setLineItems(prev => {
      const newItems = [...prev];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return newItems;
    });
    setHasUnsavedChanges(true);
  }, [lineItems]);

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    if (!boqData?.title.trim()) errors.push("BoQ Title is required");
    if (!boqData?.project) errors.push("Project selection is required");
    if (lineItems.length === 0) errors.push("At least one item is required");
    lineItems.forEach((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Quantity is required for item ${index + 1}: ${item.itemName}`);
      }
    });
    return errors;
  }, [boqData, lineItems]);

  const saveDraft = useCallback(async () => {
    const errors = validateForm();
    if (boqData?.title.trim() === "" || !boqData?.project) {
      toast({
        title: "Error",
        description: "BoQ Title and Project are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const payload = {
        title: boqData.title,
        project: boqData.project,
        location: boqData.location,
        neededBy: boqData.neededBy,
        requester: boqData.requester,
        notes: boqData.notes,
        status: "draft",
        items: lineItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          unit: item.unit,
          quantity: Number(item.quantity) || 0,
          remarks: item.remark
        }))
      };

      await axios.put(`http://localhost:8000/api/indent/${id}`, payload);
      setHasUnsavedChanges(false);
      toast({
        title: "Draft Saved",
        description: "BoQ has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save BoQ. Please try again.",
        variant: "destructive"
      });
    }
  }, [boqData, lineItems, id, toast]);

  const sendToCompare = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    try {
      const payload = {
        title: boqData!.title,
        project: boqData!.project,
        location: boqData!.location,
        neededBy: boqData!.neededBy,
        requester: boqData!.requester,
        notes: boqData!.notes,
        status: "compare",
        items: lineItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          unit: item.unit,
          quantity: Number(item.quantity) || 0,
          remarks: item.remark
        }))
      };

      await axios.put(`http://localhost:8000/api/indent/${id}`, payload);
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "BoQ sent to Purchaser for comparison"
      });
      navigate("/indent/list");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send BoQ. Please try again.",
        variant: "destructive"
      });
    }
  }, [boqData, lineItems, id, toast, navigate]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      return;
    }
    navigate("/indent/list");
  }, [hasUnsavedChanges, navigate]);

  // Filtered items for search
  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) &&
      !lineItems.some(lineItem => lineItem.itemId === item.id)
  );

  // Conditional rendering
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Loading BoQ data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Invalid BoQ ID.</p>
            <Button className="mt-4" onClick={() => navigate("/indent/list")}>
              Back to BoQ List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!boqData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">The BoQ you're looking for doesn't exist or may have been deleted.</p>
            <Button className="mt-4" onClick={() => navigate("/indent/list")}>
              Back to BoQ List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (boqData.status !== "draft") {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Only draft BoQs can be edited. This BoQ has status: {boqData.status}</p>
            <Button className="mt-4" onClick={() => navigate("/indent/list")}>
              Back to BoQ List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser.permissions.canCreateBoQ) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Contact your administrator to request BoQ editing permissions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* BoQ Header */}
      <Card>
        <CardHeader>
          <CardTitle>BoQ Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">BoQ Title *</Label>
              <Input
                id="title"
                value={boqData.title}
                onChange={(e) => updateBoqData("title", e.target.value)}
                placeholder="Enter BoQ title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={boqData.project}
                onValueChange={(value) => updateBoqData("project", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Site / Location</Label>
              <Input
                id="location"
                value={boqData.location}
                onChange={(e) => updateBoqData("location", e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neededBy">Needed By</Label>
              <Input
                id="neededBy"
                type="date"
                value={boqData.neededBy}
                onChange={(e) => updateBoqData("neededBy", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester">Requester</Label>
              <Input
                id="requester"
                value={boqData.requester}
                onChange={(e) => updateBoqData("requester", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={boqData.notes}
              onChange={(e) => updateBoqData("notes", e.target.value)}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Badge variant="outline">Status: {boqData.status}</Badge>
            <Badge variant="outline">BoQ #: {boqData.number || "N/A"}</Badge>
            <Badge variant="outline">Created By: {boqData.createdBy}</Badge>
            <Badge variant="outline">Created On: {new Date(boqData.createdOn).toLocaleDateString()}</Badge>
            {boqData.project && (
              <Badge variant="outline">
                Project: {projects.find(p => p.id === boqData.project)?.name || "Unknown"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Item from Master</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      {items.length === 0 ? (
                        <div>
                          <p className="text-muted-foreground">No items available.</p>
                          <p className="text-sm text-muted-foreground mt-2">Please contact the Purchaser to add items to the master.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground">No items found or all items already added.</p>
                          <p className="text-sm text-muted-foreground mt-2">Can't find an item? Ask Purchaser to add it.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => addItem(item)}>
                                  Add
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Add your first item</p>
              <Button onClick={() => setIsItemDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity *</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value) || "")}
                          placeholder="0"
                          className={`w-24 ${!item.quantity || item.quantity <= 0 ? "border-destructive" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.remark}
                          onChange={(e) => updateLineItem(index, "remark", e.target.value)}
                          placeholder="Optional remark"
                          className="min-w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveLineItem(index, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveLineItem(index, "down")}
                            disabled={index === lineItems.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => duplicateLineItem(index)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLineItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={saveDraft} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={sendToCompare} disabled={lineItems.length === 0}>
          <Send className="h-4 w-4 mr-2" />
          Send to Compare
        </Button>
        {hasUnsavedChanges ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to leave without saving?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay and Save</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate("/indent/list")}>
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}