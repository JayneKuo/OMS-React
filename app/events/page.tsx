import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Events", href: "/events" },
  { title: "System Events", href: "/events/system" },
  { title: "User Actions", href: "/events/user" },
  { title: "API Logs", href: "/events/api" },
]

export default function EventsPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Events">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">View system events and activity logs</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Recent system events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent events.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
