# Pintree

Pintree 是一个开源项目，旨在将浏览器书签导出成导航网站。通过简单的几步操作，您可以将书签转换成一个美观且易用的导航页面。

## 项目功能和目标

- 导出浏览器书签
- 将书签文件转换成JSON格式
- 生成静态导航网站

#### 对这个项目感兴趣可以扫码加群，也可以添加我的微信: ```Gift_wei``` 我拉你进开发群
![](/assets/wechat_group.png)

本项目还没有正式发布，但是已经可以下载测试了，下面是一个简单的教程，按照下面流程操作即可

## 安装和运行

请按照以下步骤操作：

### Step 1: 下载项目

将本项目克隆到本地：
```bash
git clone https://github.com/Pintree-io/pintree.git
cd pintree
```

### Step 2: 下载浏览器书签

在Chrome浏览器中输入 `chrome://bookmarks/`，导出书签为HTML文件。

### Step 3: 书签文件转换

前往 [Pintree JSON Converter](https://pintree.io/json-converter) 网站，将下载的HTML书签文件转换成JSON格式。

### Step 4: 替换JSON文件

将转换完成的JSON文件下载下来，替换项目目录中的 `/json/pintree.json` 文件。

### Step 5: 托管静态网站

您可以选择将此静态网站托管到GitHub Pages或您的服务器上。以下是托管到GitHub Pages的简单步骤：

1. 创建一个新的GitHub仓库。
2. 将项目文件推送到GitHub仓库。
3. 在GitHub仓库设置中启用GitHub Pages，选择`main`分支作为来源。

## 使用技术

- HTML/CSS/JavaScript
- JSON格式处理
- 静态网站托管

## 贡献指南

欢迎贡献代码和提出建议！请遵循以下步骤参与项目：

1. Fork本仓库：https://github.com/Pintree-io/pintree/tree/main
2. 创建一个新的分支 (`git checkout -b feature/your-feature`)
3. 提交您的修改 (`git commit -am 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 提交一个Pull Request

请注意，`main` 分支是项目的源代码分支，而 `gh-pages` 分支是打包出来的静态网站代码分支。请在 `main` 分支上进行开发和提交，然后我们会负责将代码打包并发布到 `gh-pages` 分支。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：
- 项目网站: [Pintree](https://pintree.io/)
- Email: viggo.zw@gmail.com
- 微信：```Gift_wei```

感谢您的使用和支持！
