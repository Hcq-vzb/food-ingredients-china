# 组件设计模式

## 概览
本文档定义了常用 UI 组件的设计模式和代码规范，确保生成的组件符合现代前端开发标准。

## 按钮组件

### 基础结构
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

### 样式规范
- Primary: 主色调背景，白色文字
- Secondary: 边框样式，主色调文字
- Ghost: 透明背景，悬停时显示背景

## 卡片组件

### 基础结构
```tsx
interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

### 样式规范
- 圆角: rounded-xl (12px)
- 阴影: shadow-md
- 内边距: p-6
- 背景: bg-white

## 表单组件

### 输入框
```tsx
interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
}
```

### 样式规范
- 边框: border border-gray-300
- 聚焦: focus:ring-2 focus:ring-blue-500
- 圆角: rounded-lg

## 布局模式

### 栅格系统
- 使用 Tailwind 的 grid 类
- 常用: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- 间距: gap-6

### 响应式断点
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
