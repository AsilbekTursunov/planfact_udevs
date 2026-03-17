"use client"

import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Header } from "@/components/Header/Header";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
          {!isLoginPage && <Sidebar />}
          {!isLoginPage && <Header />}
          <main className={isLoginPage ? "" : "pl-[80px] pt-[57px] min-h-screen bg-white"}>
            {children}
          </main>
        </QueryClientProvider>
      </body>
    </html>
  );
}
