import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
