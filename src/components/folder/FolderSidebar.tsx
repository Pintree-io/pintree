import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Collection {
  id: string;
  name: string;
}

interface FolderSidebarProps {
  collectionId: string;
  currentFolderId?: string;
  onFolderSelect: (folderId: string | null) => void;
  onCollectionChange?: (collectionId: string) => void;
  collections: Collection[];
}

interface Folder {
  id: string;
  name: string;
  icon?: string;
  parentId: string | null;
}

interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  level: number;
}

export function FolderSidebar({ 
  collectionId, 
  currentFolderId,
  onFolderSelect,
  onCollectionChange,
  collections
}: FolderSidebarProps) {
  // 如果没有集合，直接返回 null
  if (!collections || !Array.isArray(collections) || collections.length === 0) {
    return null;
  }

  const [folderTree, setFolderTree] = useState<FolderWithChildren[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collectionId) {
      fetchAllFolders();
    }
  }, [collectionId]);

  const fetchAllFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${collectionId}/folders?all=true`);
      const data = await response.json();
      
      // 构建完整的文件夹树
      const folderMap = new Map<string, FolderWithChildren>();
      
      // 初始化所有节点
      data.forEach((folder: Folder) => {
        folderMap.set(folder.id, { 
          ...folder, 
          children: [],
          level: 0
        });
      });
      
      // 构建树结构并按名称排序
      const rootFolders: FolderWithChildren[] = [];
      data.forEach((folder: Folder) => {
        const node = folderMap.get(folder.id)!;
        if (folder.parentId) {
          const parent = folderMap.get(folder.parentId);
          if (parent) {
            node.level = parent.level + 1;
            parent.children.push(node);
            // 对子文件夹按名称排序
            parent.children.sort((a, b) => a.name.localeCompare(b.name));
          }
        } else {
          rootFolders.push(node);
        }
      });
      
      // 对根文件夹排序
      rootFolders.sort((a, b) => a.name.localeCompare(b.name));
      setFolderTree(rootFolders);
    } catch (error) {
      console.error("Get folders failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolderItem = (folder: FolderWithChildren) => {
    const hasChildren = folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const paddingLeft = folder.level * 16;

    return (
      <div key={folder.id}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full flex items-center gap-2 px-2",
            isSelected && "bg-muted"
          )}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform cursor-pointer",
                  isExpanded && "rotate-90"
                )}
                onClick={(e) => toggleFolder(folder.id, e)}
              />
            )}
            {!hasChildren && <div className="w-4" />}
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{folder.name}</span>
          </div>
        </Button>

        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => renderFolderItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4 space-y-4">
        <Select
          value={collectionId}
          onValueChange={(value) => {
            onCollectionChange?.(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections && Array.isArray(collections) && collections?.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
      </div>
      
      <ScrollArea className="h-[calc(100vh-9rem)]">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 px-2",
              !currentFolderId && "bg-muted"
            )}
            onClick={() => onFolderSelect(null)}
          >
            <Folder className="h-4 w-4" />
            Root Folder
          </Button>
          {folderTree.map(folder => renderFolderItem(folder))}
        </div>
      </ScrollArea>
    </div>
  );
}
