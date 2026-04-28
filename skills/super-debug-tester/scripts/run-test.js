const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * 运行测试脚本
 * 用法: node run-test.js --project=<项目名> --module=<模块名> --auto-check
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    project: null,
    module: null,
    autoCheck: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--project=')) {
      options.project = arg.split('=')[1];
    } else if (arg.startsWith('--module=')) {
      options.module = arg.split('=')[1];
    } else if (arg === '--auto-check') {
      options.autoCheck = true;
    }
  });

  return options;
}

function findTestFiles(projectPath, moduleName) {
  const testPatterns = [
    `**/*.test.{js,ts,jsx,tsx}`,
    `**/*.spec.{js,ts,jsx,tsx}`,
    `**/tests/**/*.js`,
    `**/__tests__/**/*.js`
  ];

  const testFiles = [];
  
  testPatterns.forEach(pattern => {
    try {
      const { globSync } = require('glob');
      const files = globSync(pattern, { cwd: projectPath });
      testFiles.push(...files);
    } catch (e) {
      // 忽略错误
    }
  });

  if (moduleName) {
    return testFiles.filter(f => f.toLowerCase().includes(moduleName.toLowerCase()));
  }

  return testFiles;
}

function runTest(testFile, projectPath) {
  console.log(chalk.blue(`\n▶ 运行测试: ${testFile}`));
  
  try {
    const result = execSync(`node ${testFile}`, {
      cwd: projectPath,
      encoding: 'utf-8',
      timeout: 30000
    });
    console.log(chalk.green('✓ 测试通过'));
    console.log(result);
    return { success: true, output: result };
  } catch (error) {
    console.log(chalk.red('✗ 测试失败'));
    console.log(error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

function main() {
  const options = parseArgs();
  
  console.log(chalk.cyan('╔════════════════════════════════════╗'));
  console.log(chalk.cyan('║      代码测试运行器 v1.0           ║'));
  console.log(chalk.cyan('╚════════════════════════════════════╝'));
  
  if (!options.project) {
    console.log(chalk.yellow('⚠ 未指定项目，使用当前目录'));
    options.project = '.';
  }

  const projectPath = path.resolve(options.project);
  
  if (!fs.existsSync(projectPath)) {
    console.log(chalk.red(`✗ 项目路径不存在: ${projectPath}`));
    process.exit(1);
  }

  console.log(chalk.gray(`项目路径: ${projectPath}`));
  if (options.module) {
    console.log(chalk.gray(`目标模块: ${options.module}`));
  }
  console.log(chalk.gray(`自动检查: ${options.autoCheck ? '开启' : '关闭'}`));
  console.log('');

  // 查找测试文件
  const testFiles = findTestFiles(projectPath, options.module);
  
  if (testFiles.length === 0) {
    console.log(chalk.yellow('⚠ 未找到测试文件'));
    process.exit(0);
  }

  console.log(chalk.blue(`找到 ${testFiles.length} 个测试文件`));
  console.log('');

  // 运行测试
  let passed = 0;
  let failed = 0;

  testFiles.forEach(file => {
    const result = runTest(file, projectPath);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  });

  // 输出汇总
  console.log(chalk.cyan('\n════════════════════════════════════'));
  console.log(chalk.cyan('              测试结果汇总           '));
  console.log(chalk.cyan('════════════════════════════════════'));
  console.log(chalk.green(`✓ 通过: ${passed}`));
  console.log(chalk.red(`✗ 失败: ${failed}`));
  console.log(chalk.gray(`  总计: ${testFiles.length}`));
  console.log('');

  if (failed > 0 && options.autoCheck) {
    console.log(chalk.yellow('⚠ 检测到失败的测试，建议运行自动修复'));
    console.log(chalk.gray('  命令: 自动修复问题 --apply'));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
