# pintree

## 产品介绍

Pintree 是一个强大的书签管理平台，旨在帮助用户轻松创建、管理和分享个性化的书签集合。通过 Pintree，用户可以高效地组织信息资源，并与他人分享有价值的内容。

## 产品功能

- 书签集合管理: 用户可以创建多个书签集合（Collection），每个集合可以包含多个文件夹和书签。支持书签的标记、排序和分类，方便用户查找和管理。
- 统计分析: 提供书签集合和单个书签的访问量统计，帮助用户了解书签的使用情况。
- 社交分享: 用户可以通过链接分享他们的书签集合，方便与他人交流和分享资源。

## 网站功能

- 多集合切换: 用户可以在不同的书签集合之间切换，查看和管理不同的内容。
- 内容展示: 提供多种展示样式和排序方式，用户可以根据需要自定义书签的展示效果。

## 后台管理系统

基础配置: 支持网站基本信息的设置，如 logo、favicon、title、description 等。
- 用户管理: 提供用户的新增、编辑和删除功能，方便管理员管理用户权限。
- 权限管理: 支持权限的新增、编辑和删除，确保网站的安全性和数据的私密性。
- 导入导出: 支持书签的导入和导出功能，方便用户进行数据迁移和备份。


## 定义

- Collection：书签集合，一个Collection可以包含多个文件夹，一个文件夹可以包含多个书签
- Bookmark：书签，一个Bookmark属于一个Collection，一个Bookmark属于一个文件夹
- Folder：文件夹，一个Folder属于一个Collection，一个Folder可以包含多个Bookmark和子Folder
- Tag：标签，一个Tag可以属于一个Bookmark，一个Bookmark可以有多个Tag
- 整个网站项目：一个网站项目可以有多个Collection


## Pintree网站功能（pintree.io）任何用户通过链接都可以访问

- 切换查看不同的Collection
- 查看Collection的内容

### 其他

- 社交媒体
- 关于

## Admin后台管理系统，登录之后的功能（pintree.io/admin）链接并不展示给用户

### 基础配置

- 设置网站的logo的url
- 设置网站的favicon的url
- 设置网站的title
- 设置网站的description
- 设置网站的keywords
- 设置网站的author
- 设置网站的robots
- 设置网站的google analytics
- 设置网站的facebook meta tags
- 设置网站的twitter meta tags
- 设置网站的umami analytics
- 设置网站的plausible analytics
- 设置网站的clarity analytics
- 设置网站的gtag analytics
- 设置社交媒体链接
- 设置网站的版权信息
- 设置网站的备案信息
- 设置网站的备案号
- 设置网站的备案号链接

### 用户管理

- 新增用户
- 编辑用户
- 删除用户

### 权限管理

- 新增权限
- 编辑权限
- 删除权限

### 导入导出

- 上传Html书签导入到新建bookmark collection
- 导出bookmark collection为Html文件

### bookmark collection 管理

- 新增不同的bookmark collection
- 编辑bookmark collection
    - 编辑bookmark collection的Name
    - 编辑bookmark collection的Slug
    - 编辑bookmark collection的icon
    - 删除bookmark collection
    - 设置bookmark collection的排序等级
- 设置bookmark collection的访问权限（公开、密码访问）
- 设置某个collection中的书签展示样式（列表、卡片）
- 设置某个collection中的书签排序方式（按字母、按添加时间、按排序）

### 某个 bookmark collection 中的文件夹管理

- 新增文件夹
- 编辑文件夹
- 删除文件夹
- 设置文件夹的排序等级
- 设置文件夹的访问权限（公开、密码访问）
- 设置文件夹的密码
- 设置文件夹的icon

### 某个 bookmark collection 中的 bookmark 管理

- 添加书签
- 编辑书签
    - 编辑title
    - 编辑url
    - 编辑description
    - 编辑icon的Url
    - 编辑Update Date
    - 编辑是不是推荐(Featured)书签，是推荐书签则显示在最前面，并且书签样式会不一样
    - 移动到不同的bookmark collection
    - 编辑bookmark的排序等级
    - 编辑bookmark的所属文件夹
    - 编辑bookmark的Tag标签
    - 删除bookmark
- AI一键生成标题标签，描述
- 设置bookmark的排序

### 统计

- 统计bookmark collection的访问量
- 统计bookmark的访问量

### 退出登录

### 反馈

- 反馈问题
- 查看反馈
- 删除反馈

### 其他

- 社交媒体
- 关于
- 查看日志
- 系统信息

## Vercel环境变量

# 技术方案

## 技术栈

1. **前端框架**: 使用 Next.js 进行开发，提供高效的服务端渲染和静态网站生成功能。

2. **部署平台**: 使用 Vercel 进行部署，Vercel 是 Next.js 的官方托管平台，提供了无缝的部署体验。

3. **数据库**: 使用 Zeabur 提供的 PostgreSQL 数据库服务，按量计费，灵活扩展。

4. **AI 功能**: 使用 OpenAI API 实现 AI 一键生成标题、标签和描述的功能，提升用户体验。

5. **用户认证**: 使用 NextAuth.js 提供的用户认证服务，实现简单可靠的管理员登录功���。

6. **域名管理**: 使用 Cloudflare 购买和管理域名，提供 DNS 管理和安全防护。

## 详细说明

- **Next.js**: 作为前端框架，Next.js 提供了强大的功能，如动态路由、API 路由、静态文件支持等，适合构建现代 Web 应用。

- **Vercel**: 提供了自动化的 CI/CD 流程，支持自定义域名、SSL 证书、环境变量管理等功能，适合快速迭代和发布。

- **Zeabur PostgreSQL**: 提供高可用性和可靠性的数据库服务，支持自动备份和恢复，按需扩展，适合动态增长的应用需求。

- **OpenAI API**: 通过集成 OpenAI 的 GPT 模型，提供智能化的内容生成功能，提升用户的交互体验。

- **NextAuth.js**: 提供轻量级的认证解决方案，支持多种认证方式，确保管理员登录的安全性。

- **Cloudflare**: 提供快速的 DNS 解析和 DDoS 防护，确保网站的稳定性和安全性。

# Pintree 部署指南

本指南将帮助您从零开始部署和使用 Pintree 项目。

## 步骤 1: 注册必要的服务

1. **GitHub 账户**
   - 访问 [GitHub](https://github.com) 并注册一个账户。
   - 在 GitHub 上 fork Pintree 的开源项目到您的仓库。

2. **Vercel 账户**
   - 访问 [Vercel](https://vercel.com) 并注册一个账户。
   - 授权 Vercel 访问您的 GitHub 账户，以便从 GitHub 仓库中获取 Pintree 项目代码。

3. **域名注册**
   - 在域名注册商（如 [Cloudflare](https://www.cloudflare.com)）注册一个域名。

4. **数据库服务**
   - 在 [Zeabur](https://zeabur.com) 或其他 PostgreSQL 提供商上注册并创建一个数据库实例。
   - 获取数据库的连接信息，包括主机名、端口、数据库名称、用户名和密码。

## 步骤 2: 准备环境变量

在 Vercel 项目中配置以下环境变量：

- `DATABASE_URL`: PostgreSQL 数据库的连接字符串，格式为 `postgres://username:password@hostname:port/dbname`
- `OPENAI_API_KEY`: OpenAI API 的密钥，用于 AI 功能
- `NEXTAUTH_SECRET`: NextAuth.js 的密钥，用于加密会话
- `NEXTAUTH_URL`: 网站的完整 URL
- 其他可能需要的环境变量

## 步骤 3: 部署 Pintree

1. **访问 Pintree 官网**
   - 访问 Pintree 的官方网站，找到"一键 Deploy 到 Vercel"按钮。

2. **一键部署到 Vercel**
   - 点击按钮，选择 fork 后的 GitHub 仓库进行部署。

## 步骤 4: 设置域名

1. **在 Vercel 中设置域名**
   - 在 Vercel 的项目设置中，将您的域名绑定到该项目。

2. **在域名注册商中配置 DNS**
   - 在域名注册商（如 Cloudflare）中，配置 DNS 记录，将域名指向 Vercel 提供的 IP 地址。

## 步骤 5: 完成部署并使用 Pintree

- Vercel 会自动构建和部署项目，您可以在自己的域名上访问 Pintree。
- 通过管理员后台配置网站的基本信息、用户管理、权限管理等。
- 开始创建和管理书签集合，使用 Pintree 提供的各种功能。

通过以上步骤，您可以成功部署并使用 Pintree 项目。

## Pintree 浏览器插件

### 插件功能

Pintree 浏览器插件提供了便捷的书签导入功能，帮助用户快速将浏览器中的书签导入到自己部署的 Pintree 实例中。

#### 核心功能
- 一键导入所有浏览器书签
- 选择性导入指定文件夹
- 保持原有的文件夹结构
- 实时显示导入进度
- 导入结果统计和反馈

#### 数据处理
- 自动去重处理
- 保留原有文件夹层级
- 保留书签原始信息（标题、URL、创建时间等）
- 支持中断后续传

### 使用方法

1. **安装插件**
   - 从 Chrome 应用商店安装 Pintree 插件
   - 从 Firefox 附加组件商店安装 Pintree 插件

2. **导入书签**
   - 登录您部署的 Pintree 网站
   - 点击浏览器工具栏中的 Pintree 插件图标
   - 选择要导入的书签范围
   - 确认导入

3. **查看结果**
   - 查看导入进度
   - 确认导入完成状态
   - 查看导入统计信息

### 插件权限说明

插件需要以下权限：
- 读取浏览器书签数据
- 访问当前标签页

### 注意事项

- 使用插件前请确保已登录您的 Pintree 实例
- 大量书签导入可能需要一定时间
- 建议定期备份重要书签数据

