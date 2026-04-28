const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets', 'products');

// 确保目录存在
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

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

// 目标网站产品完整列表（从所有分类页面抓取）
const targetProducts = [
  // 乳化剂
  { name: 'SICILIA 刺槐豆胶', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z515595S51.jpg', matchId: 'locust-bean-gum' },
  { name: '蔗糖脂肪酸酯', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150626402.jpg', matchId: 'sucrose-fatty-acid-esters' },
  { name: '司盘80', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150645115.jpg', matchId: 'span-80' },
  { name: '司盘65', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150F91H.jpg', matchId: 'span-65' },
  { name: '吐温80', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150HI39.jpg', matchId: 'tween-80' },
  { name: '吐温20', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150HI39.jpg', matchId: 'tween-20' },
  
  // 食品原料
  { name: '酪蛋白酸钠 Meggle', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155620626.jpg', matchId: 'sodium-caseinate' },
  { name: 'Cremac乳清粉', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z5155534361.jpg', matchId: 'cremac-whey-powder' },
  { name: '乳清粉 Argenlac', url: 'http://wanshengfood.cn/uploads/allimg/20250905/1-250Z51554093I.jpg', matchId: 'arginlac-whey-powder' },
  { name: '蜂蜜', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151421R5.jpg', matchId: 'honey' },
  { name: '可可液块', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215143N15.jpg', matchId: 'cocoa-mass' },
  { name: '黑糖糖浆', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215145H39.jpg', matchId: 'brown-sugar-syrup' },
  { name: '黑糖粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215151SS.jpg', matchId: 'brown-sugar-powder' },
  { name: '天然超微绿茶粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151535Q6.jpg', matchId: 'green-tea-powder' },
  
  // 香精香料
  { name: '乙基麦芽酚', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221513223Y.jpg', matchId: 'ethyl-maltol' },
  { name: '饮料类香精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151050551.jpg', matchId: 'beverage-flavors' },
  { name: '糖果类香精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151110435.jpg', matchId: 'candy-flavors' },
  { name: '乳品类香精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215112J91.jpg', matchId: 'dairy-flavors' },
  { name: '冰品类香精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151146300.jpg', matchId: 'ice-cream-flavors' },
  { name: '烘焙类香精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151203R6.jpg', matchId: 'baking-flavors' },
  
  // 甜味剂
  { name: '安赛蜜', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145212V5.jpg', matchId: 'acesulfame-k' },
  { name: '阿斯巴甜', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145234G5.jpg', matchId: 'aspartame' },
  { name: '赤藓糖醇', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145256342.jpg', matchId: 'erythritol' },
  { name: '抗性糊精', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145318240.jpg', matchId: 'resistant-dextrin' },
  { name: '聚葡萄糖', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145340157.jpg', matchId: 'polydextrose' },
  { name: '山梨糖醇', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145402b95.jpg', matchId: 'sorbitol' },
  { name: '葡萄糖粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145424362.jpg', matchId: 'glucose-powder' },
  { name: '木糖醇', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145446V5.jpg', matchId: 'xylitol' },
  { name: '麦芽糖粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145508G5.jpg', matchId: 'maltose-powder' },
  { name: '三氯蔗糖', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145530342.jpg', matchId: 'sucralose' },
  { name: '海藻糖', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145552157.jpg', matchId: 'trehalose' },
  { name: '果葡糖浆', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145614b95.jpg', matchId: 'fructose-syrup' },
  { name: '低聚果糖', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145636V5.jpg', matchId: 'fructooligosaccharides' },
  { name: '异麦芽酮糖', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145658G5.jpg', matchId: 'isomaltose' },
  { name: '麦芽低聚糖粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145720342.jpg', matchId: 'malt-oligosaccharide-powder' },
  
  // 增稠稳定剂
  { name: '刺槐豆胶', url: 'http://wanshengfood.cn/uploads/allimg/20240206/1-240206221Q3351.jpg', matchId: 'locust-bean-gum-generic' },
  { name: '魔芋纯化粉KJ22', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215011I48.jpg', matchId: 'konjac-purified-powder-kj22' },
  { name: '变性淀粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215015A11.jpg', matchId: 'modified-starch' },
  { name: '羟丙基甲基纤维素HPMC', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215021c28.jpg', matchId: 'hpmc' },
  { name: '海藻酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215024I40.jpg', matchId: 'sodium-alginate' },
  { name: '羧甲基纤维素钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215032N39.jpg', matchId: 'cmc' },
  { name: '阿拉伯胶', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150355633.jpg', matchId: 'arabic-gum' },
  { name: '卡拉胶', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150425150.jpg', matchId: 'carrageenan' },
  { name: '瓜尔豆胶', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150444Q6.jpg', matchId: 'guar-gum' },
  { name: '魔芋粉', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150505460.jpg', matchId: 'konjac-powder' },
  { name: '黄原胶', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221505345A.jpg', matchId: 'xanthan-gum' },
  
  // 酸度调节剂
  { name: '乳酸钠溶液', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143543635.jpg', matchId: 'sodium-lactate-solution' },
  { name: '柠檬酸钾', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143612W0.jpg', matchId: 'potassium-citrate' },
  { name: 'L-乳酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214364G55.jpg', matchId: 'lactic-acid' },
  { name: 'L-苹果酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143G1557.jpg', matchId: 'l-malic-acid' },
  { name: 'DL-苹果酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143K5442.jpg', matchId: 'dl-malic-acid' },
  { name: '柠檬酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143QI49.jpg', matchId: 'sodium-citrate' },
  { name: '一水柠檬酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143SR07.jpg', matchId: 'citric-acid-monohydrate' },
  { name: '无水柠檬酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143UCN.jpg', matchId: 'citric-acid-anhydrous' },
  { name: '食品级冰乙酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221439142V.jpg', matchId: 'glacial-acetic-acid' },
  
  // 防腐剂
  { name: '丙酸钙', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143255362.jpg', matchId: 'calcium-propionate' },
  { name: '苯甲酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143334V5.jpg', matchId: 'sodium-benzoate' },
  { name: 'ε-聚赖氨酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143354240.jpg', matchId: 'epsilon-polylysine' },
  { name: '脱氢乙酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143431957.jpg', matchId: 'sodium-dehydroacetate' },
  { name: '山梨酸钾', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214344b95.jpg', matchId: 'potassium-sorbate' },
  
  // 抗氧化剂
  { name: '没食子酸丙酯', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222142P3240.jpg', matchId: 'propyl-gallate' },
  { name: '丁基羟基茴香醚BHA', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222142T1A7.jpg', matchId: 'bha' },
  { name: 'D-异抗坏血酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214292K64.jpg', matchId: 'sodium-isoascorbate' },
  { name: 'VC L-抗坏血酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214303J94.jpg', matchId: 'vitamin-c' },
  { name: 'VE 混合生育酚', url: 'http://wanshengfood.cn/uploads/190922/1-1Z9221ZA1519.jpg', matchId: 'mixed-tocopherols' },
  { name: 'VCAP抗坏血酸棕榈酸酯', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222143133303.jpg', matchId: 'ascorbyl-palmitate' },
  { name: 'TBHQ', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221431554J.jpg', matchId: 'tbhq' },
  
  // 保水剂
  { name: '磷酸氢二钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150U0U2.jpg', matchId: 'disodium-phosphate' },
  { name: '六偏磷酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222150ZL07.jpg', matchId: 'sodium-hexametaphosphate' },
  { name: '三聚磷酸钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215092bb.jpg', matchId: 'sodium-tripolyphosphate' },
  { name: '焦磷酸二氢二钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215094E96.jpg', matchId: 'disodium-dihydrogen-pyrophosphate' },
  
  // 着色剂
  { name: 'β-胡萝卜素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144034316.jpg', matchId: 'beta-carotene' },
  { name: '复配胭脂虫红色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144059259.jpg', matchId: 'cochineal-red-complex' },
  { name: '复配姜黄色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144122C3.jpg', matchId: 'curcumin-complex' },
  { name: '复配高粱红色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144152962.jpg', matchId: 'sorghum-red-complex' },
  { name: '天然焦糖色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144211a0.jpg', matchId: 'caramel-color' },
  { name: '日落黄色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144235N5.jpg', matchId: 'sunset-yellow' },
  { name: '柠檬黄色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214425Ua.jpg', matchId: 'tartrazine' },
  { name: '诱惑红色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144319229.jpg', matchId: 'allura-red' },
  { name: '亮蓝色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214433G34.jpg', matchId: 'brilliant-blue' },
  { name: '亮蓝铝色淀', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144354I3.jpg', matchId: 'brilliant-blue-aluminum-lake' },
  { name: '胭脂红色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-2212221444203E.jpg', matchId: 'carmine' },
  { name: '苋菜红色素', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222144441354.jpg', matchId: 'amaranth' },
  
  // 营养增强剂
  { name: '畜牧益生菌', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145Z2E8.jpg', matchId: 'livestock-probiotics' },
  { name: 'L-乳酸钙', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145919155.jpg', matchId: 'calcium-lactate' },
  { name: '牛磺酸', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122214593NF.jpg', matchId: 'taurine' },
  
  // 食用油
  { name: '精炼椰子油', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145I3556.jpg', matchId: 'refined-coconut-oil' },
  { name: '玉米油', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145K24M.jpg', matchId: 'corn-oil' },
  { name: '葵花籽油', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145Q05M.jpg', matchId: 'sunflower-oil' },
  { name: '大豆油一级', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145S12M.jpg', matchId: 'soybean-oil-grade-1' },
  
  // 调味料
  { name: '10度酿造白醋', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222145A1344.jpg', matchId: '10-degree-brewed-white-vinegar' },
  
  // 新资源食品
  { name: '共轭亚油酸CLA', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215135BO.jpg', matchId: 'cla' },
  
  // 其他食品
  { name: '大西洋海参胶囊', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215163DL.jpg', matchId: 'atlantic-sea-cucumber-capsules' },
  
  // 助剂
  { name: '食品级甲醇钠溶液', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-221222151603443.jpg', matchId: 'food-grade-sodium-methoxide-solution' },
  { name: '食品级固体甲醇钠', url: 'http://wanshengfood.cn/uploads/allimg/20221222/1-22122215161RI.jpg', matchId: 'food-grade-solid-sodium-methoxide' }
];

async function main() {
  console.log('开始批量下载产品图片...\n');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const product of targetProducts) {
    try {
      const fileName = `${product.matchId}.jpg`;
      const destPath = path.join(ASSETS_DIR, fileName);
      
      // 如果文件已存在，跳过
      if (fs.existsSync(destPath)) {
        console.log(`✓ 已存在: ${product.name}`);
        results.push({ name: product.name, matchId: product.matchId, status: 'exists' });
        continue;
      }
      
      console.log(`下载: ${product.name}...`);
      await downloadImage(product.url, destPath);
      successCount++;
      console.log(`  ✓ 成功: ${fileName}`);
      results.push({ name: product.name, matchId: product.matchId, status: 'downloaded' });
    } catch (error) {
      failCount++;
      console.error(`  ✗ 失败: ${product.name} - ${error.message}`);
      results.push({ name: product.name, matchId: product.matchId, status: 'failed', error: error.message });
    }
  }
  
  console.log('\n========================================');
  console.log('下载完成!');
  console.log(`新增成功: ${successCount} 个`);
  console.log(`已存在: ${results.filter(r => r.status === 'exists').length} 个`);
  console.log(`失败: ${failCount} 个`);
  console.log(`总计: ${targetProducts.length} 个`);
  console.log('========================================\n');
  
  // 生成映射报告
  console.log('产品图片映射报告:');
  console.log('----------------------------------------');
  for (const result of results) {
    const statusIcon = result.status === 'downloaded' ? '✓' : result.status === 'exists' ? '=' : '✗';
    console.log(`${statusIcon} ${result.name} -> ${result.matchId}`);
  }
}

main().catch(console.error);
