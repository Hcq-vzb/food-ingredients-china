# 设计系统配置模板

## Tailwind 配置示例

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
        },
        // 语义色
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        // shadcn 基础色
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px hsl(var(--shadow-color) / 0.08)",
        "card": "0 4px 20px -4px hsl(var(--shadow-color) / 0.12)",
        "elevated": "0 8px 30px -6px hsl(var(--shadow-color) / 0.16)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

## CSS 变量定义

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 基础色 */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* 卡片和浮层 */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    /* 主色调 - 根据风格调整 */
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --primary-50: 210 40% 98%;
    --primary-100: 210 40% 96.1%;
    --primary-200: 214.3 31.8% 91.4%;
    --primary-300: 212.7 26.8% 83.9%;
    --primary-400: 215 20.2% 65.1%;
    --primary-500: 215.4 16.3% 46.9%;
    --primary-600: 215.3 25% 36.7%;
    --primary-700: 215.3 25% 26.7%;
    --primary-800: 217.2 32.6% 17.5%;
    --primary-900: 222.2 47.4% 11.2%;
    
    /* 次要色 */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    /* 静音/禁用色 */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    /* 强调色 */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    /* 语义色 */
    --success: 142.1 76.2% 36.3%;
    --success-foreground: 355.7 100% 97.3%;
    --warning: 38 92% 50%;
    --warning-foreground: 48 100% 96%;
    --error: 0 84.2% 60.2%;
    --error-foreground: 210 40% 98%;
    --info: 217.2 91.2% 59.8%;
    --info-foreground: 222.2 47.4% 11.2%;
    
    /* 破坏性操作 */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    /* 边框和输入 */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    
    /* 圆角 */
    --radius: 0.5rem;
    
    /* 阴影颜色 */
    --shadow-color: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --shadow-color: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

## 配色方案参考

### 现代极简
```css
--primary: 220 13% 46%;      /* 灰蓝 */
--accent: 220 13% 91%;       /* 浅灰 */
--background: 0 0% 100%;     /* 纯白 */
```

### 玻璃态
```css
--primary: 262 83% 58%;      /* 紫色 */
--accent: 262 83% 97%;       /* 浅紫 */
--background: 0 0% 100% / 0.8; /* 半透明白 */
```

### 暗黑科技
```css
--primary: 142 71% 45%;      /* 荧光绿 */
--accent: 199 89% 48%;       /* 青色 */
--background: 224 71% 4%;    /* 深黑 */
```

### 温暖有机
```css
--primary: 25 95% 53%;       /* 橙色 */
--accent: 142 76% 36%;       /* 绿色 */
--background: 60 9% 98%;     /* 米白 */
```
