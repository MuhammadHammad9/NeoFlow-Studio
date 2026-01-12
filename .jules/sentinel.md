## 2025-02-15 - Reverse Tabnabbing in ChatBot
**Vulnerability:** The ChatBot component rendered Markdown links with `target="_blank"` but missed `rel="noopener noreferrer"`.
**Learning:** `ReactMarkdown` allows custom components. When customizing `a` tags to open in new tabs, we must explicitly add security attributes.
**Prevention:** Always verify `target="_blank"` links include `rel="noopener noreferrer"`, especially in custom renderers.
