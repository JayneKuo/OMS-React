import { MainLayout } from "@/components/layout/main-layout"
import { ExceptionAIPanel } from "@/components/exception-ai/exception-ai-panel"

const sidebarItems = [
  { title: "All Orders", href: "/orders" },
  { title: "Pending", href: "/orders/pending" },
  { title: "Processing", href: "/orders/processing" },
  { title: "Shipped", href: "/orders/shipped" },
  { title: "Delivered", href: "/orders/delivered" },
  { title: "Cancelled", href: "/orders/cancelled" },
  { title: "AI 异常处理", href: "/orders/exception-ai" },
]

export default function ExceptionAIPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Orders">
      <ExceptionAIPanel />
    </MainLayout>
  )
}
