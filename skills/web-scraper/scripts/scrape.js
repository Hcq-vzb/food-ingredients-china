const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 网页内容抓取脚本
 * @param {string} url - 目标网页URL
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} 抓取结果
 */
async function scrapeWebpage(url, options = {}) {
  try {
    // 验证URL
    if (!url || typeof url !== 'string') {
      throw new Error('请提供有效的URL');
    }

    // 确保URL以http/https开头
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    // 发送请求获取页面内容
    const response = await axios.get(targetUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 提取页面标题
    const title = $('title').text().trim() || '无标题';

    // 提取元数据
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';

    // 提取正文内容（优先选择article、main、content等标签）
    let content = '';
    const contentSelectors = ['article', 'main', '[role="main"]', '.content', '#content', '.article', '#article'];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }
    
    // 如果没有找到特定内容区域，使用body
    if (!content) {
      content = $('body').text().trim();
    }

    // 清理多余空白
    content = content.replace(/\s+/g, ' ').substring(0, 5000);

    // 提取所有链接
    const links = [];
    $('a[href]').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        // 转换为绝对路径
        let absoluteUrl = href;
        if (href.startsWith('/')) {
          const baseUrl = new URL(targetUrl);
          absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${href}`;
        } else if (!href.startsWith('http')) {
          absoluteUrl = new URL(href, targetUrl).href;
        }
        
        links.push({
          url: absoluteUrl,
          text: text || '无文本'
        });
      }
    });

    // 提取图片
    const images = [];
    $('img[src]').each((index, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';
      if (src) {
        let absoluteSrc = src;
        if (src.startsWith('/')) {
          const baseUrl = new URL(targetUrl);
          absoluteSrc = `${baseUrl.protocol}//${baseUrl.host}${src}`;
        } else if (!src.startsWith('http')) {
          absoluteSrc = new URL(src, targetUrl).href;
        }
        
        images.push({
          url: absoluteSrc,
          alt: alt
        });
      }
    });

    // 返回结果
    return {
      success: true,
      url: targetUrl,
      title: title,
      meta: {
        description: metaDescription,
        keywords: metaKeywords
      },
      content: content,
      links: links.slice(0, 50), // 限制链接数量
      images: images.slice(0, 30), // 限制图片数量
      linkCount: links.length,
      imageCount: images.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      url: url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// 如果直接运行脚本
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('用法: node scrape.js <URL>');
    process.exit(1);
  }

  scrapeWebpage(url).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { scrapeWebpage };
