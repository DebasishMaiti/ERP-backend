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
  allProjects?: boolean; // New field for all projects access
  modules: {
    [key: string]: ModulePermission;
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
      { key: "indent-list", label: "List" },
      { key: "indent-create", label: "Create" },
      { key: "indent-compare", label: "Compare" },
      { key: "indent-approval", label: "Approval" }
    ]
  },
  { 
    key: "po", 
    label: "Purchase Orders",
    subModules: [
      { key: "po-list", label: "List" },
      { key: "po-open", label: "Open" }
    ]
  },
  { 
    key: "items", 
    label: "Items",
    subModules: [
      { key: "items-list", label: "List" },
      { key: "items-add", label: "Add Item" }
    ]
  },
  { 
    key: "vendors", 
    label: "Vendors",
    subModules: [
      { key: "vendors-list", label: "List" },
      { key: "vendors-create", label: "Create" },
      { key: "vendors-accounts", label: "Accounts" }
    ]
  },
  { 
    key: "team", 
    label: "Team & Project",
    subModules: [
      { key: "team-list", label: "Team List" },
      { key: "team-add", label: "Add Member" },
      { key: "project-list", label: "Project List" },
      { key: "project-add", label: "Add Project" },
      { key: "boq-list", label: "BOQ List" },
      { key: "boq-add", label: "Add BOQ" }
    ]
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
      allProjects: checked,
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

  const handleModulePermissionChange = (moduleKey: string, permissionType: 'read' | 'write', checked: boolean) => {
    const updatedModules = {
      ...permissions.modules,
      [moduleKey]: {
        ...permissions.modules[moduleKey],
        [permissionType]: checked,
        ...(permissionType === 'read' && !checked ? { write: false } : {}),
        ...(permissionType === 'write' && checked ? { read: true } : {}),
      },
    };

    onChange({
      ...permissions,
      modules: updatedModules,
    });
  };

  const handleMainModuleToggle = (mainModuleKey: string, checked: boolean) => {
    const module = AVAILABLE_MODULES.find(m => m.key === mainModuleKey);
    if (!module) return;

    const updatedModules = { ...permissions.modules };
    
    // Update main module
    updatedModules[mainModuleKey] = {
      read: checked,
      write: checked,
    };

    // Update all sub-modules
    module.subModules.forEach(subModule => {
      updatedModules[subModule.key] = {
        read: checked,
        write: checked,
      };
    });

    onChange({
      ...permissions,
      modules: updatedModules,
    });
  };

  const isMainModuleChecked = (mainModuleKey: string) => {
    const module = AVAILABLE_MODULES.find(m => m.key === mainModuleKey);
    if (!module) return false;

    const mainModulePermissions = permissions.modules[mainModuleKey];
    const allSubModulesChecked = module.subModules.every(sub => 
      permissions.modules[sub.key]?.read || permissions.modules[sub.key]?.write
    );

    return (mainModulePermissions?.read || mainModulePermissions?.write) && allSubModulesChecked;
  };

  const isMainModuleIndeterminate = (mainModuleKey: string) => {
    const module = AVAILABLE_MODULES.find(m => m.key === mainModuleKey);
    if (!module) return false;

    const mainModulePermissions = permissions.modules[mainModuleKey];
    const someSubModulesChecked = module.subModules.some(sub => 
      permissions.modules[sub.key]?.read || permissions.modules[sub.key]?.write
    );
    const allSubModulesChecked = module.subModules.every(sub => 
      permissions.modules[sub.key]?.read || permissions.modules[sub.key]?.write
    );

    return (mainModulePermissions?.read || mainModulePermissions?.write || someSubModulesChecked) && !allSubModulesChecked;
  };

  const setQuickPermission = (type: 'full' | 'readonly' | 'none') => {
    const modulePermissions: { [key: string]: ModulePermission } = {};
    
    // Handle main modules
    AVAILABLE_MODULES.forEach(module => {
      modulePermissions[module.key] = type === 'full' 
        ? { read: true, write: true }
        : type === 'readonly' 
        ? { read: true, write: false }
        : { read: false, write: false };
      
      // Handle sub-modules
      module.subModules.forEach(subModule => {
        modulePermissions[subModule.key] = type === 'full' 
          ? { read: true, write: true }
          : type === 'readonly' 
          ? { read: true, write: false }
          : { read: false, write: false };
      });
    });

    onChange({
      projects: type === 'none' ? [] : mockData.projects.map(p => p.id),
      allProjects: type !== 'none',
      modules: modulePermissions,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Permissions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickPermission('full')} disabled={disabled} className="text-xs">
              Full Access
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPermission('readonly')} disabled={disabled} className="text-xs">
              Read Only
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPermission('none')} disabled={disabled} className="text-xs">
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
                    checked={permissions.allProjects || false}
                    onCheckedChange={handleAllProjectsToggle}
                    disabled={disabled}
                  />
                  <label htmlFor="all-projects" className="font-medium cursor-pointer">
                    All Projects (Current & Future)
                  </label>
                </div>
                <Badge variant={permissions.allProjects ? "default" : "secondary"} className="text-xs">
                  {permissions.allProjects ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {/* Add Project */}
              {!disabled && !permissions.allProjects && availableProjects.length > 0 && (
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
                  <Button 
                    size="sm" 
                    onClick={handleProjectAdd}
                    disabled={!selectedProjectToAdd}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Project List */}
              {!permissions.allProjects && (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProjectRemove(projectId)}
                        >
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
              
              {permissions.allProjects && (
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
                <div className="p-3 bg-muted/50 border-b">
                  <span className="font-medium">{module.label}</span>
                </div>

                {/* Sub-modules */}
                <div className="p-3 space-y-2">
                  {module.subModules.map(subModule => {
                    const subModulePermission = permissions.modules[subModule.key] || { read: false, write: false };
                    
                    return (
                      <div key={subModule.key} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium ml-4">{subModule.label}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${subModule.key}-read`}
                              checked={subModulePermission.read}
                              onCheckedChange={(checked) =>
                                handleModulePermissionChange(subModule.key, 'read', checked as boolean)
                              }
                              disabled={disabled}
                            />
                            <label htmlFor={`${subModule.key}-read`} className="text-xs cursor-pointer">
                              Read
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${subModule.key}-write`}
                              checked={subModulePermission.write}
                              onCheckedChange={(checked) =>
                                handleModulePermissionChange(subModule.key, 'write', checked as boolean)
                              }
                              disabled={disabled}
                            />
                            <label htmlFor={`${subModule.key}-write`} className="text-xs cursor-pointer">
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