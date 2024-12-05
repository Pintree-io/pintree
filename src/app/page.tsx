"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { WebsiteSidebar } from "@/components/website/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookmarkGrid } from "@/components/bookmark/BookmarkGrid";
import { Header } from "@/components/website/header";
import { useRouter, useSearchParams } from 'next/navigation';
import { Footer } from "@/components/website/footer";
import { TopBanner } from "@/components/website/top-banner";

import { GetStarted } from "@/components/website/get-started";
import { BackToTop } from "@/components/website/back-to-top";

function SearchParamsComponent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collections, setCollections] = useState<any[]>([]);
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const folderId = searchParams.get('folderId');
    setCurrentFolderId(folderId);
  }, [searchParams]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        const data = await response.json();
        const publicCollections = data.filter((c: any) => c.isPublic);
        setCollections(data);
        
        if (publicCollections.length > 0 && !selectedCollectionId) {
          const defaultCollection = publicCollections[0];
          setSelectedCollectionId(defaultCollection.id);
          setCollectionName(defaultCollection.name);
        }
      } catch (error) {
        console.error("Get collections failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (collections.length > 0 && selectedCollectionId) {
      const currentCollection = collections.find(c => c.id === selectedCollectionId);
      if (currentCollection) {
        setCollectionName(currentCollection.name);
      }
    }
  }, [collections, selectedCollectionId]);

  const handleCollectionChange = (id: string) => {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;
    
    setSelectedCollectionId(id);
    setCollectionName(collection.name || "");
    setCurrentFolderId(null);
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
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : collections.length > 0 ? (
            <>
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
              </div>
              <BackToTop />
            </>
          ) : (
            <div className="flex flex-1">
              <GetStarted />
            </div>
          )}
        </SidebarProvider>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsComponent />
    </Suspense>
  );
}
