# 动画效果指南

## 概览
本文档提供 Framer Motion 动画配置和常用效果示例，用于实现流畅、专业的动画效果。

## 基础配置

### 缓动函数
```typescript
const easing = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: "spring", stiffness: 300, damping: 30 }
};
```

### 常用时长
- 快速: 0.2s
- 标准: 0.3s
- 慢速: 0.5s

## 入场动画

### 淡入上移
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
/>
```

### 缩放淡入
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
/>
```

## 悬停效果

### 按钮悬停
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### 卡片悬停
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
/>
```

## 列表动画

### 交错动画
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map(item => (
    <motion.div variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }} />
  ))}
</motion.div>
```

## 页面过渡

### 路由动画
```tsx
<motion.div
  key={route}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
/>
```
