"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronsUpDown, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Collection {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;  // 添加 parentId
  displayName?: string;     // 添加 displayName
}

interface CreateBookmarkDialogGlobalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollectionId?: string;
  defaultFolderId?: string;
  onSuccess?: (folderId?: string) => void;
}

interface UrlInfo {
  title: string;
  description: string;
  icon: string;
  icons: string[];
  error?: string;
}

export default function CreateBookmarkDialogGlobal({
  open,
  onOpenChange,
  defaultCollectionId,
  defaultFolderId,
  onSuccess
}: CreateBookmarkDialogGlobalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");  // 添加错误状态
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    icon: "",
    collectionId: defaultCollectionId || "",
    folderId: defaultFolderId || "none",
    folderName: "", // 新增
    isFeatured: false,
    sortOrder: 0
  });

  // 添加新的状态
  const [hasLoadedInfo, setHasLoadedInfo] = useState(false);

  // 添加 availableIcons 状态
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);

  // 修改 useEffect，当对话框关闭时重置所有状态
  useEffect(() => {
    if (!open) {
      setHasLoadedInfo(false);
      setError("");
      setFormData({
        title: "",
        url: "",
        description: "",
        icon: "",
        collectionId: defaultCollectionId || "",
        folderId: defaultFolderId || "none",
        folderName: "",
        isFeatured: false,
        sortOrder: 0
      });
    }
  }, [open, defaultCollectionId, defaultFolderId]);

  // 初始化时获取集合列表
  useEffect(() => {
    fetchCollections();
  }, []);

  // 当 collectionId 变化时获取文件夹列表
  useEffect(() => {
    if (formData.collectionId) {
      fetchFolders(formData.collectionId);
    }
  }, [formData.collectionId]);

  // 当默认值改变时更新表单
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      collectionId: defaultCollectionId || "",
      folderId: defaultFolderId || "none"
    }));
  }, [defaultCollectionId, defaultFolderId]);

  // 在 useEffect 中设置默认文件夹名称
  useEffect(() => {
    if (defaultFolderId) {
      const folder = folders.find(f => f.id === defaultFolderId);
      if (folder) {
        setFormData(prev => ({
          ...prev,
          folderName: folder.name
        }));
      }
    }
  }, [defaultFolderId, folders]);

  // 在组件内部，我们将使用 props 中的 open 和 onOpenChange，而不是创建新的状态
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");  // 重置错误信息

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          folderId: formData.folderId === "none" ? null : formData.folderId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Create failed");
        return;
      }

      onOpenChange(false);
      onSuccess?.(formData.folderId === "none" ? undefined : formData.folderId);
      
      // 重置表单
      setFormData({
        title: "",
        url: "",
        description: "",
        icon: "",
        collectionId: defaultCollectionId || "",
        folderId: defaultFolderId || "none",
        folderName: "", // 新增
        isFeatured: false,
        sortOrder: 0
      });
    } catch (error) {
      console.error("Create bookmark failed:", error);
      setError("Create bookmark failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    }
  };

  const fetchFolders = async (collectionId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/folders?all=true`);
      const data = await response.json();
      
      // 指定 Map 的类型
      const folderMap = new Map<string, Folder>(data.map((folder: Folder) => [folder.id, folder]));
      
      // 处理文件夹数据，添加完整路径显示
      const processedFolders = data.map((folder: Folder) => {
        const path: string[] = [];
        let current: Folder | null = folder;
        
        // 递归构建完整路径
        while (current) {
          path.unshift(current.name);
          current = current.parentId ? folderMap.get(current.parentId) || null : null;
        }
        
        return {
          ...folder,
          displayName: path.join(" / ")
        };
      });
      
      setFolders(processedFolders);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  // 添加 URL 验证函数
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 如果没有书签集合,显示提示信息
  if (collections.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
          </DialogHeader>
          
          <Alert>
            <AlertDescription>
              Please create a bookmark collection first.
              <Link href="/admin/collections" className="ml-2 text-blue-600 hover:underline">
                Go to create
              </Link>
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Bookmark</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Collection</Label>
            <Select
              value={formData.collectionId}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, collectionId: value, folderId: "" }));
              }}
            >
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Folder</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {folders.find(f => f.id === formData.folderId)?.displayName || "Select a folder"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search folders..." />
                  <CommandList>
                    <CommandEmpty>No folders found</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFormData(prev => ({ ...prev, folderId: "" }));
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !formData.folderId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>Root</span>
                      </CommandItem>
                      {folders.map((folder) => (
                        <CommandItem
                          key={folder.id}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, folderId: folder.id }));
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.folderId === folder.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <Folder className="mr-2 h-4 w-4" />
                          <span>{folder.displayName}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com"
              required
            />
          </div>

          {/* 仅在获取信息后显示这些字段 */}
          {hasLoadedInfo && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Icon URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, icon: e.target.value }))
                      }
                    />
                  </div>
                  {formData.icon && (
                    <div className="flex items-center">
                      <img
                        src={formData.icon}
                        alt="Icon preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {availableIcons.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-500">Select an icon</Label>
                    <div className="grid grid-cols-6 gap-2 mt-1">
                      {availableIcons.map((iconUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`p-2 border rounded hover:bg-gray-100 ${
                            formData.icon === iconUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconUrl }))}
                        >
                          <img
                            src={iconUrl}
                            alt={`Icon ${index + 1}`}
                            className="w-6 h-6 object-contain mx-auto"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                
                if (!formData.url) {
                  setError("Please enter a URL");
                  return;
                }

                if (!isValidUrl(formData.url)) {
                  setError("Please enter a valid URL, e.g. https://example.com");
                  return;
                }

                if (!hasLoadedInfo) {
                  try {
                    setLoading(true);
                    const response = await fetch("/api/url-info", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: formData.url }),
                    });
                    
                    const data: UrlInfo = await response.json();
                    
                    if (!response.ok) {
                      throw new Error(data.error || "Failed to get URL information");
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      title: data.title || prev.title,
                      description: data.description || prev.description,
                      icon: data.icon || prev.icon,
                    }));
                    setAvailableIcons(data.icons || []);
                    setHasLoadedInfo(true);
                  } catch (error) {
                    console.error("Failed to get URL information:", error);
                    setError(error instanceof Error ? error.message : "Failed to get URL information");
                  } finally {
                    setLoading(false);
                  }
                } else {
                  handleSubmit(e);
                }
              }}
            >
              {loading ? "Getting..." : (hasLoadedInfo ? "Create" : "Get Info")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
