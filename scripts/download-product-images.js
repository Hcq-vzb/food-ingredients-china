const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

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

// 目标网站产品图片映射
const targetProducts = [
  { name: 'SICILIA 刺槐豆胶', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z515595S51.jpg' },
  { name: '酪蛋白酸钠 Meggle', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155620626.jpg' },
  { name: 'Cremac乳清粉', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155534361.jpg' },
  { name: '乳清粉 Argenlac', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z51554093I.jpg' },
  { name: '刺槐豆胶', url: 'http://wanshengfood.cn/uploads/allimg/20240206/1-240206221Q3351.jpg' },
  { name: '蜂蜜', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151421R5.jpg' },
  { name: '可可液块', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215143N15.jpg' },
  { name: '黑糖糖浆', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215145H39.jpg' },
  { name: '黑糖粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215151SS.jpg' },
  { name: '乙基麦芽酚', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221513223Y.jpg' },
  { name: '磷酸氢二钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150U0U2.jpg' },
  { name: '蔗糖脂肪酸酯', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150626402.jpg' }
];

// 我们网站的产品ID映射（根据products.ts）
const ourProductMapping = {
  'locust-bean-gum': 'SICILIA Locust Bean Gum',
  'sodium-caseinate': 'Meggle Sodium Caseinate',
  'cremac-whey-powder': 'Cremac Whey Powder',
  'arginlac-whey-powder': 'Argenlac Whey Powder',
  'honey': 'Natural Honey',
  'cocoa-mass': 'Cocoa Mass',
  'brown-sugar-syrup': 'Brown Sugar Syrup',
  'brown-sugar-powder': 'Brown Sugar Powder',
  'ethyl-maltol': 'Ethyl Maltol',
  'disodium-phosphate': 'Disodium Phosphate',
  'sucrose-fatty-acid-esters': 'Sucrose Fatty Acid Esters'
};

async function main() {
  console.log('开始下载目标网站产品图片...\n');
  
  const results = [];
  
  for (const product of targetProducts) {
    try {
      // 清理文件名，只保留有效字符
      const safeName = product.name.replace(/[^\w\u4e00-\u9fa5]/g, '_');
      const fileName = `${safeName}.jpg`;
      const tmpPath = path.join(TMP_DIR, fileName);
      const outputPath = path.join(OUTPUT_DIR, fileName);
      
      console.log(`下载: ${product.name}`);
      await downloadImage(product.url, tmpPath);
      
      // 复制到outputs目录
      fs.copyFileSync(tmpPath, outputPath);
      
      results.push({
        name: product.name,
        url: product.url,
        tmpPath,
        outputPath
      });
      
      console.log(`  ✓ 已保存: ${outputPath}\n`);
    } catch (error) {
      console.error(`  ✗ 失败: ${product.name} - ${error.message}\n`);
      results.push({
        name: product.name,
        url: product.url,
        error: error.message
      });
    }
  }
  
  console.log('\n========================================');
  console.log('下载完成!');
  console.log(`成功: ${results.filter(r => !r.error).length} 个`);
  console.log(`失败: ${results.filter(r => r.error).length} 个`);
  console.log(`输出目录: ${OUTPUT_DIR}`);
  console.log('========================================\n');
  
  // 显示匹配建议
  console.log('产品匹配建议:');
  console.log('----------------------------------------');
  for (const result of results) {
    if (result.error) continue;
    
    // 尝试匹配我们的产品
    let matchedId = null;
    const nameLower = result.name.toLowerCase();
    
    if (nameLower.includes('刺槐豆胶') && nameLower.includes('sicilia')) {
      matchedId = 'locust-bean-gum';
    } else if (nameLower.includes('酪蛋白酸钠') || nameLower.includes('meggle')) {
      matchedId = 'sodium-caseinate';
    } else if (nameLower.includes('cremac') && nameLower.includes('乳清粉')) {
      matchedId = 'cremac-whey-powder';
    } else if (nameLower.includes('argenlac') && nameLower.includes('乳清粉')) {
      matchedId = 'arginlac-whey-powder';
    } else if (nameLower.includes('蜂蜜')) {
      matchedId = 'honey';
    } else if (nameLower.includes('可可')) {
      matchedId = 'cocoa-mass';
    } else if (nameLower.includes('黑糖') && nameLower.includes('糖浆')) {
      matchedId = 'brown-sugar-syrup';
    } else if (nameLower.includes('黑糖') && nameLower.includes('粉')) {
      matchedId = 'brown-sugar-powder';
    } else if (nameLower.includes('乙基麦芽酚')) {
      matchedId = 'ethyl-maltol';
    } else if (nameLower.includes('磷酸氢二钠')) {
      matchedId = 'disodium-phosphate';
    } else if (nameLower.includes('蔗糖脂肪酸酯')) {
      matchedId = 'sucrose-fatty-acid-esters';
    }
    
    if (matchedId) {
      console.log(`${result.name} -> ${matchedId} (${ourProductMapping[matchedId]})`);
    } else {
      console.log(`${result.name} -> 未找到匹配`);
    }
  }
}

main().catch(console.error);
