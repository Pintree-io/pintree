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
  depth: number; // 添加深度属性
}

export function createFlattenBookmarks(
  items: BookmarkItem[]
): FlattenedBookmarkItem[] {
  const result: FlattenedBookmarkItem[] = [];
  let globalIndex = 0;

  function processItem(
    item: BookmarkItem,
    parentId?: string,
    depth: number = 0
  ) {
    // 生成唯一ID
    const currentId = `${depth}_${globalIndex}`;
    globalIndex++;

    // 创建当前项
    const flatItem: FlattenedBookmarkItem = {
      id: currentId,
      type: item.type,
      title: item.title,
      parentId: parentId,
      sortOrder: result.length,
      addDate: item.addDate,
      url: item.type === "link" ? item.url : undefined,
      icon: item.type === "link" ? item.icon : undefined,
      depth: depth // 记录深度
    };

    // 如果是文件夹，先添加文件夹本身
    if (item.type === "folder") {
      result.push(flatItem);
      // 然后处理子项
      if (item.children) {
        item.children.forEach(child => {
          processItem(child, currentId, depth + 1);
        });
      }
    } else {
      // 如果是链接，直接添加
      result.push(flatItem);
    }
  }

  // 处理所有顶层项目
  items.forEach(item => processItem(item));

  // 分别获取文件夹和链接
  const folders = result.filter(item => item.type === "folder");
  const links = result.filter(item => item.type === "link");

  // 对文件夹按深度和原始顺序排序
  const sortedFolders = folders.sort((a, b) => {
    if (a.depth !== b.depth) {
      return a.depth - b.depth;
    }
    return a.sortOrder - b.sortOrder;
  });

  // 返回排序后的文件夹加上原始顺序的链接
  return [...sortedFolders, ...links];
}