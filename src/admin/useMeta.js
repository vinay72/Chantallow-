// src/admin/useMeta.js
// Dropdown options (categories, sizes, stock statuses) from GET /api/meta.

import { useEffect, useState } from "react";
import { api } from "../api/client";

const EMPTY = { categories: [], sizes: [], stock_statuses: [] };

export default function useMeta() {
    const [meta, setMeta] = useState(EMPTY);

    useEffect(() => {
        let cancelled = false;
        api("/meta")
            .then((data) => !cancelled && setMeta(data))
            .catch(() => {
                /* dropdowns just stay empty; the page shows its own load error */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return meta;
}

export const formatPrice = (value) =>
    value === null || value === undefined || value === "" ? "—" : `$${Number(value).toFixed(2)}`;

export const STOCK_LABELS = { in_stock: "In stock", out_of_stock: "Out of stock" };
