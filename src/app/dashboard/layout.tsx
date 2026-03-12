"use client";

import { ProjectProvider } from "@/hooks/use-project";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="flex min-h-[100svh]">
        <Sidebar />
        {/* Main content — offset by sidebar width. Uses ml-16 for collapsed default,
            but the sidebar animates, so we use the expanded width for spacing */}
        <main className="ml-16 min-w-0 flex-1 overflow-x-hidden p-6 transition-[margin] duration-200 lg:ml-60">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ProjectProvider>
  );
}
