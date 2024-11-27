import { Search, ArrowRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useSettings } from "@/hooks/use-settings";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string, scope: 'all' | 'current') => void;
  currentEngine?: string;
  onEngineChange?: (engine: string) => void;
  currentCollection?: 'all' | 'current';
  onCollectionChange?: (collection: 'all' | 'current') => void;
}

// 添加搜索引擎图标组件
const SearchEngineIcon = ({ engine }: { engine: string }) => {
  switch (engine) {
    case 'Google':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case 'Baidu':
      return (
        <svg className="w-4 h-4" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M176.73984 539.3792c113.8816-23.90784 98.39104-156.90752 94.97088-186.0352-5.60128-44.8128-59.53536-123.16928-132.76928-116.95872-92.19328 8.06144-105.66144 138.18112-105.66144 138.18112C20.78976 434.77504 63.13984 563.32544 176.73984 539.3792L176.73984 539.3792zM297.66656 770.74176c-3.32032 9.37984-10.75456 33.32608-4.32128 54.1312 12.70784 46.69696 58.39104 39.08352 58.39104 39.08352l64.01536 0 0-128.03328-64.01536 0C323.05408 744.30464 300.7744 761.43104 297.66656 770.74176L297.66656 770.74176zM388.15488 316.31104c62.92992 0 113.76128-70.77376 113.76128-158.18496 0-87.39072-50.8288-158.12608-113.76128-158.12608-62.80704 0-113.78688 70.73536-113.78688 158.12608C274.368 245.53728 325.3504 316.31104 388.15488 316.31104L388.15488 316.31104zM659.07968 326.77632c84.12416 10.65728 138.1504-77.00992 148.90752-143.45984 10.94144-66.35776-43.30752-143.46496-102.85056-156.71552-59.6608-13.38368-134.11072 80.02304-140.89728 140.86656C556.14208 241.88672 575.18336 316.21376 659.07968 326.77632L659.07968 326.77632zM865.12384 717.4784c0 0-130.08128-98.39104-206.0672-204.68992-102.94272-156.71552-249.19296-92.95872-298.07616-13.25824-48.68096 79.70304-124.608 130.08384-135.3984 143.46752-10.91328 13.12768-157.09696 90.2656-124.672 231.13472 32.42496 140.86656 154.80064 149.86752 154.80064 149.86752s75.63008-3.61984 173.09952-24.93952c97.46432-21.12 181.45792 5.25824 181.45792 5.25824s227.71456 74.5088 290.02752-68.95616C962.52928 791.86944 865.12384 717.4784 865.12384 717.4784L865.12384 717.4784zM479.76704 927.97184l-160.04864 0c-63.91808-1.50272-81.74848-52.08576-84.94848-59.34336-3.1744-7.3984-21.25824-41.67424-11.68128-99.93728 27.62496-87.3856 96.6656-96.76032 96.6656-96.76032l96.02816 0 0-96.0256 64.01792 0 0 352.06144L479.76704 927.97184 479.76704 927.97184zM735.84384 927.97184 575.7952 927.97184c-63.02464-2.69568-64.11776-60.4672-64.11776-60.4672l0.09984-195.60448 64.01792 0 0 160.0512c4.224 17.64096 32.00768 32.00512 32.00768 32.00512l64.02048 0 0-192.05376 64.02048 0L735.84384 927.97184 735.84384 927.97184zM992.39168 438.35904c0-31.77728-27.04896-127.51872-127.26784-127.51872-100.43904 0-113.85856 90.36032-113.85856 154.24768 0 60.94592 5.248 146.02496 130.01984 143.36768C1006.0544 605.80608 992.39168 470.34112 992.39168 438.35904L992.39168 438.35904z" fill="#2319dc"/>
        </svg>
      );
    case 'Bing':
      return (
        <svg className="w-4 h-4" viewBox="0 0 234 343.41" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <defs>
            <linearGradient id="a" x1="-29.25" y1="662.02" x2="-23.09" y2="658.46" gradientTransform="matrix(24.45, 0, 0, -24.45, 967.18, 16420.97)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#37bdff"/>
              <stop offset="0.18" stopColor="#33bffd"/>
              <stop offset="0.36" stopColor="#28c5f5"/>
              <stop offset="0.53" stopColor="#15d0e9"/>
              <stop offset="0.55" stopColor="#12d1e7"/>
              <stop offset="0.59" stopColor="#1cd2e5"/>
              <stop offset="0.77" stopColor="#42d8dc"/>
              <stop offset="0.91" stopColor="#59dbd6"/>
              <stop offset="1" stopColor="#62dcd4"/>
            </linearGradient>
            <linearGradient id="b" x1="-32.86" y1="656.68" x2="-23.89" y2="656.68" gradientTransform="matrix(24.45, 0, 0, -24.45, 967.18, 16420.97)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#39d2ff"/>
              <stop offset="0.15" stopColor="#38cefe"/>
              <stop offset="0.29" stopColor="#35c3fa"/>
              <stop offset="0.43" stopColor="#2fb0f3"/>
              <stop offset="0.55" stopColor="#299aeb"/>
              <stop offset="0.58" stopColor="#2692ec"/>
              <stop offset="0.76" stopColor="#1a6cf1"/>
              <stop offset="0.91" stopColor="#1355f4"/>
              <stop offset="1" stopColor="#104cf5"/>
            </linearGradient>
            <linearGradient id="c" x1="-31.2" y1="655.9" x2="-31.2" y2="667.89" gradientTransform="matrix(24.45, 0, 0, -24.45, 967.18, 16420.97)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1b48ef"/>
              <stop offset="0.12" stopColor="#1c51f0"/>
              <stop offset="0.32" stopColor="#1e69f5"/>
              <stop offset="0.57" stopColor="#2190fb"/>
              <stop offset="1" stopColor="#26b8f4"/>
            </linearGradient>
          </defs>
          <path d="M397,303.4a92.73,92.73,0,0,1-24.84,63.16,41.81,41.81,0,0,0,4.5-6,38.11,38.11,0,0,0,2.69-5.08,17.7,17.7,0,0,0,.74-1.78,17.25,17.25,0,0,0,.65-1.78c.21-.56.39-1.14.55-1.72s.33-1.2.46-1.81l.07-.21c.14-.6.25-1.2.37-1.81s.23-1.25.33-1.88v0c.09-.58.16-1.16.21-1.76a40,40,0,0,0,.21-4.13A41.41,41.41,0,0,0,377,317.11a36.51,36.51,0,0,0-2.85-4.17,39.93,39.93,0,0,0-4-4.43,41.45,41.45,0,0,0-12.36-8.28,38.78,38.78,0,0,0-6.22-2.14l-.09,0-.74-.25-10.81-3.71v0l-28.27-9.72c-.09,0-.21,0-.28,0l-1.77-.65A26.23,26.23,0,0,1,296.29,272L286,245.62l-11.83-30.16-2.27-5.82-.58-1.18a13.35,13.35,0,0,1-1-5.08,12,12,0,0,1,0-1.35,13.19,13.19,0,0,1,18.26-10.79l52.69,27,10.39,5.31A91.11,91.11,0,0,1,367,235a92.45,92.45,0,0,1,29.79,61.87C396.91,299.06,397,301.22,397,303.4Z" transform="translate(-163 -82.94)" fill="url(#a)"/>
          <path d="M382.91,338.56a42.8,42.8,0,0,1-.72,7.82c-.14.67-.28,1.35-.44,2-.3,1.2-.62,2.36-1,3.53-.21.6-.42,1.2-.65,1.78s-.49,1.18-.74,1.78a38.1,38.1,0,0,1-2.69,5.08,42.22,42.22,0,0,1-4.5,6c-7.68,8.49-33.75,23.63-43.36,29.79l-21.33,13c-15.63,9.63-30.41,16.45-49,16.91-.88,0-1.74,0-2.6,0-1.2,0-2.39,0-3.57-.07a92.86,92.86,0,0,1-74.92-43.17,91.58,91.58,0,0,1-13.68-38.67,41.13,41.13,0,0,0,60,28.95l.14-.07,2.09-1.25,8.49-5,10.81-6.4v-.3l1.39-.83,96.71-57.29,7.44-4.41.74.25.09,0a38.31,38.31,0,0,1,6.22,2.14,41.45,41.45,0,0,1,12.36,8.28,40,40,0,0,1,4,4.43,37,37,0,0,1,2.85,4.17A41.64,41.64,0,0,1,382.91,338.56Z" transform="translate(-163 -82.94)" fill="url(#b)"/>
          <path d="M245.24,147.35l0,213.29L234.39,367l-8.5,5-2.09,1.27a.24.24,0,0,0-.13.06,41.13,41.13,0,0,1-60-28.94c-.16-.89-.28-1.81-.38-2.7-.13-1.68-.22-3.33-.25-5v-240a13.77,13.77,0,0,1,21.46-11.41l42.07,27.48a5.55,5.55,0,0,0,.73.51A41.14,41.14,0,0,1,245.24,147.35Z" transform="translate(-163 -82.94)" fill="url(#c)"/>
        </svg>
      );
      case 'Yandex':
        return (
          <svg className="w-4 h-4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M104.187 109.659C113.132 128.751 115.512 135.317 115.512 158.584V189.024H84.4885V137.696L26 10H58.2243L104.176 109.659H104.187ZM142.371 10L104.176 96.5265H135.805L174.001 10H142.371Z" fill="#FC3F1D"/>
          </svg>
        );
      case 'ChatGPT':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5346 3.0137zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>
        );
      case 'Perplexity':
        return (
          <svg className="w-4 h-4" viewBox="0 0 512 510" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M384.707 78.9356L289.136 159.752H384.707V78.9356ZM268.396 146.455L408.304 28.1462V159.752H453V358.558H399.312V483.319L268.399 363.191V479.554H244.802V363.246L110.904 482.798V358.558H58.9985V159.752H112.688V27.2383L244.802 145.005V29.7306H268.399L268.396 146.455ZM227.908 183.349C179.454 183.377 131.024 183.349 82.5954 183.349V334.961H110.894V297.367L227.908 183.349ZM285.358 183.349L399.312 297.464V334.961H429.403V183.349C381.418 183.349 333.377 183.377 285.358 183.349ZM225.927 159.752L136.285 79.8449V159.752H225.927ZM244.802 331.743V199.779L134.501 307.23V430.226L244.802 331.743ZM268.717 200.026V331.522L375.715 429.705C375.715 388.834 375.699 348 375.699 307.133L268.717 200.026Z" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
  }
};

export function SearchBar({ 
  placeholder = "搜索书签...", 
  onSearch, 
  currentEngine = "Bookmarks", 
  onEngineChange, 
  currentCollection = 'all', 
  onCollectionChange 
}: SearchBarProps) {
  const engines = ["Bookmarks", "Web Search", "AI Search"];
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchEngine, setCurrentSearchEngine] = useState("Google");
  const [currentAIEngine, setCurrentAIEngine] = useState("ChatGPT");

  const aiSearchEngines: { [key: string]: string } = {
    ChatGPT: "https://chatgpt.com/?q=",
    Perplexity: "https://www.perplexity.ai/?q=",
    ThinkAny: "https://thinkany.so/search?q=",
    "秘塔": "https://metaso.cn/?q=",
    "360AI搜索": "https://www.sou.com/?q="
  };

  useEffect(() => {
    if (currentEngine && currentEngine !== "Bookmarks") {
      setInputValue("");
    }
  }, [currentEngine]);

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      onSearch?.("", currentCollection);
      setInputValue("");
      return;
    }
    
    if (currentEngine === "Bookmarks") {
      setIsSearching(true);
      try {
        onSearch?.(inputValue.trim(), currentCollection);
      } finally {
        setIsSearching(false);
      }
    } else if (currentEngine === "Web Search") {
      const searchUrls: { [key: string]: string } = {
        Google: `https://www.google.com/search?q=${encodeURIComponent(inputValue)}`,
        Baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(inputValue)}`,
        Bing: `https://www.bing.com/search?q=${encodeURIComponent(inputValue)}`,
        Yandex: `https://yandex.com/search/?text=${encodeURIComponent(inputValue)}`
      };
      
      const url = searchUrls[currentSearchEngine];
      if (url) {
        window.open(url, '_blank');
      }
    } else if (currentEngine === "AI Search") {
      const url = aiSearchEngines[currentAIEngine as keyof typeof aiSearchEngines];
      if (url) {
        window.open(url + encodeURIComponent(inputValue), '_blank');
      }
    }
  };

  const handleEngineChange = (engine: string) => {
    if (engine === "Web Search") {
      onEngineChange?.(engine);
      if (!currentSearchEngine) {
        setCurrentSearchEngine("Google");
      }
    } else {
      onEngineChange?.(engine);
    }
    setIsFocused(true);
    editorRef.current?.focus();
  };

  const handleSearchEngineChange = (engine: string) => {
    setCurrentSearchEngine(engine);
    onEngineChange?.("Web Search");
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const value = e.currentTarget.textContent || '';
    setInputValue(value);
  };

  useEffect(() => {
    if (editorRef.current) {
      // 确保 div 的内容与 inputValue 同步
      if (editorRef.current.textContent !== inputValue) {
        editorRef.current.textContent = inputValue;
      }
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const { settings, loading } = useSettings('feature');

  // 如果正在加载或搜索功能被禁用，直接返回 null
  if (loading || settings?.enableSearch === 'false' || !settings?.enableSearch) {
    return null;
  }

  return (
    <div className="relative w-full max-w-[600px]">
      <div className="flex gap-1 pl-4">
        {engines.map((engine) => (
          <button 
            key={engine}
            className={`px-3 py-1 text-sm rounded-t-lg transition-all ${
              currentEngine === engine 
                ? "bg-black text-white font-medium shadow-sm" 
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => handleEngineChange(engine)}
            aria-pressed={currentEngine === engine}
          >
            {engine}
          </button>
        ))}
      </div>
      
      <div className="relative w-full flex flex-col">
        <div className="relative flex-1">
          <Search 
            className={`
              absolute left-3 top-4 h-4 w-4 text-muted-foreground
              transition-all duration-300 ease-in-out
              ${inputValue || isFocused 
                ? 'opacity-0 -translate-x-4' 
                : 'opacity-100 translate-x-0'
              }
            `} 
          />
          
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              className={`
                outline-none border rounded-xl w-full text-sm
                ${!inputValue && !isFocused ? 'pl-10' : 'pl-4'} 
                pr-12 
                ${isFocused || inputValue ? 'pb-12' : 'pb-3'}
                pt-3
                focus:ring-1 focus:ring-black/5
                hide-scrollbar
                transition-all duration-200 ease-in-out
              `}
              style={{
                whiteSpace: 'pre-wrap',
                overflowY: 'auto',
                overflowX: 'hidden',
                wordBreak: 'break-word',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                height: isFocused || inputValue ? '8rem' : '3rem',
                minHeight: isFocused || inputValue ? '8rem' : '3rem',
                maxHeight: isFocused || inputValue ? '12rem' : '3rem'
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              role="textbox"
              aria-multiline="true"
              aria-label={placeholder}
            />

            {(isFocused || inputValue) && (
              <div 
                className={`
                  absolute bottom-[12px] left-4 flex items-center gap-4 py-1 w-[calc(100%-3rem)]
                  transition-all duration-300 ease-in-out
                  ${isFocused || inputValue
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                  }
                `}
                style={{
                  background: 'linear-gradient(to bottom, transparent, white 15%, white)',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  paddingBottom: '0.75rem',
                  marginBottom: '-0.75rem',
                  height: '3rem',
                  clipPath: 'inset(0 0 1px 0)',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {currentEngine === "Bookmarks" && (
                  <div className="flex items-center gap-2">
                    {[
                      { value: 'all', label: 'All Collections' },
                      { value: 'current', label: 'Current Collection' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`
                          text-sm flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                          ${currentCollection === option.value
                            ? "bg-gray-100 border border-gray-200 text-black font-medium" 
                            : "text-gray-600 border border-gray-100 hover:border-gray-200"
                          }
                        `}
                        onClick={() => onCollectionChange?.(option.value as 'all' | 'current')}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentEngine === "Web Search" && (
                  <div className="flex items-center gap-2">
                    {['Google', 'Bing', 'Yandex', 'Baidu'].map((engine) => (
                      <button 
                        key={engine}
                        className={`
                          text-sm flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                          ${currentSearchEngine === engine 
                            ? "bg-gray-100 border border-gray-200 text-black font-medium" 
                            : "text-gray-600 border border-gray-100 hover:border-gray-200"
                          }
                        `}
                        onClick={() => handleSearchEngineChange(engine)}
                      >
                        <SearchEngineIcon engine={engine} />
                        {engine}
                      </button>
                    ))}
                  </div>
                )}

                {currentEngine === "AI Search" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.keys(aiSearchEngines).map((engine) => (
                      <button 
                        key={engine}
                        className={`
                          text-sm flex items-center gap-2 px-3 py-1.5 rounded-full transition-all
                          ${currentAIEngine === engine 
                            ? "bg-gray-100 border border-gray-200 text-black font-medium" 
                            : "text-gray-600 border border-gray-100 hover:border-gray-200"
                          }
                        `}
                        onClick={() => setCurrentAIEngine(engine)}
                      >
                        <SearchEngineIcon engine={engine} />
                        {engine}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div 
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: isFocused || inputValue
                  ? `translateY(20px)`
                  : 'translateY(-50%)',
                zIndex: 20
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div 
                className="bg-black rounded-full p-1.5 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={handleSearch}
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 