# Edgeone 部署指南

## 项目概述
这是一个基于 React + TypeScript + Vite 构建的现代化前端应用，已编译为静态资源，可直接部署在 Edgeone 或任何静态网站托管服务上。

## 部署步骤

### 1. 部署文件
将 [dist](file:///D:/AFile/Ai%20%E6%99%BA%E8%83%BD%E4%BD%93/AI%20agent/Mini%20max%20Agent/ai-investment-website/dist) 目录中的所有内容部署到您的 Edgeone 站点根目录：
- [index.html](file:///D:/AFile/Ai%20%E6%99%BA%E8%83%BD%E4%BD%93/AI%20agent/Mini%20max%20Agent/ai-investment-website/dist/index.html)
- [assets](file:///D:/AFile/Ai%20%E6%99%BA%E8%83%BD%E4%BD%93/AI%20agent/Mini%20max%20Agent/memory/assets/) 目录及其所有内容

### 2. 配置说明
- 本项目使用相对路径引用所有静态资源，因此可以部署在任何子目录下而无需额外配置
- 如果需要自定义域名，请在 Edgeone 控制台中进行相应配置

### 3. 更新部署
要更新部署，只需重新构建项目并替换所有文件：
```bash
# 在项目根目录执行
pnpm run build

# 然后将新的 dist 目录内容上传到 Edgeone
```

## 构建命令说明
```bash
# 开发模式
pnpm run dev

# 生产构建
pnpm run build

# 预览构建结果
pnpm run preview
```

## 技术栈
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (后端服务)

## 注意事项
1. 确保 Edgeone 的 MIME 类型配置支持 `.js` 和 `.css` 文件
2. 如果使用路由功能，可能需要配置 Edgeone 的重定向规则以支持 SPA (单页应用)