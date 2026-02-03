# Sentinel's Journal

## 2025-02-14 - Reverse Tabnabbing in Markdown
**Vulnerability:** Found `target="_blank"` links in `ReactMarkdown` components without `rel="noopener noreferrer"`.
**Learning:** `react-markdown` allows custom components for tags like `a`. When overriding these, developers must explicitly add security attributes. Also, passing the `node` prop (from AST) to the DOM element causes React warnings and should be destructured out.
**Prevention:** Always audit `ReactMarkdown` component overrides for `target="_blank"` and ensure `rel="noopener noreferrer"` is present. Use a linter plugin or custom wrapper to enforce this.
