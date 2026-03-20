"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "SMS Logs",
    href: "/sms",
    icon: MessageSquare,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 shrink-0",
        "bg-[var(--sidebar)] text-[var(--sidebar-foreground)]",
        "border-r border-[var(--sidebar-border)]",
        className
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 p-1">
          <Image src="/logo.png" alt="AIVARA" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">AIVARA</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Empower Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-[var(--sidebar-primary)]"
                    : "text-[var(--muted-foreground)]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--sidebar-border)]">
        <p className="text-xs text-[var(--muted-foreground)]">
          © 2026 AIVARA Empower
        </p>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-[var(--accent)] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--sidebar-border)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0 p-1">
                <Image src="/logo.png" alt="AIVARA" width={28} height={28} className="object-contain" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">AIVARA</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Empower Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-[var(--sidebar-accent)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-[var(--sidebar-primary)]"
                        : "text-[var(--muted-foreground)]"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
