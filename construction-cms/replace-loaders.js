const fs = require('fs');
const path = require('path');

const targetLoader = <div class="flex justify-center items-center h-64">\n          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>\n        </div>;
const targetLoaderInner = <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>;

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Simple search and replace for other loaders
            
            // 1. SVG spinners in center containers
            content = content.replace(/<div class="flex justify-center items-center[ a-zA-Z0-9-]*">\s*<svg[^>]*animate-spin[^>]*>[\s\S]*?<\/svg>\s*<\/div>/g, targetLoader);
            content = content.replace(/<div class="flex justify-center items-center[ a-zA-Z0-9-]*">\s*<div[^>]*animate-spin[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, targetLoader);
            
            // Replace <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> directly
            content = content.replace(/<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"><\/div>/g, targetLoaderInner);

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Modified:', fullPath);
            }
        }
    });
}
processDir(path.resolve('./src/app'));
