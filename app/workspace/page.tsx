import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "Workspace", href: "/workspace" },
  { title: "OMS Settings", href: "/workspace/oms-settings" },
]

export default function WorkspacePage() {
  return (
    <MainLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
          <p className="text-muted-foreground">Manage your workspace settings</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Workspace Configuration</CardTitle>
            <CardDescription>Configure your workspace preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Workspace settings coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
