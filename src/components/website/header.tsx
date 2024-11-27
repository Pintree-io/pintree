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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections?publicOnly=true");
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("获取集合失败:", error);
      }
    };
    fetchCollections();
  }, []);

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

  const handleCollectionSelect = (collection: Collection) => {
    if (onCollectionChange) {
      onCollectionChange(collection.id);
    } else {
      router.push(`/${collection.slug}`);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[400px] gap-3 p-4">
                  {collections?.map((collection) => (
                    <NavigationMenuLink
                      key={collection.id}
                      className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer ${
                        collection.id === selectedCollectionId ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleCollectionSelect(collection)}
                    >
                      <div className="text-sm font-medium leading-none">{collection.name}</div>
                      {collection.description && (
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          {collection.description}
                        </p>
                      )}
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
