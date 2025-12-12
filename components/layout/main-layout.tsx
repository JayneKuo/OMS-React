import { Sidebar } from "./sidebar"
import { HeaderSimple } from "./header-simple"

interface MainLayoutProps {
  children: React.ReactNode
  sidebarItems?: Array<{
    title: string
    href: string
    icon?: React.ReactNode
  }>
  moduleName?: string
}

export function MainLayout({ children, sidebarItems, moduleName }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HeaderSimple />
      <div className="flex flex-1 overflow-hidden">
        {sidebarItems && sidebarItems.length > 0 && (
          <Sidebar items={sidebarItems} moduleName={moduleName} />
        )}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
