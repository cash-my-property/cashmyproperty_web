const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find <button className="..."> and add cursor-pointer
  let modified = content.replace(/<(button)([^>]*?)className=(["'])(.*?)\3/g, (match, tag, before, quote, classes) => {
    if (!classes.includes('cursor-pointer')) {
      return `<${tag}${before}className=${quote}${classes} cursor-pointer${quote}`;
    }
    return match;
  });

  if (content !== modified) {
    fs.writeFileSync(file, modified, 'utf8');
    changedCount++;
    console.log('Modified:', file);
  }
});
console.log('Total files modified for buttons:', changedCount);
