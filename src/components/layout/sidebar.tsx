"use client";

import Image from "next/image";
import { TrendingUp, X, Menu, Inbox, BarChart2, Phone, LayoutDashboard, Power, Users, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useActiveSection, type SectionId } from "@/hooks/use-active-section";

const navItems = [
  { label: "Overview",              href: "#roi-overview",          id: "roi-overview" as SectionId,          icon: LayoutDashboard },
  { label: "Campaign Control",      href: "#campaign-control",      id: "campaign-control" as SectionId,      icon: Power },
  { label: "Campaign Performance",  href: "#campaign-performance",  id: "campaign-performance" as SectionId,  icon: Megaphone },
  { label: "Deal Breakdown",        href: "#forth-deals",           id: "forth-deals" as SectionId,           icon: TrendingUp },
  { label: "Rep Performance",       href: "#rep-performance",       id: "rep-performance" as SectionId,       icon: Users },
  { label: "Call Performance",      href: "#ring-central",          id: "ring-central" as SectionId,          icon: Phone },
  { label: "SMS Inbound",           href: "#sms-inbound",           id: "sms-inbound" as SectionId,           icon: Inbox },
  { label: "SMS Performance",       href: "#sms-performance",       id: "sms-performance" as SectionId,       icon: BarChart2 },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const activeSection = useActiveSection();

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
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
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
                  isActive ? "text-[var(--sidebar-primary)]" : "text-[var(--muted-foreground)]"
                )}
              />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--sidebar-border)]">
        <p className="text-xs text-[var(--muted-foreground)]">© 2026 AIVARA Empower</p>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const activeSection = useActiveSection();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-[var(--accent)] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
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

          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
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
                      isActive ? "text-[var(--sidebar-primary)]" : "text-[var(--muted-foreground)]"
                    )}
                  />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
