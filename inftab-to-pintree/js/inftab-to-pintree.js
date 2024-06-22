/*
* 只转换「inftab 新标签页」书签
*
* 代码相关：
* 转换 「inftab 新标签页」书签 为 pintree 中单独的一个文件夹大类。
* 调用方法：实例化 inftabToPintree类，调用其 convert方法。
* 调用代码：new inftabToPintree(jsonString).convert();
* 最终输出的结果类型为 JSON String。
* 只单纯的输出转换后的「inftab 新标签页」书签。
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
    return JSON.stringify(parentFolder); // 输出 Array String
  }
}

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

  // 只输出 inftab 的新逻辑
  const json = new inftabToPintree(text).convert();

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const jsonSize = formatFileSize(blob.size / 1024); // 计算JSON文件大小

  statusIndicator.className = 'group gap-2 inline-flex items-center justify-center rounded-full py-2 px-6 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-green-600 text-white hover:text-white hover:bg-green-700 active:bg-green-700 active:text-green-100 focus-visible:outline-green-600';
  statusIndicator.innerHTML = `<a href="${url}" download="pintree.json">Download JSON</a>`;
  fileNameDisplay.textContent = 'pintree.json';
  fileSizeDisplay.textContent = `Size: ${jsonSize}`;
});