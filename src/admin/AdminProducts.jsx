// src/admin/AdminProducts.jsx
// Product list with search / category / size filters, plus edit + delete.

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { api, mediaUrl } from "../api/client";
import useMeta, { formatPrice, STOCK_LABELS } from "./useMeta";

const EMPTY_FILTERS = { search: "", category: "", size: "" };

export default function AdminProducts() {
    const meta = useMeta();
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (f) => {
        setLoading(true);
        setError("");
        try {
            const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
            const data = await api("/products" + (qs ? `?${qs}` : ""));
            setProducts(data.products);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce so typing in the search box doesn't fire a request per keystroke.
    useEffect(() => {
        const t = setTimeout(() => load(filters), 250);
        return () => clearTimeout(t);
    }, [filters, load]);

    const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? Its images will be removed too.`)) return;
        try {
            await api(`/products/${product.id}`, { method: "DELETE" });
            setProducts((list) => list.filter((p) => p.id !== product.id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="adm-page-head">
                <div>
                    <h1 className="adm-title">Products</h1>
                    <p className="adm-subtitle">{loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"}`}</p>
                </div>
                <Link to="/admin/products/new" className="adm-btn adm-btn-primary">
                    <Plus size={16} /> Add product
                </Link>
            </div>

            <div className="adm-card adm-filters">
                <input
                    className="adm-input"
                    type="search"
                    placeholder="Search name, subtitle, description…"
                    value={filters.search}
                    onChange={setFilter("search")}
                />
                <select className="adm-input" value={filters.category} onChange={setFilter("category")}>
                    <option value="">All categories</option>
                    {meta.categories.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
                <select className="adm-input" value={filters.size} onChange={setFilter("size")}>
                    <option value="">All sizes</option>
                    {meta.sizes.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
            </div>

            {error && <div className="adm-alert">{error}</div>}

            <div className="adm-card adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="adm-empty">
                                    No products found.
                                </td>
                            </tr>
                        )}
                        {products.map((p) => {
                            const thumb = (p.images || []).find((m) => m.type === "image");
                            return (
                                <tr key={p.id}>
                                    <td>
                                        <div className="adm-product-cell">
                                            {thumb ? (
                                                <img src={mediaUrl(thumb.url)} alt="" className="adm-thumb" />
                                            ) : (
                                                <span className="adm-thumb adm-thumb-empty">
                                                    <ImageOff size={16} />
                                                </span>
                                            )}
                                            <div>
                                                <div className="adm-product-name">{p.name}</div>
                                                {p.subname && <div className="adm-muted">{p.subname}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.category || "—"}</td>
                                    <td>{p.size || "—"}</td>
                                    <td>
                                        {formatPrice(p.price)}
                                        {p.compare_at_price && <s className="adm-muted adm-compare">{formatPrice(p.compare_at_price)}</s>}
                                    </td>
                                    <td>
                                        <span className={`adm-badge adm-badge-${p.stock_status}`}>
                                            {STOCK_LABELS[p.stock_status] || p.stock_status}
                                        </span>
                                    </td>
                                    <td className="adm-actions">
                                        <Link to={`/admin/products/${p.id}`} className="adm-icon-btn" aria-label={`Edit ${p.name}`}>
                                            <Pencil size={16} />
                                        </Link>
                                        <button className="adm-icon-btn adm-danger" aria-label={`Delete ${p.name}`} onClick={() => handleDelete(p)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
