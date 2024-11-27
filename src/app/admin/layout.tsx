import { requireAuth } from "@/lib/auth/utils";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <SidebarProvider>
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
