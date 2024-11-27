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
import { Switch } from "@/components/ui/switch";

interface Collection {
  id: string;
  name: string;
}

interface EditBookmarkDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description?: string;
    isFeatured: boolean;
    collectionId: string;
    icon?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UrlInfo {
  title: string;
  description: string;
  icon: string;
  icons: string[];
  error?: string;
}

export function EditBookmarkDialog({
  bookmark,
  open,
  onOpenChange,
  onSuccess
}: EditBookmarkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [formData, setFormData] = useState({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || "",
    collectionId: bookmark.collectionId,
    isFeatured: bookmark.isFeatured,
    icon: bookmark.icon || "",
  });
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchCollections();
    }
  }, [open]);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Get collections failed:", error);
      setCollections([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          icon: formData.icon || null,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error;
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("更新书签失败:", error);
      setError(error instanceof Error ? error.message : "更新书签失败");
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleGetInfo = async () => {
    if (!formData.url) {
      setError("请输入 URL");
      return;
    }

    if (!isValidUrl(formData.url)) {
      setError("请输入有效的 URL，例如 https://example.com");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/url-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.url }),
      });
      
      const data: UrlInfo = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "获取 URL 信息失败");
      }
      
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        icon: data.icon || prev.icon,
      }));
      setAvailableIcons(data.icons || []);
    } catch (error) {
      console.error("获取 URL 信息失败:", error);
      setError(error instanceof Error ? error.message : "获取 URL 信息失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
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
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, collectionId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
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
            <Label>URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGetInfo}
                disabled={loading}
              >
                {loading ? "Getting..." : "Get Info"}
              </Button>
            </div>
          </div>

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
                <Label className="text-sm text-gray-500">选择图标</Label>
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
