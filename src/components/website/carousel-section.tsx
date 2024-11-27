"use client";

import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from "@/hooks/use-settings";

// 将轮播图数据抽离为常量
const CAROUSEL_IMAGES = [
  "/assets/carousel-1.jpg",
  "/assets/carousel-2.jpg",
  "/assets/carousel-3.jpg",
  "/assets/carousel-4.jpg",
  "/assets/carousel-5.jpg",
  "/assets/carousel-6.jpg",
] as const;

export function CarouselSection() {
  const { settings, loading } = useSettings('feature');

  if (loading) return null;

  // 检查 enableCarousel 是否启用
  if (settings?.enableCarousel === 'false' || !settings?.enableCarousel) {
    return null;
  }

  // 获取可见的图片和对应的链接
  const visibleImagesWithLinks = CAROUSEL_IMAGES.map((src, index) => ({
    src,
    link: settings?.carouselImageLinks ? 
      JSON.parse(settings.carouselImageLinks)[index] : 
      'https://pintree.io',
    visible: settings?.carouselImageStates ? 
      JSON.parse(settings.carouselImageStates)[index] : 
      true
  })).filter(item => item.visible);

  return (
    <div className="relative w-full px-4 md:px-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 flex justify-center">
          {visibleImagesWithLinks.map(({ src, link }, index) => (
            <CarouselItem 
              key={index} 
              className="pl-4 basis-full md:basis-1/2 lg:basis-1/4 xl:basis-1/6"
            >
              <Link 
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="relative aspect-[24/9] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={src}
                    alt={`Carousel image ${index + 1}`}
                    fill
                    className="object-cover transition-all hover:scale-105 cursor-pointer"
                    priority={index === 0}
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
} 