import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export function AdminHeader({ title, children, action }: AdminHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-8 bg-white">
        <SidebarTrigger>
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
        <Separator orientation="vertical" className="mx-4 h-6" />
        <div className="w-full flex flex-1 items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            {action}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

