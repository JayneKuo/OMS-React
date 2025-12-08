import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AutomationPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
          <p className="text-muted-foreground">Configure automated workflows and rules</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>Set up automated processes for your operations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No automation rules configured.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
