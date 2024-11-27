"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, ChevronRight, ChevronLeft } from "lucide-react";
import { BookmarkDataTable } from "@/components/bookmark/BookmarkDataTable";
import { CreateBookmarkDialog } from "@/components/bookmark/CreateBookmarkDialog";
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminHeader } from "@/components/admin/header";
import { Fragment } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  collectionId: string;
  folderId?: string;
  folder?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  icon?: string;
  isPublic: boolean;
  sortOrder: number;
  parentId: string | null;  // 添加这一行
  createdAt: string;
  updatedAt: string;
}

export default function BookmarksPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<{
    currentBookmarks: Bookmark[];
    subfolders: any[];
  }>({
    currentBookmarks: [],
    subfolders: []
  });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string; parentId: string | null }>>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data);
      
      // 获取 URL 中的 collection 参数
      const collectionId = searchParams.get("collection");
      
      // 如果 URL 中有 collection 参数，则使用该值
      // 否则，如果有集合数据，则使用第一个集合的 ID
      if (collectionId) {
        setSelectedCollectionId(collectionId);
        Promise.all([
          fetchBookmarks(collectionId),
          fetchFolders(collectionId)
        ]);
      } else if (data.length > 0) {
        const firstCollectionId = data[0].id;
        setSelectedCollectionId(firstCollectionId);
        router.push(`/admin/bookmarks?collection=${firstCollectionId}`);
        Promise.all([
          fetchBookmarks(firstCollectionId),
          fetchFolders(firstCollectionId)
        ]);
      }
    } catch (error) {
      console.error("Get collections failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async (collectionId: string) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sortField,
        sortOrder,
        ...(currentFolderId ? { folderId: currentFolderId } : {})
      });
      
      console.log("Fetching bookmarks with params:", {
        collectionId,
        sortField,
        sortOrder,
        currentFolderId,
        url: `/api/admin/collections/${collectionId}/bookmarks?${queryParams}`
      });

      const response = await fetch(
        `/api/admin/collections/${collectionId}/bookmarks?${queryParams}`
      );
      const data = await response.json();
      console.log("Received bookmarks data:", data);
      
      // 确保设置正确的数据结构
      setBookmarks({
        currentBookmarks: data.currentBookmarks || [],
        subfolders: data.subfolders || []
      });
    } catch (error) {
      console.error("获取书签失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async (collectionId: string = selectedCollectionId) => {
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/folders?` +
        (currentFolderId ? `parentId=${currentFolderId}` : '')
      );
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Get folders failed:", error);
    }
  };

  const handleSortChange = async (field: "createdAt" | "updatedAt", order: "asc" | "desc") => {
    console.log("handleSortChange called with:", { field, order });
    setSortField(field);
    setSortOrder(order);
    
    if (selectedCollectionId) {
      console.log("Fetching bookmarks with new sort:", { field, order, selectedCollectionId });
      await fetchBookmarks(selectedCollectionId);
    }
  };

  // 处理文件夹点击
  const handleFolderClick = async (folderId: string) => {
    try {
      setIsNavigating(true);
      setError(null);

      // 获取目标文件夹的路径
      const pathResponse = await fetch(`/api/collections/${selectedCollectionId}/folders/${folderId}/path`);
      const pathData = await pathResponse.json();
      
      // 更新状态
      setCurrentFolderId(folderId);
      setFolderPath(pathData);

      // 获取新文件夹的内容
      const [bookmarksResponse, foldersResponse] = await Promise.all([
        fetch(
          `/api/collections/${selectedCollectionId}/bookmarks?` + 
          `sortField=${sortField}&sortOrder=${sortOrder}&folderId=${folderId}`
        ),
        fetch(
          `/api/collections/${selectedCollectionId}/folders?parentId=${folderId}`
        )
      ]);

      const [bookmarksData, foldersData] = await Promise.all([
        bookmarksResponse.json(),
        foldersResponse.json()
      ]);

      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (error) {
      setError("导航到文件夹失败");
      console.error(error);
    } finally {
      setIsNavigating(false);
    }
  };

  // 处理文件夹导航
  const handleFolderBack = async (index: number) => {
    try {
      setIsNavigating(true);
      setError(null);

      let targetFolderId: string | undefined;
      let newPath: Array<{ id: string; name: string; parentId: string | null }>;

      if (index === -1) {
        // 返回根目录
        targetFolderId = undefined;
        newPath = [];
      } else {
        // 回到指定层级
        newPath = folderPath.slice(0, index + 1);
        targetFolderId = newPath[newPath.length - 1]?.id;
      }

      // 更新状态
      setCurrentFolderId(targetFolderId);
      setFolderPath(newPath);

      // 直接使用 targetFolderId 获取内容，而不是依赖于状态
      const [bookmarksResponse, foldersResponse] = await Promise.all([
        fetch(
          `/api/collections/${selectedCollectionId}/bookmarks?` + 
          `sortField=${sortField}&sortOrder=${sortOrder}` +
          (targetFolderId ? `&folderId=${targetFolderId}` : '')
        ),
        fetch(
          `/api/collections/${selectedCollectionId}/folders?` +
          (targetFolderId ? `parentId=${targetFolderId}` : '')
        )
      ]);

      const [bookmarksData, foldersData] = await Promise.all([
        bookmarksResponse.json(),
        foldersResponse.json()
      ]);

      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (error) {
      setError("Navigate folder failed");
      console.error(error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBookmarksChange = async () => {
    if (selectedCollectionId) {
      try {
        await Promise.all([
          fetchBookmarks(selectedCollectionId),
          fetchFolders(selectedCollectionId)
        ]);
      } catch (error) {
        console.error("刷新数据失败:", error);
      }
    }
  };

  // 修改 LoadingSkeleton 组件
  const LoadingSkeleton = () => {
    return (
      <div className="space-y-6">
        {/* 顶部操作区域骨架屏 */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>

        {/* 文件夹导航路径骨架屏 */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-9 w-[60px]" />
          <Skeleton className="h-4 w-4" /> {/* 箭头图标 */}
          <Skeleton className="h-9 w-[100px]" />
        </div>

        {/* 表格骨架屏 */}
        <div className="rounded-lg border border-gray-200">
          {/* 表头 */}
          <div className="border-b border-gray-200 bg-gray-50/40">
            <Skeleton className="h-12 w-full" />
          </div>
          
          {/* 表格内容 */}
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-4 gap-4">
                <Skeleton className="h-8 w-8 rounded-full" /> {/* 图标 */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" /> {/* 标题 */}
                  <Skeleton className="h-3 w-[300px]" /> {/* URL */}
                </div>
                <Skeleton className="h-4 w-[100px]" /> {/* 创建时间 */}
                <Skeleton className="h-8 w-8 rounded-md" /> {/* 操作按钮 */}
              </div>
            ))}
          </div>
        </div>

        {/* 分页骨架屏 */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Bookmarks"
        action={
          <Select
            value={selectedCollectionId}
            onValueChange={(value) => {
              setSelectedCollectionId(value);
              router.push(`/admin/bookmarks?collection=${value}`);
              Promise.all([
                fetchBookmarks(value),
                fetchFolders(value)
              ]);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections?.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsCreateFolderDialogOpen(true)}
            disabled={!selectedCollectionId || loading}
            variant="outline"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!selectedCollectionId || loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bookmark
          </Button>
        </div>
      </AdminHeader>

      <main className="flex-1 overflow-y-auto p-8 bg-card/50">
        {loading ? (
          <LoadingSkeleton />
        ) : collections.length === 0 ? (
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
                Please create a bookmark collection first, then add bookmarks.
              </p>
              <Button asChild>
                <Link href="/admin/collections">
                  Create Collection
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 文件夹导航路径 - 始终显示 */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFolderBack(-1)}
                className={!currentFolderId ? "bg-white" : ""}
                disabled={isNavigating}
              >
                Root
              </Button>
              {folderPath.map((folder, index) => (
                <Fragment key={folder.id}>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFolderBack(index)}
                    className={currentFolderId === folder.id ? "bg-white" : ""}
                    disabled={isNavigating}
                  >
                    {folder.name}
                  </Button>
                </Fragment>
              ))}
            </div>

            {/* 当没有书签和文件夹时显示空状态 */}
            {bookmarks.currentBookmarks.length === 0 && bookmarks.subfolders.length === 0 ? (
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
                  <h3 className="mt-4 text-lg font-semibold">No Content</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    There is no content in the current folder. Start adding your first bookmark or folder.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bookmark
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(true)}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      New Folder
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <BookmarkDataTable 
                collectionId={selectedCollectionId}
                folders={folders}
                bookmarks={bookmarks}
                currentFolderId={currentFolderId}
                onFolderClick={handleFolderClick}
                onBookmarksChange={handleBookmarksChange}
                loading={loading}
                isNavigating={isNavigating}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            )}
          </>
        )}

        <CreateBookmarkDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          defaultCollectionId={selectedCollectionId}
          defaultFolderId={currentFolderId}
          onSuccess={() => {
            if (selectedCollectionId) {
              fetchBookmarks(selectedCollectionId);
              fetchFolders(selectedCollectionId);
            }
          }}
        />

        <CreateFolderDialog 
          open={isCreateFolderDialogOpen}
          onOpenChange={setIsCreateFolderDialogOpen}
          collectionId={selectedCollectionId}
          onSuccess={() => {
            if (selectedCollectionId) {
              fetchFolders(selectedCollectionId);
            }
          }}
        />
      </main>
    </div>
  );
}
