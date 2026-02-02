## 2025-02-18 - [CRITICAL] Reverse Tabnabbing Vulnerability in ChatBot
**Vulnerability:** `react-markdown` was configured to open links in a new tab (`target="_blank"`) without `rel="noopener noreferrer"`.
**Learning:** When manually overriding components in `react-markdown`, especially the `a` tag, it is critical to explicitly add `rel="noopener noreferrer"` if `target="_blank"` is used. The library does not add this automatically when the component is overridden.
**Prevention:** Always verify `a` tag overrides in Markdown renderers include `rel="noopener noreferrer"` when opening in new tabs. Use ESLint rules (like `react/jsx-no-target-blank`) to catch this in standard JSX, though dynamic component mapping might evade static analysis.
