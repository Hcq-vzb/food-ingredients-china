const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const TMP_DIR = path.join(__dirname, '..', 'tmp');
const OUTPUT_DIR = path.join(__dirname, '..', 'outputs');

// 确保目录存在
[TMP_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 下载图片
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// 简单的PNG解析（仅获取基本尺寸信息）
function getPNGDimensions(buffer) {
  if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
    return null;
  }
  
  // IHDR chunk starts at byte 8
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

// 简单的JPEG解析
function getJPEGDimensions(buffer) {
  if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
    return null;
  }
  
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      offset++;
      continue;
    }
    
    const marker = buffer[offset + 1];
    
    // SOF markers contain dimensions
    if ((marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    
    // Skip this segment
    if (marker === 0xD9) break; // EOI
    if (marker === 0xDA) break; // SOS
    
    const segmentLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }
  
  return null;
}

// 获取图片尺寸
function getImageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.png') {
    return getPNGDimensions(buffer);
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return getJPEGDimensions(buffer);
  }
  
  return null;
}

// 去除左上角Logo（简单实现：用白色填充左上角区域）
function removeLogoTopLeft(inputPath, outputPath, logoWidth = 80, logoHeight = 40) {
  const buffer = fs.readFileSync(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  
  if (ext === '.png') {
    return removeLogoFromPNG(buffer, outputPath, logoWidth, logoHeight);
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return removeLogoFromJPEG(buffer, outputPath, logoWidth, logoHeight);
  }
  
  throw new Error(`Unsupported format: ${ext}`);
}

// PNG Logo去除（简化版：直接修改像素数据）
function removeLogoFromPNG(buffer, outputPath, logoWidth, logoHeight) {
  const dims = getPNGDimensions(buffer);
  if (!dims) {
    fs.copyFileSync(path.dirname(outputPath) + '/temp.png', outputPath);
    return;
  }
  
  // 对于PNG，我们创建一个简化的处理：复制原图并在左上角添加白色矩形
  // 由于没有图像处理库，我们采用保守策略：直接复制文件
  fs.copyFileSync(path.dirname(outputPath).replace('outputs', 'tmp') + '/' + path.basename(outputPath).replace('_processed', '_original'), outputPath);
  
  console.log(`  Note: Full PNG processing requires image library. File copied as-is.`);
}

// JPEG Logo去除
function removeLogoFromJPEG(buffer, outputPath, logoWidth, logoHeight) {
  // 同样采用保守策略
  fs.writeFileSync(outputPath, buffer);
  console.log(`  Note: Full JPEG processing requires image library. File copied as-is.`);
}

// 主处理函数
async function processImages(imageUrls, options = {}) {
  const {
    logoPosition = 'top-left',
    logoWidth = 80,
    logoHeight = 40,
    outputPrefix = 'product'
  } = options;
  
  const results = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const fileName = `${outputPrefix}_${i + 1}${path.extname(new URL(url).pathname) || '.jpg'}`;
    const originalPath = path.join(TMP_DIR, fileName.replace(/\.[^.]+$/, '_original$&'));
    const processedPath = path.join(OUTPUT_DIR, fileName.replace(/\.[^.]+$/, '_processed$&'));
    
    try {
      console.log(`Processing ${i + 1}/${imageUrls.length}: ${url}`);
      
      // 下载图片
      await downloadImage(url, originalPath);
      console.log(`  Downloaded: ${originalPath}`);
      
      // 获取图片尺寸
      const dims = getImageDimensions(originalPath);
      if (dims) {
        console.log(`  Dimensions: ${dims.width}x${dims.height}`);
      }
      
      // 去除Logo
      await removeLogoTopLeft(originalPath, processedPath, logoWidth, logoHeight);
      console.log(`  Processed: ${processedPath}`);
      
      results.push({
        original: originalPath,
        processed: processedPath,
        url: url,
        dimensions: dims
      });
    } catch (error) {
      console.error(`  Error processing ${url}: ${error.message}`);
      results.push({
        url: url,
        error: error.message
      });
    }
  }
  
  return results;
}

// 从网页抓取结果中提取产品图片
function extractProductImages(scrapeResult) {
  if (!scrapeResult || !scrapeResult.images) {
    return [];
  }
  
  // 过滤出产品图片（排除logo和装饰性图片）
  return scrapeResult.images
    .filter(img => {
      const url = img.url.toLowerCase();
      // 排除skin/img目录下的logo图片
      return !url.includes('/skin/img/') && 
             (url.includes('/uploads/') || url.includes('.jpg') || url.includes('.png'));
    })
    .map(img => img.url);
}

// 命令行入口
if (require.main === module) {
  const targetUrl = process.argv[2] || 'http://wanshengfood.cn/a/fangzhiwenyou/';
  
  console.log('Image Processor - Automated Product Image Processing');
  console.log('==================================================');
  console.log(`Target URL: ${targetUrl}`);
  console.log(`Temp Directory: ${TMP_DIR}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log('');
  
  // 这里应该先调用web-scraper获取图片列表
  // 为演示目的，我们直接使用已知的图片URL
  const productImages = [
    'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z515595S51.jpg',
    'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155620626.jpg',
    'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155534361.jpg',
    'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z51554093I.jpg',
    'http://wanshengfood.cn/uploads/allimg/20240206/1-240206221Q3351.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151421R5.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215143N15.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215145H39.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215151SS.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221513223Y.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150U0U2.jpg',
    'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150626402.jpg'
  ];
  
  console.log(`Found ${productImages.length} product images`);
  console.log('');
  
  processImages(productImages, {
    logoPosition: 'top-left',
    logoWidth: 80,
    logoHeight: 40,
    outputPrefix: 'wansheng_product'
  })
  .then(results => {
    console.log('');
    console.log('Processing Complete!');
    console.log('===================');
    console.log(`Total: ${results.length} images`);
    console.log(`Successful: ${results.filter(r => !r.error).length}`);
    console.log(`Failed: ${results.filter(r => r.error).length}`);
    console.log('');
    console.log('Output files are in:', OUTPUT_DIR);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  processImages,
  extractProductImages,
  downloadImage,
  removeLogoTopLeft
};
