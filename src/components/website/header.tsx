"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateBookmarkDialogGlobal from "@/components/bookmark/CreateBookmarkDialogGlobal";
import { useRouter } from "next/navigation";

interface Collection {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  description?: string;
}

interface HeaderProps {
  selectedCollectionId?: string;
  currentFolderId?: string | null;
  onBookmarkAdded?: () => void;
  onCollectionChange?: (id: string) => void;
}

export function Header({ 
  selectedCollectionId, 
  currentFolderId, 
  onBookmarkAdded,
  onCollectionChange 
}: HeaderProps) {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = async (newBookmarkFolderId?: string) => {
    setDialogOpen(false);
    
    if (
      (newBookmarkFolderId && newBookmarkFolderId === currentFolderId) || 
      (!newBookmarkFolderId && !currentFolderId)
    ) {
      if (onBookmarkAdded) {
        await onBookmarkAdded();
      }
    }
    
    const targetFolderId = newBookmarkFolderId || currentFolderId;
    
    if (targetFolderId && targetFolderId !== currentFolderId) {
      const url = new URL(window.location.href);
      url.searchParams.set('folderId', targetFolderId);
      router.push(url.toString());
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
      </div>
      
      <div className="flex items-center gap-2">
        {session && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Bookmark
            </Button>
          </>
        )}
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/collections" aria-label="Admin">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <CreateBookmarkDialogGlobal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCollectionId={selectedCollectionId || ""}
        defaultFolderId={currentFolderId || undefined}
        onSuccess={handleSuccess}
      />
    </header>
  );
}
