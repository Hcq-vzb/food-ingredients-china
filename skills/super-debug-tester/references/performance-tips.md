# 性能优化最佳实践

## 概览
本文档提供代码性能优化的关键策略和技巧。

## 循环优化

### 避免在循环中进行 DOM 操作
```javascript
// ❌ 低效
for (let i = 0; i < items.length; i++) {
  document.body.appendChild(items[i]);
}

// ✅ 高效
const fragment = document.createDocumentFragment();
for (let i = 0; i < items.length; i++) {
  fragment.appendChild(items[i]);
}
document.body.appendChild(fragment);
```

### 缓存数组长度
```javascript
// ❌ 每次循环都计算长度
for (let i = 0; i < array.length; i++) { }

// ✅ 缓存长度
for (let i = 0, len = array.length; i < len; i++) { }
```

## 数据结构优化

### 使用合适的数据结构
```javascript
// ❌ 数组查找 O(n)
const arr = [1, 2, 3, 4, 5];
arr.includes(3); // 线性搜索

// ✅ Set 查找 O(1)
const set = new Set([1, 2, 3, 4, 5]);
set.has(3); // 常数时间
```

### 使用 Map 替代对象
```javascript
// ❌ 对象键只能是字符串
const obj = {};
obj[{}] = 'value'; // 键被转为 "[object Object]"

// ✅ Map 支持任意类型键
const map = new Map();
map.set({}, 'value'); // 正常工作
```

## 异步优化

### 并行执行独立请求
```javascript
// ❌ 串行执行
const user = await fetchUser();
const posts = await fetchPosts();

// ✅ 并行执行
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
]);
```

### 使用防抖和节流
```javascript
// 防抖 - 延迟执行
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流 - 限制频率
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## 内存优化

### 避免内存泄漏
```javascript
// ❌ 忘记移除事件监听
element.addEventListener('click', handler);

// ✅ 组件卸载时移除
useEffect(() => {
  element.addEventListener('click', handler);
  return () => element.removeEventListener('click', handler);
}, []);
```

### 使用 WeakMap/WeakSet
```javascript
// 不会阻止垃圾回收
const weakMap = new WeakMap();
let obj = { data: 'value' };
weakMap.set(obj, 'metadata');
obj = null; // obj 可以被垃圾回收
```

## 渲染优化

### 虚拟列表
```javascript
// 只渲染可见区域
function VirtualList({ items, itemHeight, visibleCount }) {
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleItems = items.slice(startIndex, startIndex + visibleCount);
  
  return (
    <div onScroll={e => setScrollTop(e.target.scrollTop)}>
      {visibleItems.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

## 网络优化

### 资源预加载
```html
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">
```

### 代码分割
```javascript
// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```
