# 常见错误模式与解决方案

## 概览
本文档记录开发中常见的错误模式及其解决方案，用于快速定位和修复问题。

## JavaScript 运行时错误

### TypeError: Cannot read property 'X' of undefined
**原因**: 访问未定义对象的属性
**解决方案**:
```javascript
// 使用可选链操作符
const value = obj?.property?.nested;

// 或提前检查
if (obj && obj.property) {
  const value = obj.property;
}
```

### ReferenceError: X is not defined
**原因**: 使用未声明的变量
**解决方案**:
```javascript
// 确保变量已声明
let x = 0;
const y = 'value';

// 检查拼写错误
const myVar = 1;
console.log(myVar); // 不是 myvar
```

### TypeError: X is not a function
**原因**: 将非函数值作为函数调用
**解决方案**:
```javascript
// 检查类型
if (typeof fn === 'function') {
  fn();
}

// 确保正确导入
import { myFunction } from './module';
```

## 异步错误

### UnhandledPromiseRejectionWarning
**原因**: Promise 被拒绝但未处理
**解决方案**:
```javascript
// 使用 try-catch
async function fetchData() {
  try {
    const data = await api.getData();
  } catch (error) {
    console.error('获取失败:', error);
  }
}

// 或链式调用
dataPromise
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## 性能问题

### Maximum call stack size exceeded
**原因**: 无限递归或循环引用
**解决方案**:
```javascript
// 添加终止条件
function recursive(n) {
  if (n <= 0) return;
  recursive(n - 1);
}

// 检查循环引用
const obj = {};
obj.self = obj; // 避免这种写法
```

## 模块错误

### Cannot find module 'X'
**原因**: 模块未安装或路径错误
**解决方案**:
```bash
# 安装缺失的依赖
npm install X

# 检查路径
import X from './correct-path';
```

## 内存问题

### JavaScript heap out of memory
**原因**: 内存泄漏或处理大数据
**解决方案**:
```javascript
// 及时释放引用
let largeData = fetchLargeData();
processData(largeData);
largeData = null; // 释放

// 使用流处理大文件
const stream = fs.createReadStream('large-file.txt');
```
