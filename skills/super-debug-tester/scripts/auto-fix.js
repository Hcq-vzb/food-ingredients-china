const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 自动修复脚本
 * 自动检测并修复常见代码问题
 */

const FIXABLE_PATTERNS = [
  {
    name: '未定义变量',
    pattern: /typeof\s+(\w+)\s+===?\s+['"]undefined['"]/g,
    fix: (match, varName) => `typeof ${varName} !== 'undefined'`,
    description: '修复未定义变量检查'
  },
  {
    name: '缺少分号',
    pattern: /([^;{}\s])\s*\n\s*([{}])/g,
    fix: (match, before, after) => `${before};\n${after}`,
    description: '添加缺失的分号'
  },
  {
    name: 'console.log 残留',
    pattern: /console\.log\([^)]+\);?\s*\n/g,
    fix: () => '',
    description: '移除调试用的 console.log'
  },
  {
    name: '未使用的变量',
    pattern: /let\s+(\w+)\s*=\s*[^;]+;(?![\s\S]*?\1)/g,
    fix: () => '',
    description: '移除未使用的变量声明'
  },
  {
    name: '双等号比较',
    pattern: /([^=!])==([^=])/g,
    fix: (match, before, after) => `${before}===${after}`,
    description: '使用严格相等 === 替代 =='
  }
];

function findJsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findJsFiles(fullPath));
    } else if (stat.isFile() && /\.(js|ts|jsx|tsx)$/.test(item)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  FIXABLE_PATTERNS.forEach(({ name, pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: name,
        count: matches.length,
        description,
        lines: findLineNumbers(content, pattern)
      });
    }
  });
  
  return { filePath, content, issues };
}

function findLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
    pattern.lastIndex = 0;
  });
  
  return lineNumbers;
}

function applyFix(filePath, content, issues) {
  let fixed = content;
  let fixCount = 0;
  
  FIXABLE_PATTERNS.forEach(({ pattern, fix }) => {
    const newContent = fixed.replace(pattern, fix);
    if (newContent !== fixed) {
      fixCount++;
    }
    fixed = newContent;
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    return { success: true, fixCount };
  }
  
  return { success: false, fixCount: 0 };
}

function main() {
  console.log(chalk.cyan('╔════════════════════════════════════╗'));
  console.log(chalk.cyan('║      自动代码修复工具 v1.0         ║'));
  console.log(chalk.cyan('╚════════════════════════════════════╝\n'));
  
  const targetDir = process.argv[2] || '.';
  const applyMode = process.argv.includes('--apply');
  
  console.log(chalk.gray(`目标目录: ${path.resolve(targetDir)}`));
  console.log(chalk.gray(`修复模式: ${applyMode ? '应用修复' : '仅检测'}\n`));
  
  // 查找所有 JS/TS 文件
  const files = findJsFiles(targetDir);
  console.log(chalk.blue(`扫描了 ${files.length} 个文件\n`));
  
  let totalIssues = 0;
  let fixedFiles = 0;
  
  files.forEach(filePath => {
    const result = analyzeFile(filePath);
    
    if (result.issues.length > 0) {
      totalIssues += result.issues.length;
      console.log(chalk.yellow(`📄 ${path.relative(targetDir, filePath)}`));
      
      result.issues.forEach(issue => {
        console.log(chalk.gray(`   • ${issue.type}: ${issue.count} 处`));
        console.log(chalk.gray(`     行号: ${issue.lines.join(', ')}`));
      });
      
      if (applyMode) {
        const fixResult = applyFix(filePath, result.content, result.issues);
        if (fixResult.success) {
          console.log(chalk.green(`   ✓ 已自动修复`));
          fixedFiles++;
        }
      }
      console.log('');
    }
  });
  
  // 输出汇总
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.cyan('              修复结果汇总           '));
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.blue(`扫描文件: ${files.length}`));
  console.log(chalk.yellow(`发现问题: ${totalIssues}`));
  
  if (applyMode) {
    console.log(chalk.green(`修复文件: ${fixedFiles}`));
  } else {
    console.log(chalk.gray('运行模式: 检测模式（添加 --apply 参数应用修复）'));
  }
  
  console.log('');
  
  if (totalIssues > 0 && !applyMode) {
    console.log(chalk.cyan('💡 提示: 使用以下命令应用修复'));
    console.log(chalk.white('   node auto-fix.js --apply'));
  }
}

main();
