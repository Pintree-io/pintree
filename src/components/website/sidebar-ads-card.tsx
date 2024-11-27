import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarAdsCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export function SidebarAdsCard({
  title,
  description,
  imageUrl,
  buttonText,
  buttonUrl
}: SidebarAdsCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (!title && !description && !imageUrl && !buttonText && !buttonUrl) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-card text-card-foreground p-4 relative group/card">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 z-10 p-1 bg-gray-100/80 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-800 
                 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
      >
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {imageUrl && buttonUrl && (
        <a 
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative h-32 w-full mb-4 cursor-pointer"
        >
          <Image
            src={imageUrl}
            alt={title || "Advertisement"}
            fill
            className="rounded-xl object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      )}
      
      {imageUrl && !buttonUrl && (
        <div className="relative h-32 w-full mb-4">
          <Image
            src={imageUrl}
            alt={title || "Advertisement"}
            fill
            className="rounded-xl object-cover"
          />
        </div>
      )}
      
      <div>
        {title && (
          <h3 className="font-semibold line-clamp-2 text-sm">
            {title}
          </h3>
        )}
        
        {description && (
          <p className={`text-xs text-muted-foreground ${title ? 'my-2' : 'mb-2'} line-clamp-3`}>
            {description}
          </p>
        )}
        
        {buttonText && buttonUrl && (
          <div className={`${title || description ? 'mt-3' : ''}`}>
            <a
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full px-4 py-2 text-sm font-medium text-black hover:opacity-90 text-center bg-gradient-to-r from-[#8ff1a1] to-[#34dd28]"
            >
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 