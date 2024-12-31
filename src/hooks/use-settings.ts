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



  useEffect(() => {
    loadSettings();
  }, [group]);

  return {
    settings,
    loading,
    loadSettings
  };
} 