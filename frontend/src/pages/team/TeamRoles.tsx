
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Circle, Info, Shield } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
export default function TeamRoles() {
  // Admin access control - in real app, get from auth context
  const isAdmin = true; // TODO: Replace with actual admin check
  const isMobile = useIsMobile();
  
  const [permissions, setPermissions] = useState([{
    feature: "BoQ Create/Edit (draft)",
    employee: true,
    purchaser: false,
    admin: false,
    accountant: false
  }, {
    feature: "BoQ Compare & Select",
    employee: false,
    purchaser: true,
    admin: true,
    accountant: false
  }, {
    feature: "BoQ Admin Approval",
    employee: false,
    purchaser: false,
    admin: true,
    accountant: false
  }, {
    feature: "PO List/View",
    employee: true,
    purchaser: true,
    admin: true,
    accountant: true
  }, {
    feature: "PO Detail: Record Receipts",
    employee: true,
    purchaser: true,
    admin: true,
    accountant: false
  }, {
    feature: "Items & Vendor Prices (manage)",
    employee: false,
    purchaser: true,
    admin: true,
    accountant: false
  }, {
    feature: "Vendor Ledger / Payments / Credit Notes",
    employee: false,
    purchaser: false,
    admin: true,
    accountant: true
  }, {
    feature: "Team Management (add/edit members)",
    employee: false,
    purchaser: false,
    admin: true,
    accountant: false
  }]);

  const roles = [{
    name: "Employee",
    description: "Creates BoQs and submits them into the purchasing flow",
    keyActions: ["Create/Edit BoQ drafts", "Attach notes", "View PO status"],
    cannot: ["Compare vendors", "Approve BoQs", "Modify items/prices", "Record payments"]
  }, {
    name: "Purchaser",
    description: "Owns item master and vendor pricing; runs vendor comparison and generates POs",
    keyActions: ["Manage Items & Vendor Prices", "Compare & Select", "Generate PO previews", "Open PO details"],
    cannot: ["Approve BoQs (admin task)", "Post payments/credit notes"]
  }, {
    name: "Admin",
    description: "Gatekeeper for approvals and policy exceptions",
    keyActions: ["Review full vendor comparisons", "Approve/reject BoQs", "Override vendor with reason", "View all POs/ledgers"],
    cannot: ["Post payments (accountant task)"]
  }, {
    name: "Accountant",
    description: "Manages vendor financials after POs and receipts",
    keyActions: ["Record payments", "Credit notes", "Review vendor balances/ledger"],
    cannot: ["Edit items/prices", "Compare vendors", "Approve BoQs"]
  }];

  const handlePermissionChange = (permissionIndex: number, role: 'employee' | 'purchaser' | 'admin' | 'accountant', checked: boolean) => {
    if (!isAdmin) return;
    
    setPermissions(prev => prev.map((permission, index) => 
      index === permissionIndex 
        ? { ...permission, [role]: checked }
        : permission
    ));
  };
  const getRoleIcon = (hasPermission: boolean, isPrimary: boolean = false) => {
    if (isPrimary) return <CheckCircle className="h-4 w-4 text-primary" />;
    if (hasPermission) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };
  // Admin access check
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">Only administrators can access team role management.</p>
        </Card>
      </div>
    );
  }

  return <div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Admin Badge */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Administrator Access</p>
                <p className="text-sm text-muted-foreground">You can customize role permissions by checking/unchecking boxes in the matrix below.</p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Permissions Matrix */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Permissions Matrix</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click checkboxes to customize role permissions. Changes are saved automatically.
            </p>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {permissions.map((permission, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-3">
                      <div className="font-medium mb-2">{permission.feature}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Employee</span>
                          <Checkbox
                            checked={permission.employee}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'employee', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Purchaser</span>
                          <Checkbox
                            checked={permission.purchaser}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'purchaser', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Admin</span>
                          <Checkbox
                            checked={permission.admin}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'admin', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Accountant</span>
                          <Checkbox
                            checked={permission.accountant}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'accountant', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Feature</TableHead>
                      <TableHead className="text-center">Employee</TableHead>
                      <TableHead className="text-center">Purchaser</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Accountant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{permission.feature}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={permission.employee}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'employee', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={permission.purchaser}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'purchaser', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={permission.admin}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'admin', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={permission.accountant}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(idx, 'accountant', checked as boolean)
                            }
                            disabled={!isAdmin}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>;
}