# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## 部署到 Edgeone

本项目已配置为可直接部署到 Edgeone 或其他静态网站托管服务。

### 部署步骤

1. 构建项目:
   ```bash
   pnpm run build
   ```

2. 将 [dist](file:///D:/AFile/Ai%20%E6%99%BA%E8%83%BD%E4%BD%93/AI%20agent/Mini%20max%20Agent/ai-investment-website/dist/) 目录中的所有内容上传到 Edgeone 站点根目录

3. 项目使用相对路径，因此可以部署在任何子目录下

### 部署注意事项

- 确保 Edgeone 的 MIME 类型配置支持 `.js` 和 `.css` 文件
- 如果使用客户端路由，需要配置 Edgeone 的重定向规则以支持 SPA

## 用户会话问题修复

如果遇到用户会话无法启动的问题，请参考 [SESSION_FIX.md](file:///D:/AFile/Ai%20%E6%99%BA%E8%83%BD%E4%BD%93/AI%20agent/Mini%20max%20Agent/ai-investment-website/SESSION_FIX.md) 文件中的详细说明。主要修复包括：

1. 改进了认证回调处理逻辑
2. 优化了 Supabase 配置和错误处理
3. 增强了路由检测和错误页面显示

确保在 Edgeone 环境中正确配置了以下环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`