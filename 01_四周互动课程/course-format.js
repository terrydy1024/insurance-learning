(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CourseFormat = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var sentenceEnd = /[。！？!?；;]/;
  var fineEnd = /[，、：:,：]/;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sentenceParts(line) {
    var parts = [];
    var start = 0;
    var text = String(line || '');
    var strong = false;
    for (var index = 0; index < text.length; index += 1) {
      if (text.slice(index, index + 2) === '**') {
        strong = !strong;
        index += 1;
        continue;
      }
      if (strong) continue;
      if (!sentenceEnd.test(text[index])) continue;
      var end = index + 1;
      while (end < text.length && /[”’』」）)】》〉]/.test(text[end])) end += 1;
      parts.push(text.slice(start, end));
      start = end;
      index = end - 1;
    }
    if (start < text.length) parts.push(text.slice(start));
    return parts.filter(function (part) { return part.length > 0; });
  }

  function breakLongPart(part, maxChars) {
    if (part.length <= maxChars) return [part];
    var pieces = [];
    var start = 0;
    var lastBoundary = -1;
    var strong = false;
    for (var index = 0; index < part.length; index += 1) {
      if (part.slice(index, index + 2) === '**') {
        strong = !strong;
        index += 1;
        continue;
      }
      if (!strong && fineEnd.test(part[index])) lastBoundary = index + 1;
      if (index - start + 1 < maxChars) continue;
      if (strong) continue;
      var end = lastBoundary > start ? lastBoundary : index + 1;
      pieces.push(part.slice(start, end));
      start = end;
      lastBoundary = -1;
    }
    if (start < part.length) pieces.push(part.slice(start));
    return pieces;
  }

  function splitParagraphs(value, options) {
    var text = String(value == null ? '' : value);
    if (!text) return [];
    var config = options || {};
    var minimum = Number(config.minimum) || 60;
    var maximum = Number(config.maximum) || 90;
    var paragraphs = [];

    text.split(/\r?\n/).forEach(function (line) {
      if (!line) {
        paragraphs.push('');
        return;
      }
      var parts = sentenceParts(line).reduce(function (all, part) {
        return all.concat(breakLongPart(part, maximum));
      }, []);
      var current = '';
      parts.forEach(function (part) {
        if (!current) {
          current = part;
          return;
        }
        if (current.length >= minimum && current.length + part.length > maximum) {
          paragraphs.push(current);
          current = part;
        } else {
          current += part;
        }
      });
      if (current) paragraphs.push(current);
    });
    return paragraphs;
  }

  function formatInlineHtml(value) {
    var output = escapeHtml(value);
    output = output.replace(/【[^】]+】/g, '<strong>$&</strong>');
    output = output.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    return output.replace(/\*\*/g, '');
  }

  function formatHtml(value, className, options) {
    var classAttribute = className ? ' class="' + escapeHtml(className) + '"' : '';
    return splitParagraphs(value, options).map(function (paragraph) {
      return '<p' + classAttribute + '>' + formatInlineHtml(paragraph).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function formatMarkdown(value, options) {
    return splitParagraphs(value, options).map(function (paragraph) {
      return paragraph.replace(/【[^】]+】/g, function (marker, offset, source) {
        var before = source.slice(Math.max(0, offset - 2), offset);
        var after = source.slice(offset + marker.length, offset + marker.length + 2);
        if (before === '**' && after === '**') return marker;
        return '**' + marker + '**' + (after === '**' ? ' ' : '');
      });
    }).join('\n\n');
  }

  return {
    escapeHtml: escapeHtml,
    splitParagraphs: splitParagraphs,
    formatInlineHtml: formatInlineHtml,
    formatHtml: formatHtml,
    formatMarkdown: formatMarkdown
  };
});
