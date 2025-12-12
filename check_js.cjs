const fs = require('fs');
const html = fs.readFileSync('test.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch && scriptMatch.length > 4) {
  const lastScript = scriptMatch[scriptMatch.length - 1];
  const jsCode = lastScript.replace(/<\/?script>/g, '');
  try {
    new Function(jsCode);
    console.log('JS syntax OK');
  } catch (e) {
    console.log('JS ERROR:', e.message);
    // 找到错误位置
    const lines = jsCode.split('\n');
    const match = e.message.match(/at position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      let count = 0;
      for (let i = 0; i < lines.length; i++) {
        count += lines[i].length + 1;
        if (count > pos) {
          console.log('Error near line', i + 1, ':', lines[i].substring(0, 100));
          break;
        }
      }
    }
  }
}
