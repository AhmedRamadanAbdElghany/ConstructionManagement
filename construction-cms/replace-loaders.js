const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.html')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('src/app');
let replacedFilesCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Pattern for the indigo spinner: <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    const pattern = /<div\s+class=\"w-12\s+h-12\s+border-4\s+border-indigo-500\s+border-t-transparent\s+rounded-full\s+animate-spin\">\s*<\/div>/g;

    if (pattern.test(content)) {
        content = content.replace(pattern, '<app-loading-spinner [centered]="true" [label]="\'common.loading\' | translate"></app-loading-spinner>');

        if (file.endsWith('.ts') && !file.includes('.spec.ts')) {
            if (!content.includes('LoadingSpinnerComponent')) {
                // Determine import path
                const parts = file.split(path.sep);
                const depth = parts.length - 4; // src/app/folder...
                let prefix = './';
                if (depth > 0) {
                    prefix = '';
                    for (let i = 0; i < depth; i++) {
                        prefix += '../';
                    }
                }
                const importStr = `import { LoadingSpinnerComponent } from '${prefix}shared/components/loading-spinner/loading-spinner.component';\n`;

                // Add import
                const importMatches = [...content.matchAll(/^import.*from.*;/gm)];
                if (importMatches.length > 0) {
                    const lastMatch = importMatches[importMatches.length - 1];
                    const pos = lastMatch.index + lastMatch[0].length + 1;
                    content = content.substring(0, pos) + importStr + content.substring(pos);
                } else {
                    content = importStr + content;
                }

                // Add to imports array
                content = content.replace(/imports:\s*\[([^\]]*)\]/, (match, p1) => {
                    const addComma = p1.trim().length > 0 ? ', ' : '';
                    return `imports: [${p1}${addComma}LoadingSpinnerComponent]`;
                });
            }
        }

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            replacedFilesCount++;
            console.log('Updated: ' + file);
        }
    }
}
console.log('Total files updated: ' + replacedFilesCount);
