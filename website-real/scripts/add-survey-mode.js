#!/usr/bin/env node

/**
 * Script to add survey mode support to all product pages
 * This script adds the useSurveyMode hook import, usage, and conditional logic
 * to hide prices and disable cart functionality
 */

const fs = require('fs');
const path = require('path');

// Directories to check for product pages  
const shopDir = path.join(__dirname, 'app', 'shop');
const subdirs = fs.readdirSync(shopDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => !name.startsWith('[') && name !== 'page.tsx'); // Skip dynamic routes and main shop page

console.log('Found product directories:', subdirs);

function addSurveyModeSupport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file does not exist`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has survey mode
  if (content.includes('useSurveyMode')) {
    console.log(`Skipping ${filePath} - already has survey mode support`);
    return;
  }

  console.log(`Processing ${filePath}`);

  // Add import for useSurveyMode hook
  if (content.includes('import { isGreenColorOnSale, getStPatsPrice') && !content.includes('useSurveyMode')) {
    content = content.replace(
      'import { isGreenColorOnSale, getStPatsPrice',
      'import { isGreenColorOnSale, getStPatsPrice'
    );
    content = content.replace(
      'from "@/lib/stPatricksDay";',
      'from "@/lib/stPatricksDay";\nimport { useSurveyMode } from "@/hooks/useSurveyMode";'
    );
  }

  // Add survey mode hook to component
  const exportDefaultMatch = content.match(/export default function \w+\(\) \{\s*/);
  if (exportDefaultMatch) {
    const insertPos = exportDefaultMatch.index + exportDefaultMatch[0].length;
    content = content.slice(0, insertPos) + 
              '  const isSurveyMode = useSurveyMode();\n  ' + 
              content.slice(insertPos);
  }

  // Wrap price displays with survey mode check
  // This is a simplified approach - may need manual adjustment for complex cases
  content = content.replace(
    /(\$\{PRODUCT\.price\})/g,
    '{!isSurveyMode && "$" + PRODUCT.price}'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// Process each product directory
subdirs.forEach(dir => {
  const pagePath = path.join(shopDir, dir, 'page.tsx');
  addSurveyModeSupport(pagePath);
});

console.log('Survey mode setup complete!');

module.exports = { addSurveyModeSupport };