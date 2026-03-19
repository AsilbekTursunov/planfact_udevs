"use client"

import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Header } from "@/components/Header/Header";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/pages/auth'

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={` ${roboto.className} antialiased bg-slate-50 text-slate-900`}
      >
        <QueryClientProvider client={queryClient}>
          <div className="flex max-h-screen overflow-hidden max-w-[100vw]">
            {!isLoginPage && <Sidebar />}
            <div className="flex flex-col flex-1 max-h-screen overflow-hidden">
              {!isLoginPage && <Header />}
              <main className={isLoginPage ? "" : "flex-1 overflow-y-auto bg-white"}>
                {children}
              </main>
            </div>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
