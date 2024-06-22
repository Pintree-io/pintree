# 说明
此文件用来转换「inftab 新标签页」书签 为 pintree 的书签。

### 一共写了两个版本：

1.只单纯的输出转换后的「inftab 新标签页」书签。

![inftab only](assets/screenshots/inftab-to-pintree.png)

2.在原有的json-converter.js代码基础上，额外把 inftab书签 push进去。

![inftab and browser](assets/screenshots/inftab-and-browser-to-pintree.png)


### 制作背景：

浏览器书签量巨大，重要性由低到高，鱼龙混杂，平时看到只要有点用的页面都会存储。
没有根据优先级和需要进行摘选，书签量巨大的情况下，使用时极为不便。
而此「inftab书签」是作为浏览器书签的补充而存在，是对浏览器书签的优选和精选。
当然最重要原因是，之前一直在使用「inftab 新标签页」，其项目地址：https://inftab.com/。
为保持永久可用，故导从其服务器导出数据，适配开源的 pintree 以备不时之需。


### 代码相关：

##### 转换 「inftab 新标签页」书签 为 pintree 中单独的一个文件夹大类。
##### 调用方法：实例化 inftabToPintree类，调用其 convert方法。
##### 调用代码：`new inftabToPintree(jsonString).convert();`。