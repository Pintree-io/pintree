"use client";

import { useState, useEffect } from "react";
import { CollectionCard } from "./CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportCollectionDialog } from "./ImportCollectionDialog";
import { CreateCollectionDialog } from "./CreateCollectionDialog";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  sortOrder: number;
  viewStyle: "list" | "card";
  sortStyle: "alpha" | "time" | "manual";
  viewCount: number;
  totalBookmarks: number;
}

export function CollectionList({ onCollectionsChange }: { onCollectionsChange: (collections: Collection[]) => void }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (!response.ok) {
        throw new Error("获取数据失败");
      }
      const data = await response.json();

      // 确保返回的数据是数组
      if (Array.isArray(data)) {
        setCollections(data);
        onCollectionsChange(data);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("返回数据格式错误");
      }
    } catch (error) {
      console.error("获取书签集合失败:", error);
      setError(error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[160px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[160px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-10 w-10 text-muted-foreground"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold">No bookmark collections</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven't created any bookmark collections yet. Start creating your first bookmark collection now.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={collections.length > 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
            <Button
              variant="default"
              onClick={() => setIsImportDialogOpen(true)}
              disabled={collections.length > 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Json
            </Button>
          </div>
        </div>

        <CreateCollectionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={fetchCollections}
        />

        <ImportCollectionDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onSuccess={fetchCollections}
        />
      </div>
    );
  }

  return (
    <>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {collections?.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={{...collection, description: collection.description || ''}}
            onUpdate={fetchCollections}
          />
        ))}
      </div>

      <ImportCollectionDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={fetchCollections}
      />
    </>
  );
}
