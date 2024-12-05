"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/header";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettingImages } from "@/hooks/useSettingImages";
import { updateSettingImage } from "@/actions/update-setting-image";

import { Skeleton } from "@/components/ui/skeleton";

// 添加 Logo 上传组件
const LogoUploader = () => {
  const { images, isLoading, error } = useSettingImages("logoUrl");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      // 立即展示预览
      setCurrentLogoUrl(base64);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="relative w-[260px] h-[60px] border rounded bg-white">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : (
            <Image
              src={currentLogoUrl || images[0].url}
              alt="Current Logo"
              fill
              className="object-contain p-2"
            />
          )}
        </div>
        <Input
          id="logoUrl"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="max-w-[200px] bg-slate-100"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        建议尺寸: 520x120px，支持 PNG、JPG 格式
      </p>
    </div>
  );
};

const FaviconUploader = () => {
  const { images, isLoading, error } = useSettingImages("faviconUrl");
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      // 立即展示预览
      setCurrentFaviconUrl(base64);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="relative w-[32px] h-[32px] border rounded bg-white">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="relative w-[32px] h-[32px] border rounded bg-white">
            <Image
              src={currentFaviconUrl || images[0].url}
              alt="Current Favicon"
              fill
              className="object-contain p-1"
            />
          </div>
        )}
        <Input
          id="faviconUrl"
          type="file"
          accept=".ico,.png"
          onChange={handleFileChange}
          className="max-w-[200px] bg-slate-100"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        建议尺寸: 512x512px，支持 ICO、PNG 格式
      </p>
    </div>
  );
};

// 页脚设置卡片组件
interface FooterSettingsCardProps {
  settings: {
    copyrightText: string;
    icp: string;
    icpUrl: string;
    contactEmail: string;
    poweredBy: string;
    [key: string]: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FooterSettingsCard = ({ settings, handleChange }: FooterSettingsCardProps) => {
  return (
    <Card className="border bg-white">
      <CardHeader className="border-b">
        <CardTitle>页脚设置</CardTitle>
        <CardDescription>设置网站页脚信息</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-6">
        {/* 版权信息 */}
        <div className="grid gap-2">
          <Label htmlFor="copyrightText">版权信息</Label>
          <Input
            id="copyrightText"
            name="copyrightText"
            value={settings.copyrightText}
            onChange={handleChange}
            placeholder="© 2024 Your Company. All rights reserved."
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SocialMediaCard = ({
  settings,
  handleChange,
}: {
  settings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const socialLinks = [
    { id: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/yourusername' },
    { id: 'twitterUrl', label: 'Twitter URL', placeholder: 'https://twitter.com/yourusername' },
  ];

  return (
    <Card className="border bg-white">
      <CardHeader className="border-b">
        <CardTitle>社交媒体链接</CardTitle>
        <CardDescription>设置网站页脚显示的社交媒体链接</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-6">
        {socialLinks.map(({ id, label, placeholder }) => (
          <div key={id} className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              name={id}
              value={settings[id] || ""}
              onChange={handleChange}
              placeholder={placeholder}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function BasicSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    websiteName: "",
    logoUrl: "",
    faviconUrl: "",
    githubUrl: "",
    twitterUrl: "",
    discordUrl: "",
    weixinUrl: "",
    weiboUrl: "",
    bilibiliUrl: "",
    zhihuUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    copyrightText: "",
    contactEmail: "",
    googleAnalyticsId: "",
    clarityId: "",
    icp: "",
    icpUrl: "",
    poweredBy: "true",
  });

  // 加载设置数据
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/settings?group=basic");
        if (!response.ok) {
          const errorData = await response.json();
          console.error("加载设置失败:", errorData); // 调试日志
          throw new Error(errorData.error || "加载设置失败");
        }

        const data = await response.json();
        console.log("加载的设置:", data); // 调试日志

        const sanitizedData = Object.keys(data).reduce(
          (acc, key) => ({
            ...acc,
            [key]: data[key] ?? "", // 使用空字符串替代 undefined
          }),
          {}
        );

        setSettings((prev) => ({
          ...prev,
          ...sanitizedData,
        }));
      } catch (error) {
        console.error("加载设置错误:", error);
        toast.error(error instanceof Error ? error.message : "加载设置失败");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("提交的设置:", settings); // 调试日志

      // 使用 saveSettingPromises 并行处理图片上传和基本设置保存
      const saveSettingPromises = [];

      const logoInput = document.getElementById('logoUrl') as HTMLInputElement;
      const faviconInput = document.getElementById('faviconUrl') as HTMLInputElement;

      if (logoInput && logoInput.files && logoInput.files.length > 0) {
        const logoFile = logoInput.files[0];
        const logoFormData = new FormData();
        logoFormData.append('settingKey', 'logoUrl');
        logoFormData.append('file', logoFile);
        saveSettingPromises.push(
          updateSettingImage(logoFormData)
        );
      }

      if (faviconInput && faviconInput.files && faviconInput.files.length > 0) {
        const faviconFile = faviconInput.files[0];
        const faviconFormData = new FormData();
        faviconFormData.append('settingKey', 'faviconUrl');
        faviconFormData.append('file', faviconFile);
        saveSettingPromises.push(
          updateSettingImage(faviconFormData)
        );
      }

      // 添加基本设置保存到 saveSettingPromises
      saveSettingPromises.push(
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }).then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API错误响应:", errorData);
            throw new Error(errorData.error || "保存失败");
          }
          return response.json();
        }).then(result => {
          console.log("保存成功:", result); // 调试日志
        })
      );

      // 并行处理所有操作
      await Promise.all(saveSettingPromises);

      toast.success("设置已保存");
      // 保存成功后刷新页面以更新标题
      window.location.reload();
    } catch (error) {
      console.error("保存设置失败:", error);
      toast.error(error instanceof Error ? error.message : "保存设置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#f9f9f9]">
      <AdminHeader title="Basic Settings" />

      <div className="mx-auto px-4 py-12 bg-[#f9f9f9]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-8">
            {/* 基本信息 */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-normal">
                基本信息
              </p>
              <div className="space-y-2">
                <Card className="border bg-white">
                  <CardHeader className="border-b">
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>设置网站的基本信息</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-6">
                    <div className="grid gap-2">
                      <Label htmlFor="websiteName">网站名称</Label>
                      <Input
                        id="websiteName"
                        name="websiteName"
                        value={settings.websiteName}
                        onChange={handleChange}
                        placeholder="输入网站名称"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>网站 Logo</Label>
                      <LogoUploader />
                    </div>

                    <div className="grid gap-2">
                      <Label>网站图标</Label>
                      <FaviconUploader />
                    </div>
                  </CardContent>
                </Card>

                {/* 统计代码卡片 */}
                <Card className="border bg-white">
                  <CardHeader className="border-b">
                    <CardTitle>统计代码</CardTitle>
                    <CardDescription>设置网站统计代码</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 p-6">
                    <div className="grid gap-2">
                      <Label htmlFor="googleAnalyticsId">
                        Google Analytics ID
                      </Label>
                      <Input
                        id="googleAnalyticsId"
                        name="googleAnalyticsId"
                        value={settings.googleAnalyticsId}
                        onChange={handleChange}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="clarityId">Microsoft Clarity ID</Label>
                      <Input
                        id="clarityId"
                        name="clarityId"
                        value={settings.clarityId}
                        onChange={handleChange}
                        placeholder="XXXXXXXXXX"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 页脚设置 */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-normal">
                页脚设置
              </p>
              <div className="space-y-2">
                <FooterSettingsCard
                  settings={settings}
                  handleChange={handleChange}
                />
                <SocialMediaCard
                  settings={settings}
                  handleChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
