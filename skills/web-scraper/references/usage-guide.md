# 网页抓取技能使用指南

## 快速开始

### 基本用法

```javascript
const { scrapeWebpage } = require('./scripts/scrape.js');

// 抓取网页
const result = await scrapeWebpage('https://example.com');
console.log(result);
```

## 返回数据结构

```javascript
{
  success: true,           // 抓取是否成功
  url: 'https://example.com',  // 实际抓取的URL
  title: '页面标题',        // 页面标题
  meta: {
    description: '页面描述', // meta description
    keywords: '关键词'      // meta keywords
  },
  content: '页面正文内容...', // 提取的正文文本（前5000字符）
  links: [                  // 页面链接列表（最多50个）
    { url: 'https://...', text: '链接文本' }
  ],
  images: [                 // 页面图片列表（最多30个）
    { url: 'https://...', alt: '图片描述' }
  ],
  linkCount: 100,          // 总链接数
  imageCount: 20,          // 总图片数
  timestamp: '2024-01-01T00:00:00.000Z'  // 抓取时间
}
```

## 错误处理

当抓取失败时，返回结构：

```javascript
{
  success: false,
  url: 'https://example.com',
  error: '错误信息',
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

## 常见错误

- **请提供有效的URL**: URL参数为空或格式不正确
- **Network Error**: 网络连接问题或URL无法访问
- **Timeout**: 请求超时（默认30秒）

## 使用建议

1. **URL格式**: 支持自动补全协议（example.com → https://example.com）
2. **内容提取**: 优先提取article、main等语义化标签内容
3. **路径处理**: 自动将相对路径转换为绝对路径
4. **数据限制**: 链接最多返回50个，图片最多返回30个
5. **内容长度**: 正文内容限制为前5000字符

## 注意事项

- 遵守目标网站的 robots.txt 规则
- 控制请求频率，避免对服务器造成压力
- 某些网站可能有反爬虫机制
- 动态渲染的内容（JavaScript生成）可能无法抓取
