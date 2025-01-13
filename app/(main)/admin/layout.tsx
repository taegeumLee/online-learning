"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TabBar from "./components/tabBar";

const queryClient = new QueryClient();

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col w-full h-full mx-auto">
        <TabBar />
        {children}
      </div>
    </QueryClientProvider>
  );
}
