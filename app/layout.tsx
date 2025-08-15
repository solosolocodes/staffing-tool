import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accesa StaffingPro - Resource Management Platform",
  description: "Advanced staffing and project management solution by Accesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-25" style={{backgroundColor: '#f8fafc'}}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
