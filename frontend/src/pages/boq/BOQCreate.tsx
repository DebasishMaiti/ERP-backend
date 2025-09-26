import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Mock data
// const mockProjects = [
//   { id: "PRJ001", name: "Office Building Phase 1" },
//   { id: "PRJ002", name: "Residential Complex" },
//   { id: "PRJ003", name: "Shopping Mall" }
// ];

// const mockItems = [
//   { id: "ITM001", name: "Cement - OPC 53 Grade", unit: "Bags" },
//   { id: "ITM002", name: "Steel Bars - 10mm", unit: "Tons" },
//   { id: "ITM003", name: "Bricks - Red Clay", unit: "Nos" },
//   { id: "ITM004", name: "Sand - River Sand", unit: "Cubic Feet" },
//   { id: "ITM005", name: "Aggregate - 20mm", unit: "Cubic Feet" }
// ];

interface EstimateItem {
  id: string;
  itemId: string;
  plannedQuantity: number;
  unit: string;
  rate?: number;
}

export default function BOQCreate() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState("");
  const [boqName, setBOQName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [mockProjects, setMockProjects] = useState([]);
  const [mockItems, setMockItems] = useState([])


  const addEstimateItem = () => {
    const newItem: EstimateItem = {
      id: Date.now().toString(),
      itemId: "",
      plannedQuantity: 0,
      unit: "",
      rate: undefined
    };
    setEstimateItems([...estimateItems, newItem]);
  };

  const removeEstimateItem = (id: string) => {
    setEstimateItems(estimateItems.filter(item => item.id !== id));
  };

    const getProjects = async ()=>{
    const res = await axios.get("http://localhost:8000/api/project");
    setMockProjects(res.data)
    console.log(res.data);
  }

  const getItems = async ()=>{
    const res = await axios.get("http://localhost:8000/api/item");
    setMockItems(res.data);
    console.log(res.data, 'item');
    
  }

    useEffect(()=>{
      getProjects()
      getItems()
  },[])

  const handleSaveAsDraft = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      project: selectedProject,
      name: boqName,
      description,
      notes,
      status: "draft",
      items: estimateItems.map(item => ({
        item: item.itemId,
        plannedQty: item.plannedQuantity,
        unit: 10,
        rate: item.rate || null
      }))
    };

    const res = await axios.post("http://localhost:8000/api/boq", payload);

    toast({ title: "Success", description: "BOQ saved as draft" });
    console.log("BOQ Created:", res.data);
    navigate("/boq/list");
  } catch (error: any) {
    console.error("Error creating BOQ:", error);
    toast({ title: "Error", description: error?.response?.data?.message || "Failed to save draft", variant: "destructive" });
  }
};

const handleSendAndConfirm = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      project: selectedProject,
      name: boqName,
      description,
      notes,
      status: "comfirmed",
      items: estimateItems.map(item => ({
        item: item.itemId,
        plannedQty: item.plannedQuantity,
        unit: item.unit,
        rate: item.rate || null
      }))
    };

    const res = await axios.post("http://localhost:8000/api/boq", payload);

    toast({ title: "Success", description: "BOQ confirmed successfully" });
    console.log("BOQ Created:", res.data);
    navigate("/boq/list");
  } catch (error: any) {
    console.error("Error creating BOQ:", error);
    toast({ title: "Error", description: error?.response?.data?.message || "Failed to confirm BOQ", variant: "destructive" });
  }
};


  const updateEstimateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setEstimateItems(estimateItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill unit when item is selected
        if (field === 'itemId' && value) {
          const selectedItem = mockItems.find(i => i.id === value);
          if (selectedItem) {
            updatedItem.unit = selectedItem.unit;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const validateForm = () => {
    if (!selectedProject) {
      toast({ title: "Error", description: "Please select a project", variant: "destructive" });
      return false;
    }
    if (!boqName.trim()) {
      toast({ title: "Error", description: "Please enter BOQ name", variant: "destructive" });
      return false;
    }
    if (estimateItems.length === 0) {
      toast({ title: "Error", description: "Please add at least one estimate item", variant: "destructive" });
      return false;
    }
    
    // Check for duplicate items
    const itemIds = estimateItems.map(item => item.itemId).filter(Boolean);
    const duplicates = itemIds.filter((item, index) => itemIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      toast({ title: "Error", description: "Duplicate items are not allowed", variant: "destructive" });
      return false;
    }
    
    // Check for valid quantities
    const invalidItems = estimateItems.filter(item => !item.itemId || item.plannedQuantity <= 0);
    if (invalidItems.length > 0) {
      toast({ title: "Error", description: "Please fill all item details and ensure quantities are greater than 0", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const getSelectedItemName = (itemId: string) => {
    const item = mockItems.find(i => i.id === itemId);
    return item ? item.name : "";
  };

  if (isMobile) {
    return (
      <div className="container mx-auto p-4 space-y-4">

        {/* Step 1: Select Project */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project *" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Step 2: BOQ Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: BOQ Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">BOQ Name *</label>
              <Input
                placeholder="Enter BOQ name"
                value={boqName}
                onChange={(e) => setBOQName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Estimate Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Step 3: Estimate Items
              <Button onClick={addEstimateItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estimateItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items added yet. Click the + button to add items.
              </p>
            ) : (
              <div className="space-y-4">
                {estimateItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Item {index + 1}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeEstimateItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select 
                      value={item.itemId} 
                      onValueChange={(value) => updateEstimateItem(item.id, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockItems.map(mockItem => (
                          <SelectItem key={mockItem.id} value={mockItem.id}>
                            {mockItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Planned Quantity</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.plannedQuantity || ""}
                          onChange={(e) => updateEstimateItem(item.id, 'plannedQuantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Unit</label>
                        <Input
                          value={item.unit}
                          placeholder="Unit"
                           
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">Rate (Optional)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.rate || ""}
                        onChange={(e) => updateEstimateItem(item.id, 'rate', Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft} className="flex-1">
            <Save className="h-4 w-4 mr-1" />
            Save as Draft
          </Button>
          <Button onClick={handleSendAndConfirm} className="flex-1">
            <Send className="h-4 w-4 mr-1" />
            Send & Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Project */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select project (mandatory)" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: BOQ Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: BOQ Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">BOQ Name *</label>
                  <Input
                    placeholder="Enter BOQ name"
                    value={boqName}
                    onChange={(e) => setBOQName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Enter notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Estimate Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Step 3: Add Estimate Items
                <Button onClick={addEstimateItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estimateItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items added yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "Add Item" to start adding estimate items.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Planned Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate (Optional)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimateItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select 
                            value={item.itemId} 
                            onValueChange={(value) => updateEstimateItem(item.id, 'itemId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockItems.map(mockItem => (
                                <SelectItem key={mockItem._id} value={mockItem._id}>
                                  {mockItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.plannedQuantity || ""}
                            onChange={(e) => updateEstimateItem(item.id, 'plannedQuantity', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            placeholder="Unit"
                            
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.rate || ""}
                            onChange={(e) => updateEstimateItem(item.id, 'rate', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeEstimateItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Project:</span>
                <span className="font-medium">
                  {selectedProject ? mockProjects.find(p => p.id === selectedProject)?.name : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Items:</span>
                <span className="font-medium">{estimateItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <span className="font-medium">Draft</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={handleSaveAsDraft} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={handleSendAndConfirm} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send & Confirm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}