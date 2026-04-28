/**
 * 组件生成脚本
 * 根据组件描述生成标准化 React 组件代码
 */

function generateComponent(name, props = [], hasAnimation = false) {
  const propString = props.map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`).join('; ');
  
  const animationImport = hasAnimation 
    ? "import { motion } from 'framer-motion';\n" 
    : '';
  
  const wrapperStart = hasAnimation 
    ? '<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>' 
    : '<div>';
  
  const wrapperEnd = hasAnimation ? '</motion.div>' : '</div>';

  return `${animationImport}import React from 'react';

interface ${name}Props {
  ${propString}
}

export const ${name}: React.FC<${name}Props> = ({
  ${props.map(p => p.name).join(', ')}
}) => {
  return (
    ${wrapperStart}
      {/* Component content */}
    ${wrapperEnd}
  );
};
`;
}

// CLI 支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const name = args[0] || 'MyComponent';
  const hasAnimation = args.includes('--animation');
  
  console.log(generateComponent(name, [], hasAnimation));
}

module.exports = { generateComponent };
