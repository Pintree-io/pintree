"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Star, ExternalLink, Folder, ChevronLeft, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditBookmarkDialog } from "./EditBookmarkDialog";
import { EditFolderDialog } from "@/components/folder/EditFolderDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  createdAt: string; // 添加建时间
  updatedAt: string; // 添加更新时间
}

interface Folder {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookmarkDataTableProps {
  collectionId: string;
  folders: Folder[];
  bookmarks: {
    currentBookmarks: Bookmark[];
    subfolders: any[]; // 如果需要使用 subfolders，可以定义更具体的类型
  };
  currentFolderId?: string;
  onFolderClick: (folderId: string) => void;
  onBookmarksChange: () => void;
  loading?: boolean;
  isNavigating?: boolean;
  sortField: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  onSortChange: (field: "createdAt" | "updatedAt", order: "asc" | "desc") => void;
}

type TableItem = {
  id: string;
  type: "folder" | "bookmark";
  title: string;
  url?: string;
  icon?: string;
  description?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  folder?: {
    name: string;
  };
  collectionId: string;
};

export function BookmarkDataTable({
  collectionId,
  folders = [],
  bookmarks = { currentBookmarks: [], subfolders: [] },
  currentFolderId,
  onFolderClick,
  onBookmarksChange,
  loading,
  isNavigating = false,
  sortField,
  sortOrder,
  onSortChange,
}: BookmarkDataTableProps) {
  const currentBookmarks = bookmarks?.currentBookmarks || [];
  const safeBookmarks = Array.isArray(currentBookmarks) ? currentBookmarks : [];
  const safeFolders = Array.isArray(folders) ? folders : [];

  console.log('Raw bookmarks:', bookmarks);
  console.log('Safe bookmarks:', safeBookmarks);
  console.log('Raw folders:', folders);
  console.log('Safe folders:', safeFolders);

  const tableData = [
    ...safeFolders.map(folder => ({
      id: folder.id,
      type: "folder" as const,
      title: folder.name,
      icon: folder.icon,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      collectionId
    })),
    ...safeBookmarks.map(bookmark => ({
      id: bookmark.id,
      type: "bookmark" as const,
      title: bookmark.title,
      url: bookmark.url,
      icon: bookmark.icon,
      description: bookmark.description,
      isFeatured: bookmark.isFeatured,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
      viewCount: bookmark.viewCount,
      collectionId: bookmark.collectionId
    }))
  ];

  console.log('Processed tableData:', tableData);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isNavigating) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Icon URL</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>View Count</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="w-full text-left font-medium"
                  onClick={() => {
                    const newOrder = sortField === "createdAt" && sortOrder === "asc" ? "desc" : "asc";
                    onSortChange("createdAt", newOrder);
                  }}
                >
                  Created At
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="w-full text-left font-medium"
                  onClick={() => {
                    const newOrder = sortField === "updatedAt" && sortOrder === "asc" ? "desc" : "asc";
                    onSortChange("updatedAt", newOrder);
                  }}
                >
                  Updated At
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.type === "folder" ? (
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent"
                        onClick={() => onFolderClick(item.id)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {item.title}
                      </Button>
                    ) : (
                      <>
                        {item.isFeatured && <Star className="w-4 h-4 text-yellow-400" />}
                        <span>{item.title}</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.type === "bookmark" && item.icon && (
                    <div className="flex items-center justify-center">
                      <img 
                        src={item.icon} 
                        alt="icon" 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {item.type === "bookmark" ? item.icon || '-' : '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {item.type === "bookmark" ? item.description || '-' : '-'}
                </TableCell>
                <TableCell>
                  {item.type === "bookmark" ? item.viewCount || 0 : '-'}
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <TableActions item={item} onUpdate={onBookmarksChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TableActions({ item, onUpdate }: { item: TableItem; onUpdate: () => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const endpoint = item.type === "folder" ? "folders" : "bookmarks";
      const response = await fetch(`/api/${endpoint}/${item.id}`, {
        method: "DELETE",
      });

      let errorMessage = `Delete ${item.type === "folder" ? "folder" : "bookmark"} failed`;
      
      if (!response.ok) {
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      onUpdate();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 编辑对话框 */}
      {item.type === "folder" ? (
        <EditFolderDialog
          folder={item as any}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onUpdate}
          collectionId={item.collectionId}
        />
      ) : (
        <EditBookmarkDialog
          bookmark={item as any}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onUpdate}
        />
      )}

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {item.type === "folder" ? "folder" : "bookmark"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.title}" this {item.type === "folder" ? "folder" : "bookmark"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
