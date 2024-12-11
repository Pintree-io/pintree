interface BookmarkItem {
    type: "folder" | "link";
    title: string;
    addDate?: number;
    url?: string;
    icon?: string;
    children?: BookmarkItem[];
    parentId?: string;
    id?: string;
  }
  
  interface FlattenedBookmarkItem {
    id: string;
    type: "folder" | "link";
    title: string;
    parentId?: string;
    sortOrder: number;
    addDate?: number;
    url?: string;
    icon?: string;
  }
  
  export function createFlattenBookmarks(
    items: BookmarkItem[]
  ): FlattenedBookmarkItem[] {
    // 分别为 folder 和 link 创建全局计数
    const globalFolderTitleCounts: { [key: string]: number } = {};
    const globalLinkTitleCounts: { [key: string]: number } = {};
  
    return flattenBookmarks(
      items,
      undefined,
      globalFolderTitleCounts,
      globalLinkTitleCounts
    );
  }
  
  function flattenBookmarks(
    items: BookmarkItem[],
    parentId?: string,
    globalFolderTitleCounts: { [key: string]: number } = {},
    globalLinkTitleCounts: { [key: string]: number } = {}
  ): FlattenedBookmarkItem[] {
    let result: FlattenedBookmarkItem[] = [];
    const localFolderTitleCounts: { [key: string]: number } = {};
    const localLinkTitleCounts: { [key: string]: number } = {};
  
    items.forEach((item, index) => {
      // 选择正确的全局和局部计数
      const globalTitleCounts =
        item.type === "folder" ? globalFolderTitleCounts : globalLinkTitleCounts;
  
      const localTitleCounts =
        item.type === "folder" ? localFolderTitleCounts : localLinkTitleCounts;
  
      // 处理重复标题
      let uniqueTitle = item.title;
  
      // 检查全局计数
      if (globalTitleCounts[uniqueTitle] !== undefined) {
        globalTitleCounts[uniqueTitle]++;
        uniqueTitle = `${item.title} (${globalTitleCounts[uniqueTitle]})`;
      } else {
        // 如果全局没有，检查局部计数
        if (localTitleCounts[uniqueTitle] !== undefined) {
          localTitleCounts[uniqueTitle]++;
          uniqueTitle = `${item.title} (${localTitleCounts[uniqueTitle]})`;
        } else {
          localTitleCounts[uniqueTitle] = 0;
        }
  
        // 更新全局计数
        globalTitleCounts[item.title] = globalTitleCounts[item.title] || 0;
      }
  
      // 为每个项目生成唯一ID
      const uniqueId = `${parentId || "root"}_${uniqueTitle}_${item.type}_${index}`;
  
      // 创建扁平化的条目
      const flatItem: FlattenedBookmarkItem = {
        id: uniqueId,
        type: item.type,
        title: uniqueTitle,
        parentId: parentId,
        sortOrder: index,
        addDate: item.addDate,
        url: item.type === "link" ? item.url : undefined,
        icon: item.type === "link" ? item.icon : undefined,
      };
  
      result.push(flatItem);
  
      // 递归处理子项目，传递全局计数
      if (item.children && item.children.length > 0) {
        result = result.concat(
          flattenBookmarks(
            item.children,
            uniqueId,
            globalFolderTitleCounts,
            globalLinkTitleCounts
          )
        );
      }
    });
  
    // 对结果进行排序，确保父文件夹在子文件夹之前
    result.sort((a, b) => {
      // 定义一个内部函数，用于计算项目的嵌套深度
      const getDepth = (item: FlattenedBookmarkItem, items: FlattenedBookmarkItem[]): number => {
        // 如果没有父文件夹ID，深度为0（根层级）
        if (!item.parentId) return 0;
        
        // 在所有项目中查找当前项目的父项目
        const parentItem = items.find(i => i.id === item.parentId);
        
        // 递归计算深度，如果找到父项目则深度加1
        return parentItem ? 1 + getDepth(parentItem, items) : 0;
      };
    
      // 计算两个项目的嵌套深度
      const aDepth = getDepth(a, result);
      const bDepth = getDepth(b, result);
    
      // 按深度升序排序，深度小的项目排在前面
      return aDepth - bDepth;
    });
  
    return result;
  }
  
  // 使用示例
  //   function prepareBookmarksForImport(originalData) {
  //     // 假设 originalData 是原始的嵌套书签数据
  //     const flattenedBookmarks = flattenBookmarks(originalData[0].children);
  
  //     return {
  //       name: originalData[0].title || '未命名收藏夹',
  //       description: '导入的书签集合',
  //       bookmarks: flattenedBookmarks
  //     };
  //   }