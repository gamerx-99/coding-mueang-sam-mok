/**
 * Live HTML Editor - Code Formatter Module (HTML Beautifier)
 */

function formatHTML(code) {
  try {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|!doctype)/i;

    const tokens = code.match(/<!--[\s\S]*?-->|<(pre|textarea|script|style|code)[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi) || [];

    tokens.forEach(token => {
      const trimmed = token.trim();
      if (!trimmed) return;

      const isPreserveBlock = /^<(pre|textarea|script|style|code)[\s\S]*?<\/\1>/i.test(trimmed);
      if (isPreserveBlock) {
        formatted += tab.repeat(indent) + trimmed + '\n';
        return;
      }

      if (/^<\/[^>]+>/.test(trimmed)) {
        indent = Math.max(0, indent - 1);
        formatted += tab.repeat(indent) + trimmed + '\n';
      } else if (/^<!--/.test(trimmed) || /^<[^>]+\/>$/.test(trimmed) || (trimmed.startsWith('<') && voidTags.test(trimmed.slice(1)))) {
        formatted += tab.repeat(indent) + trimmed + '\n';
      } else if (/^<[a-zA-Z][^>]*>$/.test(trimmed)) {
        formatted += tab.repeat(indent) + trimmed + '\n';
        indent++;
      } else {
        formatted += tab.repeat(indent) + trimmed + '\n';
      }
    });

    return formatted.trim();
  } catch (err) {
    console.error('Error formatting HTML:', err);
    throw err;
  }
}
