import { removeBackground } from '@imgly/background-removal';
import fs from 'fs';
import path from 'path';

async function removeImageBackground(inputPath, outputPath) {
  try {
    const imageData = await removeBackground(inputPath, {
      output: {
        format: 'image/png',
        quality: 0.8
      }
    });
    
    fs.writeFileSync(outputPath, Buffer.from(imageData));
    console.log(`背景移除成功: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('背景移除失败:', error.message);
    throw error;
  }
}

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace(/\.[^.]+$/, '_nobg.png');

if (!inputPath) {
  console.error('请提供输入图片路径');
  process.exit(1);
}

removeImageBackground(inputPath, outputPath);
