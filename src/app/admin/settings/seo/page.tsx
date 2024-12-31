"use client";

import { useState, useEffect } from 'react';
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/header";
import { revalidateData } from "@/actions/revalidate-data";
const defaultSettings = {
  // websiteName: "",
  description: "",
  keywords: "",
  siteUrl: "",
};


export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/settings?group=seo');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证网站 URL 格式
    try {
      if (settings.siteUrl) {
        // 去除首尾空格和多余斜杠
        const cleanUrl = settings.siteUrl.trim().replace(/\/+$/, '');
        
        const url = new URL(cleanUrl);
        if (!url.protocol.startsWith('http')) {
          throw new Error('Website URL must start with http:// or https://');
        }
        
        // 验证域名格式
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(url.hostname)) {
          throw new Error('Please enter a valid domain');
        }

        // 更新为清理后的 URL
        settings.siteUrl = cleanUrl;
      } else {
        throw new Error('Please enter website URL');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Website URL format is incorrect');
      return;
    }

    try {
      setLoading(true);
      const saveSettingPromises = [];



      // 添加基本设置保存到 saveSettingPromises
      saveSettingPromises.push(
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...settings,
            group: 'seo'
          }),
        }).then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(errorData.error || "Save failed");
          }
          return response.json();
        }).then(result => {
          console.log("Save success:", result); // 调试日志
        })
      );

      // 并行处理所有操作
      await Promise.all(saveSettingPromises);

      revalidateData();

      toast.success("SEO settings saved");
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#f9f9f9]">
      <Toaster />
      <AdminHeader title="SEO Settings" />

      <div className="mx-auto px-4 py-12 bg-[#f9f9f9]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-8">
            {/* SEO 设置 */}
            <div className="space-y-4">
              <div className="space-y-4">
                {/* 基础 SEO */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-normal">Basic SEO</p>
                  <Card className="border bg-white">
                    <CardContent className="grid gap-4 p-6">
                      <div className="grid gap-2">
                        <label htmlFor="siteUrl" className="font-medium">
                          Website URL
                        </label>
                        <Input
                          id="siteUrl"
                          name="siteUrl"
                          value={settings.siteUrl}
                          onChange={handleChange}
                          placeholder="Enter website full URL"
                        />
                        <p className="text-sm text-muted-foreground">
                          For example: https://pintree.io
                        </p>
                      </div>

                      {/* <div className="grid gap-2">
                        <label htmlFor="websiteName" className="font-medium">
                          Website Title
                        </label>
                        <Input
                          id="websiteName"
                          name="websiteName"
                          value={settings.websiteName}
                          onChange={handleChange}
                          placeholder="Enter website title"
                        />
                      </div> */}

                      <div className="grid gap-2">
                        <label htmlFor="description" className="font-medium">
                          Website Description
                        </label>
                        <Textarea
                          id="description"
                          name="description"
                          value={settings.description}
                          onChange={handleChange}
                          placeholder="Enter website description"
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor="keywords" className="font-medium">
                          Keywords
                        </label>
                        <Input
                          id="keywords"
                          name="keywords"
                          value={settings.keywords}
                          onChange={handleChange}
                          placeholder="Enter keywords, separated by commas"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>


              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}