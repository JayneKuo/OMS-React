import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { AiAssistantProvider } from "@/components/ai-assistant/ai-assistant-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "OMS - Order Management System",
  description: "Order Management System for Item",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AiAssistantProvider>
              {children}
            </AiAssistantProvider>
          </I18nProvider>
          <Toaster closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
