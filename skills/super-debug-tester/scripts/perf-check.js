const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 性能检测脚本
 * 分析代码性能瓶颈
 */

const PERF_PATTERNS = [
  {
    name: '循环中的 DOM 操作',
    pattern: /for\s*\([^)]+\)\s*\{[^}]*document\.(getElementById|querySelector|createElement)/g,
    severity: 'high',
    suggestion: '将 DOM 操作移到循环外部，或使用 DocumentFragment'
  },
  {
    name: '未优化的正则表达式',
    pattern: /new\s+RegExp\([^)]+\)\.(test|exec)\s*\(/g,
    severity: 'medium',
    suggestion: '缓存正则表达式对象，避免重复编译'
  },
  {
    name: '内存泄漏风险 - 未清理的事件监听',
    pattern: /addEventListener\s*\([^)]+\)\s*;(?![\s\S]*?removeEventListener)/g,
    severity: 'high',
    suggestion: '确保在组件卸载时移除事件监听器'
  },
  {
    name: '大数据集操作',
    pattern: /\.(map|filter|reduce|forEach)\s*\([^)]+\)\s*;?\s*\n/g,
    severity: 'medium',
    suggestion: '考虑使用生成器或分批处理大数据集'
  },
  {
    name: '同步文件操作',
    pattern: /fs\.(readFileSync|writeFileSync|appendFileSync)/g,
    severity: 'medium',
    suggestion: '在可能的情况下使用异步文件操作'
  },
  {
    name: '嵌套循环',
    pattern: /for\s*\([^)]+\)\s*\{[\s\S]*?for\s*\([^)]+\)\s*\{/g,
    severity: 'high',
    suggestion: '优化算法复杂度，考虑使用 Map/Set 优化查找'
  },
  {
    name: '递归无终止条件',
    pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\1\s*\([^)]*\)(?!\s*;)/g,
    severity: 'high',
    suggestion: '确保递归函数有明确的终止条件'
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

function analyzePerformance(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  PERF_PATTERNS.forEach(({ name, pattern, severity, suggestion }) => {
    const matches = content.match(pattern);
    if (matches) {
      const lines = findLineNumbers(content, pattern);
      issues.push({
        type: name,
        count: matches.length,
        severity,
        suggestion,
        lines
      });
    }
  });
  
  return { filePath, issues };
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

function getSeverityColor(severity) {
  switch (severity) {
    case 'high':
      return chalk.red;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.gray;
    default:
      return chalk.white;
  }
}

function main() {
  console.log(chalk.cyan('╔════════════════════════════════════╗'));
  console.log(chalk.cyan('║      性能检测工具 v1.0             ║'));
  console.log(chalk.cyan('╚════════════════════════════════════╝\n'));
  
  const targetDir = process.argv[2] || '.';
  const targetModule = process.argv.find(arg => arg.startsWith('--module='))?.split('=')[1];
  
  console.log(chalk.gray(`目标目录: ${path.resolve(targetDir)}`));
  if (targetModule) {
    console.log(chalk.gray(`目标模块: ${targetModule}`));
  }
  console.log('');
  
  // 查找所有 JS/TS 文件
  const files = findJsFiles(targetDir);
  console.log(chalk.blue(`扫描了 ${files.length} 个文件\n`));
  
  let totalIssues = 0;
  let highSeverity = 0;
  let mediumSeverity = 0;
  
  files.forEach(filePath => {
    // 如果指定了模块，过滤文件
    if (targetModule && !filePath.toLowerCase().includes(targetModule.toLowerCase())) {
      return;
    }
    
    const result = analyzePerformance(filePath);
    
    if (result.issues.length > 0) {
      totalIssues += result.issues.length;
      console.log(chalk.white(`📄 ${path.relative(targetDir, filePath)}`));
      
      result.issues.forEach(issue => {
        const colorFn = getSeverityColor(issue.severity);
        console.log(colorFn(`   [${issue.severity.toUpperCase()}] ${issue.type}`));
        console.log(chalk.gray(`   位置: 第 ${issue.lines.join(', ')} 行`));
        console.log(chalk.cyan(`   建议: ${issue.suggestion}`));
        console.log('');
        
        if (issue.severity === 'high') highSeverity++;
        if (issue.severity === 'medium') mediumSeverity++;
      });
    }
  });
  
  // 输出汇总
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.cyan('              性能检测结果           '));
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.blue(`扫描文件: ${files.length}`));
  console.log(chalk.red(`高危问题: ${highSeverity}`));
  console.log(chalk.yellow(`中危问题: ${mediumSeverity}`));
  console.log(chalk.gray(`问题总计: ${totalIssues}`));
  console.log('');
  
  if (totalIssues > 0) {
    console.log(chalk.cyan('💡 优化建议'));
    console.log(chalk.white('   1. 优先处理高危性能问题'));
    console.log(chalk.white('   2. 考虑使用性能分析工具进行深度检测'));
    console.log(chalk.white('   3. 对关键路径进行基准测试'));
  } else {
    console.log(chalk.green('✓ 未发现明显的性能问题'));
  }
}

main();
