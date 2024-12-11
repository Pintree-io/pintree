import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Setting {
  value: any;
  type: string;
  group: string;
  description?: string;
}

export function useSettings(group?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // 加载设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings${group ? `?group=${group}` : ''}`);
      if (!response.ok) throw new Error('Load settings failed');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Load settings failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 保存设置
  const saveSettings = async (newSettings: Record<string, any>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      
      if (!response.ok) throw new Error('Save settings failed');
      toast.success('Settings saved');
      await loadSettings(); // 重新加载设置
    } catch (error) {
      toast.error('Save settings failed');
      console.error(error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [group]);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings
  };
} 