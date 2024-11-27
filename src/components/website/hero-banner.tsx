import { useSettings } from "@/hooks/use-settings";

export function HeroBanner() {
  const { settings, loading } = useSettings('feature');

  if (loading) return null;

  if (settings?.enableHeroBanner === 'false' || !settings?.enableHeroBanner) {
    return null;
  }

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-4xl font-bold text-center">
            {settings.heroBannerTitle || 'Organize and Share Your Bookmarks Effortlessly'}
          </h1>
          <p className="text-xl text-gray-600 text-center">
            {settings.heroBannerDescription || 'Create, manage and share personalized bookmark collections with Pintree'}
          </p>
          <p className="text-sm text-gray-500">
            {settings.heroBannerSponsorText || 'Sponsored by'}{" "}
            <a 
              href={settings.heroBannerButtonLink || "https://pintree.io"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-600 hover:text-green-500 transition-colors"
            >
              {settings.heroBannerButtonText || "Pintree.io"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 