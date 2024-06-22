/*
* 合并转换「浏览器书签」+「inftab 新标签页」书签
*
* 代码相关：
* 转换 「inftab 新标签页」书签 为 pintree 中单独的一个文件夹大类。
* 调用方法：实例化 inftabToPintree类，调用其 convert方法。
* 调用代码：new inftabToPintree(jsonString).convert();
* 其输出的结果类型为 JSON Object。
* 在原有的json-converter.js代码基础上，额外把 inftab书签 push进去。
*
* 制作背景：
* 浏览器书签量巨大，重要性由低到高，鱼龙混杂，平时看到只要有点用的页面都会存储。
* 没有根据优先级和需要进行摘选，书签量巨大的情况下，使用时极为不便。
* 而此「inftab书签」是作为浏览器书签的补充而存在，是对浏览器书签的优选和精选。
* 当然最重要原因是之前一直在使用「inftab 新标签页」，其项目地址：https://inftab.com/。
* 此项目运维在别人手上，我没有控制权，不能保证它长久支持，故导出其数据，适配开源的 pintree 以备不时之需。
*/
class inftabToPintree {
    constructor(json) {
      this.json = JSON.parse(json);
      this.now = new Date().getTime();
    }
  
    // 转换为 pintree 的时间单位
    timestampConvert(time){
      return Math.floor(time / 1000);
    }
  
    // 将 「inftab 新标签页」书签 以独立的一个大文件夹类别来显示。
    parentFolder(){
      return {
        type: 'folder',
        addDate: this.timestampConvert(this.json.time),
        lastModified: this.timestampConvert(this.now),
        title: 'inftab书签',
        "children": []
      }
    }
  
    // 转换为 pintree 格式的文件夹
    transformFolder(data){
      const [time, title, infinityLinks] = [data.updatetime ,data.name, data.children];
      const pintreeFolder = {
        type: 'folder',
        addDate: this.timestampConvert(time),
        lastModified: this.timestampConvert(this.now),
        title: title,
        "children": []
      }
      for(let i=0; i < infinityLinks.length; i++){
        const pintreeLink = this.transformLink(infinityLinks[i]);
        if(pintreeLink){ pintreeFolder.children.push(pintreeLink); }
      }
      return pintreeFolder;
    }
    
    // 转换为 pintree 格式的链接
    transformLink(data){
      const [type, time, title, icon, url] = [data.type, data.updatetime, data.name, data.bgImage, data.target];
      if(type !== 'app'){
        return {
          type: 'link',
          addDate: this.timestampConvert(time),
          title: title,
          icon: icon,
          url: url,
        }
      }
    }
  
    // 输出最终的转换结果
    convert() {
      const parentFolder = [this.parentFolder()];
      const infinityDatas = this.json.data.site.sites[0];
      for(let i=0; i<infinityDatas.length; i++){
        const infinityData = infinityDatas[i];
        if(infinityData.children){
          const pintreeFolder = this.transformFolder(infinityData);
          parentFolder[0].children.push(pintreeFolder);
        } else {
          const pintreeLink = this.transformLink(infinityData);
          if(pintreeLink){ parentFolder[0].children.push(pintreeLink); }
        }
      }
      return parentFolder.join(''); // 输出 Object
    }
  }
  


// 扩展 String 对象，添加 remove 方法
String.prototype.remove = function (toRemove) {
    if (Array.isArray(toRemove)) {
      return toRemove.reduce((acc, value) => acc.replace(value, ''), this);
    }
    if (typeof toRemove === 'string') {
      return this.replace(toRemove, '');
    }
    return this;
  };
  
  // 清理对象，删除值为 undefined 的属性
  const cleanupObject = (obj) => {
    Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));
    return obj;
  };
  
  // 判断是否为文件夹
  const isFolder = (item) => !!item.match(/<H3.*>.*<\/H3>/);
  
  // 判断是否为链接
  const isLink = (item) => !!item.match(/<A.*>.*<\/A>/);
  
  // 获取标题
  const getTitle = (item) => item.match(/<(H3|A).*>(.*)<\/(H3|A)>/)?.[2];
  
  // 获取图标
  const getIcon = (item) => item.match(/ICON="(.+)"/)?.[1];
  
  // 获取URL
  const getUrl = (item) => item.match(/HREF="([^"]*)"/)?.[1];
  
  // 获取数值属性
  const getNumericProperty = (item, property) => {
    const match = item.match(new RegExp(`${property}="([\\d]+)"`));
    return match ? parseInt(match[1]) : undefined;
  };
  
  // 转换链接为对象
  const transformLink = (markup) =>
    cleanupObject({
      type: 'link',
      addDate: getNumericProperty(markup, 'ADD_DATE'),
      title: getTitle(markup),
      icon: getIcon(markup),
      url: getUrl(markup),
    });
  
  // 转换文件夹为对象
  const transformFolder = (markup) =>
    cleanupObject({
      type: 'folder',
      addDate: getNumericProperty(markup, 'ADD_DATE'),
      lastModified: getNumericProperty(markup, 'LAST_MODIFIED'),
      title: getTitle(markup),
    });
  
  // 查找指定缩进级别的项目
  const findItemsAtIndentLevel = (markup, level) =>
    markup.match(new RegExp(`^\\s{${level * 4}}<DT>(.*)[\r\n]`, 'gm'));
  
  // 查找指定缩进级别的链接
  const findLinks = (markup, level) => findItemsAtIndentLevel(markup, level).filter(isLink);
  
  // 查找指定缩进级别的文件夹
  const findFolders = (markup, level) => {
    const folders = findItemsAtIndentLevel(markup, level);
    return folders?.map((folder, index) => {
      const isLastOne = index === folders.length - 1;
      return markup.substring(
        markup.indexOf(folder),
        isLastOne ? undefined : markup.indexOf(folders[index + 1]),
      );
    });
  };
  
  // 查找子项目
  const findChildren = (markup, level = 1) => {
    if (findItemsAtIndentLevel(markup, level)) {
      const links = findLinks(markup, level);
      const folders = findFolders(markup.remove(links), level);
      return [...(links || []), ...(folders || [])];
    }
  };
  
  // 处理子项目
  const processChild = (child, level = 1) => {
    if (isFolder(child)) return processFolder(child, level);
    if (isLink(child)) return transformLink(child);
  };
  
  // 处理文件夹及其子项目
  const processFolder = (folder, level) => {
    const children = findChildren(folder, level + 1);
    return cleanupObject({
      ...transformFolder(folder),
      children: children?.map((child) => processChild(child, level + 1))?.filter(Boolean),
    });
  };
  
  // 将书签转换为JSON格式
  const bookmarksToJSON = (markup, { stringify = true, formatJSON = false, spaces = 2 } = {}) => {
    const obj = findChildren(markup)?.map(child => processChild(child));
    if (!stringify) return obj;
    return JSON.stringify(obj, ...(formatJSON ? [null, spaces] : []));
  };


    // 额外增加的文件输入逻辑
  const inftabFileInput = document.getElementById('inftabFileInput');
  const inftabFileNameDisplay = document.getElementById('inftabFileInputLabel');

  inftabFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(file){
        const fileSize = `( Size: ${formatFileSize(file.size / 1024)} )`;
        inftabFileNameDisplay.innerHTML = file.name + fileSize;
    }
  });

    // 处理文件输入和拖放上传的交互逻辑
  const fileInput = document.getElementById('fileInput');
  const fileNameDisplay = document.getElementById('fileName');
  const fileSizeDisplay = document.getElementById('fileSize');
  const dropZone = document.getElementById('dropZone');
  const uploadButton = document.getElementById('uploadButton');
  const statusIndicator = document.getElementById('status');
  const fileDetails = document.getElementById('fileDetails');
  
  // 根据文件大小选择合适的单位
  const formatFileSize = (size) => {
    return size > 1024 ? `${(size / 1024).toFixed(2)} MB` : `${size.toFixed(2)} KB`;
  };
  
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const fileName = file ? file.name : 'Choose file';
    fileNameDisplay.textContent = fileName;
    if (file) {
        if (file.type !== 'text/html') {
            alert('Please re-upload the bookmarks file in html format');
            fileInput.value = ''; // 清空文件输入
            fileNameDisplay.textContent = 'Choose file';
            fileSizeDisplay.style.display = 'none';
            uploadButton.style.display = 'none';
            fileDetails.style.display = 'none';
            return;
        }
        fileSizeDisplay.textContent = `Size: ${formatFileSize(file.size / 1024)}`;
        fileSizeDisplay.style.display = 'block';
        uploadButton.style.display = 'inline-flex';
        statusIndicator.style.display = 'none'; // 隐藏状态指示器
        fileDetails.style.display = 'flex'; // 显示文件详细信息
    } else {
      fileSizeDisplay.style.display = 'none';
      uploadButton.style.display = 'none';
      fileDetails.style.display = 'none';
    }
    uploadButton.textContent = 'Convert';
  });
  
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      const file = files[0];
      const fileName = file.name;
      fileNameDisplay.textContent = fileName;
      if (file.type !== 'text/html') {
        alert('Please re-upload the bookmarks file in html format');
        fileInput.value = ''; // 清空文件输入
        fileNameDisplay.textContent = 'Choose file';
        fileSizeDisplay.style.display = 'none';
        uploadButton.style.display = 'none';
        fileDetails.style.display = 'none';
        return;
      }
      fileSizeDisplay.textContent = `Size: ${formatFileSize(file.size / 1024)}`;
      fileSizeDisplay.style.display = 'block';
      uploadButton.style.display = 'inline-flex';
      statusIndicator.style.display = 'none'; // 隐藏状态指示器
      fileDetails.style.display = 'flex'; // 显示文件详细信息
      uploadButton.textContent = 'Convert';
    }
  });
  
  uploadButton.addEventListener('click', async () => {
    if (!fileInput.files.length) {
      alert('Please select a file first.');
      return;
    }
  
    uploadButton.style.display = 'none';
    statusIndicator.className = 'group gap-2 inline-flex items-center justify-center rounded-full py-2 px-6 text-sm font-semibold text-green-600';
    statusIndicator.textContent = 'Uploading...';
    statusIndicator.style.display = 'inline-flex';
    await new Promise((resolve) => setTimeout(resolve, 1000));  // 模拟文件上传
  
    statusIndicator.className = 'group gap-2 inline-flex items-center justify-center rounded-full py-2 px-6 text-sm font-semibold text-green-600';
    statusIndicator.textContent = 'Uploaded 100%';
    await new Promise((resolve) => setTimeout(resolve, 1000));  // 模拟文件处理
  
    statusIndicator.className = 'group gap-2 inline-flex items-center justify-center rounded-full py-2 px-6 text-sm font-semibold text-green-600';
    statusIndicator.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
      <circle class="opacity-25" cx="8" cy="8" r="5" stroke="currentColor" stroke-width="2"></circle>
  </svg>
      Initializing...`;
  
    const file = fileInput.files[0];
    const text = await file.text();

    // 修改变量名
    const browserJson = bookmarksToJSON(text, { stringify: true, formatJSON: true, spaces: 2 });
    let json = '';

    // 额外增加的逻辑
    const inftabFile = inftabFileInput.files[0];
    if(inftabFile){
        const inftabText = await inftabFile.text(); 
        const inftabJson = new inftabToPintree(inftabText).convert();
        json = JSON.parse(browserJson);
        json.push(inftabJson);
        json = JSON.stringify(json);
    }

    // 维持不变
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const jsonSize = formatFileSize(blob.size / 1024); // 计算JSON文件大小
  
    statusIndicator.className = 'group gap-2 inline-flex items-center justify-center rounded-full py-2 px-6 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-green-600 text-white hover:text-white hover:bg-green-700 active:bg-green-700 active:text-green-100 focus-visible:outline-green-600';
    statusIndicator.innerHTML = `<a href="${url}" download="pintree.json">Download JSON</a>`;
    fileNameDisplay.textContent = 'pintree.json';
    fileSizeDisplay.textContent = `Size: ${jsonSize}`;
  });