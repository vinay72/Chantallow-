import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import Delta from 'quill-delta';
import 'react-quill-new/dist/quill.snow.css';
import { AlignCenter, AlignLeft, AlignRight, ImageUp, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';
import { toDisplayHtml } from '../utils/richText';

export const FONTS = ['Lufga', 'Marcellus', 'DM Sans', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS'];
const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];

// Inline styles instead of Quill's ql-* classes (registered once).
const Font = Quill.import('attributors/style/font');
Font.whitelist = FONTS;
Quill.register(Font, true);
const Size = Quill.import('attributors/style/size');
Size.whitelist = SIZES;
Quill.register(Size, true);
// 'left' is allowed explicitly so an image can be pinned left (the storefront
// centres images on their own line unless told otherwise).
const Align = Quill.import('attributors/style/align');
Align.whitelist = ['left', 'center', 'right', 'justify'];
Quill.register(Align, true);

// Shift+Enter: a <br> inside the line (Quill itself only knows whole lines).
// The class tells it apart from the <br> Quill puts in empty lines.
const { EmbedBlot } = Quill.import('parchment');
class SoftBreak extends EmbedBlot {
  static blotName = 'softbreak';
  static tagName = 'BR';
  static className = 'ql-softbreak';
}
Quill.register(SoftBreak, true);

// A <br> at the very end of a line shows nothing, so a soft break typed there
// is followed by this invisible character (removed again when saving).
const ZWSP = '​';

function insertSoftBreak(quill, range) {
  if (range.length) quill.deleteText(range.index, range.length, 'user');
  quill.insertEmbed(range.index, 'softbreak', true, 'user');
  const next = quill.getText(range.index + 1, 1);
  if (next === '\n' || next === '') quill.insertText(range.index + 1, ZWSP, 'user');
  quill.setSelection(range.index + 1, 0, 'silent');
}

// Loading saved HTML: a <br> between text is a soft break; one that ends a
// line adds nothing; an empty line's <br> is left to Quill.
function matchBreak(node, delta) {
  const parent = node.parentNode;
  if (!parent || parent.childNodes.length === 1) return delta;
  if (node === parent.lastChild) return new Delta();
  return new Delta().insert({ softbreak: true });
}

// Inserted images: shown at this width (saved on the <img>), and shrunk to at
// most MAX_IMAGE_SIDE px before upload so files stay small.
const IMAGE_WIDTH = '320';
const MAX_IMAGE_SIDE = 1200;
const MIN_IMAGE_WIDTH = 40;

// Downscales a big photo in the browser (canvas) before it's uploaded. GIFs
// (may be animated) and images already small enough are left as they are.
async function shrinkImage(file) {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 400 * 1024) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  // PNG keeps transparency; everything else becomes a compressed JPEG
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.\w+$/, '') + (type === 'image/png' ? '.png' : '.jpg');
  return new File([blob], name, { type });
}

const SPECIAL_CHARACTERS = [
  '©', '®', '™', '°', '±', '×', '÷', '€', '£', '¥', '¢', '§', '¶', '•', '…', '–', '—',
  '“', '”', '‘', '’', '«', '»', '←', '→', '↑', '↓', '✓', '✔', '★', '☆', '♥', '½', '¼',
  '¾', 'µ', 'Ω', '∞', '≈', '≠', '≤', '≥', '√', 'é', 'è', 'ü', 'ñ', 'ç',
];

// Plain text from before the editor existed -> paragraphs (shared with the storefront).
export { toDisplayHtml as toEditorHtml };

// The font size / colour / family the text of a list item starts with, read
// from the inline styles around its first piece of text. Lists apply sizes to
// the text inside an item, so the number / bullet needs to be given them too.
const MARKER_STYLES = ['fontSize', 'color', 'fontFamily'];
function leadingTextStyle(li) {
  const walker = li.ownerDocument.createTreeWalker(li, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeValue.replace(/[\s​]/g, '') && !n.parentElement.closest('.ql-ui')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const text = walker.nextNode();
  const style = {};
  for (let el = text?.parentElement; el && el !== li; el = el.parentElement) {
    for (const key of MARKER_STYLES) if (!style[key] && el.style?.[key]) style[key] = el.style[key];
  }
  return style;
}

// Editor view: size the list markers (Quill's .ql-ui spans) like their text.
function syncListMarkers(root) {
  root.querySelectorAll('li').forEach((li) => {
    const ui = li.querySelector(':scope > .ql-ui');
    if (!ui) return;
    const style = leadingTextStyle(li);
    for (const key of MARKER_STYLES) ui.style[key] = style[key] || '';
  });
}

// Quill 2 writes every list as <ol><li data-list="bullet|ordered"> with UI
// spans; turn that into normal <ul>/<ol> markup, give each item its text's
// size / colour (so the number or bullet matches), and drop editor-only bits.
function toCleanHtml(quillHtml) {
  const doc = new DOMParser().parseFromString(`<div>${quillHtml}</div>`, 'text/html');
  const root = doc.body.firstChild;
  root.querySelectorAll('li').forEach((li) => {
    const style = leadingTextStyle(li);
    for (const key of MARKER_STYLES) if (style[key] && !li.style[key]) li.style[key] = style[key];
  });
  root.querySelectorAll('.ql-ui').forEach((el) => el.remove());
  // "www.example.com" typed as a link would open as a page on this site
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    if (href && !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) a.setAttribute('href', `https://${href}`);
  });
  root.querySelectorAll('br.ql-softbreak').forEach((br) => br.removeAttribute('class'));
  root.querySelectorAll('ol').forEach((list) => {
    const items = [...list.children];
    if (!items.some((li) => li.hasAttribute('data-list'))) return;
    let current = null;
    let currentType = null;
    for (const li of items) {
      const type = li.getAttribute('data-list') === 'bullet' ? 'ul' : 'ol';
      if (type !== currentType) {
        current = doc.createElement(type);
        currentType = type;
        list.before(current);
      }
      li.removeAttribute('data-list');
      current.appendChild(li);
    }
    list.remove();
  });
  // empty lines left at the end add nothing
  while (root.lastElementChild && /^<p[^>]*><br><\/p>$/.test(root.lastElementChild.outerHTML)) root.lastElementChild.remove();
  return root.innerHTML.replace(/​/g, '');
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write the answer…' }) {
  const quillRef = useRef(null);
  const bodyRef = useRef(null);
  const fileInput = useRef(null);
  const wordInput = useRef(null);
  const replaceTarget = useRef(null); // image being replaced through the file picker
  const [initial] = useState(() => toDisplayHtml(value));
  const [showChars, setShowChars] = useState(false);
  const [busy, setBusy] = useState(null); // null | 'image' | 'word'
  const [problem, setProblem] = useState(null);

  // The selected image and where its frame goes (relative to the editor body).
  const [img, setImg] = useState(null);
  const [box, setBox] = useState(null);
  const imgRef = useRef(null);
  imgRef.current = img;

  const editor = () => quillRef.current?.getEditor();

  const emit = () => {
    const q = editor();
    if (q) onChange(toCleanHtml(q.root.innerHTML));
  };

  // Position of the selected image's frame; hidden when scrolled out of view.
  const measure = useCallback(() => {
    const q = quillRef.current?.getEditor();
    const target = imgRef.current;
    if (!q || !target || !bodyRef.current || !q.root.contains(target)) {
      setBox(null);
      return;
    }
    const r = target.getBoundingClientRect();
    const body = bodyRef.current.getBoundingClientRect();
    const view = q.root.getBoundingClientRect();
    if (r.bottom < view.top || r.top > view.bottom) {
      setBox(null);
      return;
    }
    setBox({ top: r.top - body.top, left: r.left - body.left, width: r.width, height: r.height, nearTop: r.top - view.top < 48 });
  }, []);

  useEffect(() => {
    measure();
  }, [img, measure]);

  // Image selection, list markers and keeping the frame in place.
  useEffect(() => {
    const q = quillRef.current?.getEditor();
    if (!q) return undefined;
    const root = q.root;

    const onClick = (e) => setImg(e.target.tagName === 'IMG' ? e.target : null);
    const onTextChange = () => {
      syncListMarkers(root);
      if (imgRef.current && !root.contains(imgRef.current)) setImg(null);
      else measure();
    };
    // Delete / Backspace remove the selected image (before Quill sees the key).
    const onKeyDown = (e) => {
      const target = imgRef.current;
      if (!target) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopImmediatePropagation();
        const blot = Quill.find(target);
        if (blot) q.deleteText(q.getIndex(blot), 1, 'user');
        setImg(null);
      } else if (e.key === 'Escape') {
        setImg(null);
      } else {
        setImg(null); // typing goes back to the text
      }
    };
    const onOutside = (e) => {
      if (bodyRef.current && !bodyRef.current.contains(e.target)) setImg(null);
    };

    syncListMarkers(root);
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown, true);
    root.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    document.addEventListener('mousedown', onOutside);
    q.on('text-change', onTextChange);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown, true);
      root.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      document.removeEventListener('mousedown', onOutside);
      q.off('text-change', onTextChange);
    };
  }, [measure]);

  // Index of the selected image in the document (for Quill's format / delete calls).
  const imageIndex = () => {
    const q = editor();
    const blot = img && Quill.find(img);
    return q && blot ? q.getIndex(blot) : null;
  };

  const setImageWidth = (width) => {
    const q = editor();
    const index = imageIndex();
    if (q == null || index == null) return;
    q.formatText(index, 1, 'width', width, 'user');
    requestAnimationFrame(measure);
  };

  const alignImage = (align) => {
    const q = editor();
    const index = imageIndex();
    if (q == null || index == null) return;
    q.formatLine(index, 1, 'align', align, 'user');
    requestAnimationFrame(measure);
  };

  const deleteImage = () => {
    const q = editor();
    const index = imageIndex();
    if (q == null || index == null) return;
    q.deleteText(index, 1, 'user');
    setImg(null);
  };

  // Drag a corner: width follows the pointer (height keeps the ratio).
  const startResize = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const q = editor();
    const target = img;
    if (!q || !target) return;
    const startX = e.clientX;
    const startWidth = target.getBoundingClientRect().width;
    const maxWidth = q.root.clientWidth - 32;
    const onMove = (ev) => {
      const width = Math.round(Math.min(maxWidth, Math.max(MIN_IMAGE_WIDTH, startWidth + (ev.clientX - startX) * direction)));
      target.setAttribute('width', String(width));
      measure();
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setImageWidth(String(Math.round(target.getBoundingClientRect().width)));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Shrinks, uploads an image file and returns its URL for the editor.
  const uploadImage = async (file) => {
    const { url } = await api.uploadHomeImage(await shrinkImage(file));
    return mediaUrl(url);
  };

  // New image at the cursor, or a replacement for the selected one.
  const insertImageFile = async (file) => {
    const q = editor();
    if (!q || !file) return;
    const replacing = replaceTarget.current;
    replaceTarget.current = null;
    const range = replacing ? null : q.getSelection(true);
    setBusy('image');
    setProblem(null);
    try {
      const src = await uploadImage(file);
      let index = range ? range.index : q.getLength();
      let width = IMAGE_WIDTH;
      if (replacing) {
        const blot = Quill.find(replacing);
        if (!blot) return;
        index = q.getIndex(blot);
        width = replacing.getAttribute('width') || IMAGE_WIDTH;
        q.deleteText(index, 1, 'user');
      }
      q.insertEmbed(index, 'image', src, 'user');
      q.formatText(index, 1, 'width', width, 'user');
      q.setSelection(index + 1, 0, 'silent');
      setImg(null);
    } catch (err) {
      setProblem(`Couldn't add the image: ${err.message}`);
    } finally {
      setBusy(null);
    }
  };

  // Toolbar / keyboard / clipboard config must stay the same object between renders.
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [false, ...FONTS] }, { size: [false, ...SIZES] }],
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
        handlers: {
          // a new image at the cursor (not a replacement left over from a cancelled picker)
          image: () => {
            replaceTarget.current = null;
            fileInput.current?.click();
          },
        },
      },
      keyboard: {
        bindings: {
          softBreak: {
            key: 'Enter',
            shiftKey: true,
            handler(range) {
              insertSoftBreak(this.quill, range);
              return false;
            },
          },
        },
      },
      clipboard: { matchVisual: false, matchers: [['BR', matchBreak]] },
    }),
    []
  );

  const insertCharacter = (ch) => {
    const q = editor();
    if (!q) return;
    const range = q.getSelection(true);
    q.insertText(range ? range.index : q.getLength() - 1, ch, 'user');
    q.setSelection((range ? range.index : q.getLength() - 1) + ch.length, 0, 'silent');
  };

  // Word (.docx) -> HTML at the cursor; pictures inside are uploaded too.
  const importWord = async (file) => {
    const q = editor();
    if (!q || !file) return;
    setBusy('word');
    setProblem(null);
    try {
      const mammoth = await import('mammoth');
      const { value: html } = await mammoth.convertToHtml(
        { arrayBuffer: await file.arrayBuffer() },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            const bytes = await image.read('base64');
            const blob = await (await fetch(`data:${image.contentType};base64,${bytes}`)).blob();
            const ext = (image.contentType.split('/')[1] || 'png').replace('jpeg', 'jpg');
            return {
              src: await uploadImage(new File([blob], `word-image.${ext}`, { type: image.contentType })),
              width: IMAGE_WIDTH,
            };
          }),
        }
      );
      const range = q.getSelection(true);
      q.clipboard.dangerouslyPasteHTML(range ? range.index : q.getLength() - 1, html, 'user');
    } catch (err) {
      setProblem(`Couldn't import that Word file: ${err.message}`);
    } finally {
      setBusy(null);
    }
  };

  // The current content as a .doc file Word opens (HTML-based Word document).
  const downloadWord = () => {
    const q = editor();
    if (!q) return;
    const body = toCleanHtml(q.root.innerHTML).replace(/src="\//g, `src="${window.location.origin}/`);
    const doc =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" ' +
      'xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Answer</title></head>' +
      `<body style="font-family: Arial, sans-serif">${body}</body></html>`;
    const url = URL.createObjectURL(new Blob(['﻿', doc], { type: 'application/msword' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answer.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const currentWidth = img?.getAttribute('width') || '';
  const currentAlign = img?.closest('p, li, h1, h2, h3, blockquote')?.style.textAlign || '';

  return (
    <div className="rte">
      <div className="rte-extras">
        <button type="button" className="rte-extra" aria-expanded={showChars} onClick={() => setShowChars((v) => !v)}>
          Ω Special characters
        </button>
        <button type="button" className="rte-extra" disabled={busy === 'word'} onClick={() => wordInput.current?.click()}>
          {busy === 'word' ? 'Importing…' : 'Import Word (.docx)'}
        </button>
        <button type="button" className="rte-extra" onClick={downloadWord}>
          Download as Word
        </button>
        {busy === 'image' && <span className="rte-status">Uploading image…</span>}
        <span className="rte-hint">Tip: Shift+Enter for a line break · click an image to resize it</span>
      </div>

      {showChars && (
        <div className="rte-chars" role="group" aria-label="Special characters">
          {SPECIAL_CHARACTERS.map((ch) => (
            <button
              key={ch}
              type="button"
              title={`Insert ${ch}`}
              // keep the editor's selection while clicking
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertCharacter(ch)}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      <div className="rte-body" ref={bodyRef}>
        <ReactQuill ref={quillRef} theme="snow" defaultValue={initial} onChange={emit} modules={modules} placeholder={placeholder} />

        {img && box && (
          <div className="rte-img-frame" style={{ top: box.top, left: box.left, width: box.width, height: box.height }}>
            {[
              ['nw', -1],
              ['ne', 1],
              ['sw', -1],
              ['se', 1],
            ].map(([corner, direction]) => (
              <span
                key={corner}
                className={`rte-img-handle is-${corner}`}
                onPointerDown={(e) => startResize(e, direction)}
                aria-hidden="true"
              />
            ))}
            <span className="rte-img-size">
              {Math.round(box.width)} × {Math.round(box.height)}
            </span>

            <div
              className={box.nearTop ? 'rte-img-bar is-below' : 'rte-img-bar'}
              role="toolbar"
              aria-label="Image"
              // keep the image selected while using the bar
              onMouseDown={(e) => e.preventDefault()}
            >
              {['25%', '50%', '75%', '100%'].map((w) => (
                <button key={w} type="button" className={currentWidth === w ? 'is-active' : ''} onClick={() => setImageWidth(w)}>
                  {w}
                </button>
              ))}
              <span className="rte-img-sep" />
              <button type="button" title="Align left" aria-label="Align left" className={currentAlign === 'left' ? 'is-active' : ''} onClick={() => alignImage('left')}>
                <AlignLeft size={15} />
              </button>
              <button type="button" title="Centre" aria-label="Centre" className={!currentAlign || currentAlign === 'center' ? 'is-active' : ''} onClick={() => alignImage('center')}>
                <AlignCenter size={15} />
              </button>
              <button type="button" title="Align right" aria-label="Align right" className={currentAlign === 'right' ? 'is-active' : ''} onClick={() => alignImage('right')}>
                <AlignRight size={15} />
              </button>
              <span className="rte-img-sep" />
              <button
                type="button"
                title="Replace image"
                aria-label="Replace image"
                onClick={() => {
                  replaceTarget.current = img;
                  fileInput.current?.click();
                }}
              >
                <ImageUp size={15} />
              </button>
              <button type="button" title="Delete image" aria-label="Delete image" className="is-danger" onClick={deleteImage}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {problem && <p className="rte-problem">{problem}</p>}

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          insertImageFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={wordInput}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={(e) => {
          importWord(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
