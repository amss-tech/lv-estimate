"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, BookOpen, Layers, FileText, Send, KanbanSquare, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/customers",   label: "Customers",  icon: Users },
  { href: "/catalog",     label: "Catalog",    icon: BookOpen },
  { href: "/catalog/assemblies", label: "Assemblies", icon: Layers },
  { href: "/estimates",   label: "Estimates",  icon: FileText },
  { href: "/proposals",   label: "Proposals",  icon: Send },
  { href: "/pipeline",    label: "Pipeline",   icon: KanbanSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-card border-r px-3 py-4 shrink-0">
      <div className="mb-6 px-2">
        <span className="text-lg font-bold tracking-tight">ESTICOMMS</span>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <ThemeToggle />
      <button onClick={handleSignOut}
        className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
