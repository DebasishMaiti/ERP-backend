import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Save, X } from "lucide-react";
import mockData from "@/data/mockData.json";

// Mock current user role - in real app this would come from auth context
const currentUser = {
  id: "TM-002",
  name: "Jane Smith",
  role: "Purchaser", // Employee, Purchaser, Admin, Accountant
  permissions: {
    canCreateVendors: true, // Purchaser/Admin: true
    canViewVendors: true
  }
};

interface VendorData {
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  paymentTerms: string;
  active: boolean;
  notes: string;
}

export default function VendorCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [vendorData, setVendorData] = useState<VendorData>({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    paymentTerms: "",
    active: true,
    notes: ""
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check permissions
  if (!currentUser.permissions.canCreateVendors) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Only Purchasers and Admins can create vendors.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const updateVendorField = useCallback((field: keyof VendorData, value: any) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const validateForm = () => {
    const errors: string[] = [];

    if (!vendorData.name.trim()) {
      errors.push("Vendor name is required");
    }

    // Check for duplicate vendor name
    const isDuplicate = mockData.vendors.some(v => 
      v.name.toLowerCase() === vendorData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      errors.push("A vendor with this name already exists");
    }

    // Validate email format if provided
    if (vendorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Validate payment terms if provided
    if (vendorData.paymentTerms && (isNaN(Number(vendorData.paymentTerms)) || Number(vendorData.paymentTerms) < 0)) {
      errors.push("Payment terms must be a valid number of days");
    }

    // Additional backend-required fields
    if (!vendorData.contact.trim()) {
      errors.push("Contact person is required");
    }
    if (!vendorData.phone.trim()) {
      errors.push("Phone number is required");
    }
    if (!vendorData.email.trim()) {
      errors.push("Email is required");
    }
    if (!vendorData.address.trim()) {
      errors.push("Address is required");
    }
    if (!vendorData.gstin.trim()) {
      errors.push("GSTIN / Tax ID is required");
    }
    if (!vendorData.paymentTerms.trim()) {
      errors.push("Payment terms is required");
    }

    return errors;
  };

  const saveVendor = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: vendorData.name,
        contactPerson: vendorData.contact,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address,
        gstin: vendorData.gstin,
        paymentDays: Number(vendorData.paymentTerms),
        notes: vendorData.notes,
        status: vendorData.active ? "active" : "inactive",
      };

      const response = await fetch("http://localhost:8000/api/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      toast({
        title: "Success",
        description: `Vendor "${vendorData.name}" created successfully`
      });
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [vendorData, toast]);

  const saveAndClose = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: vendorData.name,
        contactPerson: vendorData.contact,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address,
        gstin: vendorData.gstin,
        paymentDays: Number(vendorData.paymentTerms),
        notes: vendorData.notes,
        status: vendorData.active ? "active" : "inactive",
      };

      const response = await fetch("http://localhost:8000/api/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      toast({
        title: "Success",
        description: `Vendor "${vendorData.name}" created successfully`
      });
      navigate("/vendors/list");
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [vendorData, toast, navigate]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/vendors/list");
      }
    } else {
      navigate("/vendors/list");
    }
  }, [hasUnsavedChanges, navigate]);

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Vendor Details */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendorData.name}
                    onChange={(e) => updateVendorField("name", e.target.value)}
                    placeholder="Enter vendor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input
                    id="contact"
                    value={vendorData.contact}
                    onChange={(e) => updateVendorField("contact", e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={vendorData.phone}
                    onChange={(e) => updateVendorField("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => updateVendorField("email", e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={vendorData.address}
                  onChange={(e) => updateVendorField("address", e.target.value)}
                  placeholder="Full address"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN / Tax ID</Label>
                  <Input
                    id="gstin"
                    value={vendorData.gstin}
                    onChange={(e) => updateVendorField("gstin", e.target.value)}
                    placeholder="GSTIN number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={vendorData.paymentTerms}
                    onChange={(e) => updateVendorField("paymentTerms", e.target.value)}
                    placeholder="30"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={vendorData.active}
                  onCheckedChange={(checked) => updateVendorField("active", checked)}
                />
                <Label>Active Vendor</Label>
                <span className="text-sm text-muted-foreground">
                  (Inactive vendors won't appear in item pricing)
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={vendorData.notes}
                  onChange={(e) => updateVendorField("notes", e.target.value)}
                  placeholder="Additional notes about this vendor..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="outline" onClick={saveVendor} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={saveAndClose} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          </div>

          {hasUnsavedChanges && (
            <div className="text-sm text-amber-600 text-center">
              You have unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}