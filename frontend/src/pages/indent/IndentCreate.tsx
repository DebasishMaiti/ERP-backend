import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-001",
  name: "Admin",
  role: "Admin", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canCreateBoQ: true,
    canRecordGRN: true,
    canApprove: true,
    canViewPrices: true, // Admin has full access
    canViewVendors: true,
    canViewFinancials: true
  },
  assignedProjects: [] // Admin has access to all projects by default
};

interface IndentLineItem {
  id: string;
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number | "";
  remark: string;
}

interface Project {
  _id: string;
  projectCode: string; // Manually created ID (e.g., "PROJ-001")
  name: string;
  // Add other project fields as needed
}

interface BOQ {
  _id: string;
  boqId: string; // Manually created ID (e.g., "BQ-001")
  name: string;
  project: string;
  status: string;
  // Add other BOQ fields as needed
}

interface Item {
  _id: string;
  name: string;
  unit: string;
  // Add other item fields as needed
}

export default function IndentCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [boqs, setBoqs] = useState<BOQ[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState({
    projects: false,
    boqs: false,
    items: false,
    save: false
  });

  // Project selection logic
  const getAvailableProjects = () => {
    if (currentUser.role === "Employee") {
      return projects.filter(p => currentUser.assignedProjects.includes(p._id));
    }
    // Purchaser, Admin, Accountant have access to all projects
    return projects;
  };

  const availableProjects = getAvailableProjects();
  const autoSelectProject = availableProjects.length === 1 ? availableProjects[0] : null;

  // Get BOQs for selected project
  const getAvailableBOQs = (projectMongoId: string) => {
    return boqs.filter(boq => boq.project === projectMongoId && boq.status === "confirmed");
  };

  // Form state
  const [indentData, setIndentData] = useState({
    title: "",
    projectId: autoSelectProject?.projectCode || "", // Use projectCode
    projectMongoId: autoSelectProject?._id || "", // Store MongoDB _id
    boqId: "",
    boqMongoId: "", // Store MongoDB _id for BOQ
    location: "",
    neededBy: "",
    requester: currentUser.name,
    notes: "",
    status: "draft"
  });

  const [lineItems, setLineItems] = useState<IndentLineItem[]>([]);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get available BOQs based on selected project
  const availableBOQs = indentData.projectMongoId ? getAvailableBOQs(indentData.projectMongoId) : [];

  // Filtered items for search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  // Fetch projects and items on component mount
  useEffect(() => {
    fetchProjects();
    fetchItems();
  }, []);

  // Fetch BOQs when project changes
  useEffect(() => {
    if (indentData.projectMongoId) {
      fetchBOQsByProject(indentData.projectMongoId);
    } else {
      setBoqs([]);
      setIndentData(prev => ({ ...prev, boqId: "", boqMongoId: "" }));
    }
  }, [indentData.projectMongoId]);

  const fetchProjects = async () => {
    try {
      setApiLoading(prev => ({ ...prev, projects: true }));
      const response = await axios.get('http://localhost:8000/api/project');
      setProjects(response.data);
      
      // Auto-select if only one project is available
      if (response.data.length === 1) {
        setIndentData(prev => ({
          ...prev,
          projectId: response.data[0].projectCode, // Use projectCode
          projectMongoId: response.data[0]._id // Use MongoDB _id
        }));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ description: "Error fetching projects", variant: "destructive" });
    } finally {
      setApiLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchBOQsByProject = async (projectMongoId: string) => {
    try {
      setApiLoading(prev => ({ ...prev, boqs: true }));
      const response = await axios.get(`http://localhost:8000/api/boq/project/${projectMongoId}`, {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        }
      });
      setBoqs(response.data);
    } catch (error) {
      console.error('Error fetching BOQs:', error);
      toast({ description: "Error fetching BOQs", variant: "destructive" });
      setBoqs([]);
    } finally {
      setApiLoading(prev => ({ ...prev, boqs: false }));
    }
  };

  const fetchItems = async () => {
    try {
      setApiLoading(prev => ({ ...prev, items: true }));
      const response = await axios.get('http://localhost:8000/api/item');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({ description: "Error fetching items", variant: "destructive" });
    } finally {
      setApiLoading(prev => ({ ...prev, items: false }));
    }
  };

  // Check if current user can create indents
  if (!currentUser.permissions.canCreateBoQ) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Contact your administrator to request indent creation permissions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check project access for Employees
  if (currentUser.role === "Employee" && availableProjects.length === 0 && !apiLoading.projects) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Contact your administrator to get assigned to projects.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const updateIndentData = useCallback((field: string, value: string) => {
    setIndentData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If project changes, reset BOQ selection
      if (field === "projectId") {
        const selectedProject = projects.find(p => p.projectCode === value);
        updated.projectMongoId = selectedProject?._id || "";
        updated.boqId = "";
        updated.boqMongoId = "";
      }
      
      // If BOQ changes, update boqMongoId
      if (field === "boqId") {
        const selectedBoq = boqs.find(b => b.boqId === value);
        updated.boqMongoId = selectedBoq?._id || "";
      }
      
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [projects, boqs]);

  const addItem = useCallback((item: Item) => {
    const newItem: IndentLineItem = {
      id: `line-${Date.now()}`,
      itemId: item._id,
      itemName: item.name,
      unit: item.unit,
      quantity: "",
      remark: ""
    };
    
    setLineItems(prev => [...prev, newItem]);
    setIsItemDialogOpen(false);
    setItemSearchQuery("");
    setHasUnsavedChanges(true);
  }, []);

  const updateLineItem = useCallback((index: number, field: keyof IndentLineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
    setHasUnsavedChanges(true);
  }, []);

  const deleteLineItem = useCallback((index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  }, []);

  const moveLineItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lineItems.length) return;

    setLineItems(prev => {
      const items = [...prev];
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return items;
    });
    setHasUnsavedChanges(true);
  }, [lineItems.length]);

  const validateForm = () => {
    if (!indentData.title.trim()) {
      toast({ description: "Please enter a title", variant: "destructive" });
      return false;
    }
    if (!indentData.projectId) {
      toast({ description: "Please select a project", variant: "destructive" });
      return false;
    }
    if (!indentData.boqId) {
      toast({ description: "Please select a BOQ", variant: "destructive" });
      return false;
    }
    if (lineItems.length === 0) {
      toast({ description: "Please add at least one item", variant: "destructive" });
      return false;
    }
    
    // Validate line items
    for (const item of lineItems) {
      if (!item.quantity || item.quantity <= 0) {
        toast({ description: `Please enter valid quantity for ${item.itemName}`, variant: "destructive" });
        return false;
      }
    }
    
    return true;
  };

  const saveIndent = async (status: "draft" | "compare") => {
    if (!validateForm()) return;

    try {
      setApiLoading(prev => ({ ...prev, save: true }));
      
     
      const apiItems = lineItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName, 
        unit: item.unit,  
        quantity: Number(item.quantity),
        remarks: item.remark
      }));

      const indentPayload = {
        title: indentData.title,
        project: indentData.projectMongoId, 
        boq: indentData.boqMongoId, 
        projectId: indentData.projectId,
        boqId: indentData.boqId, 
        location: indentData.location,
        neededBy: indentData.neededBy ? new Date(indentData.neededBy).toISOString() : new Date().toISOString(),
        requester: indentData.requester,
        notes: indentData.notes,
        items: apiItems,
        status: status,
        comment: ""
      };

      const response = await axios.post('http://localhost:8000/api/indent', indentPayload);

      toast({ 
        description: status === "draft" 
          ? "Indent saved as draft successfully" 
          : "Indent sent for comparison successfully" 
      });
      setHasUnsavedChanges(false);
      
      if (status === "compare") {
        navigate("/indent/list");
      }
    } catch (error: any) {
      console.error('Error saving indent:', error);
      toast({ 
        description: error.response?.data?.message || "Error saving indent", 
        variant: "destructive" 
      });
    } finally {
      setApiLoading(prev => ({ ...prev, save: false }));
    }
  };

  const saveDraft = () => {
    saveIndent("draft");
  };

  const sendToCompare = () => {
    saveIndent("compare");
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Indent Information */}
        <Card>
          <CardHeader>
            <CardTitle>Indent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Indent Title *</Label>
                <Input
                  id="title"
                  value={indentData.title}
                  onChange={(e) => updateIndentData("title", e.target.value)}
                  placeholder="Enter indent title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select 
                  value={indentData.projectId} 
                  onValueChange={(value) => updateIndentData("projectId", value)}
                  disabled={apiLoading.projects}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      apiLoading.projects ? "Loading projects..." : 
                      "Select project"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project.projectCode}>
                        {project.name} ({project.projectCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {apiLoading.projects && (
                  <p className="text-sm text-muted-foreground">Loading projects...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="boq">BOQ *</Label>
                <Select 
                  value={indentData.boqId} 
                  onValueChange={(value) => updateIndentData("boqId", value)}
                  disabled={!indentData.projectId || apiLoading.boqs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      apiLoading.boqs ? "Loading BOQs..." : 
                      !indentData.projectId ? "Select project first" : 
                      availableBOQs.length === 0 ? "No BOQs available" :
                      "Select BOQ"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {boqs.map(boq => (
                      <SelectItem key={boq._id} value={boq.boqId}>
                        {boq.name} ({boq.boqId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {apiLoading.boqs && (
                  <p className="text-sm text-muted-foreground">Loading BOQs...</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={indentData.location}
                  onChange={(e) => updateIndentData("location", e.target.value)}
                  placeholder="Delivery location"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neededBy">Needed By</Label>
                <Input
                  id="neededBy"
                  type="date"
                  value={indentData.neededBy}
                  onChange={(e) => updateIndentData("neededBy", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requester">Requester</Label>
                <Input
                  id="requester"
                  value={indentData.requester}
                  onChange={(e) => updateIndentData("requester", e.target.value)}
                  placeholder="Requesting person"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={indentData.notes}
                onChange={(e) => updateIndentData("notes", e.target.value)}
                placeholder="Additional notes or requirements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Indent Items</CardTitle>
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={apiLoading.items}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                  {apiLoading.items && " (Loading...)"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search items..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {apiLoading.items ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading items...
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {itemSearchQuery ? "No items found" : "No items available"}
                      </div>
                    ) : (
                      filteredItems.map(item => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => addItem(item)}
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Unit: {item.unit}</p>
                          </div>
                          <Button size="sm">Add</Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || "")}
                          className="w-20"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.remark}
                          onChange={(e) => updateLineItem(index, "remark", e.target.value)}
                          placeholder="Optional remark"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLineItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLineItem(index, 'down')}
                            disabled={index === lineItems.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLineItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={!hasUnsavedChanges || apiLoading.save}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to discard them?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate(-1)}>
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft} disabled={apiLoading.save}>
              <Save className="w-4 h-4 mr-2" />
              {apiLoading.save ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={sendToCompare} disabled={apiLoading.save}>
              <Send className="w-4 h-4 mr-2" />
              {apiLoading.save ? "Sending..." : "Send for Comparison"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}