import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="light">
      <head>
        <link rel="preconnect" href="https://static.toss.im" />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen max-w-screen-2xl mx-auto">
            <div className="flex-grow">{children}</div>
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
