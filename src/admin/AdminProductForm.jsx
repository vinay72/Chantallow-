// src/admin/AdminProductForm.jsx
// Create (/admin/products/new) and edit (/admin/products/:id) a product,
// including image/video uploads. New products need at least 4 images.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, Film } from "lucide-react";
import { api, mediaUrl } from "../api/client";
import useMeta, { STOCK_LABELS } from "./useMeta";

const MIN_IMAGES = 4;
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

const EMPTY = {
    name: "",
    subname: "",
    description: "",
    price: "",
    compare_at_price: "",
    category: "",
    size: "",
    stock_status: "in_stock",
};

export default function AdminProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const meta = useMeta();

    const [values, setValues] = useState(EMPTY);
    const [existing, setExisting] = useState([]); // media already saved: [{url, type}]
    const [files, setFiles] = useState([]); // new File objects to upload
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        api(`/products/${id}`)
            .then(({ product }) => {
                if (cancelled) return;
                setValues({
                    name: product.name || "",
                    subname: product.subname || "",
                    description: product.description || "",
                    price: product.price ?? "",
                    compare_at_price: product.compare_at_price ?? "",
                    category: product.category || "",
                    size: product.size || "",
                    stock_status: product.stock_status || "in_stock",
                });
                setExisting(product.images || []);
            })
            .catch((err) => !cancelled && setErrors([err.message]))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [id, isEdit]);

    // Local previews for files picked but not uploaded yet.
    const previews = useMemo(
        () => files.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith("video/") ? "video" : "image", name: f.name })),
        [files]
    );
    useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

    const all = [...existing, ...previews];
    const imageCount = all.filter((m) => m.type === "image").length;
    const videoCount = all.filter((m) => m.type === "video").length;

    const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

    const addFiles = (e) => {
        const picked = Array.from(e.target.files || []);
        setFiles((prev) => [...prev, ...picked]);
        e.target.value = ""; // lets the same file be picked again after removing it
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problems = [];
        if (!isEdit && imageCount < MIN_IMAGES) problems.push(`Add at least ${MIN_IMAGES} product images.`);
        if (imageCount > MAX_IMAGES) problems.push(`You can add at most ${MAX_IMAGES} images.`);
        if (videoCount > MAX_VIDEOS) problems.push(`You can add at most ${MAX_VIDEOS} videos.`);
        if (problems.length) return setErrors(problems);

        const body = new FormData();
        Object.entries(values).forEach(([k, v]) => body.append(k, v));
        if (isEdit) {
            // An empty keep_media means "remove all existing media".
            if (existing.length) existing.forEach((m) => body.append("keep_media", m.url));
            else body.append("keep_media", "");
        }
        files.forEach((f) => body.append("media", f));

        setSaving(true);
        setErrors([]);
        try {
            await api(isEdit ? `/products/${id}` : "/products", { method: isEdit ? "PUT" : "POST", body });
            navigate("/admin/products");
        } catch (err) {
            setErrors(err.errors);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="adm-subtitle">Loading product…</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="adm-page-head">
                <div>
                    <Link to="/admin/products" className="adm-back">
                        <ArrowLeft size={16} /> All products
                    </Link>
                    <h1 className="adm-title">{isEdit ? "Edit product" : "Add product"}</h1>
                </div>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
                </button>
            </div>

            {errors.length > 0 && (
                <div className="adm-alert">
                    {errors.map((msg) => (
                        <div key={msg}>{msg}</div>
                    ))}
                </div>
            )}

            <div className="adm-form-grid">
                <div className="adm-card">
                    <h2 className="adm-card-title">Details</h2>
                    <label className="adm-field">
                        <span>Name *</span>
                        <input className="adm-input" required value={values.name} onChange={set("name")} />
                    </label>
                    <label className="adm-field">
                        <span>Subtitle</span>
                        <input
                            className="adm-input"
                            placeholder="e.g. Moringa + Butterfly Pea Infused Tallow"
                            value={values.subname}
                            onChange={set("subname")}
                        />
                    </label>
                    <label className="adm-field">
                        <span>Description</span>
                        <textarea className="adm-input" rows={7} value={values.description} onChange={set("description")} />
                    </label>
                </div>

                <div className="adm-card">
                    <h2 className="adm-card-title">Pricing &amp; inventory</h2>
                    <div className="adm-row">
                        <label className="adm-field">
                            <span>Price *</span>
                            <input className="adm-input" type="number" min="0" step="0.01" required value={values.price} onChange={set("price")} />
                        </label>
                        <label className="adm-field">
                            <span>Compare-at price</span>
                            <input
                                className="adm-input"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Shown struck through"
                                value={values.compare_at_price}
                                onChange={set("compare_at_price")}
                            />
                        </label>
                    </div>
                    <div className="adm-row">
                        <label className="adm-field">
                            <span>Category</span>
                            <select className="adm-input" value={values.category} onChange={set("category")}>
                                <option value="">—</option>
                                {meta.categories.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                        <label className="adm-field">
                            <span>Size</span>
                            <select className="adm-input" value={values.size} onChange={set("size")}>
                                <option value="">—</option>
                                {meta.sizes.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <label className="adm-field">
                        <span>Stock status</span>
                        <select className="adm-input" value={values.stock_status} onChange={set("stock_status")}>
                            {(meta.stock_statuses.length ? meta.stock_statuses : ["in_stock", "out_of_stock"]).map((s) => (
                                <option key={s} value={s}>
                                    {STOCK_LABELS[s] || s}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="adm-card adm-span-2">
                    <div className="adm-media-head">
                        <h2 className="adm-card-title">Media</h2>
                        <span className={!isEdit && imageCount < MIN_IMAGES ? "adm-count adm-count-warn" : "adm-count"}>
                            {imageCount} image{imageCount === 1 ? "" : "s"}
                            {!isEdit && ` (min ${MIN_IMAGES})`} · {videoCount} video{videoCount === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="adm-media-grid">
                        {existing.map((m) => (
                            <MediaTile
                                key={m.url}
                                media={{ ...m, url: mediaUrl(m.url) }}
                                onRemove={() => setExisting((list) => list.filter((x) => x.url !== m.url))}
                            />
                        ))}
                        {previews.map((m, i) => (
                            <MediaTile key={m.url} media={m} isNew onRemove={() => setFiles((list) => list.filter((_, j) => j !== i))} />
                        ))}
                        <label className="adm-upload-tile">
                            <Upload size={20} />
                            <span>Add images / video</span>
                            <small>JPG, PNG, WebP, GIF, MP4, WebM · 50MB max</small>
                            <input type="file" multiple accept={ACCEPT} onChange={addFiles} hidden />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}

function MediaTile({ media, isNew, onRemove }) {
    return (
        <div className="adm-media-tile">
            {media.type === "video" ? (
                <div className="adm-media-video">
                    <video src={media.url} muted />
                    <Film size={16} className="adm-media-video-icon" />
                </div>
            ) : (
                <img src={media.url} alt="" />
            )}
            {isNew && <span className="adm-media-new">New</span>}
            <button type="button" className="adm-media-remove" aria-label="Remove" onClick={onRemove}>
                <X size={14} />
            </button>
        </div>
    );
}
