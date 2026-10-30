// src/utils/richText.js
// Helpers for rich text (HTML) written in the admin's RichTextEditor, shared by
// the admin and the storefront. Kept separate from the editor so the storefront
// doesn't load Quill.

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Text saved before the editor existed is plain text: turn it into paragraphs
// (blank line = new paragraph, single line break = <br>). HTML is returned as is.
export function toDisplayHtml(text) {
    const value = String(text || "");
    if (/<[a-z][\s\S]*>/i.test(value)) return value;
    return value
        .split(/\n{2,}/)
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
        .join("");
}
