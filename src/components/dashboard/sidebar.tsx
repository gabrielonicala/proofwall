"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import {
  LayoutDashboard,
  MessageSquareQuote,
  Layers,
  FileText,
  Upload,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { LogoIcon } from "@/components/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Testimonials", href: "/dashboard/testimonials", icon: MessageSquareQuote },
  { label: "Walls", href: "/dashboard/walls", icon: Layers },
  { label: "Forms", href: "/dashboard/forms", icon: FileText },
  { label: "Import", href: "/dashboard/import", icon: Upload },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { project } = useProject();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <TooltipProvider delay={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-sidebar"
      >
        {/* Logo + collapse */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Link href="/" className="flex items-center gap-2">
                  <LogoIcon className="size-7" />
                  <span className="text-2xl font-bold">
                    Proof<span className="text-gradient">Wall</span>
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </button>
        </div>

        {/* Project name */}
        {!collapsed && project && (
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-xs font-medium text-foreground">
              {project.name}
            </p>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            const content = (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <link.icon className="size-4 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger render={<div />}>{content}</TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={link.href}>{content}</div>;
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-border p-2">
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="size-4 flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
