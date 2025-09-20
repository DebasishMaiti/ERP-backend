import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, ShoppingCart, Package, Building2, Users, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
const mainNavItems = [{
  title: "Indent",
  icon: FileText,
  key: "indent",
  subitems: [{
    title: "List",
    url: "/indent/list"
  }, {
    title: "Create",
    url: "/indent/create"
  }, {
    title: "Compare",
    url: "/indent/compare"
  }, {
    title: "Approval",
    url: "/indent/approval"
  }]
}, {
  title: "POs",
  icon: ShoppingCart,
  key: "po",
  subitems: [{
    title: "List",
    url: "/po/list"
  }, {
    title: "Open",
    url: "/po/open"
  }]
}, {
  title: "Items",
  icon: Package,
  key: "items",
  subitems: [{
    title: "List",
    url: "/items/list"
  }, {
    title: "Add Item",
    url: "/items/edit"
  }]
}, {
  title: "Vendors",
  icon: Building2,
  key: "vendors",
  subitems: [{
    title: "List",
    url: "/vendors/list"
  }, {
    title: "Create",
    url: "/vendors/create"
  }, {
    title: "Accounts",
    url: "/vendors/ledger"
  }]
}, {
  title: "Team",
  icon: Users,
  key: "team",
  subitems: [{
    title: "Team List",
    url: "/team/list"
  }, {
    title: "Add Member",
    url: "/team/edit"
  }, {
    title: "Project List",
    url: "/team/projects"
  }, {
    title: "Add Project",
    url: "/team/project-edit"
  }, {
    title: "BOQ List",
    url: "/boq/list"
  }, {
    title: "Add BOQ",
    url: "/boq/create"
  }]
}];
export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const getActiveSection = () => {
    const path = location.pathname;
    for (const item of mainNavItems) {
      if (item.subitems.some(sub => path === sub.url)) {
        return item.key;
      }
    }
    return null;
  };
  const handleNavigation = (url: string) => {
    navigate(url);
    setActiveSheet(null);
  };
  const activeSection = getActiveSection();
  return <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {mainNavItems.map(item => <Sheet key={item.key} open={activeSheet === item.key} onOpenChange={open => setActiveSheet(open ? item.key : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className={`flex flex-col items-center p-2 h-auto ${activeSection === item.key ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-0 ">{item.title}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-96">
              <SheetHeader>
                <SheetTitle className="text-left">{item.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {item.subitems.map(subitem => <Button key={subitem.url} variant="ghost" className={`w-full justify-start text-left ${location.pathname === subitem.url ? "bg-primary/10 text-primary" : "text-foreground"}`} onClick={() => handleNavigation(subitem.url)}>
                    {subitem.title}
                  </Button>)}
              </div>
            </SheetContent>
          </Sheet>)}
        
        {/* User Profile Sheet */}
        <Sheet open={activeSheet === 'user'} onOpenChange={open => setActiveSheet(open ? 'user' : null)}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 h-auto text-muted-foreground">
              <User className="h-5 w-5" />
              <span className="text-xs mt-0.5">User</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle className="text-left">User Profile</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Admin User</span>
              </div>
              <Separator />
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setActiveSheet(null)}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>;
}