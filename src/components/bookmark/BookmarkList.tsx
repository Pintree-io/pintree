"use client";

import { useState, useEffect } from "react";
import { BookmarkCard } from "./BookmarkCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  collectionId: string;
  folderId?: string;
  collection: {
    name: string;
  };
  folder?: {
    name: string;
  };
}

interface BookmarkListProps {
  collectionId: string;
}

export function BookmarkList({ collectionId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      fetchBookmarks();
    }
  }, [collectionId]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/bookmarks`);
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error("Fetch bookmarks failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!collectionId) {
    return (
      <div className="text-center text-gray-500 py-4">
        Please select a bookmark collection
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No bookmarks yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          title={bookmark.title}
          url={bookmark.url}
          icon={bookmark.icon}
          description={bookmark.description}
          isFeatured={bookmark.isFeatured}
        />
      ))}
    </div>
  );
}
