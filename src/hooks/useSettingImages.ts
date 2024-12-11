import { useState, useEffect } from 'react';
import { getSettingImages } from '@/actions/get-setting-image';

type Image = {
  id: string;
  url: string;
}

export const useSettingImages = (settingKey: string) => {
  // const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesData, setImagesData] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettingImages = async () => {
      try {
        const result = await getSettingImages(settingKey);
        if (result.success) {
          const images = result.imageIds?.map((id: string) => ({ id, url: `/api/images/${id}` }));

          setImagesData(images || []);
          setError(null);
        } else {
          setImagesData([]);
          setError(result.error || 'Get setting images failed');
        }
      } catch (err) {
        setImagesData([]);
        setError(err instanceof Error ? err.message : 'Get setting images failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingImages();

  }, [settingKey]);

  return { 
    images:imagesData, 
    isLoading,
    error
  };
};