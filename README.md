# Pintree

Pintree 是一个开源项目，旨在将浏览器书签导出成导航网站。通过简单的几步操作，就可以将书签转换成一个美观且易用的导航页面。

## 项目功能和目标

- 导出浏览器书签
- 将书签文件转换成JSON格式
- 生成静态导航网站

#### 对这个项目感兴趣可以扫码加群，也可以添加我的微信: ```Gift_wei``` 我拉你进开发群
![](/assets/wechat_group.png)

本项目还没有正式发布，但是已经可以下载测试了，下面是一个简单的教程，按照下面流程操作即可

## 安装和运行

### 步骤 1：Fork 项目

在这个页面的右上角，点击 `Fork` 按钮，将项目 Fork 到您的 GitHub 账号中。

### 步骤 2：下载浏览器书签

1. 打开 Chrome 浏览器。
2. 在地址栏输入 `chrome://bookmarks/` 并按回车键。
3. 在页面右上角，点击三点菜单，选择 `导出书签`。
4. 将书签文件保存到您的电脑上。

### 步骤 3：书签文件转换

1. 打开浏览器，访问 [Pintree JSON Converter](https://pintree.io/json-converter) 网站。
2. 点击 `选择文件` 按钮，选择刚才保存的书签文件（HTML 格式）。
3. 点击 `转换` 按钮，网站会自动将书签文件转换为 JSON 格式。
4. 转换完成后，点击 `下载 JSON 文件`，将转换后的文件下载到您的电脑上。

### 步骤 4：替换 JSON 文件

1. 打开您的 GitHub 账号中的 `pintree` 仓库（即刚才 Fork 的项目）。
2. 点击仓库中的 `json` 文件夹。
3. 点击 `Upload files` 按钮，选择刚才下载的 JSON 文件，并上传。
4. 确保上传的文件命名为 `pintree.json`，并选择 `Commit changes`。

### 步骤 5：启用 GitHub Pages

1. 在您的 `pintree` 仓库页面，点击 `Settings`。
2. 找到 `Pages` 选项。
3. 在 `Source` 下拉菜单中，选择 `gh-pages` 分支，然后点击 `Save`。
4. 几分钟后，您的静态网站将会在 `https://yourusername.github.io/pintree` 上可用。记得替换`yourusername`

---

通过以上步骤，您已经成功完成了 Pintree 项目的安装和运行。如果有任何问题，可以加群获取更多帮助。
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

感谢使用和支持！
