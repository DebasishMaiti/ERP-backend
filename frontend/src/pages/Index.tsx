
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShoppingCart, Package, Building2, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const quickStats = [
    { title: "Active BoQs", value: "12", change: "+2", icon: FileText },
    { title: "Open POs", value: "8", change: "+1", icon: ShoppingCart },
    { title: "Items", value: "156", change: "+5", icon: Package },
    { title: "Vendors", value: "24", change: "0", icon: Building2 },
    { title: "Team Members", value: "7", change: "0", icon: Users },
    { title: "Monthly Spend", value: "₹12.5L", change: "+8%", icon: TrendingUp },
  ];

  const quickActions = [
    { title: "Create New BoQ", description: "Start a new Bill of Quantities", href: "/indent/create", icon: FileText },
    { title: "View Purchase Orders", description: "Check PO status and deliveries", href: "/po/list", icon: ShoppingCart },
    { title: "Manage Items", description: "Update item prices and vendors", href: "/items/list", icon: Package },
    { title: "Vendor Management", description: "Add vendors and track payments", href: "/vendors/list", icon: Building2 },
  ];

  return (
    <div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="bg-card shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-success">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="bg-card shadow-card hover:shadow-elevated transition-all hover:scale-105 cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <Card className="bg-card shadow-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-secondary-bg rounded-lg">
                  <div className="w-2 h-2 bg-status-approved rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">BoQ-001 approved by Admin</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-secondary-bg rounded-lg">
                  <div className="w-2 h-2 bg-status-pending rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">PO-024 delivery received - Cement 300 bags</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-secondary-bg rounded-lg">
                  <div className="w-2 h-2 bg-status-draft rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New vendor ABC Suppliers added</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
