---
name: image-background-remover
description: 智能抠图工具，支持复杂背景的图片背景移除。当用户提到抠图、去背景、背景移除、remove background、背景透明化时必须使用此技能。
dependency:
  npm:
    - @imgly/background-removal@^1.5.0
---

# 图片抠图工具

## 任务目标
- 本 Skill 用于：移除图片背景，生成透明背景图片
- 能力：
  - 支持复杂背景的智能识别和移除
  - 保留前景主体细节（发丝、边缘等）
  - 输出 PNG 格式透明背景图片
  - 支持批量处理
- 触发：当用户提到"抠图"、"去背景"、"背景移除"、"remove background"、"背景透明化"时使用

## 前置准备
- 依赖说明：使用 @imgly/background-removal 库进行背景移除
- 浏览器环境：需要 WebGL 支持

## 操作步骤
1. **加载图片**
   - 用户上传图片或提供图片 URL
   - 验证图片格式（支持 JPG、PNG、WebP 等常见格式）

2. **背景移除**
   - 调用 `scripts/remove-background.mjs` 脚本处理图片
   - 使用 AI 模型智能识别前景和背景
   - 处理复杂边缘（如头发、毛发等细节）

3. **输出结果**
   - 生成 PNG 格式透明背景图片
   - 提供下载链接

## 资源索引

### 脚本工具
- **[scripts/remove-background.mjs](scripts/remove-background.mjs)**
  - 用途：执行背景移除操作
  - 触发时机：当用户需要移除图片背景时，**必须调用此脚本**
  - 输入：图片文件路径或 URL
  - 输出：透明背景 PNG 图片

## 注意事项
- **脚本调用规则**：背景移除是计算密集型操作，**必须调用** scripts/remove-background.mjs 脚本执行，不要尝试自行处理
- **性能提示**：首次处理需要下载 AI 模型，可能需要几秒钟时间
- **隐私说明**：图片处理在本地完成，不会上传到远程服务器
- **浏览器兼容性**：需要现代浏览器支持 WebGL
