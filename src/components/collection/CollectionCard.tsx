import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCollectionDialog } from "./EditCollectionDialog";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Edit, Download, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    viewStyle: "list" | "card";
    sortStyle: "alpha" | "time" | "manual";
    viewCount: number;
    totalBookmarks: number;
  };
  onUpdate: () => void;
}

export function CollectionCard({ collection, onUpdate }: CollectionCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && 
        (e.target.closest('button') || e.target.closest('[role="menuitem"]'))) {
      return;
    }
    router.push(`/admin/bookmarks?collection=${collection.id}`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
        router.push('/admin/collections');
      }
    } catch (error) {
      console.error("删除书签集合失败:", error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/collections/${collection.id}/export`);
      if (!response.ok) throw new Error('导出失败');
      
      const data = await response.json();
      
      // 创建下载文件
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}-export.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="relative group">
        <Card className="absolute w-[98%] h-full bg-muted rounded-3xl border-none bg-gray-100 group-hover:rotate-2 transition-transform duration-300" />
        <Card onClick={handleClick} className="relative cursor-pointer hover:-translate-y-2 transition-all rounded-3xl bg-gradient-to-b from-white to-green-50/50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col h-[120px]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{collection.name}</h3>
                  <div className="h-[40px]">
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-auto flex justify-between items-center">
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    collection.isPublic 
                      ? "bg-green-100 text-green-800" 
                      : "bg-orange-100 text-gray-800"
                  )}
                >
                  {collection.isPublic ? "Public" : "Private"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {collection.totalBookmarks} Bookmarks
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditCollectionDialog
        collection={collection}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={onUpdate}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bookmark Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{collection.name}" bookmark collection? This action cannot be undone.
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
              onClick={() => {
                handleDelete();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
