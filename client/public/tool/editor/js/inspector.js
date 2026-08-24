/**
 * Live HTML Editor - Inspector & Line Tracking Module
 */

function annotateHTMLWithLines(html) {
  let result = '';
  let i = 0;
  const len = html.length;
  let line = 1;
  let inScript = false;
  let inStyle = false;
  let inComment = false;

  while (i < len) {
    if (!inScript && !inStyle && !inComment && html.substr(i, 4) === '<!--') {
      inComment = true;
      result += '<!--';
      i += 4;
      continue;
    }
    if (inComment) {
      if (html.substr(i, 3) === '-->') {
        inComment = false;
        result += '-->';
        i += 3;
        continue;
      }
      if (html[i] === '\n') line++;
      result += html[i];
      i++;
      continue;
    }

    if (inScript) {
      if (html.substr(i, 9).toLowerCase() === '</script>') {
        inScript = false;
        result += '</script>';
        i += 9;
        continue;
      }
      if (html[i] === '\n') line++;
      result += html[i];
      i++;
      continue;
    }

    if (inStyle) {
      if (html.substr(i, 8).toLowerCase() === '</style>') {
        inStyle = false;
        result += '</style>';
        i += 8;
        continue;
      }
      if (html[i] === '\n') line++;
      result += html[i];
      i++;
      continue;
    }

    if (html[i] === '<') {
      if (html[i + 1] === '/' || html[i + 1] === '!' || html[i + 1] === '?') {
        result += html[i];
        i++;
        continue;
      }

      const match = html.slice(i).match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
      if (match) {
        const tagName = match[1];
        const tagLower = tagName.toLowerCase();
        const tagLine = line;

        if (tagLower === 'script') inScript = true;
        if (tagLower === 'style') inStyle = true;

        result += `<${tagName} data-line="${tagLine}"`;
        i += match[0].length;
        continue;
      }
    }

    if (html[i] === '\n') line++;
    result += html[i];
    i++;
  }

  return result;
}


function getInspectorScript(currentMode = 'visual-edit') {
  return `
  <style id="__inspector_styles">
    .__inspector_highlight {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.12) !important;
      cursor: pointer !important;
    }
    .__selected_element {
      outline: 2px solid #8b5cf6 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.25) !important;
      position: relative !important;
    }
    .__editing_inline {
      outline: 2px dashed #10b981 !important;
      outline-offset: 3px !important;
      background-color: rgba(16, 185, 129, 0.08) !important;
      cursor: text !important;
    }
    [contenteditable="true"]:focus {
      outline: 2px dashed #10b981 !important;
    }
  </style>
  <script id="__inspector_script">
    (function() {
      let currentMode = '${currentMode}'; // 'preview' | 'inspect' | 'visual-edit'
      let selectedElement = null;
      let editingElement = null;
      let syncDebounceTimer = null;

      function clearHighlights() {
        document.querySelectorAll('.__inspector_highlight').forEach(el => {
          el.classList.remove('__inspector_highlight');
        });
      }

      function clearSelection() {
        if (selectedElement && selectedElement.classList) {
          selectedElement.classList.remove('__selected_element');
        }
        if (editingElement) {
          stopInlineEditing(false);
        }
        selectedElement = null;
      }

      function getElementSelector(target) {
        if (!target || !target.tagName) return '';
        const tag = target.tagName.toLowerCase();
        const id = (typeof target.id === 'string' && target.id) ? '#' + target.id : '';
        const classes = target.classList
          ? Array.from(target.classList)
              .filter(c => !c.startsWith('__'))
              .map(c => '.' + c).join('')
          : '';
        return tag + id + classes;
      }

      function getLineNumber(target) {
        if (!target) return null;
        const lineAttr = (target.getAttribute && target.getAttribute('data-line')) || 
                         (target.closest && target.closest('[data-line]')?.getAttribute('data-line'));
        return lineAttr ? parseInt(lineAttr, 10) : null;
      }

      function getComputedInfo(target) {
        if (!target) return {};
        const rect = target.getBoundingClientRect();
        const style = window.getComputedStyle(target);
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          textAlign: style.textAlign,
          display: style.display,
          margin: style.margin,
          padding: style.padding,
          borderRadius: style.borderRadius,
          className: Array.from(target.classList || []).filter(c => !c.startsWith('__')).join(' '),
          id: target.id || '',
          href: target.getAttribute('href') || '',
          src: target.getAttribute('src') || ''
        };
      }

      // Serialize clean HTML back to parent editor
      function serializeAndSync() {
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = setTimeout(() => {
          const cloneDoc = document.documentElement.cloneNode(true);
          
          // Clean injected elements and attributes
          const injectedStyles = cloneDoc.querySelector('#__inspector_styles');
          if (injectedStyles) injectedStyles.remove();
          const injectedScript = cloneDoc.querySelector('#__inspector_script');
          if (injectedScript) injectedScript.remove();

          cloneDoc.querySelectorAll('*').forEach(el => {
            el.classList.remove('__inspector_highlight', '__selected_element', '__editing_inline');
            if (el.getAttribute('class') === '') el.removeAttribute('class');
            el.removeAttribute('contenteditable');
            el.removeAttribute('data-line');
            el.removeAttribute('spellcheck');
          });

          const docType = document.doctype 
            ? '<!DOCTYPE ' + document.doctype.name + (document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : '') + (!document.doctype.publicId && document.doctype.systemId ? ' SYSTEM' : '') + (document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : '') + '>\n'
            : '<!DOCTYPE html>\n';

          const cleanHTML = docType + cloneDoc.outerHTML;

          window.parent.postMessage({
            type: 'PREVIEW_MUTATED',
            html: cleanHTML
          }, '*');
        }, 150);
      }

      function startInlineEditing(target) {
        if (!target) return;
        stopInlineEditing(false);
        editingElement = target;
        target.contentEditable = 'true';
        target.spellcheck = false;
        target.classList.add('__editing_inline');
        target.focus();

        function onInput() {
          serializeAndSync();
        }

        function onBlur() {
          target.removeEventListener('input', onInput);
          target.removeEventListener('blur', onBlur);
          stopInlineEditing(true);
        }

        target.addEventListener('input', onInput);
        target.addEventListener('blur', onBlur, { once: true });

        target.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            e.preventDefault();
            target.blur();
          }
        });
      }

      function stopInlineEditing(shouldSync = true) {
        if (editingElement) {
          editingElement.contentEditable = 'false';
          editingElement.classList.remove('__editing_inline');
          editingElement = null;
          if (shouldSync) serializeAndSync();
        }
      }

      function selectElement(target, skipLineJump = false) {
        if (!target || target === document.body || target === document.documentElement) return;
        clearSelection();
        selectedElement = target;
        selectedElement.classList.add('__selected_element');

        const selector = getElementSelector(target);
        const line = getLineNumber(target);
        const computed = getComputedInfo(target);

        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          selector: selector,
          line: line,
          tag: target.tagName.toLowerCase(),
          text: target.innerText || target.textContent || '',
          computed: computed,
          skipLineJump: skipLineJump
        }, '*');
      }

      // Mode switch handler
      window.addEventListener('message', function(e) {
        if (!e.data) return;

        if (e.data.type === 'SET_MODE') {
          currentMode = e.data.mode;
          clearHighlights();
          clearSelection();
        }

        if (e.data.type === 'SET_INSPECTOR_MODE') {
          currentMode = e.data.active ? 'inspect' : 'preview';
          clearHighlights();
          clearSelection();
        }

        // Parent commands (Format, Style, Insert, Duplicate, Delete, Move)
        if (e.data.type === 'EXEC_COMMAND') {
          handleExecCommand(e.data);
        }
      });

      function handleExecCommand(data) {
        const { cmd, value, payload } = data;
        if (!selectedElement && cmd !== 'insert_element') return;

        switch (cmd) {
          case 'edit_text':
            if (selectedElement) startInlineEditing(selectedElement);
            break;

          case 'format_text':
            if (value === 'bold' || value === 'italic' || value === 'underline' || value === 'strikeThrough') {
              document.execCommand(value, false, null);
              serializeAndSync();
            } else if (value.startsWith('justify')) {
              if (selectedElement) {
                const align = value.replace('justify', '').toLowerCase();
                selectedElement.style.textAlign = align;
                serializeAndSync();
              }
            }
            break;

          case 'apply_style':
            if (selectedElement && payload) {
              for (const [key, val] of Object.entries(payload)) {
                if (val === null || val === '') {
                  selectedElement.style.removeProperty(key);
                } else {
                  selectedElement.style[key] = val;
                }
              }
              selectElement(selectedElement, true);
              serializeAndSync();
            }
            break;

          case 'insert_element':
            const htmlSnippet = payload && payload.html ? payload.html : '<div>New Element</div>';
            const position = payload && payload.position ? payload.position : 'after';
            const temp = document.createElement('div');
            temp.innerHTML = htmlSnippet.trim();
            const newEl = temp.firstElementChild;

            if (selectedElement && selectedElement.parentNode) {
              if (position === 'before') {
                selectedElement.parentNode.insertBefore(newEl, selectedElement);
              } else if (position === 'inside') {
                selectedElement.appendChild(newEl);
              } else { // after
                selectedElement.parentNode.insertBefore(newEl, selectedElement.nextSibling);
              }
            } else {
              document.body.appendChild(newEl);
            }
            selectElement(newEl);
            serializeAndSync();
            break;

          case 'duplicate_element':
            if (selectedElement && selectedElement.parentNode) {
              const clone = selectedElement.cloneNode(true);
              clone.classList.remove('__selected_element', '__inspector_highlight', '__editing_inline');
              selectedElement.parentNode.insertBefore(clone, selectedElement.nextSibling);
              selectElement(clone);
              serializeAndSync();
            }
            break;

          case 'delete_element':
            if (selectedElement && selectedElement.parentNode) {
              const parent = selectedElement.parentNode;
              selectedElement.remove();
              clearSelection();
              selectElement(parent !== document.body ? parent : null, true);
              serializeAndSync();
            }
            break;

          case 'move_element_up':
            if (selectedElement && selectedElement.previousElementSibling) {
              selectedElement.parentNode.insertBefore(selectedElement, selectedElement.previousElementSibling);
              selectElement(selectedElement, true);
              serializeAndSync();
            }
            break;

          case 'move_element_down':
            if (selectedElement && selectedElement.nextElementSibling) {
              selectedElement.parentNode.insertBefore(selectedElement.nextElementSibling, selectedElement);
              selectElement(selectedElement, true);
              serializeAndSync();
            }
            break;

          case 'set_attributes':
            if (selectedElement && payload) {
              if (payload.id !== undefined) selectedElement.id = payload.id;
              if (payload.className !== undefined) {
                const existingSpecial = Array.from(selectedElement.classList).filter(c => c.startsWith('__'));
                selectedElement.className = (payload.className + ' ' + existingSpecial.join(' ')).trim();
              }
              if (payload.href !== undefined && selectedElement.tagName.toLowerCase() === 'a') {
                selectedElement.setAttribute('href', payload.href);
              }
              if (payload.src !== undefined && selectedElement.tagName.toLowerCase() === 'img') {
                selectedElement.setAttribute('src', payload.src);
              }
              selectElement(selectedElement, true);
              serializeAndSync();
            }
            break;
        }
      }

      // Mouse Hover Events
      document.addEventListener('mouseover', function(e) {
        if (currentMode === 'preview') return;
        const target = e.target;
        if (!target || target === document.body || target === document.documentElement) return;

        clearHighlights();
        if (target !== selectedElement) {
          target.classList.add('__inspector_highlight');
        }

        const line = getLineNumber(target);
        const selector = getElementSelector(target);

        window.parent.postMessage({
          type: 'ELEMENT_HOVER',
          line: line,
          selector: selector,
          tag: target.tagName ? target.tagName.toLowerCase() : ''
        }, '*');
      }, true);

      document.addEventListener('mouseout', function(e) {
        if (currentMode === 'preview') return;
        if (e.target && e.target.classList) {
          e.target.classList.remove('__inspector_highlight');
        }
        window.parent.postMessage({ type: 'ELEMENT_LEAVE' }, '*');
      }, true);

      // Left-Click Events
      document.addEventListener('click', function(e) {
        const target = e.target;
        if (!target || target === document.body || target === document.documentElement) {
          if (currentMode === 'visual-edit') clearSelection();
          return;
        }

        // Handling link clicks in preview vs edit mode
        const link = target.closest ? target.closest('a') : null;
        if (link && currentMode === 'preview') {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            if (href.length > 1) {
              try {
                const targetEl = document.querySelector(href);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
              } catch(err) {}
            }
          } else if (href && !href.startsWith('javascript:')) {
            e.preventDefault();
            window.open(link.href, '_blank');
          }
          return;
        }

        if (currentMode === 'inspect') {
          e.preventDefault();
          e.stopPropagation();
          const line = getLineNumber(target);
          const selector = getElementSelector(target);
          window.parent.postMessage({
            type: 'ELEMENT_CLICK',
            line: line,
            selector: selector,
            tag: target.tagName.toLowerCase()
          }, '*');
        } else if (currentMode === 'visual-edit') {
          e.preventDefault();
          e.stopPropagation();
          selectElement(target);
        }
      }, true);

      // Double-Click for Inline Text Editing
      document.addEventListener('dblclick', function(e) {
        if (currentMode !== 'visual-edit') return;
        const target = e.target;
        if (!target || target === document.body || target === document.documentElement) return;
        e.preventDefault();
        e.stopPropagation();
        selectElement(target, true);
        startInlineEditing(target);
      }, true);

      // Right-Click (Context Menu) Handling
      document.addEventListener('contextmenu', function(e) {
        if (currentMode === 'preview') return; // Allow normal browser context menu in preview
        const target = e.target;
        if (!target || target === document.body || target === document.documentElement) return;

        e.preventDefault();
        e.stopPropagation();

        selectElement(target, true);

        const selector = getElementSelector(target);
        const line = getLineNumber(target);
        const computed = getComputedInfo(target);
        const isEditable = !['IMG', 'HR', 'BR', 'INPUT'].includes(target.tagName);

        window.parent.postMessage({
          type: 'OPEN_CONTEXT_MENU',
          clientX: e.clientX,
          clientY: e.clientY,
          screenX: e.screenX,
          screenY: e.screenY,
          tag: target.tagName.toLowerCase(),
          selector: selector,
          line: line,
          isEditable: isEditable,
          computed: computed
        }, '*');
      }, true);

      // Keyboard shortcuts inside preview (Delete, Esc)
      document.addEventListener('keydown', function(e) {
        if (currentMode === 'visual-edit' && selectedElement && !editingElement) {
          if (e.key === 'Delete' || (e.key === 'Backspace' && !e.target.isContentEditable)) {
            e.preventDefault();
            handleExecCommand({ cmd: 'delete_element' });
          } else if (e.key === 'Escape') {
            clearSelection();
          } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            handleExecCommand({ cmd: 'duplicate_element' });
          }
        }
      });
    })();
  <\/script>
  `;
}

// Helper: ป้องกัน XSS ด้วยการใช้ textContent และ DOM Nodes แทน innerHTML
function setBadgeContent(badgeElement, icon, selector, lineText, hint) {
  if (!badgeElement) return;
  badgeElement.textContent = '';
  
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon + ' ';
  badgeElement.appendChild(iconSpan);

  const strong = document.createElement('strong');
  strong.textContent = selector;
  badgeElement.appendChild(strong);

  if (lineText) {
    badgeElement.appendChild(document.createTextNode(' ' + lineText));
  }
  if (hint) {
    const hintSpan = document.createElement('span');
    hintSpan.textContent = hint;
    hintSpan.style.fontSize = '0.75rem';
    hintSpan.style.opacity = '0.8';
    hintSpan.style.marginLeft = '6px';
    badgeElement.appendChild(hintSpan);
  }
}
