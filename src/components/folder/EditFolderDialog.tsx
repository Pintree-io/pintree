"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Folder {
  id: string;
  name: string;
  icon?: string;
  isPublic: boolean;
  password?: string;
  sortOrder: number;
  parentId?: string | null;
}

interface EditFolderDialogProps {
  folder: Folder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  collectionId: string;
}

export function EditFolderDialog({
  folder,
  open,
  onOpenChange,
  onSuccess,
  collectionId
}: EditFolderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const initialFormData = {
    name: "",
    icon: "",
    isPublic: false,
    password: "",
    sortOrder: 0,
    parentId: "root"
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (collectionId) {
      fetchFolders();
    }
  }, [collectionId]);

  useEffect(() => {
    if (folder && open) {
      setFormData({
        name: folder.name || "",
        icon: folder.icon || "",
        isPublic: folder.isPublic || false,
        password: folder.password || "",
        sortOrder: typeof folder.sortOrder === 'number' ? folder.sortOrder : 0,
        parentId: folder.parentId || "root",
      });
    }
  }, [folder, open]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/folders`);
      const data = await response.json();
      setFolders(data.filter((f: Folder) => f.id !== folder.id));
    } catch (error) {
      console.error("Failed to get folders:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId === "root" ? null : formData.parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Update folder failed: ${response.status}`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Update folder failed:", error);
      alert(error instanceof Error ? error.message : "Update folder failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Modify folder properties and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon URL</Label>
            <Input
              value={formData.icon}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, icon: e.target.value }))
              }
              placeholder="https://example.com/icon.png"
            />
          </div>

          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPublic: checked }))
              }
            />
            <Label>Public Access</Label>
          </div>

          {!formData.isPublic && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Set access password"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Parent Folder</Label>
            <Select
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, parentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Parent Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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