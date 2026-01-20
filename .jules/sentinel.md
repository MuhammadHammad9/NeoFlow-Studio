## 2025-02-17 - React Markdown Reverse Tabnabbing
**Vulnerability:** `react-markdown` was configured to open links in a new tab (`target="_blank"`) without `rel="noopener noreferrer"`.
**Learning:** `react-markdown` custom components for `a` tags must explicitly include `rel="noopener noreferrer"` when `target="_blank"` is used, as it doesn't add it by default even if it's a known best practice.
**Prevention:** Always verify `a` tag configurations in markdown renderers. Use a lint rule or a wrapper component to enforce secure link attributes.
