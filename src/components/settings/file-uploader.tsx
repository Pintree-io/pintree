import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploaderProps {
  type: 'logo' | 'favicon' | 'sidebar-ads';
  title: string;
  description: string;
  previewWidth: number;
  previewHeight: number;
}

export function FileUploader({ 
  type, 
  title, 
  description, 
  previewWidth, 
  previewHeight 
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // 加载当前图片
  useEffect(() => {
    const loadCurrentImage = async () => {
      try {
        const response = await fetch(`/api/settings?key=sidebarAdsImageUrl`);
        if (response.ok) {
          const data = await response.json();
          setPreviewUrl(data.sidebarAdsImageUrl);
        }
      } catch (error) {
        console.error('加载图片失败:', error);
      }
    };

    if (type === 'sidebar-ads') {
      loadCurrentImage();
    }
  }, [type]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('type', type);
    
    try {
      const response = await fetch('/api/settings/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '上传失败');
      }
      
      const result = await response.json();
      if (result.url) {
        setPreviewUrl(result.url);
      }
      
      toast.success(`${title}更新成功`);
    } catch (error) {
      console.error('上传失败:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {previewUrl && (
          <div className="relative" style={{ width: previewWidth, height: previewHeight }}>
            <Image 
              src={previewUrl}
              alt={title || 'Preview'}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="max-w-[200px] bg-slate-100"
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
} 