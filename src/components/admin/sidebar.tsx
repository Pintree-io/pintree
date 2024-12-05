"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Library, 
  Bookmark, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarRail,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useSettingImages } from "@/hooks/useSettingImages";
import { Skeleton } from "../ui/skeleton";

const menuItems = [
  {
    href: "/admin/collections",
    label: "Collections",
    icon: Library,
  },
  {
    href: "/admin/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    subItems: [
      {
        href: "/admin/settings/basic",
        label: "Basic Settings",
      },
      {
        href: "/admin/settings/seo",
        label: "SEO Settings",
      },
    ]
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["/admin/settings"]));

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const { images, isLoading, error } = useSettingImages('logoUrl');

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent rounded-none pr-0">
                <Link href="/" className="pl-0 flex items-center gap-2 justify-start rounded-none pr-0">
                {isLoading ? (
                  <Skeleton className="w-[260px] h-[60px]" />
                ) : (
                  <Image 
                    src={images[0]?.url || "/logo.png"} 
                    alt="Logo" 
                    width={260} 
                    height={60} 
                  />
                )}
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.subItems ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleExpand(item.href)}
                      className="w-full flex items-center justify-between rounded-xl hover:bg-gray-200/50 active:bg-gray-200/50"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      {expandedItems.has(item.href) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                    
                    {expandedItems.has(item.href) && (
                      <div className="pl-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuButton
                            key={subItem.href}
                            asChild
                            isActive={pathname === subItem.href}
                            size="sm"
                            className="text-sm text-muted-foreground hover:bg-gray-200/50 active:bg-gray-200/50"
                          >
                            <Link href={subItem.href}>
                              {subItem.label}
                            </Link>
                          </SidebarMenuButton>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href} className="flex items-center gap-2 rounded-xl hover:bg-gray-200/50 active:bg-gray-200/50">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
