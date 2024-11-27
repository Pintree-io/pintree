"use client";

import Image from 'next/image'
import { useState } from 'react'
import { Folder } from 'lucide-react'

interface BookmarkCardProps {
  title: string
  url: string
  icon?: string
  description?: string
  isFeatured?: boolean
  collection?: {
    name: string
    slug: string
  }
  folder?: {
    name: string
  }
}

export function BookmarkCard({
  title,
  url,
  icon,
  description,
  isFeatured = false,
  collection,
  folder
}: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false)
  const defaultIcon = '/assets/default-icon.svg'
  
  // 清理 URL 显示，移除 http(s) 和尾部斜杠
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  
  return (
    <div 
      onClick={() => window.open(url, '_blank')}
      className={`
        cursor-pointer flex items-center transition-shadow p-4 
        bg-card/50 dark:bg-gray-900 border border-[#eaebf3]
        dark:ring-gray-800 rounded-2xl hover:bg-card
        dark:hover:bg-gray-800
        ${isFeatured ? 'border-2 border-blue-500' : ''}
      `}
    >
      <div className="relative w-8 h-8 mr-4 flex-shrink-0">
        <Image
          src={imageError ? defaultIcon : (icon || defaultIcon)}
          alt={title}
          fill
          className="rounded-full object-cover"
          onError={() => setImageError(true)}
          priority={isFeatured}
        />
      </div>

      <div className="flex flex-col overflow-hidden">
        <h2 className="text-sm font-medium mb-1 truncate dark:text-gray-400">
          {title}
        </h2>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-600 mb-1 line-clamp-2">
            {description}
          </p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-600 dark:hover:text-gray-400 truncate">
          {cleanUrl}
        </p>

        {(collection || folder) && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            {collection && (
              <span className="inline-flex items-center">
                {collection.name}
              </span>
            )}
            {folder && (
              <>
                <span className="mx-1">/</span>
                <span className="inline-flex items-center">
                  <Folder className="w-3 h-3 mr-1" />
                  {folder.name}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
