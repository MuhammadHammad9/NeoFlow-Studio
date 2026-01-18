## 2026-01-18 - Reverse Tabnabbing Vulnerability
**Vulnerability:** Found `target="_blank"` links in `components/ChatBot.tsx` without `rel="noopener noreferrer"`.
**Learning:** `ReactMarkdown` custom link renderers overriding the `a` tag must explicitly include `rel="noopener noreferrer"` when setting `target="_blank"`. This is often overlooked when styling links.
**Prevention:** Review all `target="_blank"` usages during code review. Ensure `rel="noopener noreferrer"` is present to prevent the new page from accessing `window.opener`.
