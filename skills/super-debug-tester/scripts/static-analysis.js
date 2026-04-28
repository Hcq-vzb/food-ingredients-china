const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 静态代码分析脚本
 * 扫描代码规范、潜在漏洞
 */

const SECURITY_PATTERNS = [
  {
    name: '硬编码密钥',
    pattern: /(password|secret|key|token)\s*[=:]\s*['"][^'"]{8,}['"]/gi,
    severity: 'critical',
    category: '安全',
    suggestion: '使用环境变量或密钥管理服务存储敏感信息'
  },
  {
    name: 'SQL 注入风险',
    pattern: /(query|exec)\s*\(\s*[`"'][^`"']*\$\{[^}]+\}/g,
    severity: 'critical',
    category: '安全',
    suggestion: '使用参数化查询或 ORM 框架'
  },
  {
    name: 'XSS 风险 - innerHTML',
    pattern: /\.innerHTML\s*=\s*[^;]+/g,
    severity: 'high',
    category: '安全',
    suggestion: '使用 textContent 或安全的 HTML 转义'
  },
  {
    name: '不安全的 eval',
    pattern: /eval\s*\(/g,
    severity: 'high',
    category: '安全',
    suggestion: '避免使用 eval，使用 JSON.parse 或 Function 构造器'
  },
  {
    name: '不安全的正则',
    pattern: /new\s+RegExp\s*\(\s*[^)]+\+\s*[^)]+\)/g,
    severity: 'medium',
    category: '安全',
    suggestion: '验证用户输入，避免正则表达式注入'
  }
];

const CODE_STYLE_PATTERNS = [
  {
    name: '未使用的导入',
    pattern: /import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];(?![\s\S]*?\{[^}]*\b(imported)\b)/g,
    severity: 'low',
    category: '规范',
    suggestion: '移除未使用的导入'
  },
  {
    name: '过长的函数',
    pattern: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{500,}\}/g,
    severity: 'low',
    category: '规范',
    suggestion: '将长函数拆分为多个小函数'
  },
  {
    name: '魔法数字',
    pattern: /[^\w](\d{3,})[^\w]/g,
    severity: 'low',
    category: '规范',
    suggestion: '使用具名常量替代魔法数字'
  },
  {
    name: 'TODO 注释',
    pattern: /\/\/\s*TODO/gi,
    severity: 'info',
    category: '规范',
    suggestion: '及时处理 TODO 项'
  },
  {
    name: 'console 残留',
    pattern: /console\.(log|warn|error|debug)\s*\(/g,
    severity: 'low',
    category: '规范',
    suggestion: '生产环境移除调试日志'
  }
];

const DEAD_CODE_PATTERNS = [
  {
    name: '未使用的变量',
    pattern: /(?:let|const|var)\s+(\w+)\s*=\s*[^;]+;(?![\s\S]*?\b\1\b)/g,
    severity: 'low',
    category: '死代码',
    suggestion: '移除未使用的变量'
  },
  {
    name: '不可达代码',
    pattern: /return[^;]*;\s*\n\s*[\w\s]+\n/g,
    severity: 'medium',
    category: '死代码',
    suggestion: '移除 return 后的不可达代码'
  },
  {
    name: '空函数体',
    pattern: /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g,
    severity: 'low',
    category: '死代码',
    suggestion: '实现函数或移除空函数'
  }
];

const ALL_PATTERNS = [
  ...SECURITY_PATTERNS,
  ...CODE_STYLE_PATTERNS,
  ...DEAD_CODE_PATTERNS
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
  
  ALL_PATTERNS.forEach(({ name, pattern, severity, category, suggestion }) => {
    const matches = content.match(pattern);
    if (matches) {
      const lines = findLineNumbers(content, pattern);
      issues.push({
        type: name,
        count: matches.length,
        severity,
        category,
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
    case 'critical':
      return chalk.bgRed.white;
    case 'high':
      return chalk.red;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.gray;
    case 'info':
      return chalk.blue;
    default:
      return chalk.white;
  }
}

function main() {
  console.log(chalk.cyan('╔════════════════════════════════════╗'));
  console.log(chalk.cyan('║      静态代码分析工具 v1.0         ║'));
  console.log(chalk.cyan('╚════════════════════════════════════╝\n'));
  
  const targetDir = process.argv[2] || '.';
  
  console.log(chalk.gray(`目标目录: ${path.resolve(targetDir)}\n`));
  
  // 查找所有 JS/TS 文件
  const files = findJsFiles(targetDir);
  console.log(chalk.blue(`扫描了 ${files.length} 个文件\n`));
  
  let totalIssues = 0;
  const categoryCount = {};
  const severityCount = {};
  
  files.forEach(filePath => {
    const result = analyzeFile(filePath);
    
    if (result.issues.length > 0) {
      totalIssues += result.issues.length;
      console.log(chalk.white(`📄 ${path.relative(targetDir, filePath)}`));
      
      result.issues.forEach(issue => {
        const colorFn = getSeverityColor(issue.severity);
        console.log(colorFn(`   [${issue.severity.toUpperCase()}][${issue.category}] ${issue.type}`));
        console.log(chalk.gray(`   位置: 第 ${issue.lines.join(', ')} 行`));
        console.log(chalk.cyan(`   建议: ${issue.suggestion}`));
        console.log('');
        
        categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
        severityCount[issue.severity] = (severityCount[issue.severity] || 0) + 1;
      });
    }
  });
  
  // 输出汇总
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.cyan('              分析结果汇总           '));
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.blue(`扫描文件: ${files.length}`));
  console.log(chalk.gray(`问题总计: ${totalIssues}`));
  console.log('');
  
  if (totalIssues > 0) {
    console.log(chalk.cyan('按严重程度分类'));
    Object.entries(severityCount)
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return order[a[0]] - order[b[0]];
      })
      .forEach(([severity, count]) => {
        const colorFn = getSeverityColor(severity);
        console.log(colorFn(`  ${severity.toUpperCase()}: ${count}`));
      });
    
    console.log('');
    console.log(chalk.cyan('按类别分类'));
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(chalk.white(`  ${category}: ${count}`));
    });
    
    console.log('');
    console.log(chalk.cyan('💡 修复建议'));
    console.log(chalk.white('   1. 优先处理关键和高危安全问题'));
    console.log(chalk.white('   2. 清理死代码和未使用的变量'));
    console.log(chalk.white('   3. 统一代码风格，移除调试代码'));
  } else {
    console.log(chalk.green('✓ 代码质量良好，未发现明显问题'));
  }
}

main();
