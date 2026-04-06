import { Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "UFinance",
  description: "UFinance",
  icons: {
    icon: '/assets/images/logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${roboto.className} antialiased bg-slate-50 text-slate-900`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
