# CMS Monorepo

这是一个使用pnpm workspace管理的monorepo项目。

## 项目结构

- `apps/` - 存放应用
  - `cms/` - Vue 3 + TypeScript的CMS系统
- `packages/` - 存放共享库
  - `utils/` - 通用工具函数库

## 开发设置

### 前提条件

- Node.js 16+
- pnpm 7+

### 安装依赖

```bash
pnpm install
```

### 开发指令

```bash
# 启动CMS应用
pnpm dev

# 构建所有项目
pnpm build

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 添加新包

```bash
# 添加新的共享库
mkdir -p packages/[package-name]/src
cd packages/[package-name]
pnpm init
```

## 添加依赖

```bash
# 向根目录添加开发依赖
pnpm add -Dw [package]

# 向特定包添加依赖
pnpm add [package] --filter [target-package]

# 包之间的依赖引用
pnpm add @cms/utils --filter cms-app
```
