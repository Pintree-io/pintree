"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import { useSettingImages } from "@/hooks/useSettingImages";

interface Collection {
  id: string;
  name: string;
  isPublic: boolean;
  slug: string;
}

interface FolderNode {
  id: string;
  name: string;
  icon?: string;
  level: number;
  children: FolderNode[];
}

interface WebsiteSidebarProps {
  onFolderSelect?: (folderId: string | null) => void;
  onCollectionChange?: (collectionId: string) => void;
  selectedCollectionId: string;
  currentFolderId: string | null;
}

export function WebsiteSidebar({
  onFolderSelect,
  onCollectionChange,
  selectedCollectionId,
  currentFolderId
}: WebsiteSidebarProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const { images, isLoading, error } = useSettingImages('logoUrl');

  // 获取书签集合列表
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/collections?publicOnly=true");
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("API 返回的数据格式不正确");
          setCollections([]);
          return;
        }

        const publicCollections = data;
        setCollections(publicCollections);
        
        // 如果有公开的书签集合且没有选中的集合，选择第一个
        if (publicCollections.length > 0 && !selectedCollectionId) {
          const firstCollection = publicCollections[0];
          if (onCollectionChange) {
            onCollectionChange(firstCollection.id);
          }
        }
      } catch (error) {
        console.error("获取书签集合失败:", error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // 获取文件夹树
  useEffect(() => {
    if (selectedCollectionId) {
      const fetchFolders = async () => {
        try {
          const response = await fetch(`/api/collections/${selectedCollectionId}/folders?all=true`);
          const data = await response.json();
          setFolders(data);
          setFolderTree(buildFolderTree(data));
        } catch (error) {
          console.error("获取文件夹失败:", error);
        }
      };
      fetchFolders();
    }
  }, [selectedCollectionId]);

  // 添加一个新的 useEffect 来处理文件夹展开
  useEffect(() => {
    if (currentFolderId && folders.length > 0) {
      const expandParentFolders = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (folder && folder.parentId) {
          setExpandedFolders(prev => {
            const next = new Set(prev);
            next.add(folder.parentId!);
            return next;
          });
          expandParentFolders(folder.parentId);
        }
      };
      
      // 确保当前文件夹也被展开
      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.add(currentFolderId);
        return next;
      });
      
      expandParentFolders(currentFolderId);
    }
  }, [currentFolderId, folders]);

  const buildFolderTree = (folders: any[]): FolderNode[] => {
    const folderMap = new Map();
    
    // 第一步：创建所有节点的映射
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        level: 0,
        path: []
      });
    });

    // 第二步：计算每个文件夹的路径和层级
    const calculateLevel = (folderId: string, visited = new Set<string>()): number => {
      if (visited.has(folderId)) {
        console.warn('检测到循环引用:', folderId);
        return 0;
      }
      
      const folder = folderMap.get(folderId);
      if (!folder) return 0;
      if (folder.level !== 0) return folder.level; // 如果已经计算过，直接返回
      
      visited.add(folderId);
      
      if (!folder.parentId) {
        folder.level = 0;
      } else {
        folder.level = calculateLevel(folder.parentId, visited) + 1;
      }
      
      visited.delete(folderId);
      return folder.level;
    };

    // 为所有文件夹计算层级
    folders.forEach(folder => {
      calculateLevel(folder.id);
    });

    // 第三步：构建树结构
    const rootFolders: FolderNode[] = [];
    folders.forEach(folder => {
      const node = folderMap.get(folder.id);
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // 如果找不到父文件夹，作为根文件夹处理
          rootFolders.push(node);
        }
      } else {
        rootFolders.push(node);
      }
    });

    // 第四步：递归排序所有层级的文件夹
    const sortFolders = (folders: FolderNode[]) => {
      folders.sort((a, b) => a.name.localeCompare(b.name));
      folders.forEach(folder => {
        if (folder.children.length > 0) {
          sortFolders(folder.children);
        }
      });
    };

    sortFolders(rootFolders);

    // 添加调试日志
    const logFolderStructure = (folders: FolderNode[], prefix = '') => {
      folders.forEach(folder => {
        console.log(`${prefix}${folder.name} (Level: ${folder.level})`);
        if (folder.children.length > 0) {
          logFolderStructure(folder.children, prefix + '  ');
        }
      });
    };
    
    // 在开发环境下输出文件夹结构
    if (process.env.NODE_ENV === 'development') {
      console.log('文件夹结构:');
      logFolderStructure(rootFolders);
    }

    return rootFolders;
  };

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const renderFolderTree = (folders: FolderNode[]) => {
    return folders.map((folder) => (
      <div key={folder.id}>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => handleFolderSelect(folder.id)}
            className={cn(
              "flex items-center w-full",
              "transition-colors hover:bg-gray-200/50 active:bg-gray-200/50 rounded-xl",
              currentFolderId === folder.id ? "bg-gray-200/50" : ""
            )}
            style={{
              paddingLeft: `${(folder.level * 5) + 12}px`
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center w-8">
                {folder.children.length > 0 ? (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      expandedFolders.has(folder.id) && "rotate-90",
                      currentFolderId === folder.id && "text-emerald-600 dark:text-emerald-400"
                    )}
                    onClick={(e) => toggleFolder(folder.id, e)}
                  />
                ) : (
                  <div className="w-4" />
                )}
                {expandedFolders.has(folder.id) ? (
                  <FolderOpen 
                    className={cn(
                      "h-4 w-4 shrink-0 fill-current",
                      currentFolderId === folder.id && "text-emerald-600 dark:text-emerald-400"
                    )} 
                  />
                ) : (
                  <Folder 
                    className={cn(
                      "h-4 w-4 shrink-0 fill-current",
                      currentFolderId === folder.id && "text-emerald-600 dark:text-emerald-400"
                    )} 
                  />
                )}
              </div>
              <span className={cn(
                "truncate",
                currentFolderId === folder.id && "text-emerald-600 dark:text-emerald-400 font-medium"
              )}>
                {folder.name}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        {expandedFolders.has(folder.id) && folder.children.length > 0 && (
          <div>
            {renderFolderTree(folder.children)}
          </div>
        )}
      </div>
    ));
  };

  const handleFolderSelect = (folderId: string) => {
    // 如果文件夹有子文件夹，则展开/折叠该文件夹
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const hasChildren = folders.some(f => f.parentId === folderId);
      if (hasChildren) {
        setExpandedFolders(prev => {
          const next = new Set(prev);
          if (next.has(folderId)) {
            next.delete(folderId);
          } else {
            next.add(folderId);
          }
          return next;
        });
      }
    }

    // 原有的文件夹选择逻辑
    if (onFolderSelect) {
      onFolderSelect(folderId);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('folderId', folderId);
      router.push(url.toString(), { scroll: false });
    }
  };

  const SidebarSkeleton = () => {
    return (
      <div className="space-y-4 p-4">
        {/* 文件夹列表骨架屏 */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  };

  const handleCollectionChange = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    // 重置展开的件夹状态
    setExpandedFolders(new Set());
    
    // 调用父组件的回调
    if (onCollectionChange) {
      onCollectionChange(collectionId);
    }
    
    // 直接进行路由跳转
    router.push(`/${collection.slug}`);
  };

  return (
    <Sidebar className="flex flex-col h-screen bg-[#F9F9F9]">
      <SidebarHeader className="flex-shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent rounded-none pr-0">
                <Link href="/" className="pl-0 flex items-center gap-2 justify-start rounded-none pr-0 w-full">
                  {isLoading ? (
                    <Skeleton className="w-[260px] h-[60px]" />
                  ) : (
                    <Image src={images[0]?.url || "/logo.png"} alt="Logo" width={260} height={60} />
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
        <SidebarGroup>
          <SidebarMenu>
            {loading ? (
              <SidebarSkeleton />
            ) : folderTree.length > 0 ? (
              renderFolderTree(folderTree)
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-sm text-muted-foreground space-y-2">
                <Folder className="h-8 w-8 opacity-50" />
                <span>No folders yet</span>
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
