const fs = require('fs');
const path = require('path');

const filePaths = process.argv.slice(2);

if (filePaths.length === 0) {
  console.log('Please provide file paths');
  process.exit(1);
}

const replacements = [
  { regex: /\bbg-gray-50\/50\b/g, replace: 'bg-light-bg dark:bg-dark-bg' },
  { regex: /\bbg-gray-50\b/g, replace: 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt' },
  { regex: /\bbg-white\b/g, replace: 'bg-white dark:bg-dark-surface' },
  { regex: /\bbg-gray-100\b/g, replace: 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt' },
  { regex: /\bbg-gray-200\b/g, replace: 'bg-light-border dark:bg-dark-border' },
  
  { regex: /\bborder-gray-100\b/g, replace: 'border-light-border dark:border-dark-border' },
  { regex: /\bborder-gray-150\b/g, replace: 'border-light-border dark:border-dark-border' },
  { regex: /\bborder-gray-155\b/g, replace: 'border-light-border dark:border-dark-border' },
  { regex: /\bborder-gray-200\b/g, replace: 'border-light-border dark:border-dark-border' },
  { regex: /\bborder-gray-250\b/g, replace: 'border-light-border dark:border-dark-border' },
  { regex: /\bborder-gray-300\b/g, replace: 'border-light-borderHover dark:border-dark-borderHover' },

  { regex: /\btext-gray-900\b/g, replace: 'text-light-text dark:text-dark-text' },
  { regex: /\btext-gray-800\b/g, replace: 'text-light-text dark:text-dark-text' },
  { regex: /\btext-gray-700\b/g, replace: 'text-light-textSecondary dark:text-dark-textSecondary' },
  { regex: /\btext-gray-600\b/g, replace: 'text-light-textSecondary dark:text-dark-textSecondary' },
  { regex: /\btext-gray-500\b/g, replace: 'text-light-textMuted dark:text-dark-textMuted' },
  { regex: /\btext-gray-450\b/g, replace: 'text-light-textMuted dark:text-dark-textMuted' },
  { regex: /\btext-gray-400\b/g, replace: 'text-light-textMuted dark:text-dark-textMuted' },

  { regex: /\btext-orange-500\b/g, replace: 'text-brand-orange-500 dark:text-brand-orange-400' },
  { regex: /\btext-orange-600\b/g, replace: 'text-brand-orange-600 dark:text-brand-orange-500' },
  { regex: /\btext-orange-900\b/g, replace: 'text-brand-orange-600 dark:text-brand-orange-400' },
  { regex: /\btext-orange-950\b/g, replace: 'text-brand-orange-600 dark:text-brand-orange-400' },
  { regex: /\bbg-orange-50\/50\b/g, replace: 'bg-brand-orange-50 dark:bg-brand-orange-950/20' },
  { regex: /\bbg-orange-50\b/g, replace: 'bg-brand-orange-50 dark:bg-brand-orange-950/20' },
  { regex: /\bborder-orange-100\b/g, replace: 'border-brand-orange-100 dark:border-brand-orange-500/20' },
  { regex: /\bborder-orange-200\b/g, replace: 'border-brand-orange-200 dark:border-brand-orange-500/30' },
  { regex: /\bbg-orange-500\b/g, replace: 'bg-brand-orange-500' },
  { regex: /\bbg-orange-600\b/g, replace: 'bg-brand-orange-600' },
  { regex: /\bborder-orange-500\b/g, replace: 'border-brand-orange-500' },

  { regex: /\bfocus:ring-orange-500\/10\b/g, replace: 'focus:ring-brand-orange-500/10' },
  { regex: /\bfocus:border-orange-500\b/g, replace: 'focus:border-brand-orange-500' },

  { regex: /\bfrom-orange-500\b/g, replace: 'from-brand-orange-500' },
  { regex: /\bto-amber-600\b/g, replace: 'to-brand-orange-600' },
  { regex: /\bhover:from-orange-600\b/g, replace: 'hover:from-brand-orange-600' },
  { regex: /\bhover:to-amber-700\b/g, replace: 'hover:to-brand-orange-700' },
  { regex: /\bshadow-orange-500\/10\b/g, replace: 'shadow-brand-orange-500/10' }
];

filePaths.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });

    // We also need to add transition classes to main div if missing
    // But it's easier to just do text replacements and manually fix structural stuff.

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
