"use client";

import { ProjectProvider } from "@/hooks/use-project";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <div className="flex min-h-[100svh]">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ProjectProvider>
  );
}
