## 🚀 快速部署步骤

### 1. 创建 Neon 数据库
- [![Deploy with Neon](https://img.shields.io/badge/Deploy%20with-Neon-blue?logo=postgresql)](https://console.neon.tech/app/projects/new)
- 免费注册/登录
- 创建项目后，复制 `DATABASE_URL`

### 2. 部署到 Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPintree-io%2Fpintree%2Ftree%2Fpintree-next&env=DATABASE_URL,ADMIN_EMAIL,ADMIN_PASSWORD&project-name=pintree_next&repository-name=pintree_next)

### 3. 粘贴 Neon 的 DATABASE_URL，设置管理员邮箱和密码
- 填写完成后点击部署

### 4. 部署完成后配置额外环境变量
- 进入 Vercel 项目设置
- 添加两个新的环境变量：
  1. `NEXT_PUBLIC_APP_URL`
  2. `NEXTAUTH_URL`
- 这两个变量的值都是你的 Vercel 应用域名
  - 例如：`https://your-app-name.vercel.app`
  - 直接复制 Vercel 生成的域名链接即可

> 💡 提示：如遇到任何问题，请查看项目文档或在 GitHub Issues 中寻求帮助