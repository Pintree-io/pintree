"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";


interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;  // 添加这一行
}

export function CreateCollectionDialog({ 
  open, 
  onOpenChange,
  onSuccess
}: CreateCollectionDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    // viewStyle: "list",    // 注释掉
    // sortStyle: "alpha",   // 注释掉
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // 显示错误提示
        toast({
          variant: "destructive",
          title: "Create Failed",
          description: data.error || "Create collection failed"
        });
        return; // 直接返回，不关闭对话框
      }

      // 成功后的操作
      onOpenChange(false);
      router.refresh();
      
      // 重置表单
      setFormData({
        name: "",
        description: "",
        isPublic: true,
        // viewStyle: "list",    // 注释掉
        // sortStyle: "alpha",   // 注释掉
      });

      // 成功提示
      toast({
        title: "Create Success",
        description: "Bookmark collection created",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Create failed:", error);
      // 错误提示
      toast({
        variant: "destructive",
        title: "Create Failed",
        description: error instanceof Error ? error.message : "An error occurred while creating the bookmark collection"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Bookmark Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter collection name"
              disabled={loading}
            />
          </div>

          {/* 注释掉整个 View Style 选择框 */}
          {/* <div className="space-y-2">
            <Label htmlFor="viewStyle">View Style</Label>
            <Select
              value={formData.viewStyle}
              onValueChange={(value) => setFormData(prev => ({ ...prev, viewStyle: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select view style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="card">Card View</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* 注释掉整个 Sort Style 选择框 */}
          {/* <div className="space-y-2">
            <Label htmlFor="sortStyle">Sort Style</Label>
            <Select
              value={formData.sortStyle}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sortStyle: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sort style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alpha">Sort by Name</SelectItem>
                <SelectItem value="time">Sort by Time</SelectItem>
                <SelectItem value="manual">Manual Sort</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter collection description"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Public Access</Label>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
