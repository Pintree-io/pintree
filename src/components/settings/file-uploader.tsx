import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploaderProps {
  type: 'logo' | 'favicon';
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
      
      // 强制刷新图片
      const timestamp = new Date().getTime();
      const images = document.querySelectorAll(`img[src="/${type === 'logo' ? 'logo.png' : 'favicon.ico'}"]`);
      images.forEach(img => {
        img.setAttribute('src', `/${type === 'logo' ? 'logo.png' : 'favicon.ico'}?t=${timestamp}`);
      });
      
      toast.success(`${title}更新成功`);
    } catch (error) {
      console.error('上传失败:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      <div className="flex items-center gap-4">
        <div className={`relative w-[${previewWidth}px] h-[${previewHeight}px] border rounded`}>
          <Image 
            src={`/${type === 'logo' ? 'logo.png' : 'favicon.ico'}`}
            alt={`Current ${title}`}
            fill
            className="object-contain"
          />
        </div>
        <Input
          type="file"
          accept={type === 'logo' ? "image/png,image/jpeg" : "image/x-icon,image/png"}
          onChange={handleFileChange}
          disabled={isUploading}
          className="max-w-[300px]"
        />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
} 