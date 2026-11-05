const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'HR', 'SUB', 'SUP']);
const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'target', 'rel', 'width', 'height']);

// Parse as inert HTML, then rebuild using a strict tag/attribute allowlist.
export default function sanitizeHtml(input = '') {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return String(input).replace(/<[^>]*>/g, ' ');
  const parsed = new DOMParser().parseFromString(String(input), 'text/html');
  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    if (!ALLOWED_TAGS.has(node.tagName)) {
      const fragment = document.createDocumentFragment();
      [...node.childNodes].forEach((child) => fragment.appendChild(cleanNode(child)));
      return fragment;
    }
    const clean = document.createElement(node.tagName.toLowerCase());
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (!ALLOWED_ATTRS.has(name)) return;
      if (name === 'href' || name === 'src') {
        try {
          const url = new URL(attribute.value, window.location.origin);
          const allowed = name === 'href' ? ['http:', 'https:', 'mailto:'] : ['http:', 'https:'];
          if (!allowed.includes(url.protocol)) return;
          clean.setAttribute(name, url.href);
        } catch { return; }
      } else if (name === 'target') {
        if (attribute.value === '_blank') clean.setAttribute('target', '_blank');
      } else if (name === 'rel') {
        clean.setAttribute('rel', 'noopener noreferrer');
      } else {
        clean.setAttribute(name, attribute.value.slice(0, 500));
      }
    });
    [...node.childNodes].forEach((child) => clean.appendChild(cleanNode(child)));
    if (clean.tagName === 'A' && clean.getAttribute('target') === '_blank') clean.setAttribute('rel', 'noopener noreferrer');
    return clean;
  };
  const output = document.createElement('div');
  [...parsed.body.childNodes].forEach((node) => output.appendChild(cleanNode(node)));
  return output.innerHTML;
}
