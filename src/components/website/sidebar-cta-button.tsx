"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function SidebarCtaButton() {
  const [settings, setSettings] = useState({
    enabled: false,
    text: "",
    link: ""
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings?group=feature');
        const data = await response.json();
        
        setSettings({
          enabled: data.enableCtaButton === 'true' || data.enableCtaButton === true,
          text: data.ctaButtonText || "Claim your Pintree",
          link: data.ctaButtonLink || "https://pintree.io"
        });
      } catch (error) {
        console.error('加载CTA按钮设置失败:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  if (!isLoaded || !settings.enabled) {
    return null;
  }

  return (
    <Link
      href={settings.link}
      target="_blank"
      className="flex overflow-hidden items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-9 px-4 py-2 whitespace-pre group/cta relative w-full justify-center gap-2 rounded-full transition-all duration-300 ease-out hover:ring-2 hover:ring-black hover:ring-offset-2"
    >
      <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover/cta:-translate-x-40" />
      <div className="flex items-center">
        <Flame className="w-4 h-4 fill-current" />
        <span className="ml-1 text-white">{settings.text}</span>
      </div>
    </Link>
  );
} 