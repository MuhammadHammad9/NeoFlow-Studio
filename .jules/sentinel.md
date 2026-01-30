## 2025-02-18 - Fix Reverse Tabnabbing in ChatBot
**Vulnerability:** Reverse Tabnabbing via `target="_blank"` in `ReactMarkdown` components without `rel="noopener noreferrer"`.
**Learning:** `ReactMarkdown` allows customizing components. When overriding `a` tag to open in new tab (`target="_blank"`), it does NOT automatically add `rel="noopener noreferrer"`. This must be added manually.
**Prevention:** Always add `rel="noopener noreferrer"` when using `target="_blank"`, especially in custom component renderers.
