import { NavLink, useLocation } from "react-router-dom";
import { FileText, ShoppingCart, Package, Users, UserCheck, List, Plus, GitCompare, CheckCircle, Receipt, Eye, PackageOpen, Building2, DollarSign, CreditCard, UserPlus, Shield } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
const navigationItems = [{
  title: "Indent",
  icon: FileText,
  items: [{
    title: "List",
    url: "/indent/list",
    icon: List
  }, {
    title: "Create",
    url: "/indent/create",
    icon: Plus
  }, {
    title: "Compare",
    url: "/indent/compare",
    icon: GitCompare
  }, {
    title: "Approval",
    url: "/indent/approval",
    icon: CheckCircle
  }]
}, {
  title: "Purchase Orders",
  icon: ShoppingCart,
  items: [{
    title: "List",
    url: "/po/list",
    icon: List
  }, {
    title: "Open",
    url: "/po/open",
    icon: Receipt
  }]
}, {
  title: "Items",
  icon: Package,
  items: [{
    title: "List",
    url: "/items/list",
    icon: List
  }, {
    title: "Add Item",
    url: "/items/edit",
    icon: PackageOpen
  }]
}, {
  title: "Vendors",
  icon: Building2,
  items: [{
    title: "List",
    url: "/vendors/list",
    icon: List
  }, {
    title: "Create",
    url: "/vendors/create",
    icon: Plus
  }, {
    title: "Accounts",
    url: "/vendors/ledger",
    icon: DollarSign
  }]
}, {
  title: "Team & Project",
  icon: Users,
  items: [{
    title: "Team List",
    url: "/team/list",
    icon: UserCheck
  }, {
    title: "Add Member",
    url: "/team/edit",
    icon: UserPlus
  }, {
    title: "Project List",
    url: "/team/projects",
    icon: List
  }, {
    title: "Add Project",
    url: "/team/project-edit",
    icon: Plus
  }, {
    title: "BOQ List",
    url: "/boq/list",
    icon: FileText
  }, {
    title: "Add BOQ",
    url: "/boq/create",
    icon: Plus
  }]
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(["Indent"]); // Default open

  const collapsed = state === "collapsed";
  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => prev.includes(groupTitle) ? prev.filter(g => g !== groupTitle) : [...prev, groupTitle]);
  };
  const isActiveGroup = (group: typeof navigationItems[0]) => {
    return group.items.some(item => location.pathname === item.url);
  };
  const isActiveItem = (url: string) => {
    return location.pathname === url;
  };
  return <Sidebar collapsible="offcanvas">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            
            {!collapsed && <div>
                <h2 className="text-sidebar-foreground font-bold text-lg">ERP</h2>
                <p className="text-sidebar-foreground/70 text-xs">Management System</p>
              </div>}
          </div>
        </div>

        {navigationItems.map(group => <SidebarGroup key={group.title}>
            <Collapsible open={!collapsed && openGroups.includes(group.title)} onOpenChange={() => toggleGroup(group.title)}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className={`
                  flex items-center justify-between w-full p-3 mx-2 rounded-lg
                  hover:bg-sidebar-accent transition-colors cursor-pointer
                  ${isActiveGroup(group) ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/90'}
                `}>
                  <div className="flex items-center space-x-3">
                    <group.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{group.title}</span>}
                  </div>
                  {!collapsed && <span className={`transition-transform ${openGroups.includes(group.title) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(item => <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={({
                      isActive
                    }) => `
                              flex items-center space-x-3 w-full p-2 mx-4 my-1 rounded-md
                              transition-colors text-sm
                              ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'}
                            `}>
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>)}
      </SidebarContent>
    </Sidebar>;
}