import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  sidebarItems?: Array<{
    title: string
    href: string
  }>
}

export function MainLayout({ children, sidebarItems }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {sidebarItems && sidebarItems.length > 0 && (
          <Sidebar items={sidebarItems} />
        )}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
