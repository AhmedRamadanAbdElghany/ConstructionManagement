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

    // Fix lines where import was appended on the same line due to \r instead of \r\n
    // Pattern: some import line ending with ';' followed by \r then another import (no \n between)
    // This results in two imports on the "same line" with a \r in between
    content = content.replace(/;\rimport /g, ';\r\nimport ');

    // Also clean up double blank lines that may have been introduced
    content = content.replace(/\n\n\n+/g, '\n\n');
    content = content.replace(/\r\n\r\n\r\n+/g, '\r\n\r\n');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed line endings in: ' + file);
        fixedCount++;
    }
}
console.log('Total fixed: ' + fixedCount);
