import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, X } from "lucide-react";
import mockData from "@/data/mockData.json";

interface ModulePermission {
  read: boolean;
  write: boolean;
}

interface Permissions {
  projects: string[];
  permissions: {
    indent: {
      list: ModulePermission;
      create: ModulePermission;
      compare: ModulePermission;
      approval: ModulePermission;
    };
    purchaseOrders: {
      list: ModulePermission;
      open: ModulePermission;
    };
    items: {
      list: ModulePermission;
      addItem: ModulePermission;
    };
    vendors: {
      list: ModulePermission;
      create: ModulePermission;
      accounts: ModulePermission;
    };
    teamAndProject: {
      teamList: ModulePermission;
      addMember: ModulePermission;
      projectList: ModulePermission;
      addProject: ModulePermission;
      boqList: ModulePermission;
      addBoq: ModulePermission;
    };
  };
}

interface PermissionsManagerProps {
  permissions: Permissions;
  onChange: (permissions: Permissions) => void;
  disabled?: boolean;
}

const AVAILABLE_MODULES = [
  {
    key: "indent",
    label: "Indent",
    subModules: [
      { key: "list", label: "List" },
      { key: "create", label: "Create" },
      { key: "compare", label: "Compare" },
      { key: "approval", label: "Approval" },
    ],
  },
  {
    key: "purchaseOrders",
    label: "Purchase Orders",
    subModules: [
      { key: "list", label: "List" },
      { key: "open", label: "Open" },
    ],
  },
  {
    key: "items",
    label: "Items",
    subModules: [
      { key: "list", label: "List" },
      { key: "addItem", label: "Add Item" },
    ],
  },
  {
    key: "vendors",
    label: "Vendors",
    subModules: [
      { key: "list", label: "List" },
      { key: "create", label: "Create" },
      { key: "accounts", label: "Accounts" },
    ],
  },
  {
    key: "teamAndProject",
    label: "Team & Project",
    subModules: [
      { key: "teamList", label: "Team List" },
      { key: "addMember", label: "Add Member" },
      { key: "projectList", label: "Project List" },
      { key: "addProject", label: "Add Project" },
      { key: "boqList", label: "BOQ List" },
      { key: "addBoq", label: "Add BOQ" },
    ],
  },
];

export function PermissionsManager({ permissions, onChange, disabled = false }: PermissionsManagerProps) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [selectedProjectToAdd, setSelectedProjectToAdd] = useState<string>("");
  const availableProjects = mockData.projects.filter(
    project => !permissions.projects.includes(project.id)
  );

  const handleAllProjectsToggle = (checked: boolean) => {
    onChange({
      ...permissions,
      projects: checked ? mockData.projects.map(p => p.id) : [],
    });
  };

  const handleProjectAdd = () => {
    if (selectedProjectToAdd && !permissions.projects.includes(selectedProjectToAdd)) {
      onChange({
        ...permissions,
        projects: [...permissions.projects, selectedProjectToAdd],
      });
      setSelectedProjectToAdd("");
    }
  };

  const handleProjectRemove = (projectId: string) => {
    onChange({
      ...permissions,
      projects: permissions.projects.filter(id => id !== projectId),
    });
  };

  const handleModulePermissionChange = (
    moduleKey: string,
    subModuleKey: string,
    permissionType: "read" | "write",
    checked: boolean
  ) => {
    const updatedPermissions = {
      ...permissions.permissions,
      [moduleKey]: {
        ...permissions.permissions[moduleKey],
        [subModuleKey]: {
          ...permissions.permissions[moduleKey][subModuleKey],
          [permissionType]: checked,
          ...(permissionType === "read" && !checked ? { write: false } : {}),
          ...(permissionType === "write" && checked ? { read: true } : {}),
        },
      },
    };

    onChange({
      ...permissions,
      permissions: updatedPermissions,
    });
  };

  const handleMainModuleToggle = (moduleKey: string, checked: boolean) => {
    const module = AVAILABLE_MODULES.find(m => m.key === moduleKey);
    if (!module) return;

    const updatedModule = { ...permissions.permissions[moduleKey] };
    module.subModules.forEach(subModule => {
      updatedModule[subModule.key] = { read: checked, write: checked };
    });

    onChange({
      ...permissions,
      permissions: {
        ...permissions.permissions,
        [moduleKey]: updatedModule,
      },
    });
  };

  const isMainModuleChecked = (moduleKey: string) => {
    const module = AVAILABLE_MODULES.find(m => m.key === moduleKey);
    if (!module) return false;

    return module.subModules.every(
      sub => permissions.permissions[moduleKey][sub.key]?.read && permissions.permissions[moduleKey][sub.key]?.write
    );
  };

  const isMainModuleIndeterminate = (moduleKey: string) => {
    const module = AVAILABLE_MODULES.find(m => m.key === moduleKey);
    if (!module) return false;

    const someChecked = module.subModules.some(
      sub => permissions.permissions[moduleKey][sub.key]?.read || permissions.permissions[moduleKey][sub.key]?.write
    );
    const allChecked = module.subModules.every(
      sub => permissions.permissions[moduleKey][sub.key]?.read && permissions.permissions[moduleKey][sub.key]?.write
    );

    return someChecked && !allChecked;
  };

  const setQuickPermission = (type: "full" | "readonly" | "none") => {
    const newPermissions: Permissions["permissions"] = {
      indent: {
        list: { read: type !== "none", write: type === "full" },
        create: { read: type !== "none", write: type === "full" },
        compare: { read: type !== "none", write: type === "full" },
        approval: { read: type !== "none", write: type === "full" },
      },
      purchaseOrders: {
        list: { read: type !== "none", write: type === "full" },
        open: { read: type !== "none", write: type === "full" },
      },
      items: {
        list: { read: type !== "none", write: type === "full" },
        addItem: { read: type !== "none", write: type === "full" },
      },
      vendors: {
        list: { read: type !== "none", write: type === "full" },
        create: { read: type !== "none", write: type === "full" },
        accounts: { read: type !== "none", write: type === "full" },
      },
      teamAndProject: {
        teamList: { read: type !== "none", write: type === "full" },
        addMember: { read: type !== "none", write: type === "full" },
        projectList: { read: type !== "none", write: type === "full" },
        addProject: { read: type !== "none", write: type === "full" },
        boqList: { read: type !== "none", write: type === "full" },
        addBoq: { read: type !== "none", write: type === "full" },
      },
    };

    onChange({
      projects: type === "none" ? [] : mockData.projects.map(p => p.id),
      permissions: newPermissions,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Permissions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickPermission("full")} disabled={disabled} className="text-xs">
              Full Access
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPermission("readonly")} disabled={disabled} className="text-xs">
              Read Only
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPermission("none")} disabled={disabled} className="text-xs">
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Projects Section */}
        <div>
          <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Project Access</span>
                  <Badge variant="secondary" className="text-xs">
                    {permissions.projects.length}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {/* All Projects Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded border-2 border-dashed">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="all-projects"
                    checked={permissions.projects.length === mockData.projects.length}
                    onCheckedChange={handleAllProjectsToggle}
                    disabled={disabled}
                  />
                  <label htmlFor="all-projects" className="font-medium cursor-pointer">
                    All Projects (Current & Future)
                  </label>
                </div>
                <Badge
                  variant={permissions.projects.length === mockData.projects.length ? "default" : "secondary"}
                  className="text-xs"
                >
                  {permissions.projects.length === mockData.projects.length ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {/* Add Project */}
              {!disabled && permissions.projects.length !== mockData.projects.length && availableProjects.length > 0 && (
                <div className="flex gap-2">
                  <Select value={selectedProjectToAdd} onValueChange={setSelectedProjectToAdd}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleProjectAdd} disabled={!selectedProjectToAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Project List */}
              {permissions.projects.length !== mockData.projects.length && (
                <div className="space-y-2">
                  {permissions.projects.map(projectId => {
                    const project = mockData.projects.find(p => p.id === projectId);
                    return project ? (
                      <div key={projectId} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="text-sm font-medium">{project.name}</span>
                          <p className="text-xs text-muted-foreground">{project.code}</p>
                        </div>
                        {!disabled && (
                          <Button variant="ghost" size="sm" onClick={() => handleProjectRemove(projectId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : null;
                  })}
                  {permissions.projects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No projects assigned
                    </p>
                  )}
                </div>
              )}
              
              {permissions.projects.length === mockData.projects.length && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Access granted to all current and future projects
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Module Permissions */}
        <div>
          <h4 className="font-medium mb-3">Module Access</h4>
          <div className="space-y-3">
            {AVAILABLE_MODULES.map(module => (
              <div key={module.key} className="border rounded-lg">
                {/* Main Module Header */}
                <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                  <span className="font-medium">{module.label}</span>
                  <Checkbox
                    checked={isMainModuleChecked(module.key)}
                 
                    onCheckedChange={(checked) => handleMainModuleToggle(module.key, checked as boolean)}
                    disabled={disabled}
                  />
                </div>

                {/* Sub-modules */}
                <div className="p-3 space-y-2">
                  {module.subModules.map(subModule => {
                    const subModulePermission = permissions.permissions[module.key][subModule.key];
                    return (
                      <div key={subModule.key} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium ml-4">{subModule.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${module.key}-${subModule.key}-read`}
                              checked={subModulePermission?.read || false}
                              onCheckedChange={(checked) =>
                                handleModulePermissionChange(module.key, subModule.key, "read", checked as boolean)
                              }
                              disabled={disabled}
                            />
                            <label htmlFor={`${module.key}-${subModule.key}-read`} className="text-xs cursor-pointer">
                              Read
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${module.key}-${subModule.key}-write`}
                              checked={subModulePermission?.write || false}
                              onCheckedChange={(checked) =>
                                handleModulePermissionChange(module.key, subModule.key, "write", checked as boolean)
                              }
                              disabled={disabled}
                            />
                            <label htmlFor={`${module.key}-${subModule.key}-write`} className="text-xs cursor-pointer">
                              Write
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}