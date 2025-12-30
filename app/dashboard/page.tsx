import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Users, LayoutDashboard, BarChart3, FileText, Settings } from "lucide-react"

export default function DashboardPage() {
  const sidebarItems = [
    { title: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { title: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { title: "Reports", href: "/dashboard/reports", icon: <FileText className="h-4 w-4" /> },
    { title: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
  ]

  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      change: "+12.5%",
      icon: ShoppingCart,
    },
    {
      title: "Active Products",
      value: "567",
      change: "+5.2%",
      icon: Package,
    },
    {
      title: "Total Customers",
      value: "8,901",
      change: "+18.3%",
      icon: Users,
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+23.1%",
      icon: TrendingUp,
    },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your order management system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                You have 12 new orders today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Order #{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">Customer Name {i}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${(Math.random() * 1000).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-primary-hover/10 transition-colors">
                Create New Order
              </button>
              <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-primary-hover/10 transition-colors">
                Add Product
              </button>
              <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-primary-hover/10 transition-colors">
                Process Returns
              </button>
              <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-primary-hover/10 transition-colors">
                View Reports
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
