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
        } else if (fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('src/app');
let fixedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Normalizing file path.
    const normalizedFile = file.replace(/\\/g, '/');
    const parts = normalizedFile.split('/');
    const appIndex = parts.indexOf('app');
    const depth = parts.length - appIndex - 2;

    let relPath = '';
    if (depth === 0) {
        relPath = './';
    } else {
        for (let i = 0; i < depth; i++) {
            relPath += '../';
        }
    }
    const correctImport = `import { LoadingSpinnerComponent } from '${relPath}shared/components/loading-spinner/loading-spinner.component';`;

    // 1. Check if the file imports LoadingSpinnerComponent but the path is not perfectly relative or is an absolute import.
    // Sometimes the automatic node script might have messed up `.../shared` depth.
    // Match any import of LoadingSpinnerComponent from anywhere ending in `shared/components/loading-spinner/loading-spinner.component`
    const wrongImportPattern = /import\s+\{\s*LoadingSpinnerComponent\s*\}\s*from\s*['"][^\n]+shared\/components\/loading-spinner\/loading-spinner\.component['"];/g;

    // We only replace if there's a match and it is not ALREADY the strictly correct import string.
    if (wrongImportPattern.test(content) && !content.includes(correctImport)) {
        content = content.replace(wrongImportPattern, correctImport);
    }

    // 2. Check if the file uses LoadingSpinnerComponent in its imports array, but lacks the import statement altogether
    if (content.includes('LoadingSpinnerComponent') && !content.includes('shared/components/loading-spinner/loading-spinner.component')) {
        const importMatches = [...content.matchAll(/^import.*from.*;/gm)];
        if (importMatches.length > 0) {
            const lastMatch = importMatches[importMatches.length - 1];
            const pos = lastMatch.index + lastMatch[0].length + 1;
            content = content.substring(0, pos) + correctImport + '\n' + content.substring(pos);
        }
    }

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed import in: ' + file);
        fixedCount++;
    }
}
console.log('Total fixed imports: ' + fixedCount);
