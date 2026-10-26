import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const renderer = new marked.Renderer();

renderer.link = ({ href, title, text }) => {
  const safeTitle = title ? ` title="${escapeAttribute(title)}"` : '';
  return `<a href="${escapeAttribute(href)}"${safeTitle} rel="noreferrer">${text}</a>`;
};

marked.setOptions({ renderer, gfm: true, breaks: false });

export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown);
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'h1',
      'h2',
      'img',
      'pre',
      'code',
      'hr',
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      code: ['class'],
      pre: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

function escapeAttribute(value: string): string {
  return value.replace(/[&"'<>]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;',
    };
    return entities[character] ?? character;
  });
}

