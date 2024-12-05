"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { WebsiteSidebar } from "@/components/website/sidebar";
import { BookmarkGrid } from "@/components/bookmark/BookmarkGrid";
import { Header } from "@/components/website/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Collection } from "@prisma/client";
import { Footer } from "@/components/website/footer";
import { TopBanner } from "@/components/website/top-banner";
import { BackToTop } from "@/components/website/back-to-top";

export default function CollectionPage() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const fetchCollectionBySlug = async () => {
      try {
        const response = await fetch(`/api/collections/slug/${params.slug}`);
        const collection = await response.json();
        if (collection) {
          setSelectedCollectionId(collection.id);
          setCollectionName(collection.name);
        }
      } catch (error) {
        console.error("获取集合失败:", error);
      }
    };

    if (params.slug) {
      fetchCollectionBySlug();
    }
  }, [params.slug]);

  useEffect(() => {
    const folderId = searchParams.get('folderId');
    setCurrentFolderId(folderId);
  }, [searchParams]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("获取集合列表失败:", error);
      }
    };
    fetchCollections();
  }, []);

  const handleCollectionChange = (id: string) => {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;
    
    setSelectedCollectionId(id);
    setCollectionName(collection.name || "");
    setCurrentFolderId(null);
    
    // 使用 collection 的 slug 进行导航
    router.push(`/${collection.slug}`);
  };

  const handleFolderSelect = (id: string | null) => {
    const collection = collections.find(c => c.id === selectedCollectionId);
    if (!collection) return;

    if (id === null) {
      router.push(`/${collection.slug}`);
      setCurrentFolderId(null);
      return;
    }
    
    router.push(`/${collection.slug}?folderId=${id}`);
    setCurrentFolderId(id);
  };

  const refreshData = useCallback(async () => {
    if (selectedCollectionId) {
      try {
        const response = await fetch(`/api/collections/${selectedCollectionId}/bookmarks${currentFolderId ? `?folderId=${currentFolderId}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error("刷新数据失败:", error);
      }
    }
  }, [selectedCollectionId, currentFolderId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBanner />
      <div className="flex flex-1">
        <SidebarProvider>
          <WebsiteSidebar 
            selectedCollectionId={selectedCollectionId}
            currentFolderId={currentFolderId}
            onCollectionChange={handleCollectionChange}
            onFolderSelect={handleFolderSelect}
          />
          <div className="flex flex-1 flex-col space-y-8">
            <Header 
              selectedCollectionId={selectedCollectionId} 
              currentFolderId={currentFolderId}
              onBookmarkAdded={refreshData}
            />
            <div className="flex-1 overflow-y-auto">
              <BookmarkGrid 
                key={`${selectedCollectionId}-${currentFolderId}`}
                collectionId={selectedCollectionId}
                currentFolderId={currentFolderId}
                collectionName={collectionName}
                collectionSlug={collections.find(c => c.id === selectedCollectionId)?.slug || ''}
                refreshTrigger={refreshTrigger}
              />
            </div>
            <Footer />
            <BackToTop />
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
} 